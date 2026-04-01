import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { getUserFromRequest } from '@/lib/middleware/auth';
import { ok, unauthorized, serverError } from '@/lib/utils/apiResponse';

export async function GET(req: NextRequest) {
  try {
    const decoded = getUserFromRequest(req);
    if (!decoded?.id) return unauthorized();

    const result = await authService.getMe(decoded.id);
    if (!result.ok) return unauthorized();
    return ok(result.data);
  } catch {
    return serverError();
  }
}
