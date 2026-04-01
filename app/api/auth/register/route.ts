import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { badRequest, conflict, created, forbidden, serverError } from '@/lib/utils/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.name || !body?.email || !body?.password) return badRequest('Name, email, and password are required');

    const result = await authService.register({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role ?? 'patient',
      phone: body.phone,
    });
    if (!result.ok && result.code === 'ADMIN_REGISTRATION_DISABLED') return forbidden('Admin registration is disabled');
    if (!result.ok && result.code === 'EMAIL_EXISTS') return conflict('Email already registered');
    if (!result.ok) return serverError();
    return created(result.data);
  } catch {
    return serverError();
  }
}
