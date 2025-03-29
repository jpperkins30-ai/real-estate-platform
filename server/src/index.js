const express = require('express');
const connectDB = require('./config/database');
const logger = require('./utils/logger');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { setupSwagger } = require('./config/swagger');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration 
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
  maxAge: 86400 // 24 hours
};

// Connect to database before initializing routes
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize USMap if needed
    try {
      logger.info('Initializing US Map...');
      const initUSMap = require('./scripts/initUSMap');
      await initUSMap();
      logger.info('US Map initialization complete');
    } catch (error) {
      logger.error(`Error initializing US Map: ${error.message}`);
    }
    
    // Middleware setup
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors(corsOptions));
    app.use(helmet());
    
    // Setup Swagger documentation using our new module
    setupSwagger(app);
    
    // Static files
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

    // If admin dashboard is enabled
    if (process.env.ENABLE_ADMIN_DASHBOARD === 'true') {
      app.use(
        '/admin',
        express.static(path.join(process.cwd(), 'admin-dashboard'))
      );
    }
    
    // Initialize routes
    try {
      app.use('/api/auth', require('./routes/auth'));
      app.use('/api/properties', require('./routes/property.routes'));
      app.use('/api/users', require('./routes/user'));
      app.use('/api/logs', require('./routes/logs'));
      app.use('/api/usmap', require('./routes/usmap.routes'));
      app.use('/api/states', require('./routes/state.routes'));
      app.use('/api/counties', require('./routes/county.routes'));
      app.use('/api/export', require('./routes/export.routes'));
      app.use('/api/tax-liens', require('./routes/tax-lien.routes'));
    } catch (error) {
      logger.error(`Error loading routes: ${error.message}`);
      logger.info('Starting server with minimal routes');
    }
    
    // Test route
    app.get('/api/test', (req, res) => {
      logger.info('Test endpoint accessed');
      res.json({ message: 'API is working!' });
    });
    
    // MongoDB test route
    app.get('/api/mongodb-test', async (req, res) => {
      try {
        logger.info('MongoDB test endpoint accessed');
        const mongoose = require('mongoose');
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const collectionNames = collections.map(c => c.name);
        
        // Try to query the usmap collection directly
        const usmapCollection = db.collection('usmap');
        const usMapData = await usmapCollection.find({}).toArray();
        
        res.json({
          message: 'MongoDB connection test',
          connected: true,
          collections: collectionNames,
          usMapData
        });
      } catch (error) {
        logger.error(`MongoDB test error: ${error.message}`);
        res.status(500).json({
          message: 'MongoDB connection test failed',
          error: error.message,
          connected: false
        });
      }
    });
    
    // Health check endpoint
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
    app.use((err, req, res, next) => {
      logger.error(err.stack);
      res.status(err.statusCode || 500).json({
        success: false,
        error: err.message || 'Server Error'
      });
    });
    
    // 404 route handling
    app.use('*', (req, res) => {
      logger.debug(`Route not found: ${req.originalUrl}`);
      res.status(404).json({ message: 'Route not found' });
    });
    
    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app; 