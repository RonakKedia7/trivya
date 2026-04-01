// app/api/auth/login/route.ts
// PRODUCTION: Replace body with real bcrypt compare + JWT sign against MongoDB
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await authService.login({ email: body.email, password: body.password });
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
