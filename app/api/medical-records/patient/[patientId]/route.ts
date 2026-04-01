import { NextRequest, NextResponse } from 'next/server';
import { medicalRecordsService } from '@/lib/services/medical-records.service';
import { serverError } from '@/lib/utils/apiResponse';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ patientId: string }> }) {
  try {
    const { patientId } = await params;
    const data = await medicalRecordsService.listByPatient(patientId);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return serverError();
  }
}
