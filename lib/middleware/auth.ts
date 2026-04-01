import { NextRequest } from 'next/server';
import { verifyToken } from '../utils/jwt';
import { isEnvAdminEmail } from '@/lib/config/admin';

export const getUserFromRequest = (req: NextRequest) => {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
};

export const isAdminRequest = (req: NextRequest) => {
  const user = getUserFromRequest(req);
  if (!user) return false;
  const role = String(user.role || '').toLowerCase();
  const email = String(user.email || '');
  return role === 'admin' && isEnvAdminEmail(email);
};
