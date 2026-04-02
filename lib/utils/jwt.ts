import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.TOKEN_SECRET;
if (!JWT_SECRET) {
  throw new Error("TOKEN_SECRET environment variable is required");
}
const JWT_EXPIRES_IN = "7d";

export const signToken = (payload: string | object | Buffer) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): jwt.JwtPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
  } catch {
    return null;
  }
};
