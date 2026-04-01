import 'server-only';

import mongoose from 'mongoose';
import { connectDB } from '@/lib/dbConfig';
import AppointmentModel from '@/lib/models/Appointment';
import UserModel from '@/lib/models/User';
import DoctorModel from '@/lib/models/Doctor';
import PatientModel from '@/lib/models/Patient';
import MedicalRecordModel from '@/lib/models/MedicalRecord';
import { safeIso } from './mappers';

type AppointmentFilters = {
  status?: string;
  department?: string;
  date?: string;
  doctorId?: string;
  patientId?: string;
  search?: string;
  page?: number;
  limit?: number;
};

type CreateAppointmentRequest = {
  doctorId: string;
  date: string;
  time: string;
  reason: string;
};

type UpdateAppointmentStatusRequest = { status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'; notes?: string };
type DoctorScheduleDay = { day: string; isWorking: boolean; slots: Array<{ startTime: string; endTime: string; isAvailable: boolean }> };

function mapAppointmentToFrontend(doc: any) {
  return {
    id: doc._id.toString(),
    patientId: doc.patient?.user?._id?.toString() || doc.patient?._id?.toString() || doc.patient?.toString(),
    patientName: doc.patient?.user?.name || 'Unknown Patient',
    doctorId: doc.doctor?.user?._id?.toString() || doc.doctor?._id?.toString() || doc.doctor?.toString(),
    doctorName: doc.doctor?.user?.name || 'Unknown Doctor',
    department: doc.doctor?.specialization || 'General',
    date: safeIso(doc.date).split('T')[0],
    time: doc.timeSlot,
    status: (doc.status || '').toString().toLowerCase(),
    reason: doc.type || 'in-person',
    createdAt: safeIso(doc.createdAt),
  };
}

function buildFilters(filters: AppointmentFilters) {
  const query: any = {};
  if (filters.status) query.status = new RegExp(`^${filters.status}$`, 'i');
  if (filters.date) {
    const startOfDay = new Date(filters.date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(filters.date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    query.date = { $gte: startOfDay, $lte: endOfDay };
  }
  if (filters.doctorId && mongoose.isValidObjectId(filters.doctorId)) {
    query.doctor = new mongoose.Types.ObjectId(filters.doctorId);
  }
  if (filters.patientId && mongoose.isValidObjectId(filters.patientId)) {
    query.patient = new mongoose.Types.ObjectId(filters.patientId);
  }
  return query;
}

function parseTimeToMinutes(time: string): number | null {
  const value = String(time || '').trim().toUpperCase();

  // HH:mm (24h)
  const h24 = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (h24) return Number(h24[1]) * 60 + Number(h24[2]);

  // hh:mm AM/PM
  const h12 = value.match(/^(0?\d|1[0-2]):([0-5]\d)\s?(AM|PM)$/);
  if (h12) {
    const baseHour = Number(h12[1]) % 12;
    const minutes = Number(h12[2]);
    const isPm = h12[3] === 'PM';
    return (baseHour + (isPm ? 12 : 0)) * 60 + minutes;
  }

  return null;
}

function isDoctorAvailableAt(schedule: DoctorScheduleDay[] | undefined, dateStr: string, timeStr: string): boolean {
  if (!Array.isArray(schedule) || schedule.length === 0) return false;
  const bookingDate = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(bookingDate.getTime())) return false;

  const bookingMinutes = parseTimeToMinutes(timeStr);
  if (bookingMinutes === null) return false;

  const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const daySchedule = schedule.find((d) => String(d.day).toLowerCase() === dayName);
  if (!daySchedule || !daySchedule.isWorking) return false;

  return daySchedule.slots.some((slot) => {
    if (!slot.isAvailable) return false;
    const start = parseTimeToMinutes(slot.startTime);
    const end = parseTimeToMinutes(slot.endTime);
    if (start === null || end === null) return false;
    return bookingMinutes >= start && bookingMinutes < end;
  });
}

export const appointmentsService = {
  async listAll(filters: AppointmentFilters = {}) {
    await connectDB();
    const query = buildFilters(filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;

    const docs = await AppointmentModel.find(query)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await AppointmentModel.countDocuments(query);
    return { items: docs.map(mapAppointmentToFrontend), pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  },

  async listMine(userId: string, filters: AppointmentFilters = {}) {
    await connectDB();
    const dbUser = await UserModel.findById(userId);
    if (!dbUser) return { ok: false as const, code: 'UNAUTHORIZED' as const };

    const roleSpecificQuery: any = {};
    if (dbUser.role === 'Doctor') {
      const doctor = await DoctorModel.findOne({ user: dbUser._id });
      if (doctor) roleSpecificQuery.doctor = doctor._id;
    } else if (dbUser.role === 'Patient') {
      const patient = await PatientModel.findOne({ user: dbUser._id });
      if (patient) roleSpecificQuery.patient = patient._id;
    }

    const query = { ...buildFilters(filters), ...roleSpecificQuery };
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 100;

    const docs = await AppointmentModel.find(query)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await AppointmentModel.countDocuments(query);
    return { ok: true as const, items: docs.map(mapAppointmentToFrontend), pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  },

  async get(id: string) {
    await connectDB();
    const doc = await AppointmentModel.findById(id)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } });
    if (!doc) return null;
    return mapAppointmentToFrontend(doc);
  },

  async create(userId: string, req: CreateAppointmentRequest) {
    await connectDB();

    const parsedDate = new Date(req.date);
    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    let doctor: any = null;
    if (mongoose.isValidObjectId(req.doctorId)) {
      doctor = await DoctorModel.findById(req.doctorId).populate('user');
      if (!doctor) doctor = await DoctorModel.findOne({ user: req.doctorId }).populate('user');
    }
    if (!doctor) return { ok: false as const, code: 'NOT_FOUND' as const, message: 'Doctor not found' };

    if (!isDoctorAvailableAt((doctor.availability as DoctorScheduleDay[]) || [], req.date, req.time)) {
      return { ok: false as const, code: 'INVALID_SLOT' as const, message: 'Doctor is not available at the selected day/time.' };
    }

    const requestedMinutes = parseTimeToMinutes(req.time);
    const sameDayAppointments = await AppointmentModel.find({
      doctor: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Scheduled', 'Completed'] },
    }).select('timeSlot');
    const hasConflict = sameDayAppointments.some((item) => parseTimeToMinutes(item.timeSlot) === requestedMinutes);
    if (hasConflict) return { ok: false as const, code: 'CONFLICT' as const, message: 'This time slot is already booked.' };

    const patient = await PatientModel.findOne({ user: userId });
    if (!patient) return { ok: false as const, code: 'NOT_FOUND' as const, message: 'Patient profile not found. Please setup profile.' };

    const apt = await AppointmentModel.create({
      patient: patient._id,
      doctor: doctor._id,
      date: new Date(req.date),
      timeSlot: req.time,
      status: 'Scheduled',
    });

    const populated = await apt.populate([
      { path: 'doctor', populate: { path: 'user' } },
      { path: 'patient', populate: { path: 'user' } },
    ]);

    return { ok: true as const, data: mapAppointmentToFrontend(populated) };
  },

  async updateStatus(id: string, req: UpdateAppointmentStatusRequest) {
    await connectDB();
    let dbStatus = 'Pending';
    if (req.status === 'scheduled' || req.status === 'in-progress') dbStatus = 'Scheduled';
    if (req.status === 'completed') dbStatus = 'Completed';
    if (req.status === 'cancelled') dbStatus = 'Cancelled';

    const doc = await AppointmentModel.findByIdAndUpdate(id, { status: dbStatus }, { new: true })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } });
    if (!doc) return { ok: false as const, code: 'NOT_FOUND' as const };
    return { ok: true as const, data: mapAppointmentToFrontend(doc) };
  },

  async cancel(id: string) {
    return this.updateStatus(id, { status: 'cancelled' });
  },

  async statsAdmin(todayDate: string) {
    await connectDB();
    const totalDoctors = await DoctorModel.countDocuments();
    const totalPatients = await PatientModel.countDocuments();
    const totalAppointments = await AppointmentModel.countDocuments();

    const startOfDay = new Date(todayDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(todayDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const todayAppointments = await AppointmentModel.countDocuments({ date: { $gte: startOfDay, $lte: endOfDay } });
    const pendingAppointments = await AppointmentModel.countDocuments({ status: 'Pending' });
    const completedAppointments = await AppointmentModel.countDocuments({ status: 'Completed' });
    const cancelledAppointments = await AppointmentModel.countDocuments({ status: 'Cancelled' });

    const recentDocs = await AppointmentModel.find()
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } })
      .sort({ createdAt: -1 })
      .limit(10);

    const doctorsByDepartmentAgg = await DoctorModel.aggregate([{ $group: { _id: '$specialization', count: { $sum: 1 } } }]);
    const doctorsByDepartment = Object.fromEntries(doctorsByDepartmentAgg.map((x: any) => [x._id || 'General', x.count]));

    return {
      totalDoctors,
      totalPatients,
      totalAppointments,
      todayAppointments,
      pendingAppointments,
      completedAppointments,
      cancelledAppointments,
      recentAppointments: recentDocs.map(mapAppointmentToFrontend),
      doctorsByDepartment,
    };
  },

  async statsDoctor(doctorId: string, todayDate: string) {
    await connectDB();
    const startOfDay = new Date(todayDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(todayDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const todayAppointments = await AppointmentModel.countDocuments({ doctor: doctorId, date: { $gte: startOfDay, $lte: endOfDay } });
    const upcomingAppointments = await AppointmentModel.countDocuments({ doctor: doctorId, date: { $gt: endOfDay }, status: { $in: ['Scheduled', 'Pending'] } });
    const completedAppointments = await AppointmentModel.countDocuments({ doctor: doctorId, status: 'Completed' });

    const patientIds = await AppointmentModel.distinct('patient', { doctor: doctorId });
    const totalPatients = patientIds.length;

    return { todayAppointments, upcomingAppointments, completedAppointments, totalPatients };
  },

  async statsPatient(patientId: string) {
    await connectDB();
    const now = new Date();
    const upcomingAppointments = await AppointmentModel.countDocuments({ patient: patientId, date: { $gte: now }, status: { $in: ['Scheduled', 'Pending'] } });
    const totalVisits = await AppointmentModel.countDocuments({ patient: patientId, status: { $in: ['Completed', 'Scheduled'] } });
    const totalRecords = await MedicalRecordModel.countDocuments({ patient: patientId });

    const next = await AppointmentModel.findOne({ patient: patientId, date: { $gte: now }, status: { $in: ['Scheduled', 'Pending'] } })
      .sort({ date: 1 })
      .populate({ path: 'doctor', populate: { path: 'user' } });

    const nextAppointment = next ? { date: safeIso(next.date).split('T')[0], time: next.timeSlot } : null;

    return { upcomingAppointments, totalVisits, totalRecords, nextAppointment };
  },
};

