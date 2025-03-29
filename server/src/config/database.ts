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
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform');
    
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