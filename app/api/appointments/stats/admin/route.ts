import { appointmentsService } from '@/lib/services/appointments.service';
import { ok, serverError } from '@/lib/utils/apiResponse';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const stats = await appointmentsService.statsAdmin(today);
    return ok(stats);
  } catch {
    return serverError();
  }
}
