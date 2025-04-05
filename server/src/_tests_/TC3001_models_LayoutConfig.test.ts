// Test Case 3001: Verify LayoutConfig model creates a new layout config
import mongoose from 'mongoose';
import { LayoutConfig } from '../models/LayoutConfig';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';

let mongoServer: MongoMemoryServer;

// Setup MongoDB Memory Server with better connection handling
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

describe('LayoutConfig Model', () => {
  it('should create a new layout config', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const layoutData = {
      userId,
      name: 'Test Layout',
      description: 'Test layout description',
      isDefault: true,
      isPublic: false,
      layoutType: 'quad' as const,
      panels: [
        {
          id: 'panel1',
          contentType: 'map',
          title: 'Map Panel'
        },
        {
          id: 'panel2',
          contentType: 'state',
          title: 'State Panel'
        },
        {
          id: 'panel3',
          contentType: 'county',
          title: 'County Panel'
        },
        {
          id: 'panel4',
          contentType: 'property',
          title: 'Property Panel'
        }
      ]
    };
    
    const layout = new LayoutConfig(layoutData);
    await layout.save();
    
    const savedLayout = await LayoutConfig.findById(layout._id);
    
    expect(savedLayout).toBeTruthy();
    expect(savedLayout?.name).toBe('Test Layout');
    expect(savedLayout?.layoutType).toBe('quad');
    expect(savedLayout?.panels).toHaveLength(4);
    expect(savedLayout?.panels[2].contentType).toBe('county');
  });
  
  it('should handle nested panel position and size', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const layoutData = {
      userId,
      name: 'Layout with Positions',
      layoutType: 'dual' as const,
      panels: [
        {
          id: 'panel1',
          contentType: 'map',
          title: 'Map Panel',
          position: { row: 0, col: 0 },
          size: { width: 50, height: 100 }
        },
        {
          id: 'panel2',
          contentType: 'property',
          title: 'Property Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 100 }
        }
      ]
    };
    
    const layout = new LayoutConfig(layoutData);
    await layout.save();
    
    const savedLayout = await LayoutConfig.findById(layout._id);
    
    // Add null checks to fix TypeScript errors
    expect(savedLayout).toBeTruthy();
    if (!savedLayout || !savedLayout.panels || savedLayout.panels.length < 2) {
      throw new Error('Layout or panels not found');
      return;
    }
    
    const panel0 = savedLayout.panels[0];
    const panel1 = savedLayout.panels[1];
    
    if (!panel0.position || !panel0.size || !panel1.size) {
      throw new Error('Panel position or size is undefined');
      return;
    }
    
    expect(panel0.position.row).toBe(0);
    expect(panel0.position.col).toBe(0);
    expect(panel0.size.width).toBe(50);
    expect(panel1.size.height).toBe(100);
  });
}); 
