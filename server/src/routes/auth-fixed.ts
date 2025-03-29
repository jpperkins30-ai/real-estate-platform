// Import statements
import express from 'express';
import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User';
import mongoose from 'mongoose';
import { 
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

// Define the user interface including Mongoose document properties
interface IUser extends mongoose.Document {
  name: string;
  email: string;
  role: string;
  password: string;
  // other properties...
}

// Function to generate tokens with proper typing
const generateToken = (user: IUser): string => {
  // Ensure JWT_SECRET exists and is treated as a string
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  // Create a Buffer from JWT_SECRET to fix typing issues
  const secretBuffer = Buffer.from(process.env.JWT_SECRET);
  
  // Use @ts-ignore to bypass the complex typing issues with jwt.sign
  // @ts-ignore
  return jwt.sign(
    { 
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    },
    secretBuffer,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

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

      // Generate token
      const token = generateToken(user as IUser);
      
      // Log successful registration
      logAuthEvent('register', user._id.toString(), true, { 
        email, 
        role,
        responseTime: endTimer()
      });

      res.status(201).json({
        message: 'Registration successful',
        token,
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

      // Generate JWT token
      const token = generateToken(user as IUser);

      // Log successful login
      logAuthEvent('login', user._id.toString(), true, { 
        ...meta,
        role: user.role,
        responseTime: endTimer()
      });

      res.json({
        message: 'Login successful',
        token,
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

export default router; 