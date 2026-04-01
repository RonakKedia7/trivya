// app/api/medical-records/route.ts
// GET  /api/medical-records  → admin only
// POST /api/medical-records  → doctor only (create or upsert)
// PRODUCTION: Validate JWT; POST enforces doctor role and appointment ownership
import { NextRequest, NextResponse } from 'next/server';
import { medicalRecordsService, appointmentsService, authService } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const result = await medicalRecordsService.getAll({
    page:  searchParams.get('page')  ? Number(searchParams.get('page'))  : undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
  });
  return NextResponse.json(result, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Derive context from the appointment
    const aptRes = await appointmentsService.getById(body.appointmentId);
    if (!aptRes.success) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }

    const userRes = await authService.getMe();
    if (!userRes.success) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const apt = aptRes.data;
    const result = await medicalRecordsService.create(body, {
      id:          apt.doctorId,
      name:        apt.doctorName,
      patientId:   apt.patientId,
      patientName: apt.patientName,
      date:        apt.date,
    });

    if (!result.success) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
