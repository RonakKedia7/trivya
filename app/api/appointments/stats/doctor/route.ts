import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/dbConfig';
import AppointmentModel from '@/lib/models/Appointment';
import { getUserFromRequest, hasPendingPasswordReset } from '@/lib/middleware/auth';
import { badRequest, ok, serverError, unauthorized } from '@/lib/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get('doctorId') ?? '';
    if (!doctorId) return badRequest('doctorId is required');
    await connectDB();
    const today = new Date().toISOString().split('T')[0];
    const startOfDay = new Date(today);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const todayAppointments = await AppointmentModel.countDocuments({ doctor: doctorId, date: { $gte: startOfDay, $lte: endOfDay } });
    const upcomingAppointments = await AppointmentModel.countDocuments({ doctor: doctorId, date: { $gt: endOfDay }, status: { $in: ['Scheduled', 'Pending'] } });
    const completedAppointments = await AppointmentModel.countDocuments({ doctor: doctorId, status: 'Completed' });
    const patientIds = await AppointmentModel.distinct('patient', { doctor: doctorId });
    const stats = { todayAppointments, upcomingAppointments, completedAppointments, totalPatients: patientIds.length };
    return ok(stats);
  } catch {
    return serverError();
  }
}
