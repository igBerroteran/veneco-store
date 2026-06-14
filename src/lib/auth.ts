import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_123456';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (JWT_SECRET + '_refresh');

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const verified = verifyToken(token);
      if (verified) return verified;
    }

    // Si el access token expiró o no existe, verificar si existe un refresh token válido
    const refreshToken = cookieStore.get('refreshToken')?.value;
    if (refreshToken) {
      const verifiedRefresh = verifyRefreshToken(refreshToken);
      if (verifiedRefresh) {
        return verifiedRefresh;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<TokenPayload> {
  const session = await getSession();
  if (!session || session.role !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

export async function requireClient(): Promise<TokenPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized: Client access required');
  }
  return session;
}
