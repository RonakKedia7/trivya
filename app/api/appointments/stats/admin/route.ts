/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/dbConfig';
import AppointmentModel from '@/lib/models/Appointment';
import DoctorModel from '@/lib/models/Doctor';
import PatientModel from '@/lib/models/Patient';
import { getUserFromRequest, hasPendingPasswordReset } from '@/lib/middleware/auth';
import { ok, serverError, unauthorized } from '@/lib/utils/apiResponse';

function safeIso(date: any): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
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
    await connectDB();
    const today = new Date().toISOString().split('T')[0];
    const totalDoctors = await DoctorModel.countDocuments();
    const totalPatients = await PatientModel.countDocuments();
    const totalAppointments = await AppointmentModel.countDocuments();
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
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
    const stats = {
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
    return ok(stats);
  } catch {
    return serverError();
  }
}
