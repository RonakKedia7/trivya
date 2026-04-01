import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/middleware/auth';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/dbConfig';
import UserModel from '@/lib/models/User';
import { verifyEnvAdminPassword, ENV_ADMIN_ID } from '@/lib/config/admin';
import { isStrongPassword, getPasswordValidationMessage } from '@/lib/utils/password';
import { badRequest, notFound, ok, unauthorized, serverError } from '@/lib/utils/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();

    const body = await req.json();
    if (!body?.currentPassword || !body?.newPassword) {
      return badRequest('currentPassword and newPassword are required');
    }

    if (!isStrongPassword(body.newPassword)) return badRequest(getPasswordValidationMessage());
    if (body.currentPassword === body.newPassword) return badRequest('New password must be different from current password');
    if (decoded.id === ENV_ADMIN_ID) {
      const currentValid = verifyEnvAdminPassword(body.currentPassword);
      if (!currentValid) return unauthorized('Current password is incorrect');
      return badRequest('Admin password is managed via environment variables and cannot be changed from UI');
    }
    await connectDB();
    const user = await UserModel.findById(decoded.id);
    if (!user || user.role === 'Admin') return notFound('User not found');
    const currentValid = await bcrypt.compare(body.currentPassword, user.password || '');
    if (!currentValid) return unauthorized('Current password is incorrect');
    user.password = await bcrypt.hash(body.newPassword, 10);
    user.mustChangePassword = false;
    await user.save();
    return ok(null, 'Password updated successfully');
  } catch {
    return serverError();
  }
}
