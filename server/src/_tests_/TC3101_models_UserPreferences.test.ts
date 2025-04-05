// Test Case 3101: Verify UserPreferences model creates user preference document
import mongoose from 'mongoose';
import { UserPreferences } from '../models/UserPreferences';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  try {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    console.log(`MongoDB Memory Server started at URI: ${mongoUri}`);
    
    await mongoose.disconnect(); // Ensure no existing connections
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });
    
    console.log('Connected to MongoDB Memory Server');
  } catch (error) {
    console.error('Error setting up MongoDB Memory Server:', error);
    throw error;
  }
});

afterAll(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB Memory Server');
    }
    if (mongoServer) {
      await mongoServer.stop();
      console.log('MongoDB Memory Server stopped');
    }
  } catch (error) {
    console.error('Error tearing down MongoDB Memory Server:', error);
  }
});

// Clear database between tests to prevent interference
afterEach(async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      const collections = mongoose.connection.collections;
      for (const key in collections) {
        await collections[key].deleteMany({});
      }
      console.log('Cleared all collections');
    }
  } catch (error) {
    console.error('Error clearing collections:', error);
  }
});

describe('UserPreferences Model', () => {
  it('should create a user preference document', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const userPrefs = {
      userId,
      displayName: 'Test User',
      theme: 'dark',
      favoriteLayouts: [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ],
      recentSearches: ['property123', 'address456'],
      notifications: {
        email: true,
        app: false,
        sms: true
      }
    };
    
    const userPreferences = new UserPreferences(userPrefs);
    await userPreferences.save();
    
    const savedPreferences = await UserPreferences.findOne({ userId });
    
    expect(savedPreferences).toBeTruthy();
    if (!savedPreferences) {
      throw new Error('User preferences not found');
      return;
    }
    
    // Use type assertion to fix TypeScript errors
    const typedPreferences = savedPreferences as any;
    expect(typedPreferences.displayName).toBe('Test User');
    expect(typedPreferences.theme).toBe('dark');
    expect(typedPreferences.favoriteLayouts).toHaveLength(2);
    expect(typedPreferences.recentSearches).toContain('property123');
    expect(typedPreferences.notifications.email).toBe(true);
  });
  
  it('should update user themes correctly', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const userPrefs = {
      userId,
      displayName: 'Theme Test User',
      theme: 'light'
    };
    
    const userPreferences = new UserPreferences(userPrefs);
    await userPreferences.save();
    
    // Update theme
    await UserPreferences.findOneAndUpdate(
      { userId },
      { theme: 'dark' },
      { new: true }
    );
    
    const updatedPreferences = await UserPreferences.findOne({ userId });
    expect(updatedPreferences).toBeTruthy();
    
    // Use type assertion
    const typedPreferences = updatedPreferences as any;
    expect(typedPreferences.theme).toBe('dark');
  });
}); 
