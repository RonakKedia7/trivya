/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/dbConfig';
import DoctorModel from '@/lib/models/Doctor';
import UserModel from '@/lib/models/User';
import { generateTemporaryPassword } from '@/lib/utils/password';
import { badRequest, conflict, created, serverError } from '@/lib/utils/apiResponse';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
function safeIso(date: any): string {
  try {
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}
function createDefaultWeeklyAvailability() {
  return WEEK_DAYS.map((day) => ({ day, isWorking: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].includes(day), slots: [] }));
}
function mapDoctorToFrontend(doc: any) {
  return {
    id: doc._id.toString(),
    role: 'doctor',
    name: doc.user?.name || '',
    email: doc.user?.email || '',
    phone: doc.user?.phone || '',
    specialization: doc.specialization,
    department: doc.specialization,
    qualification: doc.qualification || 'MBBS, MD',
    experience: doc.experience,
    consultationFee: doc.consultationFee || 500,
    bio: doc.bio || '',
    availability: doc.availability || createDefaultWeeklyAvailability(),
    createdAt: safeIso(doc.createdAt).split('T')[0],
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      search: searchParams.get('search') || undefined,
      department: searchParams.get('department') || undefined,
      specialization: searchParams.get('specialization') || undefined,
      page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    };

    await connectDB();
    const query: any = {};
    if (filters.specialization) query.specialization = filters.specialization;
    if (filters.department) query.specialization = filters.department;
    let doctorQuery: any = { ...query };
    if (filters.search) {
      const users = await UserModel.find({
        $or: [{ name: new RegExp(filters.search, 'i') }, { email: new RegExp(filters.search, 'i') }],
      }).select('_id');
      doctorQuery.user = { $in: users.map((u) => u._id) };
    }
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 50;
    const docs = await DoctorModel.find(doctorQuery).populate('user').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit);
    const total = await DoctorModel.countDocuments(doctorQuery);
    const items = docs.map(mapDoctorToFrontend);
    const pagination = { total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
    return NextResponse.json({ success: true, data: items, pagination }, { status: 200 });
  } catch {
    return serverError();
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.name || !body?.email) return badRequest('name and email are required');
    await connectDB();
    const existingUser = await UserModel.findOne({ email: body.email });
    if (existingUser) return conflict('A doctor with this email already exists');
    const temporaryPassword = generateTemporaryPassword();
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const newUser = await UserModel.create({
      name: body.name,
      email: body.email,
      phone: body.phone,
      password: hashedPassword,
      role: 'Doctor',
      mustChangePassword: true,
    });
    const newDoctor = await DoctorModel.create({
      user: newUser._id,
      specialization: body.specialization || body.department,
      experience: body.experience,
      consultationFee: body.consultationFee,
      bio: body.bio,
      availability: createDefaultWeeklyAvailability(),
    });
    const populated = await newDoctor.populate('user');
    return created({ doctor: mapDoctorToFrontend(populated), temporaryPassword }, 'Doctor created successfully');
  } catch {
    return serverError();
  }
}
