import { NextRequest } from 'next/server';
import { appointmentsService } from '@/lib/services/appointments.service';
import { getUserFromRequest, hasPendingPasswordReset } from '@/lib/middleware/auth';
import { notFound, ok, serverError, unauthorized } from '@/lib/utils/apiResponse';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = getUserFromRequest(_req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    const { id } = await params;
    const doc = await appointmentsService.get(id);
    if (!doc) return notFound('Appointment not found');
    return ok(doc);
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
    const result = await appointmentsService.cancel(id);
    if (!result.ok) return notFound('Appointment not found');
    return ok(result.data);
  } catch {
    return serverError();
  }
}
