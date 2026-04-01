// app/api/patients/[id]/appointments/route.ts
// GET /api/patients/:id/appointments → admin or self (patient)
// PRODUCTION: Validate JWT; self-access check
import { NextRequest, NextResponse } from 'next/server';
import { patientsService } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await patientsService.getAppointments(id);
  return NextResponse.json(result, { status: 200 });
}
