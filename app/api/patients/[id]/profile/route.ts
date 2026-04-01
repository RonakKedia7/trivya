import { NextRequest } from 'next/server';
import { patientsService } from '@/lib/services/patients.service';
import { badRequest, notFound, ok, serverError } from '@/lib/utils/apiResponse';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body || typeof body !== 'object') return badRequest('Invalid request body');
    const result = await patientsService.updateProfile(id, body);
    if (!result.ok) return notFound('Patient not found');
    return ok(result.data, 'Profile updated successfully');
  } catch {
    return serverError();
  }
}
