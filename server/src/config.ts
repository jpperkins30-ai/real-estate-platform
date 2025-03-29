/**
 * Server configuration
 */
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Set default JWT_SECRET directly for development
if (process.env.NODE_ENV !== 'production') {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-for-development';
  console.log('Using development JWT_SECRET');
}
// JWT Configuration - only check in production
else if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET environment variable is not set. This is a security risk.');
  process.exit(1);
}

const config = {
  server: {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    directory: process.env.LOG_DIR || 'logs',
  },
  upload: {
    maxSize: process.env.MAX_UPLOAD_SIZE ? parseInt(process.env.MAX_UPLOAD_SIZE) : 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  },
  cors: {
    origins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  collectors: {
    maxRetries: process.env.COLLECTOR_MAX_RETRIES ? parseInt(process.env.COLLECTOR_MAX_RETRIES) : 3,
    timeout: process.env.COLLECTOR_TIMEOUT ? parseInt(process.env.COLLECTOR_TIMEOUT) : 30000, // 30 seconds
    userAgent: process.env.COLLECTOR_USER_AGENT || 'Real Estate Platform Bot',
  },
  export: {
    tempDir: process.env.EXPORT_TEMP_DIR || './tmp/exports',
  },
  admin: {
    enabled: process.env.SERVE_ADMIN_DASHBOARD === 'true',
  }
};

export default config; 