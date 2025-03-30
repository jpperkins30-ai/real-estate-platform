import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import logger, { logError, logInfo, logDebug } from './utils/logger';
import { requestLogger, errorLogger } from './middleware/requestLogger';
import authRoutes from './routes/auth';
import propertyRoutes from './routes/property.routes';
import userRoutes from './routes/user';
import logsRoutes from './routes/logs';
import usMapRoutes from './routes/usmap.routes';
import stateRoutes from './routes/state.routes';
import countyRoutes from './routes/county.routes';
import helmet from 'helmet';
import config from './config';
import controllerRoutes from './routes/controller.routes';
import collectionRoutes from './routes/collection.routes';
import exportRoutes from './routes/export.routes';
import taxLienRoutes from './routes/tax-lien.routes';
import initGeoData from './utils/initGeoData';
import { mainRoutes } from './routes/main.routes';
import { typesRoutes } from './routes/types.routes';
import { collectorTypesRoutes } from './routes/collectorTypes.routes';
import { Property } from './models/property.model';
import { State } from './models/State';
import { County } from './models/County';
import { USMap } from './models/usmap.model';
import { Controller } from './models/Controller';
import { IDataSource } from './models/DataSource';
import Collection from './models/Collection';
import connectDB from './config/database';
import initUSMap from './scripts/initUSMap';
import { setupSwagger } from './config/swagger';

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
    // Initialize USMap
    try {
      await initUSMap();
      logger.info('US Map initialization complete');
    } catch (error) {
      logger.error('Error initializing US Map:', error);
      // Continue server startup even if US Map initialization fails
    }
    
    // Initialize geographic data if needed
    if (process.env.INIT_GEO_DATA === 'true') {
      try {
        logger.info('Initializing geographic data...');
        await initGeoData();
        logger.info('Geographic data initialization complete');
      } catch (error) {
        logger.error('Error initializing geographic data:', error);
      }
    }
    
    // Setup Swagger documentation
    setupSwagger(app);
    
    // Start server
    const server = app.listen(config.server.port, () => {
      logger.info(`Server running on port ${config.server.port}`);
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
  // Path to the API docs - adjust based on your project structure
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/models/*.ts'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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
    
    // Try to query the usmaps collection directly
    const usmapsCollection = db.collection('usmaps');
    const usMapData = await usmapsCollection.find({}).toArray();
    
    res.json({
      message: 'MongoDB connection test',
      connected: true,
      collections: collectionNames,
      usMapData
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
    version: '1.0.0',
    message: 'API is operational'
  });
});

// Error handling middleware
app.use(errorLogger);

// 404 route handling
app.use('*', (req, res) => {
  logger.debug(`Route not found: ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

export default app;