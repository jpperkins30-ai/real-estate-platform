import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { vi, beforeAll, afterAll, afterEach } from 'vitest';
import { setupLayoutSchema } from '../../services/dbConnection';

// Mocked MongoDB server for tests
let mongoServer: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Set environment variable for MongoDB URI
  process.env.MONGODB_URI = uri;
  
  // Connect to in-memory database
  await mongoose.connect(uri);
  
  // Setup schemas
  setupLayoutSchema();
  
  console.log('Connected to in-memory MongoDB server');
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect and stop MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
  
  console.log('Disconnected from in-memory MongoDB server');
});

// Reset data after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  // Clear all collections after each test
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
  
  console.log('Reset test database collections');
});

// Helper function to create test layouts
export const createTestLayout = async (layout: any) => {
  const Layout = mongoose.models.Layout;
  const newLayout = new Layout(layout);
  await newLayout.save();
  return newLayout;
};

// Helper function to create multiple test layouts
export const createTestLayouts = async (layouts: any[]) => {
  const Layout = mongoose.models.Layout;
  return await Layout.insertMany(layouts);
}; 