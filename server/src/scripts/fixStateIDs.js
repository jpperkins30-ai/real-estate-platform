/**
 * Fix missing IDs in State collections
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Connect to MongoDB
async function connectToDatabase() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    return false;
  }
}

// Define State schema
const StateSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  type: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId },
  geometry: Object,
  metadata: Object
}, { 
  timestamps: true,
  strict: false // Allow any fields that might be in the database
});

async function fixStateIds() {
  try {
    console.log('Starting State ID fix...');
    
    // Connect to database
    const dbConnected = await connectToDatabase();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Get model
    const State = mongoose.model('State', StateSchema);
    
    // Find all states without IDs
    const statesWithoutIds = await State.find({ id: { $exists: false } });
    console.log(`Found ${statesWithoutIds.length} states without IDs`);
    
    if (statesWithoutIds.length === 0) {
      console.log('No states need fixing');
      return;
    }
    
    // Fix each state
    for (const state of statesWithoutIds) {
      try {
        // Generate an ID based on state abbreviation
        const stateId = state.abbreviation.toLowerCase();
        
        // Update the state with the new ID
        await State.updateOne(
          { _id: state._id },
          { $set: { id: stateId } }
        );
        
        console.log(`Fixed state: ${state.name} with ID: ${stateId}`);
      } catch (error) {
        console.error(`Error fixing state ${state.name}:`, error);
      }
    }
    
    console.log('State ID fix complete');
  } catch (error) {
    console.error('Error in State ID fix:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixStateIds().then(() => {
  console.log('State ID fix script completed');
  process.exit(0);
}).catch(error => {
  console.error('State ID fix script failed:', error);
  process.exit(1);
}); 