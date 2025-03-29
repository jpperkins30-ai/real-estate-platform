const mongoose = require('mongoose');
const logger = require('../utils/logger');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * Connect to MongoDB database
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    
    // Verify collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    logger.info(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    return conn.connection;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 