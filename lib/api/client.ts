// lib/api/client.ts — browser-safe fetch wrapper for Next.js API routes

export const API_BASE = '/api';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('hms_token');
}

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('hms_token', token);
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('hms_token');
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
