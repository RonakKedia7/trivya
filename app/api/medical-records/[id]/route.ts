/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/dbConfig';
import MedicalRecordModel from '@/lib/models/MedicalRecord';
import { badRequest, notFound, ok, serverError } from '@/lib/utils/apiResponse';

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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const doc = await MedicalRecordModel.findById(id)
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } });
    if (!doc) return notFound('Medical record not found');
    return ok(mapRecordToFrontend(doc));
  } catch {
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body || typeof body !== 'object') return badRequest('Invalid request body');
    await connectDB();
    const updated = await MedicalRecordModel.findByIdAndUpdate(
      id,
      {
        ...(body.diagnosis !== undefined ? { diagnosis: body.diagnosis } : {}),
        ...(body.prescription !== undefined || body.treatment !== undefined
          ? { prescription: body.prescription || body.treatment }
          : {}),
        ...(body.notes !== undefined ? { notes: body.notes } : {}),
      },
      { new: true },
    )
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } });
    if (!updated) return notFound('Medical record not found');
    return ok(mapRecordToFrontend(updated));
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    await MedicalRecordModel.findByIdAndDelete(id);
    return ok(null);
  } catch {
    return serverError();
  }
}
