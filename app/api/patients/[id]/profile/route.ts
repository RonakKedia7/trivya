// app/api/patients/[id]/profile/route.ts
// PUT /api/patients/:id/profile  → self or admin
// PRODUCTION: Validate JWT; enforce self-access rule; update MongoDB users + patients docs
import { NextRequest, NextResponse } from 'next/server';
import { patientsService } from '@/lib/api';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await patientsService.updateProfile(id, body);
    if (!result.success) return NextResponse.json(result, { status: 404 });
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
