// app/api/appointments/[id]/route.ts
// GET    /api/appointments/:id  → any authenticated user
// DELETE /api/appointments/:id  → patient (cancel) / admin
// PRODUCTION: Validate JWT; patient can only cancel their own appointment
import { NextRequest, NextResponse } from 'next/server';
import { appointmentsService } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await appointmentsService.getById(id);
  if (!result.success) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result, { status: 200 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await appointmentsService.cancel(id);
  if (!result.success) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result, { status: 200 });
}
