import { NextRequest, NextResponse } from 'next/server';
import { medicalRecordsService } from '@/lib/services/medical-records.service';
import { appointmentsService } from '@/lib/services/appointments.service';
import { getUserFromRequest } from '@/lib/middleware/auth';
import { badRequest, created, notFound, serverError, unauthorized } from '@/lib/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const data = await medicalRecordsService.listAll({
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();

    if (!body?.appointmentId || !body?.diagnosis) return badRequest('appointmentId and diagnosis are required');

    // Derive patient/doctor from the appointment (source of truth)
    const apt = await appointmentsService.get(body.appointmentId);
    if (!apt) return notFound('Appointment not found');

    const record = await medicalRecordsService.create(
      {
        appointmentId: body.appointmentId,
        diagnosis: body.diagnosis,
        treatment: body.treatment ?? body.prescription ?? '',
        prescription: body.prescription,
        notes: body.notes,
        finalized: body.finalized ?? true,
      },
      apt.patientId,
      apt.doctorId,
    );

    return created(record);
  } catch {
    return serverError();
  }
}
