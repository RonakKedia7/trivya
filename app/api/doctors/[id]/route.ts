// app/api/doctors/[id]/route.ts
// GET    /api/doctors/:id  → public
// PUT    /api/doctors/:id  → admin / self doctor
// DELETE /api/doctors/:id  → admin only
// PRODUCTION: Validate JWT role before PUT/DELETE
import { NextRequest, NextResponse } from 'next/server';
import { doctorsService } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await doctorsService.getById(id);
  if (!result.success) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await doctorsService.update(id, body);
    if (!result.success) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await doctorsService.delete(id);
  if (!result.success) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result, { status: 200 });
}
