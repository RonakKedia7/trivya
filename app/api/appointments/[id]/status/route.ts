import { NextRequest } from 'next/server';
import { appointmentsService } from '@/lib/services/appointments.service';
import { badRequest, notFound, ok, serverError, unauthorized } from '@/lib/utils/apiResponse';
import { getUserFromRequest, hasPendingPasswordReset } from '@/lib/middleware/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    const { id } = await params;
    const body = await req.json();
    if (!body?.status) return badRequest('status is required');

    const result = await appointmentsService.updateStatus(id, { status: body.status, notes: body.notes });
    if (!result.ok) return notFound('Appointment not found');
    return ok(result.data);
  } catch {
    return serverError();
  }
}
