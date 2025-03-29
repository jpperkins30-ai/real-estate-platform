// Script to list all counties
const { MongoClient, ObjectId } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function listCounties() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // Get all states for reference
    const allStates = await db.collection('states').find({}).toArray();
    console.log(`Found ${allStates.length} states in database`);
    
    // Create a map of state IDs to state objects for easy lookup
    const stateMap = {};
    allStates.forEach(state => {
      stateMap[state._id.toString()] = state;
      console.log(`- ${state.name} (${state.abbreviation}), ID: ${state._id}`);
    });
    
    console.log("\n=== CHECKING FOR PROBLEMATIC COUNTIES ===");
    
    // Look for counties with duplicate names
    const countyNames = {};
    const countiesByName = await db.collection('counties').find({}).toArray();
    
    countiesByName.forEach(county => {
      if (!countyNames[county.name]) {
        countyNames[county.name] = [];
      }
      countyNames[county.name].push(county._id.toString());
    });
    
    let duplicateFound = false;
    for (const name in countyNames) {
      if (countyNames[name].length > 1) {
        console.log(`Duplicate county name "${name}" found with IDs: ${countyNames[name].join(', ')}`);
        duplicateFound = true;
      }
    }
    
    if (!duplicateFound) {
      console.log("No counties with duplicate names found.");
    }
    
    // Check for Harris County specifically
    const harrisCounties = await db.collection('counties').find({ name: "Harris" }).toArray();
    if (harrisCounties.length > 0) {
      console.log(`\nFound ${harrisCounties.length} Harris County records:`);
      harrisCounties.forEach(county => {
        console.log(`- ID: ${county._id}`);
        console.log(`  Fields: ${Object.keys(county).join(', ')}`);
        if (county.id !== undefined) console.log(`  id: ${county.id}`);
        if (county.stateId) console.log(`  stateId: ${county.stateId}`);
        if (county.parentId) console.log(`  parentId: ${county.parentId}`);
      });
    } else {
      console.log("\nNo Harris County records found.");
    }
    
    // Count total counties
    const totalCounties = await db.collection('counties').countDocuments();
    console.log(`\nTotal counties in database: ${totalCounties}`);
    
    // List all counties
    console.log("\nAll counties in database:");
    const allCounties = await db.collection('counties').find({}).toArray();
    
    if (allCounties.length === 0) {
      console.log("No counties found in database.");
      return;
    }
    
    for (let i = 0; i < allCounties.length; i++) {
      const county = allCounties[i];
      console.log(`\nCounty #${i + 1}: ${county.name}`);
      console.log(`- ID: ${county._id}`);
      
      // Print state information if available
      if (county.stateId) {
        const stateId = county.stateId.toString();
        if (stateMap[stateId]) {
          console.log(`- State: ${stateMap[stateId].name} (${stateMap[stateId].abbreviation})`);
          console.log(`- State ID: ${stateId}`);
        } else {
          console.log(`- State ID: ${stateId} (unknown state)`);
        }
      } else {
        console.log(`- State: Unknown (no stateId)`);
      }
      
      // Print parent ID if available
      if (county.parentId) {
        console.log(`- Parent ID: ${county.parentId}`);
      } else {
        console.log(`- Parent ID: None`);
      }
      
      // Print type if available
      if (county.type) {
        console.log(`- Type: ${county.type}`);
      } else {
        console.log(`- Type: Unknown`);
      }
      
      // Print geometry type if available
      if (county.geometry && county.geometry.type) {
        console.log(`- Geometry type: ${county.geometry.type}`);
      } else {
        console.log(`- Geometry type: None`);
      }
      
      // Print total properties if available
      if (county.metadata && county.metadata.totalProperties !== undefined) {
        console.log(`- Total properties: ${county.metadata.totalProperties}`);
      } else {
        console.log(`- Total properties: Unknown`);
      }
      
      // Print creation date if available
      if (county.createdAt) {
        console.log(`- Created: ${county.createdAt}`);
      } else {
        console.log(`- Created: Unknown`);
      }
      
      // Print all fields for debugging
      console.log(`- All fields: ${Object.keys(county).join(', ')}`);
    }
    
    // Get metadata from USMap
    console.log("\n=== US MAP METADATA ===");
    const usMap = await db.collection('usmaps').findOne({ type: "us_map" });
    if (usMap) {
      console.log(`US Map ID: ${usMap._id}`);
      if (usMap.metadata) {
        console.log(`- Total states: ${usMap.metadata.totalStates || 'unknown'}`);
        console.log(`- Total counties: ${usMap.metadata.totalCounties || 'unknown'}`);
        console.log(`- Total properties: ${usMap.metadata.totalProperties || 'unknown'}`);
      } else {
        console.log("- No metadata available");
      }
    } else {
      console.log("No US Map found");
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the function
listCounties(); 