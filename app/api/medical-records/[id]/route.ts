import { NextRequest } from 'next/server';
import { medicalRecordsService } from '@/lib/services/medical-records.service';
import { badRequest, notFound, ok, serverError } from '@/lib/utils/apiResponse';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const doc = await medicalRecordsService.get(id);
    if (!doc) return notFound('Medical record not found');
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
    const updated = await medicalRecordsService.update(id, body);
    if (!updated) return notFound('Medical record not found');
    return ok(updated);
  } catch {
    return serverError();
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await medicalRecordsService.remove(id);
    return ok(null);
  } catch {
    return serverError();
  }
}
