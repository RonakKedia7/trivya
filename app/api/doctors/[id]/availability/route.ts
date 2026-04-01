// app/api/doctors/[id]/availability/route.ts
// GET /api/doctors/:id/availability  → public
// PUT /api/doctors/:id/availability  → doctor self / admin
// PRODUCTION: Validate JWT role; doctor can only update their own availability
import { NextRequest, NextResponse } from 'next/server';
import { doctorsService } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await doctorsService.getAvailability(id);
  if (!result.success) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await doctorsService.updateAvailability(id, { schedule: body.schedule });
    if (!result.success) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
