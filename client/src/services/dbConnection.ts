import mongoose from 'mongoose';

// MongoDB connection settings
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Function to connect to MongoDB
export const connectToDatabase = async (): Promise<typeof mongoose> => {
  try {
    const connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log('Connected to MongoDB');
    return connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
};

// Function to disconnect from MongoDB
export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
    throw error;
  }
};

// Setup MongoDB schema for layouts
export const setupLayoutSchema = () => {
  // Only create schema if it doesn't already exist
  if (mongoose.models.Layout) {
    return mongoose.models.Layout;
  }
  
  const PanelPositionSchema = new mongoose.Schema({
    // For standard layouts
    row: { type: Number },
    col: { type: Number },
    // For advanced layouts
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number }
  }, { _id: false });
  
  const PanelSizeSchema = new mongoose.Schema({
    width: { type: Number },
    height: { type: Number }
  }, { _id: false });
  
  const PanelSchema = new mongoose.Schema({
    id: { type: String, required: true },
    contentType: { 
      type: String, 
      enum: ['map', 'state', 'county', 'property', 'filter', 'stats', 'chart'],
      required: true 
    },
    title: { type: String, required: true },
    position: PanelPositionSchema,
    size: PanelSizeSchema,
    state: { type: mongoose.Schema.Types.Mixed },
    visible: { type: Boolean, default: true },
    closable: { type: Boolean, default: false },
    maximizable: { type: Boolean, default: true }
  }, { _id: false });
  
  const layoutSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    type: { 
      type: String, 
      enum: ['single', 'dual', 'tri', 'quad', 'advanced'],
      required: true 
    },
    panels: [PanelSchema],
    isDefault: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  // Middleware to update the updatedAt field on save
  layoutSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });
  
  // Create indexes for more efficient queries
  layoutSchema.index({ userId: 1 });
  layoutSchema.index({ isPublic: 1 });
  layoutSchema.index({ type: 1 });
  
  return mongoose.model('Layout', layoutSchema);
};

// Get the Layout model
export const getLayoutModel = () => {
  return setupLayoutSchema();
};

// Setup MongoDB for testing with sample data
export const setupTestDatabase = async () => {
  await connectToDatabase();
  
  // Get Layout model
  const Layout = getLayoutModel();
  
  // Clear existing layouts
  await Layout.deleteMany({});
  
  try {
    // Insert sample layouts
    const sampleLayouts = [
      {
        name: 'Default Single Panel',
        description: 'A simple single panel layout',
        type: 'single' as const,
        panels: [
          {
            id: 'main',
            contentType: 'map' as const,
            title: 'Map View',
            position: { row: 0, col: 0 },
            size: { width: 100, height: 100 },
            maximizable: false,
            closable: false
          }
        ],
        isDefault: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Default Dual Panel',
        description: 'A dual panel layout',
        type: 'dual' as const,
        panels: [
          {
            id: 'left',
            contentType: 'map' as const,
            title: 'Map View',
            position: { row: 0, col: 0 },
            size: { width: 60, height: 100 },
            maximizable: true,
            closable: false
          },
          {
            id: 'right',
            contentType: 'property' as const,
            title: 'Property View',
            position: { row: 0, col: 1 },
            size: { width: 40, height: 100 },
            maximizable: true,
            closable: false
          }
        ],
        isDefault: false,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    await Layout.create(sampleLayouts);
    console.log('Test database initialized with sample layouts');
  } catch (error) {
    console.error('Error initializing test database:', error);
  }
}; 