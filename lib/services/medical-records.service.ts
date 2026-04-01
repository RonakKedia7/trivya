import 'server-only';

import { connectDB } from '@/lib/dbConfig';
import MedicalRecordModel from '@/lib/models/MedicalRecord';
import { safeIso } from './mappers';

type CreateMedicalRecordRequest = {
  appointmentId: string;
  diagnosis: string;
  treatment: string;
  prescription?: string;
  notes?: string;
  finalized: boolean;
};

type UpdateMedicalRecordRequest = Partial<CreateMedicalRecordRequest>;

function mapRecordToFrontend(doc: any) {
  return {
    id: doc._id.toString(),
    appointmentId: doc.appointment?._id?.toString?.() || doc.appointment?.toString?.() || '',
    patientId: doc.patient?._id?.toString?.() || doc.patient?.toString?.() || '',
    patientName: doc.patient?.user?.name || 'Unknown Patient',
    doctorId: doc.doctor?._id?.toString?.() || doc.doctor?.toString?.() || '',
    doctorName: doc.doctor?.user?.name || 'Unknown Doctor',
    diagnosis: doc.diagnosis,
    visitDate: safeIso(doc.date).split('T')[0],
    treatment: doc.prescription,
    prescription: doc.prescription,
    notes: doc.notes,
    finalized: true,
    updatedAt: safeIso(doc.updatedAt),
  };
}

export const medicalRecordsService = {
  async listAll(options: { page?: number; limit?: number } = {}) {
    await connectDB();
    const page = options.page ?? 1;
    const limit = options.limit ?? 50;
    const docs = await MedicalRecordModel.find()
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    return docs.map(mapRecordToFrontend);
  },

  async get(id: string) {
    await connectDB();
    const doc = await MedicalRecordModel.findById(id)
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } });
    if (!doc) return null;
    return mapRecordToFrontend(doc);
  },

  async listByPatient(patientId: string) {
    await connectDB();
    const docs = await MedicalRecordModel.find({ patient: patientId })
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .sort({ date: -1 });
    return docs.map(mapRecordToFrontend);
  },

  async listByDoctor(doctorId: string) {
    await connectDB();
    const docs = await MedicalRecordModel.find({ doctor: doctorId })
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .sort({ date: -1 });
    return docs.map(mapRecordToFrontend);
  },

  async getByAppointment(appointmentId: string) {
    await connectDB();
    const doc = await MedicalRecordModel.findOne({ appointment: appointmentId })
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .sort({ date: -1 });
    return doc ? mapRecordToFrontend(doc) : null;
  },

  async create(req: CreateMedicalRecordRequest, patientId: string, doctorId: string) {
    await connectDB();
    const doc = await MedicalRecordModel.create({
      appointment: req.appointmentId,
      patient: patientId,
      doctor: doctorId,
      diagnosis: req.diagnosis,
      prescription: req.prescription || req.treatment,
      notes: req.notes,
    });
    const populated = await doc.populate([
      { path: 'patient', populate: { path: 'user' } },
      { path: 'doctor', populate: { path: 'user' } },
    ]);
    return mapRecordToFrontend(populated);
  },

  async update(id: string, req: UpdateMedicalRecordRequest) {
    await connectDB();
    const doc = await MedicalRecordModel.findByIdAndUpdate(
      id,
      {
        ...(req.diagnosis !== undefined ? { diagnosis: req.diagnosis } : {}),
        ...(req.prescription !== undefined || req.treatment !== undefined
          ? { prescription: req.prescription || req.treatment }
          : {}),
        ...(req.notes !== undefined ? { notes: req.notes } : {}),
      },
      { new: true },
    )
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } });
    if (!doc) return null;
    return mapRecordToFrontend(doc);
  },

  async remove(id: string) {
    await connectDB();
    await MedicalRecordModel.findByIdAndDelete(id);
    return true;
  },
};

