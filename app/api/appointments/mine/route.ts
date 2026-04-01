import { NextRequest, NextResponse } from 'next/server';
import { appointmentsService } from '@/lib/services/appointments.service';
import { getUserFromRequest } from '@/lib/middleware/auth';
import { serverError, unauthorized } from '@/lib/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();

    const { searchParams } = new URL(req.url);
    const filters = {
      status: searchParams.get('status') || undefined,
      date: searchParams.get('date') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    };

    const result = await appointmentsService.listMine(decoded.id, filters);
    if (!result.ok) return unauthorized();
    return NextResponse.json({ success: true, data: result.items, pagination: result.pagination }, { status: 200 });
  } catch {
    return serverError();
  }
}
