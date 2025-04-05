/**
 * Database connection configuration
 */

import mongoose from 'mongoose';
import logger from '../utils/logger';
import config from '../config';

/**
 * Connect to MongoDB database
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
    
    // Connection options for both Atlas and local MongoDB
    // For Atlas, most options are included in the connection string
    const options: mongoose.ConnectOptions = {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      connectTimeoutMS: 10000, // 10 seconds
    };
    
    // If using MongoDB Atlas (SRV connection string)
    if (mongodbUri.includes('mongodb+srv')) {
      logger.info('Connecting to MongoDB Atlas...');
    } else {
      logger.info('Connecting to local MongoDB...');
    }
    
    const conn = await mongoose.connect(mongodbUri, options);
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Log available collections
    const collections = await conn.connection.db.listCollections().toArray();
    logger.info(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${(error as Error).message}`);
    process.exit(1);
  }
};

export default connectDB; 