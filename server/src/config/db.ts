import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate-platform');
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err: unknown) {
    console.error(`Error connecting to MongoDB: ${err instanceof Error ? err.message : 'Unknown error'}`);
    process.exit(1);
  }
}; 