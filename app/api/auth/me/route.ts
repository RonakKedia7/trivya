// app/api/auth/me/route.ts
// PRODUCTION: Decode JWT from Authorization header, return user from MongoDB
import { NextResponse } from 'next/server';
import { authService } from '@/lib/api';

export async function GET() {
  const result = await authService.getMe();
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 401 });
  }
  return NextResponse.json(result, { status: 200 });
}
