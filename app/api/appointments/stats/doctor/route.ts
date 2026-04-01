import { NextRequest } from 'next/server';
import { appointmentsService } from '@/lib/services/appointments.service';
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
    const today = new Date().toISOString().split('T')[0];
    const stats = await appointmentsService.statsDoctor(doctorId, today);
    return ok(stats);
  } catch {
    return serverError();
  }
}
