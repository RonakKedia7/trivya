// app/api/doctors/route.ts
// GET  /api/doctors?search=&department=&page=&limit=   → public list
// POST /api/doctors                                      → admin only (create doctor)
// PRODUCTION: Validate admin JWT, insert into MongoDB users + doctors collections
import { NextRequest, NextResponse } from 'next/server';
import { doctorsService } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filters = {
    search:         searchParams.get('search')         || undefined,
    department:     searchParams.get('department')     || undefined,
    specialization: searchParams.get('specialization') || undefined,
    page:           searchParams.get('page')  ? Number(searchParams.get('page'))  : undefined,
    limit:          searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
  };
  const result = await doctorsService.getAll(filters);
  return NextResponse.json(result, { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await doctorsService.create(body);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 409 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
