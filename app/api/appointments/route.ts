/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/dbConfig';
import AppointmentModel from '@/lib/models/Appointment';
import DoctorModel from '@/lib/models/Doctor';
import PatientModel from '@/lib/models/Patient';
import { getUserFromRequest, hasPendingPasswordReset } from '@/lib/middleware/auth';
import { badRequest, created, serverError, unauthorized } from '@/lib/utils/apiResponse';

function safeIso(date: any): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}
function parseTimeToMinutes(time: string): number | null {
  const value = String(time || '').trim().toUpperCase();
  const h24 = value.match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
  if (h24) return Number(h24[1]) * 60 + Number(h24[2]);
  const h12 = value.match(/^(0?\d|1[0-2]):([0-5]\d)\s?(AM|PM)$/);
  if (!h12) return null;
  const baseHour = Number(h12[1]) % 12;
  return (baseHour + (h12[3] === 'PM' ? 12 : 0)) * 60 + Number(h12[2]);
}
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

export async function GET(req: NextRequest) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      department: searchParams.get('department') || undefined,
      date: searchParams.get('date') || undefined,
      doctorId: searchParams.get('doctorId') || undefined,
      patientId: searchParams.get('patientId') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    };

    await connectDB();
    const query: any = {};
    if (filters.status) query.status = new RegExp(`^${filters.status}$`, 'i');
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setUTCHours(23, 59, 59, 999);
      query.date = { $gte: startOfDay, $lte: endOfDay };
    }
    if (filters.doctorId && mongoose.isValidObjectId(filters.doctorId)) query.doctor = new mongoose.Types.ObjectId(filters.doctorId);
    if (filters.patientId && mongoose.isValidObjectId(filters.patientId)) query.patient = new mongoose.Types.ObjectId(filters.patientId);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const docs = await AppointmentModel.find(query)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const total = await AppointmentModel.countDocuments(query);
    const items = docs.map(mapAppointmentToFrontend);
    const pagination = { total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
    return NextResponse.json({ success: true, data: items, pagination }, { status: 200 });
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    if (!body?.doctorId || !body?.date || !body?.time) {
      return badRequest('doctorId, date, and time are required');
    }

    await connectDB();
    const parsedDate = new Date(body.date);
    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);
    let doctor: any = null;
    if (mongoose.isValidObjectId(body.doctorId)) {
      doctor = await DoctorModel.findById(body.doctorId).populate('user');
      if (!doctor) doctor = await DoctorModel.findOne({ user: body.doctorId }).populate('user');
    }
    if (!doctor) return badRequest('Doctor not found');
    const bookingDate = new Date(`${body.date}T00:00:00`);
    const bookingMinutes = parseTimeToMinutes(body.time);
    const dayName = bookingDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const daySchedule = (doctor.availability || []).find((d: any) => String(d.day).toLowerCase() === dayName);
    const slot = daySchedule?.slots?.find((s: any) => {
      const st = parseTimeToMinutes(s.startTime);
      const en = parseTimeToMinutes(s.endTime);
      return s.isAvailable && st !== null && en !== null && bookingMinutes !== null && bookingMinutes >= st && bookingMinutes < en;
    });
    if (!daySchedule?.isWorking || !slot) return badRequest('Doctor is not available at the selected day/time.');
    const st = parseTimeToMinutes(slot.startTime)!;
    const en = parseTimeToMinutes(slot.endTime)!;
    const sameDayAppointments = await AppointmentModel.find({
      doctor: doctor._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ['Scheduled', 'Completed'] },
    }).select('timeSlot');
    const hasConflict = sameDayAppointments.some((item) => {
      const t = parseTimeToMinutes(item.timeSlot);
      return t !== null && t >= st && t < en;
    });
    if (hasConflict) return NextResponse.json({ success: false, message: 'This time slot is already booked.', error: 'This time slot is already booked.' }, { status: 409 });
    const patient = await PatientModel.findOne({ user: decoded.id });
    if (!patient) return badRequest('Patient profile not found. Please setup profile.');
    const apt = await AppointmentModel.create({
      patient: patient._id,
      doctor: doctor._id,
      date: new Date(body.date),
      timeSlot: body.time,
      status: 'Scheduled',
    });
    const updatedSchedule = (doctor.availability || []).map((d: any) => {
      if (String(d.day).toLowerCase() !== dayName) return d;
      return {
        ...d,
        slots: (d.slots || []).map((s: any) => {
          const ss = parseTimeToMinutes(s.startTime);
          const ee = parseTimeToMinutes(s.endTime);
          if (ss !== null && ee !== null && bookingMinutes !== null && bookingMinutes >= ss && bookingMinutes < ee) {
            return { ...s, isAvailable: false };
          }
          return s;
        }),
      };
    });
    await DoctorModel.findByIdAndUpdate(doctor._id, { availability: updatedSchedule });
    const populated = await apt.populate([{ path: 'doctor', populate: { path: 'user' } }, { path: 'patient', populate: { path: 'user' } }]);
    return created(mapAppointmentToFrontend(populated));
  } catch {
    return serverError();
  }
}
