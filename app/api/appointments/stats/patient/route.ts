/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/dbConfig';
import AppointmentModel from '@/lib/models/Appointment';
import MedicalRecordModel from '@/lib/models/MedicalRecord';
import { getUserFromRequest, hasPendingPasswordReset } from '@/lib/middleware/auth';
import { badRequest, ok, serverError, unauthorized } from '@/lib/utils/apiResponse';

function safeIso(date: any): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export async function GET(req: NextRequest) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId') ?? '';
    if (!patientId) return badRequest('patientId is required');
    await connectDB();
    const now = new Date();
    const upcomingAppointments = await AppointmentModel.countDocuments({ patient: patientId, date: { $gte: now }, status: { $in: ['Scheduled', 'Pending'] } });
    const totalVisits = await AppointmentModel.countDocuments({ patient: patientId, status: { $in: ['Completed', 'Scheduled'] } });
    const totalRecords = await MedicalRecordModel.countDocuments({ patient: patientId });
    const next = await AppointmentModel.findOne({ patient: patientId, date: { $gte: now }, status: { $in: ['Scheduled', 'Pending'] } })
      .sort({ date: 1 })
      .populate({ path: 'doctor', populate: { path: 'user' } });
    const nextAppointment = next ? { date: safeIso(next.date).split('T')[0], time: next.timeSlot } : null;
    const stats = { upcomingAppointments, totalVisits, totalRecords, nextAppointment };
    return ok(stats);
  } catch {
    return serverError();
  }
}
