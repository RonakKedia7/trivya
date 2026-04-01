import { NextRequest } from 'next/server';
import { doctorsService } from '@/lib/services/doctors.service';
import { getUserFromRequest, hasPendingPasswordReset } from '@/lib/middleware/auth';
import { badRequest, ok, serverError, unauthorized } from '@/lib/utils/apiResponse';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = getUserFromRequest(_req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    const { id } = await params;
    const data = await doctorsService.getAvailability(id);
    if (!data) return notFound('Doctor not found');
    return ok(data);
  } catch {
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    const { id } = await params;
    const body = await req.json();
    if (!body?.schedule) return badRequest('schedule is required');
    const updated = await doctorsService.updateAvailability(id, body.schedule);
    if (!updated) return badRequest('Invalid availability payload or overlapping time slots');
    return ok(updated, 'Availability updated successfully');
  } catch {
    return serverError();
  }
}
