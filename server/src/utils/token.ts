/**
 * Token utilities for JWT handling
 */
import jwt, { SignOptions } from 'jsonwebtoken';
import { logError } from './logger';

/**
 * Safely get the JWT secret
 */
export const getJwtSecret = (): Buffer => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return Buffer.from(secret);
};

/**
 * Generate a JWT token with proper typing
 */
export const generateToken = (
  payload: Record<string, any>, 
  options: SignOptions = { expiresIn: '24h' }
): string => {
  try {
    return jwt.sign(payload, getJwtSecret(), options);
  } catch (error) {
    logError('Failed to generate JWT token', error as Error);
    throw error;
  }
};

/**
 * Verify a JWT token with proper typing
 */
export const verifyToken = <T = Record<string, any>>(token: string): T => {
  try {
    return jwt.verify(token, getJwtSecret()) as T;
  } catch (error) {
    logError('Failed to verify JWT token', error as Error);
    throw error;
  }
}; 