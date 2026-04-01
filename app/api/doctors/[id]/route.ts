import { NextRequest } from 'next/server';
import { doctorsService } from '@/lib/services/doctors.service';
import { badRequest, notFound, ok, serverError } from '@/lib/utils/apiResponse';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await doctorsService.get(id);
    if (!doc) return notFound('Doctor not found');
    return ok(doc);
  } catch {
    return serverError();
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body || typeof body !== 'object') return badRequest('Invalid request body');
    const result = await doctorsService.update(id, body);
    if (!result.ok) return notFound('Doctor not found');
    return ok(result.data, 'Doctor updated successfully');
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await doctorsService.remove(id);
    if (!result.ok) return notFound('Doctor not found');
    return ok(null, 'Doctor deleted successfully');
  } catch {
    return serverError();
  }
}
