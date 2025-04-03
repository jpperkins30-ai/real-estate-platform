import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import logger, { logError } from './utils/logger'; // Import both default and named export

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Routes
app.get('/api/health', (req, res) => {
  logger.info('Health check endpoint accessed');
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    server: 'minimal-server'
  });
});

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
    logError('MongoDB test error', error as Error);
    res.status(500).json({
      message: 'MongoDB connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      connected: false
    });
  }
});

// 404 handler
app.use('*', (req, res) => {
  logger.debug(`Route not found: ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      console.warn('WARNING: No JWT_SECRET environment variable. Using development default.');
      process.env.JWT_SECRET = 'development-jwt-secret-for-testing-only';
    }
    
    console.log('Environment variables:');
    console.log(`- PORT: ${process.env.PORT || 4000}`);
    console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`- MONGODB_URI: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform'}`);
    console.log(`- JWT_SECRET: ${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}`);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform');
    logger.info(`MongoDB Connected: ${new URL(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform').hostname}`);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name).join(', ');
    logger.info(`Available collections: ${collectionNames}`);
    
    // Start listening
    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    // Use the properly imported logError function
    logError('MongoDB connection error', error as Error);
    process.exit(1);
  }
};

startServer(); 