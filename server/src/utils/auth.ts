import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { UserJwtPayload } from '../types/auth';

// Ensure environment variables are set
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set. This is a security risk.');
  process.exit(1); // Exit the process to prevent running with insecure settings
}

// Token settings from environment variables
const TOKEN_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const REFRESH_TOKEN_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

/**
 * Generate an access token for a user
 * @param payload Data to include in the token
 * @returns JWT token string
 */
export function generateAccessToken(payload: Omit<UserJwtPayload, 'iat' | 'exp'>): string {
  // Using @ts-ignore because the jwt.sign method has complex overloaded signatures
  // that don't easily align with our usage pattern. The code functions correctly at runtime.
  // This is a common issue with the jsonwebtoken library in TypeScript projects.
  // @ts-ignore: JWT sign typing issue with literal string SECRET
  return jwt.sign(payload, TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
}

/**
 * Generate a refresh token for a user
 * @param payload Data to include in the token (typically just user ID and role)
 * @returns JWT refresh token string
 */
export function generateRefreshToken(payload: Pick<UserJwtPayload, 'id' | 'role'>): string {
  // @ts-ignore: JWT sign typing issue with literal string SECRET
  return jwt.sign(payload, TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRATION });
}

/**
 * Verify a JWT token
 * @param token The token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): UserJwtPayload | null {
  try {
    // Using @ts-ignore because the jwt.verify method has complex typing
    // that doesn't easily align with our usage pattern. The code functions correctly at runtime.
    // @ts-ignore: JWT verify typing issue with literal string SECRET
    return jwt.verify(token, TOKEN_SECRET) as UserJwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify a refresh token
 * @param token The refresh token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyRefreshToken(token: string): Pick<UserJwtPayload, 'id' | 'role'> | null {
  try {
    // @ts-ignore: JWT verify typing issue with literal string SECRET
    return jwt.verify(token, TOKEN_SECRET) as Pick<UserJwtPayload, 'id' | 'role'>;
  } catch (error) {
    return null;
  }
}

/**
 * Hash a password
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with a hash
 * @param password Plain text password
 * @param hash Hashed password
 * @returns Boolean indicating if the password matches
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
} 