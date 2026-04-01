// lib/api/client.ts — browser-safe fetch wrapper for Next.js API routes

export const API_BASE = '/api';
const TOKEN_KEY = 'hms_token';
const LAST_LOGIN_PASSWORD_KEY = 'hms_last_login_password';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(TOKEN_KEY);
}

export function setLastLoginPassword(password: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(LAST_LOGIN_PASSWORD_KEY, password);
}

export function getLastLoginPassword() {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem(LAST_LOGIN_PASSWORD_KEY);
}

export function clearLastLoginPassword() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(LAST_LOGIN_PASSWORD_KEY);
}

/**
 * Fetch wrapper that returns parsed JSON (even for non-2xx responses).
 * This keeps UI code simple: it can rely on `{ success: boolean, ... }`.
 */
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = await res.json().catch(() => null);
  if (payload) return payload as T;

  // Fallback for non-JSON responses
  return ({ success: res.ok, data: null, message: res.ok ? undefined : res.statusText } as any) as T;
}
