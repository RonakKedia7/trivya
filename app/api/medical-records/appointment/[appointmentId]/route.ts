/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/dbConfig';
import MedicalRecordModel from '@/lib/models/MedicalRecord';
import { ok, serverError } from '@/lib/utils/apiResponse';

function safeIso(date: any): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ appointmentId: string }> }) {
  try {
    const { appointmentId } = await params;
    await connectDB();
    const doc = await MedicalRecordModel.findOne({ appointment: appointmentId })
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .sort({ date: -1 });
    const data = doc ? mapRecordToFrontend(doc) : null;
    return ok(data);
  } catch {
    return serverError();
  }
}
