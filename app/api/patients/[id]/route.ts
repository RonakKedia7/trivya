import { NextRequest } from 'next/server';
import { patientsService } from '@/lib/services/patients.service';
import { notFound, ok, serverError } from '@/lib/utils/apiResponse';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await patientsService.get(id);
    if (!doc) return notFound('Patient not found');
    return ok(doc);
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await patientsService.remove(id);
    if (!result.ok) return notFound('Patient not found');
    return ok(null, 'Patient deleted successfully');
  } catch {
    return serverError();
  }
}
