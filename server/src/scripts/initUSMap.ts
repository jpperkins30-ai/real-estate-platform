/**
 * Script to initialize a default US Map document if one doesn't exist
 */
import mongoose from 'mongoose';
import { USMap } from '../models/usmap.model';
import logger from '../utils/logger';
import connectDB from '../config/database';

/**
 * Initialize a US Map document if one doesn't exist
 */
export const initUSMap = async (): Promise<void> => {
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    
    logger.info('Initializing US Map...');
    
    // Check if US Map exists
    const existingUSMap = await USMap.findOne({ type: 'us_map' });
    
    if (!existingUSMap) {
      logger.info('US Map not found, creating default');
      
      // Create default US Map
      const newUSMap = new USMap({
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
        },
        controllers: []
      });
      
      // Save the new US Map
      await newUSMap.save();
      logger.info('Default US Map created successfully');
    } else {
      logger.info('US Map already exists');
    }
  } catch (error) {
    logger.error(`Error initializing US Map: ${(error as Error).message}`);
    // Don't throw the error, just log it - this allows the server to continue starting up
  } finally {
    // Close database connection if this script is run standalone
    if (process.env.STANDALONE === 'true') {
      await mongoose.connection.close();
    }
  }
};

// Run the function if this script is executed directly
if (require.main === module) {
  initUSMap()
    .then(() => {
      logger.info('US Map initialization complete');
      process.exit(0);
    })
    .catch(error => {
      logger.error(`Failed to initialize US Map: ${error}`);
      process.exit(1);
    });
}

// Export as both named and default export
export default initUSMap; 