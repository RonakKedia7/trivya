import { NextRequest } from 'next/server';
import { appointmentsService } from '@/lib/services/appointments.service';
import { badRequest, ok, serverError } from '@/lib/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId') ?? '';
    if (!patientId) return badRequest('patientId is required');
    const stats = await appointmentsService.statsPatient(patientId);
    return ok(stats);
  } catch {
    return serverError();
  }
}
