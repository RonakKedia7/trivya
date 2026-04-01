import 'server-only';

import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/dbConfig';
import UserModel from '@/lib/models/User';
import DoctorModel from '@/lib/models/Doctor';
import PatientModel from '@/lib/models/Patient';
import { signToken, verifyToken } from '@/lib/utils/jwt';
import { mapUserToPublic } from './mappers';

type LoginRequest = { email: string; password: string };
type RegisterRequest = { name: string; email: string; password: string; role: 'admin' | 'doctor' | 'patient'; phone?: string };

export const authService = {
  async login(req: LoginRequest) {
    await connectDB();
    const user = await UserModel.findOne({ email: req.email });
    if (!user) return { ok: false as const, code: 'INVALID_CREDENTIALS' as const };

    const isMatch = await bcrypt.compare(req.password, user.password || '');
    if (!isMatch) return { ok: false as const, code: 'INVALID_CREDENTIALS' as const };

    const tokenPayload = { id: user._id.toString(), role: user.role, email: user.email };
    const token = signToken(tokenPayload);
    const refreshToken = signToken({ ...tokenPayload, type: 'refresh' });

    return { ok: true as const, data: { user: mapUserToPublic(user), token, refreshToken } };
  },

  async register(req: RegisterRequest) {
    await connectDB();
    const existing = await UserModel.findOne({ email: req.email });
    if (existing) return { ok: false as const, code: 'EMAIL_EXISTS' as const };

    const hashedPassword = await bcrypt.hash(req.password, 10);
    const mappedRole = req.role === 'admin' ? 'Admin' : req.role === 'doctor' ? 'Doctor' : 'Patient';

    const newUser = await UserModel.create({
      name: req.name,
      email: req.email,
      password: hashedPassword,
      role: mappedRole,
      phone: req.phone,
    });

    if (mappedRole === 'Doctor') {
      await DoctorModel.create({
        user: newUser._id,
        specialization: 'General',
        experience: 0,
      });
    } else if (mappedRole === 'Patient') {
      await PatientModel.create({ user: newUser._id });
    }

    const tokenPayload = { id: newUser._id.toString(), role: newUser.role, email: newUser.email };
    const token = signToken(tokenPayload);
    const refreshToken = signToken({ ...tokenPayload, type: 'refresh' });

    return { ok: true as const, data: { user: mapUserToPublic(newUser), token, refreshToken } };
  },

  async getMe(userId: string) {
    await connectDB();
    const user = await UserModel.findById(userId).select('-password');
    if (!user) return { ok: false as const, code: 'NOT_FOUND' as const };
    return { ok: true as const, data: mapUserToPublic(user) };
  },

  async refresh(refreshToken: string) {
    const decoded = verifyToken(refreshToken);
    if (!decoded?.id || decoded?.type !== 'refresh') return { ok: false as const, code: 'INVALID_REFRESH' as const };

    await connectDB();
    const user = await UserModel.findById(decoded.id);
    if (!user) return { ok: false as const, code: 'NOT_FOUND' as const };

    const tokenPayload = { id: user._id.toString(), role: user.role, email: user.email };
    const token = signToken(tokenPayload);
    const newRefreshToken = signToken({ ...tokenPayload, type: 'refresh' });
    return { ok: true as const, data: { user: mapUserToPublic(user), token, refreshToken: newRefreshToken } };
  },
};

