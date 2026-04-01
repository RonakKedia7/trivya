import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/dbConfig';
import UserModel from '@/lib/models/User';
import { signToken } from '@/lib/utils/jwt';
import { buildEnvAdminUser, ENV_ADMIN_ID, isEnvAdminEmail, verifyEnvAdminPassword } from '@/lib/config/admin';
import { badRequest, ok, unauthorized, serverError } from '@/lib/utils/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.email || !body?.password) return badRequest('Email and password are required');

    if (isEnvAdminEmail(body.email)) {
      const valid = verifyEnvAdminPassword(body.password);
      if (!valid) return unauthorized('Invalid email or password');
      const adminUser = buildEnvAdminUser();
      if (!adminUser) return unauthorized('Invalid email or password');
      const tokenPayload = { id: ENV_ADMIN_ID, role: 'Admin', email: adminUser.email };
      const token = signToken(tokenPayload);
      const refreshToken = signToken({ ...tokenPayload, type: 'refresh' });
      return ok({ user: adminUser, token, refreshToken });
    }

    await connectDB();
    const user = await UserModel.findOne({ email: body.email });
    if (!user || user.role === 'Admin') return unauthorized('Invalid email or password');

    const isMatch = await bcrypt.compare(body.password, user.password || '');
    if (!isMatch) return unauthorized('Invalid email or password');

    const tokenPayload = { id: user._id.toString(), role: user.role, email: user.email };
    const token = signToken(tokenPayload);
    const refreshToken = signToken({ ...tokenPayload, type: 'refresh' });
    return ok({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: (user.role ?? '').toString().toLowerCase(),
        phone: user.phone,
        mustChangePassword: Boolean(user.mustChangePassword),
        createdAt: user.createdAt?.toISOString?.() ?? new Date().toISOString(),
      },
      token,
      refreshToken,
    });
  } catch {
    return serverError();
  }
}
