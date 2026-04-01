import 'server-only';

import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/dbConfig';
import DoctorModel from '@/lib/models/Doctor';
import UserModel from '@/lib/models/User';
import { safeIso } from './mappers';

type DoctorFilters = {
  search?: string;
  department?: string;
  specialization?: string;
  page?: number;
  limit?: number;
};

type CreateDoctorRequest = {
  name: string;
  email: string;
  phone?: string;
  password: string;
  specialization: string;
  department: string;
  qualification?: string;
  experience: number;
  consultationFee: number;
  bio: string;
};

type UpdateDoctorRequest = Partial<Omit<CreateDoctorRequest, 'email' | 'password'>> & { name?: string; phone?: string };

type AvailabilitySlot = { startTime: string; endTime: string; isAvailable: boolean };
type DayAvailability = { day: string; isWorking: boolean; slots: AvailabilitySlot[] };

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function createDefaultWeeklyAvailability(): DayAvailability[] {
  return WEEK_DAYS.map((day) => ({
    day,
    isWorking: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day),
    slots: [],
  }));
}

function normalizeSchedule(raw: any): DayAvailability[] {
  if (typeof raw === 'boolean') {
    if (raw) return createDefaultWeeklyAvailability();
    return WEEK_DAYS.map((day) => ({ day, isWorking: false, slots: [] }));
  }

  const incoming = Array.isArray(raw) ? raw : [];
  const byDay = new Map<string, DayAvailability>();

  for (const item of incoming) {
    const day = WEEK_DAYS.find((d) => d.toLowerCase() === String(item?.day || '').toLowerCase());
    if (!day) continue;
    const slots = Array.isArray(item?.slots)
      ? item.slots
          .filter((s: any) => typeof s?.startTime === 'string' && typeof s?.endTime === 'string')
          .map((s: any) => ({
            startTime: s.startTime.trim(),
            endTime: s.endTime.trim(),
            isAvailable: Boolean(s.isAvailable),
          }))
      : [];

    byDay.set(day, {
      day,
      isWorking: Boolean(item?.isWorking),
      slots,
    });
  }

  return WEEK_DAYS.map((day) => byDay.get(day) ?? { day, isWorking: false, slots: [] });
}

function mapDoctorToFrontend(doc: any) {
  const schedule = normalizeSchedule(doc.availability);
  return {
    id: doc._id.toString(),
    role: 'doctor',
    name: doc.user?.name || '',
    email: doc.user?.email || '',
    phone: doc.user?.phone || '',
    specialization: doc.specialization,
    department: doc.specialization,
    qualification: doc.qualification || 'MBBS, MD',
    experience: doc.experience,
    consultationFee: doc.consultationFee || 500,
    bio: doc.bio || '',
    availability: schedule,
    createdAt: safeIso(doc.createdAt).split('T')[0],
  };
}

export const doctorsService = {
  async list(filters: DoctorFilters = {}) {
    await connectDB();
    const query: any = {};
    if (filters.specialization) query.specialization = filters.specialization;
    if (filters.department) query.specialization = filters.department;

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;

    let doctorQuery: any = { ...query };
    if (filters.search) {
      const userQuery = {
        $or: [{ name: new RegExp(filters.search, 'i') }, { email: new RegExp(filters.search, 'i') }],
      };
      const users = await UserModel.find(userQuery).select('_id');
      doctorQuery.user = { $in: users.map((u) => u._id) };
    }

    const docs = await DoctorModel.find(doctorQuery)
      .populate('user')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await DoctorModel.countDocuments(doctorQuery);
    return {
      items: docs.map(mapDoctorToFrontend),
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  async get(id: string) {
    await connectDB();
    let doc = await DoctorModel.findById(id).populate('user');
    if (!doc && mongoose.isValidObjectId(id)) {
      doc = await DoctorModel.findOne({ user: id }).populate('user');
    }
    if (!doc) return null;
    return mapDoctorToFrontend(doc);
  },

  async create(req: CreateDoctorRequest) {
    await connectDB();
    const existingUser = await UserModel.findOne({ email: req.email });
    if (existingUser) return { ok: false as const, code: 'EMAIL_EXISTS' as const };

    const hashedPassword = await bcrypt.hash(req.password, 10);
    const newUser = await UserModel.create({
      name: req.name,
      email: req.email,
      phone: req.phone,
      password: hashedPassword,
      role: 'Doctor',
    });

    const newDoctor = await DoctorModel.create({
      user: newUser._id,
      specialization: req.specialization || req.department,
      experience: req.experience,
      consultationFee: req.consultationFee,
      bio: req.bio,
      availability: createDefaultWeeklyAvailability(),
    });

    const populated = await newDoctor.populate('user');
    return { ok: true as const, data: mapDoctorToFrontend(populated) };
  },

  async update(id: string, req: UpdateDoctorRequest) {
    await connectDB();
    const doctor = await DoctorModel.findById(id).populate('user');
    if (!doctor) return { ok: false as const, code: 'NOT_FOUND' as const };

    if (req.name || req.phone) {
      const userUpdates: any = {};
      if (req.name) userUpdates.name = req.name;
      if (req.phone) userUpdates.phone = req.phone;
      await UserModel.findByIdAndUpdate((doctor.user as any)._id, userUpdates);
    }

    const docUpdates: any = {};
    if (req.specialization || req.department) docUpdates.specialization = req.specialization || req.department;
    if (req.experience !== undefined) docUpdates.experience = req.experience;
    if (req.consultationFee !== undefined) docUpdates.consultationFee = req.consultationFee;
    if (req.bio !== undefined) docUpdates.bio = req.bio;

    const updatedDoc = await DoctorModel.findByIdAndUpdate(id, docUpdates, { new: true }).populate('user');
    if (!updatedDoc) return { ok: false as const, code: 'NOT_FOUND' as const };
    return { ok: true as const, data: mapDoctorToFrontend(updatedDoc) };
  },

  async remove(id: string) {
    await connectDB();
    const doctor = await DoctorModel.findById(id);
    if (!doctor) return { ok: false as const, code: 'NOT_FOUND' as const };
    await UserModel.findByIdAndDelete(doctor.user);
    await DoctorModel.findByIdAndDelete(id);
    return { ok: true as const };
  },

  async getAvailability(id: string) {
    await connectDB();
    const doctor = await DoctorModel.findById(id).select('availability');
    if (!doctor) return null;
    return normalizeSchedule(doctor.availability);
  },

  async updateAvailability(id: string, schedule: any) {
    await connectDB();
    const normalizedSchedule = normalizeSchedule(schedule);
    const updated = await DoctorModel.findByIdAndUpdate(id, { availability: normalizedSchedule }, { new: true }).select('availability');
    if (!updated) return null;
    return normalizeSchedule(updated.availability);
  },
};

