import { NextRequest, NextResponse } from 'next/server';
import { appointmentsService } from '@/lib/services/appointments.service';
import { getUserFromRequest, hasPendingPasswordReset } from '@/lib/middleware/auth';
import { badRequest, created, serverError, unauthorized } from '@/lib/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      department: searchParams.get('department') || undefined,
      date: searchParams.get('date') || undefined,
      doctorId: searchParams.get('doctorId') || undefined,
      patientId: searchParams.get('patientId') || undefined,
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    };

    const { items, pagination } = await appointmentsService.listAll(filters);
    return NextResponse.json({ success: true, data: items, pagination }, { status: 200 });
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (await hasPendingPasswordReset(decoded.id)) return unauthorized('You must update your password before continuing');

    if (!body?.doctorId || !body?.date || !body?.time) {
      return badRequest('doctorId, date, and time are required');
    }

    const result = await appointmentsService.create(decoded.id, {
      doctorId: body.doctorId,
      date: body.date,
      time: body.time,
      reason: body.reason ?? '',
    });

    if (!result.ok) {
      if (result.code === 'CONFLICT') {
        return NextResponse.json({ success: false, message: result.message, error: result.message }, { status: 409 });
      }
      return badRequest(result.message ?? 'Unable to create appointment');
    }

    return created(result.data);
  } catch {
    return serverError();
  }
}
