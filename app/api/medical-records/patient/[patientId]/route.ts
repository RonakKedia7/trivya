// app/api/medical-records/patient/[patientId]/route.ts
// GET /api/medical-records/patient/:patientId → admin, self (patient), or attending doctor
import { NextRequest, NextResponse } from 'next/server';
import { medicalRecordsService } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params;
  const result = await medicalRecordsService.getByPatient(patientId);
  return NextResponse.json(result, { status: 200 });
}
