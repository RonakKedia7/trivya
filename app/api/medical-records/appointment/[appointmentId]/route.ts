import { NextRequest } from 'next/server';
import { medicalRecordsService } from '@/lib/services/medical-records.service';
import { ok, serverError } from '@/lib/utils/apiResponse';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ appointmentId: string }> }) {
  try {
    const { appointmentId } = await params;
    const data = await medicalRecordsService.getByAppointment(appointmentId);
    return ok(data);
  } catch {
    return serverError();
  }
}
