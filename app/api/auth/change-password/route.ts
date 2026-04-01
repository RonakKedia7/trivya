import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { getUserFromRequest } from '@/lib/middleware/auth';
import { badRequest, notFound, ok, unauthorized, serverError } from '@/lib/utils/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();

    const body = await req.json();
    if (!body?.currentPassword || !body?.newPassword) {
      return badRequest('currentPassword and newPassword are required');
    }

    const result = await authService.changePassword({
      userId: decoded.id,
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });

    if (!result.ok && result.code === 'INVALID_REQUEST') return badRequest('Invalid password payload');
    if (!result.ok && result.code === 'WEAK_PASSWORD') return badRequest(result.message);
    if (!result.ok && result.code === 'PASSWORD_REUSE') return badRequest('New password must be different from current password');
    if (!result.ok && result.code === 'INVALID_CREDENTIALS') return unauthorized('Current password is incorrect');
    if (!result.ok && result.code === 'NOT_FOUND') return notFound('User not found');
    if (!result.ok && result.code === 'ADMIN_PASSWORD_ENV_MANAGED') {
      return badRequest('Admin password is managed via environment variables and cannot be changed from UI');
    }
    if (!result.ok) return serverError();

    return ok(null, 'Password updated successfully');
  } catch {
    return serverError();
  }
}
