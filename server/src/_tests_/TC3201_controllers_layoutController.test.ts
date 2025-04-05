// Test Case 3201: Verify layoutController creates new layout
import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { getLayouts, getLayout, createLayout, updateLayout, deleteLayout, cloneLayout } from '../controllers/layoutController';
import { LayoutConfig } from '../models/LayoutConfig';

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

beforeEach(async () => {
  // Clear the database before each test
  if (mongoose.connection.readyState !== 0) {
    await LayoutConfig.deleteMany({});
    console.log('Cleared collections for controller test');
  }
});

// Mock Express request and response
const mockRequest = () => {
  const req: Partial<Request> = {
    params: {},
    body: {},
    query: {}
  };
  return req;
};

const mockResponse = () => {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis()
  };
  return res;
};

describe('Layout Controller', () => {
  describe('createLayout', () => {
    it('should create a new layout', async () => {
      const userId = new mongoose.Types.ObjectId();
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        userId,
        name: 'Test Layout',
        description: 'Test layout description',
        layoutType: 'quad',
        panels: [
          { id: 'panel1', contentType: 'map', title: 'Map Panel' },
          { id: 'panel2', contentType: 'property', title: 'Property Panel' }
        ]
      };
      
      await createLayout(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      
      // Check that the layout was actually created in the database
      const layouts = await LayoutConfig.find({ userId });
      expect(layouts.length).toBe(1);
      expect(layouts[0].name).toBe('Test Layout');
    });
  });
  
  describe('getLayouts', () => {
    it('should get all layouts for a user', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      // Create test layouts
      await LayoutConfig.create([
        { userId, name: 'Layout 1', layoutType: 'dual' },
        { userId, name: 'Layout 2', layoutType: 'tri' }
      ]);
      
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { userId: userId.toString() };
      
      await getLayouts(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      
      const callResult = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callResult.layouts.length).toBe(2);
    });
  });
  
  describe('getLayout', () => {
    it('should get a single layout by ID', async () => {
      const userId = new mongoose.Types.ObjectId();
      
      // Create test layout
      const layout = await LayoutConfig.create({
        userId, 
        name: 'Test Layout',
        layoutType: 'single'
      });
      
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: layout._id.toString() };
      
      await getLayout(req as Request, res as Response);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      
      const callResult = (res.json as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(callResult.layout.name).toBe('Test Layout');
    });
  });
}); 
