// app/api/auth/register/route.ts
// PRODUCTION: Hash password with bcrypt, insert user into MongoDB, return JWT
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await authService.register({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role ?? 'patient',
      phone: body.phone,
    });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 409 });
    }
    return NextResponse.json(result, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
