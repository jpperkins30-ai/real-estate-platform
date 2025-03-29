import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { env } from './environment';

// Ensure .env file is loaded
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuration object
const config = {
  server: {
    port: env.PORT,
    env: env.NODE_ENV,
    apiPrefix: env.API_PREFIX,
  },
  database: {
    uri: env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: logsDir,
    filename: 'app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: 'json',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-jwt-secret-for-development-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-for-development-only',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  upload: {
    directory: uploadsDir,
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  },
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    maxAge: 86400,
  },
  swagger: {
    enabled: true,
    route: '/api-docs',
    title: 'Real Estate Platform API',
    version: '1.0.0',
    description: 'API documentation for Real Estate Platform',
  },
};

export default config; 