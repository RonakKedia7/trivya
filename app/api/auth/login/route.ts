import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { badRequest, ok, unauthorized, serverError } from '@/lib/utils/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.email || !body?.password) return badRequest('Email and password are required');

    const result = await authService.login({ email: body.email, password: body.password });
    if (!result.ok) return unauthorized('Invalid email or password');
    return ok(result.data);
  } catch {
    return serverError();
  }
}
