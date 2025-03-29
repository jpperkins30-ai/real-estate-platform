// Routes for authentication
import express from 'express';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  comparePassword, 
  hashPassword, 
  verifyRefreshToken 
} from '../utils/auth';
import { authenticate } from '../middleware/auth';
import { TypedRequestHandler } from '../types/express';
import { 
  RegisterRequestBody, 
  LoginRequestBody, 
  RefreshTokenRequestBody,
  UserJwtPayload 
} from '../types/auth';
import { logAuthEvent, startPerformanceTimer } from '../utils/appLogger';
import { logError, logInfo } from '../utils/logger';
import jwt, { SignOptions } from 'jsonwebtoken';
import config from '../config';

const router = express.Router();

// Password validation with complexity requirements
const passwordComplexityCheck = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number')
  .matches(/[^a-zA-Z0-9]/).withMessage('Password must contain at least one special character');

// Validation middleware for registration
const registerValidation = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  passwordComplexityCheck,
  body('name').notEmpty().withMessage('Name is required')
];

// Validation middleware for login
const loginValidation = [
  body('email').isEmail().withMessage('Enter a valid email address'),
  body('password').notEmpty().withMessage('Password is required')
];

// Validation middleware for token refresh
const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required')
];

// Helper function to handle validation errors
const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post(
  '/register',
  registerValidation,
  (async (req: Request<{}, {}, RegisterRequestBody>, res: Response) => {
    // Start performance timer
    const endTimer = startPerformanceTimer('auth-register');
    
    if (handleValidationErrors(req, res)) return;

    const { email, password, name, role = 'user' } = req.body;

    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        logAuthEvent('register', 'unknown', false, { 
          email, 
          reason: 'User already exists'
        });
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        role
      });

      // Generate JWT tokens
      const accessToken = generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role
      });
      
      const refreshToken = generateRefreshToken({
        id: user._id.toString(),
        role: user.role
      });

      // Log successful registration
      logAuthEvent('register', user._id.toString(), true, { 
        email, 
        role,
        responseTime: endTimer()
      });

      res.status(201).json({
        message: 'Registration successful',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      // Log error with proper type casting
      logError('Registration error', error as Error);
      
      res.status(500).json({ message: 'Server error during registration' });
    }
  }) as TypedRequestHandler
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  loginValidation,
  (async (req: Request<{}, {}, LoginRequestBody>, res: Response) => {
    // Start performance timer
    const endTimer = startPerformanceTimer('auth-login');
    
    if (handleValidationErrors(req, res)) return;

    const { email, password } = req.body;
    
    // Metadata for logging that includes request IP
    const meta = { 
      email,
      ip: req.ip || req.socket.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        logAuthEvent('login', 'unknown', false, { 
          ...meta, 
          reason: 'User not found'
        });
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Compare password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        logAuthEvent('login', user._id.toString(), false, { 
          ...meta, 
          reason: 'Invalid password'
        });
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate JWT tokens
      const accessToken = generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role
      });
      
      const refreshToken = generateRefreshToken({
        id: user._id.toString(),
        role: user.role
      });

      // Log successful login
      logAuthEvent('login', user._id.toString(), true, { 
        ...meta,
        role: user.role,
        responseTime: endTimer()
      });

      res.json({
        message: 'Login successful',
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      // Log error with proper type casting
      logError('Login error', error as Error);
      
      res.status(500).json({ message: 'Server error during login' });
    }
  }) as TypedRequestHandler
);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid refresh token
 */
router.post(
  '/refresh',
  refreshTokenValidation,
  (async (req: Request<{}, {}, RefreshTokenRequestBody>, res: Response) => {
    // Start performance timer  
    const endTimer = startPerformanceTimer('auth-token-refresh');
    
    if (handleValidationErrors(req, res)) return;

    const { refreshToken } = req.body;

    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);
      if (!payload) {
        logAuthEvent('token-refresh', 'unknown', false, { 
          reason: 'Invalid or expired token'
        });
        return res.status(401).json({ message: 'Invalid or expired refresh token' });
      }

      // Get user data for the access token
      const user = await User.findById(payload.id);
      if (!user) {
        logAuthEvent('token-refresh', payload.id, false, { 
          reason: 'User not found'
        });
        return res.status(401).json({ message: 'User not found' });
      }

      // Generate new access token
      const accessToken = generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role
      });

      // Log successful token refresh
      logAuthEvent('token-refresh', user._id.toString(), true, {
        responseTime: endTimer()
      });

      res.json({
        accessToken,
        message: 'Access token refreshed successfully'
      });
    } catch (error) {
      // Log error with proper type casting
      logError('Token refresh error', error as Error);
      
      res.status(500).json({ message: 'Server error during token refresh' });
    }
  }) as TypedRequestHandler
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // For development only - mock login
    if (email === 'admin@example.com' && password === 'admin') {
      const payload = {
        id: '1',
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'admin'
      };
      
      // @ts-ignore
      const token = jwt.sign(
        { 
          id: (payload as any).id || (payload as any)._id?.toString() || '',
          name: payload.name,
          email: payload.email,
          role: payload.role
        },
        Buffer.from(process.env.JWT_SECRET || 'fallback-secret'),
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );
      
      logInfo(`User logged in: ${email}`);
      return res.json({
        success: true,
        token,
        user: payload
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: 'Invalid credentials' 
    });
  } catch (error) {
    logError('Login error', error as Error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // For development only - mock registration
    const user = {
      id: Date.now().toString(),
      name,
      email,
      role: 'user'
    };
    
    // @ts-ignore
    const token = jwt.sign(
      { 
        id: (user as any).id || (user as any)._id?.toString() || '',
        name: user.name,
        email: user.email,
        role: user.role
      },
      Buffer.from(process.env.JWT_SECRET || 'fallback-secret'),
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );
    
    logInfo(`User registered: ${email}`);
    return res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    logError('Registration error', error as Error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

export default router; 