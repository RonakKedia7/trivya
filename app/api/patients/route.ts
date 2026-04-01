/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/dbConfig';
import PatientModel from '@/lib/models/Patient';
import UserModel from '@/lib/models/User';
import { serverError } from '@/lib/utils/apiResponse';

function safeIso(date: any): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}
function mapPatientToFrontend(doc: any) {
  return {
    id: doc._id.toString(),
    role: 'patient',
    name: doc.user?.name || '',
    email: doc.user?.email || '',
    phone: doc.user?.phone || doc.contactNumber || '',
    dateOfBirth: doc.dateOfBirth ? safeIso(doc.dateOfBirth).split('T')[0] : '',
    gender: doc.gender ? doc.gender.toString().toLowerCase() : '',
    bloodGroup: doc.bloodGroup || '',
    address: doc.address || '',
    emergencyContact: '',
    createdAt: doc.createdAt ? safeIso(doc.createdAt).split('T')[0] : '',
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    await connectDB();
    const search = searchParams.get('search') || undefined;
    const page = searchParams.get('page') ? Number(searchParams.get('page')) : 1;
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : 50;
    let patientQuery: any = {};
    if (search) {
      const users = await UserModel.find({
        $or: [{ name: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }],
      }).select('_id');
      patientQuery = { user: { $in: users.map((u) => u._id) } };
    }
    const docs = await PatientModel.find(patientQuery).populate('user').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await PatientModel.countDocuments(patientQuery);
    const items = docs.map(mapPatientToFrontend);
    const pagination = { total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
    return NextResponse.json({ success: true, data: items, pagination }, { status: 200 });
  } catch {
    return serverError();
  }
}
