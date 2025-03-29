import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import logger, { logError, requestLogger } from './utils/logger';
import config from './config/config';

// Routes
import { authRoutes } from './routes/auth';
import { mainRoutes } from './routes/main';
import { propertyRoutes } from './routes/property.routes';
import { userRoutes } from './routes/user';
import { logsRoutes } from './routes/logs';
import { usMapRoutes } from './routes/usmap.routes';
import { stateRoutes } from './routes/state.routes';
import { countyRoutes } from './routes/county.routes';
import { controllerRoutes } from './routes/controller.routes';
import { exportRoutes } from './routes/export.routes';
import { taxLienRoutes } from './routes/taxLien.routes';
import { typesRoutes } from './routes/types.routes';
import { collectorTypesRoutes } from './routes/collectorTypes.routes';
import connectDB from './config/database';

// Load environment variables with explicit path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Print environment variables for debugging
console.log('Environment variables:');
console.log('- PORT:', process.env.PORT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- MONGODB_URI:', process.env.MONGODB_URI);
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security check for required environment variables in production
if (NODE_ENV === 'production') {
  const requiredEnvVars = ['JWT_SECRET'];
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    logger.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}

// CORS configuration based on environment
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
app.use(helmet());

// Add request logging middleware
app.use(requestLogger);

// Connect to MongoDB using our new connectDB function
connectDB()
  .then(async () => {
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logger.info('HTTP server closed');
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
    });
  })
  .catch((error) => {
    logError('MongoDB connection error', error as Error);
    process.exit(1);
  });

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/usmap', usMapRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/counties', countyRoutes);
app.use('/api/controllers', controllerRoutes.main);
app.use('/api/controller-types', controllerRoutes.types);
app.use('/api/collector-types', controllerRoutes.collectorTypes);
app.use('/api/export', exportRoutes);
app.use('/api/tax-liens', taxLienRoutes);
app.use('/api', mainRoutes);
app.use('/api/types', typesRoutes);
app.use('/api/collector-types', collectorTypesRoutes);

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

// Public health check endpoint that doesn't require authentication
app.get('/api/health', (req, res) => {
  logger.info('Public health check endpoint accessed');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
}); 