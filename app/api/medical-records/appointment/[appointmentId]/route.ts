// app/api/medical-records/appointment/[appointmentId]/route.ts
// GET /api/medical-records/appointment/:appointmentId → any authenticated user
import { NextRequest, NextResponse } from 'next/server';
import { medicalRecordsService } from '@/lib/api';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ appointmentId: string }> }) {
  const { appointmentId } = await params;
  const result = await medicalRecordsService.getByAppointment(appointmentId);
  return NextResponse.json(result, { status: 200 });
}
