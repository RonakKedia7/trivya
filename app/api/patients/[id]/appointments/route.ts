import { NextRequest, NextResponse } from 'next/server';
import { patientsService } from '@/lib/services/patients.service';
import { serverError } from '@/lib/utils/apiResponse';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const docs = await patientsService.listAppointments(id);
    return NextResponse.json({ success: true, data: docs }, { status: 200 });
  } catch {
    return serverError();
  }
}
