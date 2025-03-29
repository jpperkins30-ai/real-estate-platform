/**
 * Reset and migrate county documents to use customId field
 * 
 * This script:
 * 1. Finds all counties in the database
 * 2. Resets the customId field for all counties
 * 3. Updates each county to have a correct customId based on state and name
 * 4. Reports on the migration status
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Helper function to slugify a string
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/[^\w\-]+/g, '')     // Remove all non-word chars
    .replace(/\-\-+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')           // Trim - from start of text
    .replace(/-+$/, '');          // Trim - from end of text
};

// Extract the state code from a county name
const extractStateCodeFromName = (name) => {
  // Common state patterns in county names
  const patterns = [
    { pattern: /\b(TX|Texas)\b/i, code: 'tx' },
    { pattern: /\b(CA|California)\b/i, code: 'ca' },
    { pattern: /\b(FL|Florida)\b/i, code: 'fl' },
    { pattern: /\b(NY|New York)\b/i, code: 'ny' },
    { pattern: /\b(MD|Maryland)\b/i, code: 'md' }
  ];
  
  // Check if the name contains a state pattern
  for (const { pattern, code } of patterns) {
    if (pattern.test(name)) {
      return code;
    }
  }
  
  // If not found, check if there's a parenthesized state code
  const stateCodeMatch = name.match(/\(([A-Z]{2})\)/);
  if (stateCodeMatch) {
    return stateCodeMatch[1].toLowerCase();
  }
  
  // Match common counties to their states
  const countyMapping = {
    'Montgomery': 'md',
    'Baltimore': 'md',
    'Howard': 'md',
    'Dallas': 'tx',
    'Travis': 'tx',
    'Harris': 'tx',
    'Los Angeles': 'ca',
    'San Francisco': 'ca',
    'San Diego': 'ca',
    'Miami-Dade': 'fl',
    'Broward': 'fl',
    'Palm Beach': 'fl',
    'Kings': 'ny',
    'Queens': 'ny',
    'New York': 'ny'
  };
  
  return countyMapping[name] || null;
};

// Connect to MongoDB
console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    runMigration();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Define simplified schemas for State and County
const StateSchema = new Schema({
  abbreviation: String,
  name: String,
  id: String
});

const CountySchema = new Schema({
  customId: String,
  name: String,
  stateId: Schema.Types.ObjectId,
  type: String
});

// Create models
const State = mongoose.model('State', StateSchema);
const County = mongoose.model('County', CountySchema);

async function runMigration() {
  try {
    console.log('Starting county ID reset and migration...');
    
    // Get all counties
    const counties = await County.find({});
    console.log(`Found ${counties.length} counties to process`);
    
    // First, reset all customIds
    console.log('Resetting all county customIds...');
    await County.updateMany({}, { $unset: { customId: 1 } });
    console.log('Reset complete. Now assigning correct customIds...');
    
    // Get all states for reference
    const states = await State.find({});
    console.log(`Found ${states.length} states for reference`);
    
    // Create maps for quick lookups
    const stateMap = {}; // Map state IDs to abbreviations
    const stateAbbrevMap = {}; // Map state abbreviations to state objects
    
    states.forEach(state => {
      stateMap[state._id.toString()] = state.abbreviation.toLowerCase();
      stateAbbrevMap[state.abbreviation.toLowerCase()] = state;
    });
    
    let updated = 0;
    let errors = 0;
    
    // Process each county
    for (const county of counties) {
      try {
        let stateAbbr = null;
        
        // Try to get state abbreviation from stateId
        if (county.stateId && stateMap[county.stateId.toString()]) {
          stateAbbr = stateMap[county.stateId.toString()];
          console.log(`Found state '${stateAbbr}' from stateId for county ${county.name}`);
        } else {
          // Try to extract state code from the county name
          stateAbbr = extractStateCodeFromName(county.name);
          
          if (!stateAbbr) {
            console.log(`Could not determine state for county ${county.name}, using 'unk' as fallback`);
            stateAbbr = 'unk'; // Unknown state
          } else {
            console.log(`Extracted state code '${stateAbbr}' from county name: ${county.name}`);
            
            // Find the state by abbreviation and update the county's stateId
            const matchedState = stateAbbrevMap[stateAbbr];
            
            if (matchedState) {
              await County.updateOne(
                { _id: county._id },
                { $set: { stateId: matchedState._id } }
              );
              console.log(`Updated stateId for county ${county.name} to ${matchedState.name} (${matchedState._id})`);
            }
          }
        }
        
        // Generate customId
        const customId = `${stateAbbr}-${slugify(county.name.toLowerCase())}`;
        
        // Update the county
        await County.updateOne(
          { _id: county._id },
          { $set: { customId: customId } }
        );
        
        console.log(`Updated county ${county.name} with customId: ${customId}`);
        updated++;
      } catch (error) {
        console.error(`Error processing county ${county.name}:`, error.message);
        errors++;
      }
    }
    
    console.log('\nMigration complete:');
    console.log(`- Total counties: ${counties.length}`);
    console.log(`- Updated: ${updated}`);
    console.log(`- Errors: ${errors}`);
    
    console.log('\nDisconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('Migration complete');
  } catch (error) {
    console.error('Migration failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
} 