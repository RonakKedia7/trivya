// app/api/auth/logout/route.ts
// PRODUCTION: Invalidate refresh token in DB
import { NextResponse } from 'next/server';
import { authService } from '@/lib/api';

export async function POST() {
  const result = await authService.logout();
  return NextResponse.json(result, { status: 200 });
}
