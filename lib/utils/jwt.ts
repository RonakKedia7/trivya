import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.TOKEN_SECRET || 'fallback_secret_for_dev_only';
const JWT_EXPIRES_IN = '7d';

export const signToken = (payload: string | object | Buffer) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
