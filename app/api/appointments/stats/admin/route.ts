import { NextRequest } from 'next/server';
import { appointmentsService } from '@/lib/services/appointments.service';
import { getUserFromRequest, hasPendingPasswordReset } from '@/lib/middleware/auth';
import { ok, serverError, unauthorized } from '@/lib/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');
    const today = new Date().toISOString().split('T')[0];
    const stats = await appointmentsService.statsAdmin(today);
    return ok(stats);
  } catch {
    return serverError();
  }
}
