import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { USMap } from '../models/usmap.model';
import logger from '../utils/logger';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate';
  
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info(`Connected to MongoDB at ${MONGODB_URI}`);
    return true;
  } catch (error) {
    logger.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Create initial data
async function initializeData() {
  try {
    // Check connection
    const connected = await connectToDatabase();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }
    
    // Create US Map (if it doesn't exist)
    let usMap = await USMap.findOne();
    if (!usMap) {
      logger.info('Creating US Map');
      usMap = await USMap.create({
        name: 'US Map',
        type: 'us_map',
        metadata: {
          totalStates: 0,
          totalCounties: 0,
          totalProperties: 0,
          statistics: {
            totalTaxLiens: 0,
            totalValue: 0
          }
        }
      });
      logger.info('US Map created successfully with ID: ' + usMap._id);
    } else {
      logger.info('US Map already exists with ID: ' + usMap._id);
    }
    
  } catch (error) {
    logger.error('Error initializing data:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
  }
}

// Run the script
initializeData().then(() => {
  logger.info('Data initialization script completed');
}); 