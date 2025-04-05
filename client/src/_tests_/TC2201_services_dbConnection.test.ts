// Test Case 2201: Verify dbConnection service establishes connection correctly
// Test Case TC2201: Verify dbConnection service establishes connection correctly
// Test Case TC999: Verify services_dbConnection functionality
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { connectToDatabase, disconnectFromDatabase, setupLayoutSchema } from '../services/dbConnection';

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {})
};

// Create a MongoDB memory server for testing
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
});

afterAll(async () => {
  // Make sure we're disconnected from any test databases
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
  }
  
  if (mongoServer) {
    await mongoServer.stop();
  }
  
  // Restore mocks
  vi.restoreAllMocks();
});

describe('Database Connection Service', () => {
  it('connects to the database successfully', async () => {
    const connection = await connectToDatabase();
    
    expect(connection).toBeTruthy();
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected
    expect(consoleSpy.log).toHaveBeenCalledWith('Connected to MongoDB');
    
    // Disconnect after test
    await disconnectFromDatabase();
  });
  
  it('disconnects from the database successfully', async () => {
    // First connect
    await connectToDatabase();
    
    // Then disconnect
    await disconnectFromDatabase();
    
    expect(mongoose.connection.readyState).toBe(0); // 0 = disconnected
    expect(consoleSpy.log).toHaveBeenCalledWith('Disconnected from MongoDB');
  });
  
  it('handles connection errors', async () => {
    // Set an invalid connection URI to force an error
    const originalUri = process.env.MONGODB_URI;
    process.env.MONGODB_URI = 'mongodb://invalid-host:12345/test';
    
    // Disconnect first to ensure clean test
    if (mongoose.connection.readyState) {
      await disconnectFromDatabase();
    }
    
    // Add longer timeout and make sure the error is caught properly
    await expect(async () => {
      await connectToDatabase();
    }).rejects.toThrow();
    
    expect(consoleSpy.error).toHaveBeenCalled();
    
    // Restore the original URI
    process.env.MONGODB_URI = originalUri;
  }, 10000); // Increase timeout to 10 seconds
  
  it('creates a Layout schema with correct fields', async () => {
    // Ensure we're connected
    await connectToDatabase();
    
    // Setup the layout schema
    const Layout = setupLayoutSchema();
    
    // Verify schema fields
    const schema = Layout.schema;
    
    expect(schema.path('name')).toBeTruthy();
    expect(schema.path('name').isRequired).toBe(true);
    
    expect(schema.path('type')).toBeTruthy();
    expect(schema.path('type').isRequired).toBe(true);
    expect(schema.path('type').enumValues).toContain('single');
    expect(schema.path('type').enumValues).toContain('dual');
    expect(schema.path('type').enumValues).toContain('tri');
    expect(schema.path('type').enumValues).toContain('quad');
    expect(schema.path('type').enumValues).toContain('advanced');
    
    expect(schema.path('panels')).toBeTruthy();
    expect(schema.path('isDefault')).toBeTruthy();
    expect(schema.path('isPublic')).toBeTruthy();
    expect(schema.path('createdAt')).toBeTruthy();
    expect(schema.path('updatedAt')).toBeTruthy();
    
    // Disconnect after test
    await disconnectFromDatabase();
  });
  
  it('reuses existing Layout model if it already exists', async () => {
    // Ensure we're connected
    await connectToDatabase();
    
    // Setup the layout schema for the first time
    const Layout1 = setupLayoutSchema();
    
    // Try to set it up again
    const Layout2 = setupLayoutSchema();
    
    // They should be the same instance
    expect(Layout1).toBe(Layout2);
    
    // Disconnect after test
    await disconnectFromDatabase();
  });
  
  it('can create and save a layout document', async () => {
    // Ensure we're connected
    await connectToDatabase();
    
    // Setup the layout schema
    const Layout = setupLayoutSchema();
    
    // Create a test layout
    const testLayout = new Layout({
      name: 'Test Layout',
      type: 'dual',
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
      ],
      isDefault: true,
      isPublic: false
    });
    
    // Save it to the database
    await testLayout.save();
    
    // Retrieve it
    const savedLayout = await Layout.findById(testLayout._id);
    
    expect(savedLayout).toBeTruthy();
    expect(savedLayout?.name).toBe('Test Layout');
    expect(savedLayout?.type).toBe('dual');
    expect(savedLayout?.panels).toHaveLength(2);
    expect(savedLayout?.panels[0].id).toBe('panel1');
    expect(savedLayout?.panels[1].id).toBe('panel2');
    expect(savedLayout?.isDefault).toBe(true);
    expect(savedLayout?.isPublic).toBe(false);
    
    // Disconnect after test
    await disconnectFromDatabase();
  });
}); 


