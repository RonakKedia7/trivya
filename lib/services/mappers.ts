import 'server-only';
import type { IUser } from '@/lib/models/User';

export function toId(value: any): string | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') return value;
  if (value?._id) return value._id.toString();
  return value.toString?.();
}

export function safeIso(date: any): string {
  try {
    if (!date) return new Date().toISOString();
    const d = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export function mapUserToPublic(u: IUser | any) {
  return {
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: (u.role ?? '').toString().toLowerCase(),
    phone: u.phone,
    createdAt: safeIso(u.createdAt),
  };
}

