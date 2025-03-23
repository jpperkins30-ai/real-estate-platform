import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * Environment configuration with default values
 */
export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  API_PREFIX: process.env.API_PREFIX || '/api',
}; 