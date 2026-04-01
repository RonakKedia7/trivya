import { NextRequest } from 'next/server';
import { verifyToken, signToken } from '@/lib/utils/jwt';
import { connectDB } from '@/lib/dbConfig';
import UserModel from '@/lib/models/User';
import { buildEnvAdminUser, ENV_ADMIN_ID } from '@/lib/config/admin';
import { badRequest, ok, unauthorized, serverError } from '@/lib/utils/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.refreshToken) return badRequest('refreshToken is required');

    const decoded = verifyToken(body.refreshToken);
    if (!decoded?.id || decoded?.type !== 'refresh') return unauthorized('Invalid refresh token');
    if (decoded.id === ENV_ADMIN_ID) {
      const adminUser = buildEnvAdminUser();
      if (!adminUser) return unauthorized('Invalid refresh token');
      const tokenPayload = { id: ENV_ADMIN_ID, role: 'Admin', email: adminUser.email };
      const token = signToken(tokenPayload);
      const refreshToken = signToken({ ...tokenPayload, type: 'refresh' });
      return ok({ user: adminUser, token, refreshToken });
    }
    await connectDB();
    const user = await UserModel.findById(decoded.id);
    if (!user || user.role === 'Admin') return unauthorized('Invalid refresh token');
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
