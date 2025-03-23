import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
  },
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiration: process.env.JWT_EXPIRATION || '1d',
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/server.log',
  },
  upload: {
    maxSize: process.env.MAX_UPLOAD_SIZE ? parseInt(process.env.MAX_UPLOAD_SIZE) : 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  },
  collectors: {
    maxRetries: process.env.COLLECTOR_MAX_RETRIES ? parseInt(process.env.COLLECTOR_MAX_RETRIES) : 3,
    timeout: process.env.COLLECTOR_TIMEOUT ? parseInt(process.env.COLLECTOR_TIMEOUT) : 30000, // 30 seconds
    userAgent: process.env.COLLECTOR_USER_AGENT || 'Real Estate Platform Bot',
  },
};

export default config; 