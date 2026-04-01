import { NextRequest, NextResponse } from 'next/server';
import { patientsService } from '@/lib/services/patients.service';
import { serverError } from '@/lib/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { items, pagination } = await patientsService.list({
      search: searchParams.get('search') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    });
    return NextResponse.json({ success: true, data: items, pagination }, { status: 200 });
  } catch {
    return serverError();
  }
}
