import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/dbConfig';
import UserModel from '@/lib/models/User';
import DoctorModel from '@/lib/models/Doctor';
import PatientModel from '@/lib/models/Patient';
import { signToken } from '@/lib/utils/jwt';
import { isEnvAdminEmail } from '@/lib/config/admin';
import { isStrongPassword, getPasswordValidationMessage } from '@/lib/utils/password';
import { badRequest, conflict, created, forbidden, serverError } from '@/lib/utils/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.name || !body?.email || !body?.password) return badRequest('Name, email, and password are required');

    if ((body.role as string) === 'admin' || isEnvAdminEmail(body.email)) return forbidden('Admin registration is disabled');
    if (!isStrongPassword(body.password)) return badRequest(getPasswordValidationMessage());

    await connectDB();
    const existing = await UserModel.findOne({ email: body.email });
    if (existing) return conflict('Email already registered');

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const mappedRole = body.role === 'doctor' ? 'Doctor' : 'Patient';
    const newUser = await UserModel.create({
      name: body.name,
      email: body.email,
      password: hashedPassword,
      role: mappedRole,
      phone: body.phone,
      mustChangePassword: false,
    });
    if (mappedRole === 'Doctor') {
      await DoctorModel.create({ user: newUser._id, specialization: 'General', experience: 0 });
    } else {
      await PatientModel.create({ user: newUser._id });
    }

    const tokenPayload = { id: newUser._id.toString(), role: newUser.role, email: newUser.email };
    const token = signToken(tokenPayload);
    const refreshToken = signToken({ ...tokenPayload, type: 'refresh' });
    return created({
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: (newUser.role ?? '').toString().toLowerCase(),
        phone: newUser.phone,
        mustChangePassword: Boolean(newUser.mustChangePassword),
        createdAt: newUser.createdAt?.toISOString?.() ?? new Date().toISOString(),
      },
      token,
      refreshToken,
    });
  } catch {
    return serverError();
  }
}
