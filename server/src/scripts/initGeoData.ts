/**
 * Script to initialize geographic data in the database
 * This can be run as a standalone script or imported and called during application startup
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { checkGeoJSONFiles, createGeoJSONDirectories, initializeGeographicData } from '../utils/geoDataUtils';
import logger from '../utils/logger';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
  
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
    return true;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Initialize models
function initializeModels() {
  try {
    // Make sure models are loaded
    require('../models/State');
    require('../models/County');
    require('../models/USMap');
    
    logger.info('Models initialized');
    return true;
  } catch (error) {
    logger.error('Error initializing models:', error);
    return false;
  }
}

// Main initialization function
async function initializeGeoData() {
  try {
    logger.info('Starting geographic data initialization');
    
    // Connect to database
    const dbConnected = await connectToDatabase();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Initialize models
    const modelsInitialized = initializeModels();
    if (!modelsInitialized) {
      throw new Error('Failed to initialize models');
    }
    
    // Check if GeoJSON files exist
    const filesExist = await checkGeoJSONFiles();
    if (!filesExist) {
      logger.info('Creating GeoJSON directories');
      await createGeoJSONDirectories();
      
      // In production, you would download GeoJSON files here
      // For now, we just log a message
      logger.warn('GeoJSON files not found. Please manually add GeoJSON files to the data/geojson directory');
      logger.warn('Skipping geographic data initialization');
      return;
    }
    
    // Initialize geographic data
    await initializeGeographicData();
    
    logger.info('Geographic data initialization complete');
  } catch (error) {
    logger.error('Error in geographic data initialization:', error);
  } finally {
    // Close database connection if running as standalone script
    if (require.main === module) {
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  initializeGeoData().then(() => {
    logger.info('Geographic data initialization script completed');
    process.exit(0);
  }).catch(error => {
    logger.error('Geographic data initialization script failed:', error);
    process.exit(1);
  });
}

export default initializeGeoData; 