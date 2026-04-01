import { NextResponse } from 'next/server';

export type ApiSuccess<T> = { success: true; data: T; message?: string };
// Keep `error` for backward compatibility with existing UI code.
export type ApiFailure = { success: false; message: string; error?: string; errors?: unknown };
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) } satisfies ApiSuccess<T>, { status: 200 });
}

export function created<T>(data: T, message?: string) {
  return NextResponse.json({ success: true, data, ...(message ? { message } : {}) } satisfies ApiSuccess<T>, { status: 201 });
}

export function noContent(message?: string) {
  return NextResponse.json({ success: true, data: null, ...(message ? { message } : {}) } satisfies ApiSuccess<null>, { status: 200 });
}

export function badRequest(message = 'Bad request', errors?: unknown) {
  return NextResponse.json({ success: false, message, error: message, ...(errors ? { errors } : {}) } satisfies ApiFailure, { status: 400 });
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ success: false, message, error: message } satisfies ApiFailure, { status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ success: false, message, error: message } satisfies ApiFailure, { status: 403 });
}

export function notFound(message = 'Not found') {
  return NextResponse.json({ success: false, message, error: message } satisfies ApiFailure, { status: 404 });
}

export function conflict(message = 'Conflict') {
  return NextResponse.json({ success: false, message, error: message } satisfies ApiFailure, { status: 409 });
}

export function serverError(message = 'Internal server error') {
  return NextResponse.json({ success: false, message, error: message } satisfies ApiFailure, { status: 500 });
}

