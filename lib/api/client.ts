// ─────────────────────────────────────────────────────────────────────────────
// lib/api/client.ts  —  Base API client
//
// MOCK MODE (current):  All calls go through mock service modules.
// PRODUCTION MODE:      Replace the import at the bottom with a real HTTP client
//                       (e.g. axios / fetch) and update BASE_URL.
//
// HOW TO SWITCH:
//   Change `export * from './mock'` → `export * from './http'`
//   The hook / page code stays EXACTLY the same.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simulates a realistic network delay.
 * Replace with nothing (or real latency) in production.
 */
export const simulateDelay = (ms = 300): Promise<void> =>
  new Promise((res) => setTimeout(res, ms));

/** Base URL for the real API – unused in mock mode */
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/**
 * Thin wrapper around fetch for real API calls.
 * Only used when you replace mock calls with real HTTP calls.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('hms_token') : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'API error');
  }

  return res.json() as Promise<T>;
}
