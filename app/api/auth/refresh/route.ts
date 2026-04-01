import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { badRequest, ok, unauthorized, serverError } from '@/lib/utils/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.refreshToken) return badRequest('refreshToken is required');

    const result = await authService.refresh(body.refreshToken);
    if (!result.ok) return unauthorized('Invalid refresh token');
    return ok(result.data);
  } catch {
    return serverError();
  }
}
