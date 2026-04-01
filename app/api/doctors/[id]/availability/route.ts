import { NextRequest } from 'next/server';
import { doctorsService } from '@/lib/services/doctors.service';
import { badRequest, notFound, ok, serverError } from '@/lib/utils/apiResponse';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
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
    const { id } = await params;
    const body = await req.json();
    if (!body?.schedule) return badRequest('schedule is required');
    const updated = await doctorsService.updateAvailability(id, body.schedule);
    return ok(updated, 'Availability updated successfully');
  } catch {
    return serverError();
  }
}
