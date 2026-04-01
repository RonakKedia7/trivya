// app/api/appointments/stats/admin/route.ts
// GET /api/appointments/stats/admin → admin only
// PRODUCTION: Validate admin JWT; run aggregation pipeline on MongoDB
import { NextResponse } from 'next/server';
import { appointmentsService } from '@/lib/api';

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const result = await appointmentsService.getAdminStats(today);
  return NextResponse.json(result, { status: 200 });
}
