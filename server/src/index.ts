// @ts-nocheck
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path';
import logger, { logInfo, logError, logDebug } from './utils/logger';
import { requestLogger, errorLogger } from './middleware/requestLogger';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/property';
import userRoutes from './routes/user';
import logsRoutes from './routes/logs';
import usMapRoutes from './routes/usmap.routes';
import stateRoutes from './routes/state.routes';
import countyRoutes from './routes/county.routes';
import helmet from 'helmet';
import { specs } from './swagger';
import config from './config';
import controllerRoutes from './routes/controller.routes';
import collectionRoutes from './routes/collection.routes';
import exportRoutes from './routes/export.routes';
import initializeGeoData from './scripts/initGeoData';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security check for required environment variables in production
if (NODE_ENV === 'production') {
  const requiredEnvVars = ['JWT_SECRET'];
  const missingVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missingVars.length > 0) {
    logError(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
}

// CORS configuration based on environment
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : 'https://yourdomain.com'
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(helmet());

// Add request logging middleware
app.use(requestLogger);

// Connect to MongoDB
mongoose.connect(config.database.uri)
  .then(async () => {
    logInfo(`Connected to MongoDB at ${config.database.uri}`);
    
    // Initialize geographic data
    if (process.env.INIT_GEO_DATA === 'true') {
      try {
        logInfo('Initializing geographic data...');
        await initializeGeoData();
        logInfo('Geographic data initialization complete');
      } catch (error) {
        logError('Error initializing geographic data:', error);
      }
    }
    
    // Start server
    const server = app.listen(config.server.port, () => {
      logInfo(`Server running on port ${config.server.port}`);
    });
    
    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logInfo('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        logInfo('HTTP server closed');
        mongoose.connection.close(false, () => {
          logInfo('MongoDB connection closed');
          process.exit(0);
        });
      });
    });
  })
  .catch((error) => {
    logError('MongoDB connection error:', error);
    process.exit(1);
  });

// Swagger documentation setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate API',
      version: '1.0.0',
      description: 'API for real estate platform',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// If admin dashboard is enabled
if (process.env.ENABLE_ADMIN_DASHBOARD === 'true') {
  app.use(
    '/admin',
    express.static(path.join(process.cwd(), 'admin-dashboard'))
  );
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/usmap', usMapRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/counties', countyRoutes);
app.use('/api/controllers', controllerRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/export', exportRoutes);

// Test route
app.get('/api/test', (req, res) => {
  logInfo('Test endpoint accessed');
  res.json({ message: 'API is working!' });
});

// Error handling middleware
app.use(errorLogger);

// 404 route handling
app.use('*', (req, res) => {
  logDebug(`Route not found: ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

export default app;