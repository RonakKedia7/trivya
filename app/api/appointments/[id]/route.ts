/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/dbConfig';
import AppointmentModel from '@/lib/models/Appointment';
import DoctorModel from '@/lib/models/Doctor';
import { getUserFromRequest, hasPendingPasswordReset } from '@/lib/middleware/auth';
import { notFound, ok, serverError, unauthorized } from '@/lib/utils/apiResponse';

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
  return ((Number(h12[1]) % 12) + (h12[3] === 'PM' ? 12 : 0)) * 60 + Number(h12[2]);
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

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = getUserFromRequest(_req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    const { id } = await params;
    await connectDB();
    const doc = await AppointmentModel.findById(id)
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } });
    if (!doc) return notFound('Appointment not found');
    return ok(mapAppointmentToFrontend(doc));
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = getUserFromRequest(_req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    const { id } = await params;
    await connectDB();
    const doc = await AppointmentModel.findByIdAndUpdate(id, { status: 'Cancelled' }, { new: true })
      .populate({ path: 'doctor', populate: { path: 'user' } })
      .populate({ path: 'patient', populate: { path: 'user' } });
    if (!doc) return notFound('Appointment not found');
    if (doc.doctor?._id) {
      const doctorDoc = await DoctorModel.findById(doc.doctor._id);
      if (doctorDoc) {
        const dateStr = safeIso(doc.date).split('T')[0];
        const bookingMinutes = parseTimeToMinutes(doc.timeSlot);
        const dayName = new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const nextSchedule = (doctorDoc.availability as any[]).map((d) => {
          if (String(d.day).toLowerCase() !== dayName) return d;
          return {
            ...d,
            slots: (d.slots || []).map((s: any) => {
              const ss = parseTimeToMinutes(s.startTime);
              const ee = parseTimeToMinutes(s.endTime);
              if (ss !== null && ee !== null && bookingMinutes !== null && bookingMinutes >= ss && bookingMinutes < ee) {
                return { ...s, isAvailable: true };
              }
              return s;
            }),
          };
        });
        await DoctorModel.findByIdAndUpdate(doctorDoc._id, { availability: nextSchedule });
      }
    }
    return ok(mapAppointmentToFrontend(doc));
  } catch {
    return serverError();
  }
}
