import 'server-only';

import crypto from 'crypto';

export const ENV_ADMIN_ID = 'env-admin';

export function getAdminCredentials() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  return { email, password, configured: Boolean(email && password) };
}

export function isEnvAdminEmail(email: string) {
  const admin = getAdminCredentials();
  if (!admin.configured || !admin.email) return false;
  return admin.email.toLowerCase() === email.trim().toLowerCase();
}

export function verifyEnvAdminPassword(inputPassword: string) {
  const admin = getAdminCredentials();
  if (!admin.configured || typeof admin.password !== 'string') return false;

  const a = Buffer.from(inputPassword, 'utf8');
  const b = Buffer.from(admin.password, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function buildEnvAdminUser() {
  const admin = getAdminCredentials();
  if (!admin.configured || !admin.email) return null;
  return {
    id: ENV_ADMIN_ID,
    name: 'Administrator',
    email: admin.email,
    role: 'admin' as const,
    createdAt: new Date(0).toISOString(),
  };
}

