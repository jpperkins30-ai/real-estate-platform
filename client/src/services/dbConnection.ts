import mongoose from 'mongoose';

// MongoDB connection settings
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/multi-frame-app';

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
  
  const layoutSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    type: { 
      type: String, 
      enum: ['single', 'dual', 'tri', 'quad', 'advanced'],
      required: true 
    },
    panels: [{ 
      id: { type: String, required: true },
      contentType: { 
        type: String, 
        enum: ['map', 'state', 'county', 'property', 'filter', 'stats', 'chart'],
        required: true 
      },
      title: { type: String, required: true },
      position: {
        // For standard layouts
        row: { type: Number },
        col: { type: Number },
        // For advanced layouts
        x: { type: Number },
        y: { type: Number },
        width: { type: Number },
        height: { type: Number }
      },
      size: {
        width: { type: Number },
        height: { type: Number }
      },
      state: { type: mongoose.Schema.Types.Mixed },
      visible: { type: Boolean, default: true },
      closable: { type: Boolean, default: false },
      maximizable: { type: Boolean, default: true }
    }],
    isDefault: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  return mongoose.model('Layout', layoutSchema);
}; 