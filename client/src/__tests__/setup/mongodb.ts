import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { vi, beforeAll, afterAll, afterEach } from 'vitest';

// Mock MongoDB for tests
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Set environment variable
  process.env.MONGODB_URI = uri;
  
  // Connect to in-memory database
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  // Clear all collections after each test
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}); 