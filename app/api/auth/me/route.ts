import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/middleware/auth';
import { connectDB } from '@/lib/dbConfig';
import UserModel from '@/lib/models/User';
import { buildEnvAdminUser, ENV_ADMIN_ID } from '@/lib/config/admin';
import { ok, unauthorized, serverError } from '@/lib/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();
    if (decoded.id === ENV_ADMIN_ID) {
      const adminUser = buildEnvAdminUser();
      if (!adminUser) return unauthorized();
      return ok(adminUser);
    }
    await connectDB();
    const user = await UserModel.findById(decoded.id).select('-password');
    if (!user || user.role === 'Admin') return unauthorized();
    return ok({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: (user.role ?? '').toString().toLowerCase(),
      phone: user.phone,
      mustChangePassword: Boolean(user.mustChangePassword),
      createdAt: user.createdAt?.toISOString?.() ?? new Date().toISOString(),
    });
  } catch {
    return serverError();
  }
}
