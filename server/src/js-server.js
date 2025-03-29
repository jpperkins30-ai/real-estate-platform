// src/js-server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth-bypass');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Real Estate Platform API' });
});

// MongoDB connection
const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    console.log('MongoDB URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform');
    
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('MongoDB connected successfully');
    
    // Log available collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // Log environment variables (without showing actual secrets)
    console.log('Environment variables:');
    console.log('- JWT_SECRET:', process.env.JWT_SECRET ? '[SET]' : '[NOT SET]');
    console.log('- PORT:', process.env.PORT || '4000 (default)');
    console.log('- NODE_ENV:', process.env.NODE_ENV || 'development (default)');
    console.log('- MONGODB_URI:', process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform');
    
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Close server & exit process
  process.exit(1);
});

startServer(); 