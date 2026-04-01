/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConfig';
import MedicalRecordModel from '@/lib/models/MedicalRecord';
import AppointmentModel from '@/lib/models/Appointment';
import { getUserFromRequest } from '@/lib/middleware/auth';
import { badRequest, created, notFound, serverError, unauthorized } from '@/lib/utils/apiResponse';

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    await connectDB();
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;
    const docs = await MedicalRecordModel.find()
      .populate({ path: 'patient', populate: { path: 'user' } })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const data = docs.map(mapRecordToFrontend);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();

    if (!body?.appointmentId || !body?.diagnosis) return badRequest('appointmentId and diagnosis are required');

    // Derive patient/doctor from the appointment (source of truth)
    await connectDB();
    const apt = await AppointmentModel.findById(body.appointmentId)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } });
    if (!apt) return notFound('Appointment not found');

    const recordDoc = await MedicalRecordModel.create({
      appointment: body.appointmentId,
      patient: apt.patient,
      doctor: apt.doctor,
      diagnosis: body.diagnosis,
      prescription: body.prescription || body.treatment || '',
      notes: body.notes,
    });
    const populated = await recordDoc.populate([
      { path: 'patient', populate: { path: 'user' } },
      { path: 'doctor', populate: { path: 'user' } },
    ]);
    const record = mapRecordToFrontend(populated);

    return created(record);
  } catch {
    return serverError();
  }
}
