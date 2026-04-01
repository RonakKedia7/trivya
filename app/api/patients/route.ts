// app/api/patients/route.ts
// GET /api/patients  → admin only
// PRODUCTION: Validate admin JWT; paginate MongoDB query
import { NextRequest, NextResponse } from 'next/server';
import { patientsService } from '@/lib/api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const result = await patientsService.getAll({
    search: searchParams.get('search') || undefined,
    page:   searchParams.get('page')  ? Number(searchParams.get('page'))  : undefined,
    limit:  searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
  });
  return NextResponse.json(result, { status: 200 });
}
