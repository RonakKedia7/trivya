import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConfig';
import MedicalRecordModel from '@/lib/models/MedicalRecord';
import { serverError } from '@/lib/utils/apiResponse';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const docs = await MedicalRecordModel.find({ patient: id }).populate({ path: 'doctor', populate: { path: 'user' } });
    return NextResponse.json({ success: true, data: docs }, { status: 200 });
  } catch {
    return serverError();
  }
}
