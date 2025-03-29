// Script to list all properties
const { MongoClient, ObjectId } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function listProperties() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // Get all states for reference
    const states = await db.collection('states').find({}).toArray();
    const stateMap = {};
    states.forEach(state => {
      stateMap[state._id.toString()] = state;
    });
    
    // Get all counties for reference
    const counties = await db.collection('counties').find({}).toArray();
    const countyMap = {};
    counties.forEach(county => {
      countyMap[county._id.toString()] = county;
    });
    
    // Count properties
    const totalProperties = await db.collection('properties').countDocuments();
    console.log(`\nTotal properties in database: ${totalProperties}`);
    
    // List all properties
    if (totalProperties === 0) {
      console.log("No properties found in database.");
      return;
    }
    
    console.log("\nAll properties in database:");
    const properties = await db.collection('properties').find({}).toArray();
    
    let propertyIndex = 1;
    for (const property of properties) {
      console.log(`\nProperty #${propertyIndex++}: ${property.address.formatted}`);
      console.log(`- ID: ${property._id}`);
      
      // Print county information
      if (property.countyId) {
        const countyId = property.countyId.toString();
        const county = countyMap[countyId];
        if (county) {
          console.log(`- County: ${county.name}`);
        } else {
          console.log(`- County ID: ${countyId} (unknown county)`);
        }
      } else {
        console.log(`- County: Unknown (no countyId)`);
      }
      
      // Print state information
      if (property.stateId) {
        const stateId = property.stateId.toString();
        const state = stateMap[stateId];
        if (state) {
          console.log(`- State: ${state.name} (${state.abbreviation})`);
        } else {
          console.log(`- State ID: ${stateId} (unknown state)`);
        }
      } else {
        console.log(`- State: Unknown (no stateId)`);
      }
      
      // Print property type
      console.log(`- Type: ${property.type}${property.subType ? ' / ' + property.subType : ''}`);
      
      // Print property status
      console.log(`- Status: ${property.status || 'unknown'}`);
      
      // Print metadata if available
      if (property.metadata) {
        const meta = property.metadata;
        console.log(`- Bedrooms: ${meta.bedrooms || 'n/a'}`);
        console.log(`- Bathrooms: ${meta.bathrooms || 'n/a'}`);
        console.log(`- Square Feet: ${meta.squareFeet || 'n/a'}`);
        console.log(`- Year Built: ${meta.yearBuilt || 'n/a'}`);
        console.log(`- Last Sale: $${meta.lastSaleAmount?.toLocaleString() || 'n/a'}`);
        console.log(`- Tax Assessment: $${meta.taxAssessment?.toLocaleString() || 'n/a'}`);
        console.log(`- Owner: ${meta.ownerName || 'n/a'}`);
      }
      
      // Print creation date
      if (property.createdAt) {
        console.log(`- Created: ${property.createdAt}`);
      }
    }
    
    // Show properties by state
    console.log("\n=== Properties by State ===");
    for (const state of states) {
      const stateProperties = await db.collection('properties').find({ stateId: state._id }).toArray();
      console.log(`\n${state.name} (${state.abbreviation}): ${stateProperties.length} properties`);
      
      if (stateProperties.length > 0) {
        for (const prop of stateProperties) {
          console.log(`- ${prop.address.formatted}`);
          
          // Get county name
          if (prop.countyId) {
            const countyId = prop.countyId.toString();
            const county = countyMap[countyId];
            if (county) {
              console.log(`  County: ${county.name}`);
            }
          }
        }
      }
    }
    
    // Show properties by county
    console.log("\n=== Properties by County ===");
    for (const county of counties) {
      const countyProperties = await db.collection('properties').find({ countyId: county._id }).toArray();
      console.log(`\n${county.name} County: ${countyProperties.length} properties`);
      
      if (countyProperties.length > 0) {
        for (const prop of countyProperties) {
          console.log(`- ${prop.address.formatted}`);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the function
listProperties(); 