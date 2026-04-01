// app/api/auth/refresh/route.ts
// PRODUCTION: Validate refresh token from DB, issue new JWT access token
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await authService.refresh(body.refreshToken ?? '');
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 401 });
    }
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }
}
