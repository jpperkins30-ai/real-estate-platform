import { JwtPayload } from 'jsonwebtoken';

/**
 * Enhanced JWT payload with user-specific fields
 */
export interface UserJwtPayload extends JwtPayload {
  id: string;
  email?: string;
  role?: string;
}

/**
 * Registration request body
 */
export interface RegisterRequestBody {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin';
}

/**
 * Login request body
 */
export interface LoginRequestBody {
  email: string;
  password: string;
}

/**
 * Token refresh request body
 */
export interface RefreshTokenRequestBody {
  refreshToken: string;
}

/**
 * Password reset request body
 */
export interface PasswordResetRequestBody {
  email: string;
}

/**
 * Password reset confirmation body
 */
export interface ResetConfirmationBody {
  token: string;
  password: string;
}

/**
 * Authentication response with access and refresh tokens
 */
export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

/**
 * Token refresh response
 */
export interface TokenRefreshResponse {
  accessToken: string;
  message?: string;
} 