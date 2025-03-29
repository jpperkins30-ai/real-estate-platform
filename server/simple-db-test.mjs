/**
 * Simple database connection test using ES modules
 */
import { createRequire } from 'module';
import * as url from 'url';
import * as path from 'path';

const require = createRequire(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Load dotenv
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });

// Log environment variables
console.log('Starting MongoDB connection test...');
console.log('Environment variables:');
console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');
console.log('- MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform');

// Set JWT_SECRET if not already set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'test-jwt-secret';
  console.log('Set JWT_SECRET for testing');
}

// Connect to MongoDB directly
import mongoose from 'mongoose';

try {
  console.log('Connecting to MongoDB...');
  const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform');
  
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  
  // Log available collections
  const collections = await conn.connection.db.listCollections().toArray();
  console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
  
  console.log('Database connection test completed successfully!');
  
  // Close connection
  await mongoose.connection.close();
  console.log('MongoDB connection closed');
} catch (error) {
  console.error('Error connecting to MongoDB:', error.message);
  process.exit(1);
} 