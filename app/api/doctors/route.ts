import { NextRequest, NextResponse } from 'next/server';
import { doctorsService } from '@/lib/services/doctors.service';
import { badRequest, conflict, created, serverError } from '@/lib/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      search: searchParams.get('search') || undefined,
      department: searchParams.get('department') || undefined,
      specialization: searchParams.get('specialization') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    };

    const { items, pagination } = await doctorsService.list(filters);
    return NextResponse.json({ success: true, data: items, pagination }, { status: 200 });
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.name || !body?.email || !body?.password) return badRequest('name, email, and password are required');
    const result = await doctorsService.create(body);
    if (!result.ok && result.code === 'EMAIL_EXISTS') return conflict('A doctor with this email already exists');
    if (!result.ok) return serverError();
    return created(result.data, 'Doctor created successfully');
  } catch {
    return serverError();
  }
}
