// app/api/appointments/stats/patient/route.ts
// GET /api/appointments/stats/patient?patientId=...  → patient only
// PRODUCTION: Derive patientId from JWT sub; validate role
import { NextRequest, NextResponse } from 'next/server';
import { appointmentsService } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId') ?? '';
  const result = await appointmentsService.getPatientStats(patientId);
  return NextResponse.json(result, { status: 200 });
}
