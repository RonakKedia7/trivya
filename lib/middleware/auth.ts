import { NextRequest } from 'next/server';
import { verifyToken } from '../utils/jwt';
import { isEnvAdminEmail } from '@/lib/config/admin';
import { connectDB } from '@/lib/dbConfig';
import UserModel from '@/lib/models/User';

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

export async function hasPendingPasswordReset(userId?: string) {
  if (!userId || userId === 'env-admin') return false;
  await connectDB();
  const user = await UserModel.findById(userId).select('mustChangePassword role');
  if (!user) return false;
  if (user.role === 'Admin') return false;
  return Boolean(user.mustChangePassword);
}
