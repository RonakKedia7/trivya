// app/api/appointments/stats/doctor/route.ts
// GET /api/appointments/stats/doctor?doctorId=...  → doctor only
// PRODUCTION: Derive doctorId from JWT sub; validate role
import { NextRequest, NextResponse } from 'next/server';
import { appointmentsService } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const doctorId = searchParams.get('doctorId') ?? '';
  const today = new Date().toISOString().split('T')[0];
  const result = await appointmentsService.getDoctorStats(doctorId, today);
  return NextResponse.json(result, { status: 200 });
}
