/**
 * Fix missing IDs in County collections
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

// Define County schema
const CountySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  stateId: { type: mongoose.Schema.Types.ObjectId, ref: 'State' },
  type: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId },
  geometry: Object,
  metadata: Object
}, { 
  timestamps: true,
  strict: false // Allow any fields that might be in the database
});

// Define State schema
const StateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  abbreviation: { type: String, required: true },
  type: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId },
  metadata: Object
}, { 
  timestamps: true,
  strict: false // Allow any fields that might be in the database
});

async function fixCountyIds() {
  try {
    console.log('Starting County ID fix...');
    
    // Connect to database
    const dbConnected = await connectToDatabase();
    if (!dbConnected) {
      throw new Error('Failed to connect to database');
    }
    
    // Get models
    const County = mongoose.model('County', CountySchema);
    const State = mongoose.model('State', StateSchema);
    
    // Find all counties without IDs
    const countiesWithoutIds = await County.find({ id: { $exists: false } });
    console.log(`Found ${countiesWithoutIds.length} counties without IDs`);
    
    if (countiesWithoutIds.length === 0) {
      console.log('No counties need fixing');
      return;
    }
    
    // Fix each county
    for (const county of countiesWithoutIds) {
      try {
        // Find the state for this county
        const state = await State.findById(county.stateId);
        
        if (!state) {
          console.warn(`Could not find state for county ${county.name} (${county._id})`);
          continue;
        }
        
        // Generate an ID based on state abbreviation and county name
        const stateAbbr = state.abbreviation;
        const countyId = `${stateAbbr.toLowerCase()}-${county.name.toLowerCase().replace(/\s+/g, '-')}`;
        
        // Update the county with the new ID
        await County.updateOne(
          { _id: county._id },
          { $set: { id: countyId } }
        );
        
        console.log(`Fixed county: ${county.name} (${stateAbbr}) with ID: ${countyId}`);
      } catch (error) {
        console.error(`Error fixing county ${county.name}:`, error);
      }
    }
    
    console.log('County ID fix complete');
  } catch (error) {
    console.error('Error in County ID fix:', error);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixCountyIds().then(() => {
  console.log('County ID fix script completed');
  process.exit(0);
}).catch(error => {
  console.error('County ID fix script failed:', error);
  process.exit(1);
}); 