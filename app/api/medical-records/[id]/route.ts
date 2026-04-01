// app/api/medical-records/[id]/route.ts
// GET /api/medical-records/:id → any authenticated
// PUT /api/medical-records/:id → doctor only (not finalized)
// PRODUCTION: Check finalized flag server-side; validate doctor ownership
import { NextRequest, NextResponse } from 'next/server';
import { medicalRecordsService } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await medicalRecordsService.getById(id);
  if (!result.success) return NextResponse.json(result, { status: 404 });
  return NextResponse.json(result, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await medicalRecordsService.update(id, body);
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
