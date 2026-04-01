// app/api/appointments/route.ts
// GET  /api/appointments    → admin (all appointments with filters)
// POST /api/appointments    → patient (book appointment)
// PRODUCTION: Validate JWT; POST enforces patient role; GET enforces admin role
import { NextRequest, NextResponse } from 'next/server';
import { appointmentsService, authService } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filters = {
    status:     searchParams.get('status')     || undefined,
    department: searchParams.get('department') || undefined,
    date:       searchParams.get('date')       || undefined,
    doctorId:   searchParams.get('doctorId')   || undefined,
    patientId:  searchParams.get('patientId')  || undefined,
    search:     searchParams.get('search')     || undefined,
    page:       searchParams.get('page')  ? Number(searchParams.get('page'))  : undefined,
    limit:      searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
  };
  const result = await appointmentsService.getAll(filters);
  return NextResponse.json(result, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // In mock mode, get current user from session store
    const userRes = await authService.getMe();
    if (!userRes.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const result = await appointmentsService.create(userRes.data, {
      doctorId: body.doctorId,
      date:     body.date,
      time:     body.time,
      reason:   body.reason,
    });
    if (!result.success) {
      const isConflict = result.error?.includes('already booked');
      return NextResponse.json({ success: false, error: result.error }, { status: isConflict ? 409 : 400 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
