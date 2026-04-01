// app/api/appointments/[id]/status/route.ts
// PATCH /api/appointments/:id/status → doctor or admin
// Body: { status: 'in-progress' | 'completed' | 'cancelled', notes?: string }
// PRODUCTION: Enforce status transition rules server-side; validate doctor/admin JWT
import { NextRequest, NextResponse } from 'next/server';
import { appointmentsService } from '@/lib/api';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const result = await appointmentsService.updateStatus(id, {
      status: body.status,
      notes:  body.notes,
    });
    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
