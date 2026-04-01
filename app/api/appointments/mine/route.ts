// app/api/appointments/mine/route.ts
// GET /api/appointments/mine → doctor or patient — returns own appointments
// PRODUCTION: Decode JWT, filter by role (patientId or doctorId)
import { NextRequest, NextResponse } from 'next/server';
import { appointmentsService, authService } from '@/lib/api';

export async function GET(req: NextRequest) {
  const userRes = await authService.getMe();
  if (!userRes.success) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = {
    status: searchParams.get('status') || undefined,
    date:   searchParams.get('date')   || undefined,
    page:   searchParams.get('page')  ? Number(searchParams.get('page'))  : undefined,
    limit:  searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
  };

  const result = await appointmentsService.getMine(userRes.data, filters);
  return NextResponse.json(result, { status: 200 });
}
