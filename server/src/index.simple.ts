/**
 * Simplified index.ts without logger dependency
 */
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import config from './config';

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Print environment variables for debugging
console.log('Environment variables:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI);
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

// Create simple console logger
const logger = {
  info: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.log(`${timestamp} [INFO] ${message}`, meta || '');
  },
  error: (message: string, error?: any) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    if (error instanceof Error) {
      console.error(`${timestamp} [ERROR] ${message}: ${error.message}`);
      if (error.stack) console.error(`${timestamp} [ERROR] Stack: ${error.stack}`);
    } else {
      console.error(`${timestamp} [ERROR] ${message}`, error || '');
    }
  },
  warn: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.warn(`${timestamp} [WARN] ${message}`, meta || '');
  },
  debug: (message: string, meta?: any) => {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    console.debug(`${timestamp} [DEBUG] ${message}`, meta || '');
  }
};

// Alias functions
const logInfo = logger.info;
const logError = logger.error;
const logWarn = logger.warn;
const logDebug = logger.debug;

// Create Express app
const app = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security check for required environment variables
if (!process.env.JWT_SECRET) {
  if (NODE_ENV === 'production') {
    console.error('ERROR: JWT_SECRET environment variable is not set. This is a security risk.');
    process.exit(1);
  } else {
    console.warn('WARNING: Using default JWT_SECRET for development.');
    process.env.JWT_SECRET = 'default-jwt-secret-for-development-only';
  }
}

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// Swagger documentation setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate Platform API',
      version: '1.0.0',
      description: 'API documentation for Real Estate Platform',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
  },
  // Path to the API docs
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/models/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

mongoose.connect(MONGODB_URI)
  .then(() => {
    logger.info(`MongoDB Connected: ${new URL(MONGODB_URI).hostname}`);
    
    // Get all collections
    mongoose.connection.db.listCollections().toArray()
      .then(collections => {
        const collectionNames = collections.map(c => c.name).join(', ');
        logger.info(`Available collections: ${collectionNames}`);
        
        // Start the server
        app.listen(PORT, () => {
          logger.info(`Server running on port ${PORT}`);
          logger.info(`Swagger documentation available at http://localhost:${PORT}/api-docs`);
        });
      })
      .catch(err => {
        logger.error('Failed to list collections', err);
      });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Test route
app.get('/api/test', (req, res) => {
  logger.info('Test endpoint accessed');
  res.json({ message: 'API is working!' });
});

// MongoDB test route
app.get('/api/mongodb-test', async (req, res) => {
  try {
    logger.info('MongoDB test endpoint accessed');
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    res.json({
      message: 'MongoDB connection test',
      connected: true,
      collections: collectionNames
    });
  } catch (error) {
    logger.error('MongoDB test error:', error);
    res.status(500).json({
      message: 'MongoDB connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      connected: false
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'API is operational'
  });
});

// 404 route
app.use('*', (req, res) => {
  logger.debug(`Route not found: ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

// Handle process shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  mongoose.connection.close()
    .then(() => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    })
    .catch(err => {
      logger.error('Error closing MongoDB connection:', err);
      process.exit(1);
    });
});

export default app; 