// app/api/patients/[id]/route.ts
// GET    /api/patients/:id  → admin or self
// DELETE /api/patients/:id  → admin only
// PRODUCTION: Validate JWT; self-access check for GET
import { NextRequest, NextResponse } from 'next/server';
import { patientsService } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await patientsService.getById(id);
  if (!result.success) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result, { status: 200 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await patientsService.delete(id);
  if (!result.success) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result, { status: 200 });
}
