// app/api/medical-records/doctor/[doctorId]/route.ts
// GET /api/medical-records/doctor/:doctorId → admin or self (doctor)
import { NextRequest, NextResponse } from 'next/server';
import { medicalRecordsService } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ doctorId: string }> }) {
  const { doctorId } = await params;
  const result = await medicalRecordsService.getByDoctor(doctorId);
  return NextResponse.json(result, { status: 200 });
}
