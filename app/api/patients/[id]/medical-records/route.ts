// app/api/patients/[id]/medical-records/route.ts
// GET /api/patients/:id/medical-records → admin, self (patient), or attending doctor
// PRODUCTION: Validate JWT; check role access rules
import { NextRequest, NextResponse } from 'next/server';
import { patientsService } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await patientsService.getMedicalRecords(id);
  return NextResponse.json(result, { status: 200 });
}
