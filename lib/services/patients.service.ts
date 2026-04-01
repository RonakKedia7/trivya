import 'server-only';

import mongoose from 'mongoose';
import { connectDB } from '@/lib/dbConfig';
import PatientModel from '@/lib/models/Patient';
import UserModel from '@/lib/models/User';
import AppointmentModel from '@/lib/models/Appointment';
import MedicalRecordModel from '@/lib/models/MedicalRecord';
import { safeIso } from './mappers';

type ListOptions = { search?: string; page?: number; limit?: number };
type UpdatePatientProfileRequest = {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  medicalHistory?: string;
  allergies?: string;
};

function mapPatientToFrontend(doc: any) {
  return {
    id: doc._id.toString(),
    role: 'patient',
    name: doc.user?.name || '',
    email: doc.user?.email || '',
    phone: doc.user?.phone || doc.contactNumber || '',
    dateOfBirth: doc.dateOfBirth ? safeIso(doc.dateOfBirth).split('T')[0] : '',
    gender: doc.gender ? doc.gender.toString().toLowerCase() : '',
    bloodGroup: doc.bloodGroup || '',
    address: doc.address || '',
    emergencyContact: '',
    createdAt: doc.createdAt ? safeIso(doc.createdAt).split('T')[0] : '',
  };
}

export const patientsService = {
  async list(options: ListOptions = {}) {
    await connectDB();
    const page = options.page ?? 1;
    const limit = options.limit ?? 50;

    let patientQuery: any = {};
    if (options.search) {
      const users = await UserModel.find({
        $or: [{ name: new RegExp(options.search, 'i') }, { email: new RegExp(options.search, 'i') }],
      }).select('_id');
      patientQuery = { user: { $in: users.map((u) => u._id) } };
    }

    const docs = await PatientModel.find(patientQuery)
      .populate('user')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await PatientModel.countDocuments(patientQuery);
    return { items: docs.map(mapPatientToFrontend), pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 } };
  },

  async get(id: string) {
    await connectDB();
    let doc = await PatientModel.findById(id).populate('user');
    if (!doc && mongoose.isValidObjectId(id)) {
      doc = await PatientModel.findOne({ user: id }).populate('user');
    }
    if (!doc) return null;
    return mapPatientToFrontend(doc);
  },

  async updateProfile(id: string, req: UpdatePatientProfileRequest) {
    await connectDB();
    const patient = await PatientModel.findById(id).populate('user');
    if (!patient) return { ok: false as const, code: 'NOT_FOUND' as const };

    if (req.name || req.phone) {
      const userUpdates: any = {};
      if (req.name) userUpdates.name = req.name;
      if (req.phone) userUpdates.phone = req.phone;
      await UserModel.findByIdAndUpdate((patient.user as any)._id, userUpdates);
    }

    const updates: any = {};
    if (req.dateOfBirth) updates.dateOfBirth = new Date(req.dateOfBirth);
    if (req.gender) updates.gender = req.gender === 'male' ? 'Male' : req.gender === 'female' ? 'Female' : 'Other';
    if (req.bloodGroup) updates.bloodGroup = req.bloodGroup;
    if (req.address) updates.address = req.address;
    if (req.phone) updates.contactNumber = req.phone;

    const updated = await PatientModel.findByIdAndUpdate(id, updates, { new: true }).populate('user');
    if (!updated) return { ok: false as const, code: 'NOT_FOUND' as const };
    return { ok: true as const, data: mapPatientToFrontend(updated) };
  },

  async remove(id: string) {
    await connectDB();
    const patient = await PatientModel.findById(id);
    if (!patient) return { ok: false as const, code: 'NOT_FOUND' as const };
    await UserModel.findByIdAndDelete(patient.user);
    await PatientModel.findByIdAndDelete(id);
    return { ok: true as const };
  },

  async listAppointments(patientId: string) {
    await connectDB();
    const docs = await AppointmentModel.find({ patient: patientId }).populate({ path: 'doctor', populate: { path: 'user' } });
    return docs;
  },

  async listMedicalRecords(patientId: string) {
    await connectDB();
    const docs = await MedicalRecordModel.find({ patient: patientId }).populate({ path: 'doctor', populate: { path: 'user' } });
    return docs;
  },
};

