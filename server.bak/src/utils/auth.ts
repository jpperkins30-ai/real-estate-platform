import jwt, { SignOptions } from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/env';

interface TokenPayload {
  id: string;
  [key: string]: any; // For any additional fields you might want to add
}

export function generateToken(userId: string, additionalData: Record<string, any> = {}): string {
  const payload: TokenPayload = { id: userId, ...additionalData };
  const options: SignOptions = { expiresIn: '1d' };
  return jwt.sign(payload, JWT_CONFIG.secret, options);
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_CONFIG.secret) as TokenPayload;
  } catch (error) {
    // Handle invalid or expired tokens
    return null;
  }
} 