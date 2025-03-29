// Script to insert sample properties for each county
const { MongoClient, ObjectId } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function insertProperties() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // Check for problematic indexes on properties collection
    console.log("Checking properties collection indexes...");
    const indexes = await db.collection('properties').indexes();
    console.log("Current indexes:", indexes.map(idx => `${idx.name} (${JSON.stringify(idx.key)})`).join(', '));
    
    // Check for problematic id index (not _id)
    const idIndex = indexes.find(idx => idx.name === 'id_1');
    if (idIndex) {
      console.log("Found problematic 'id' index, dropping it...");
      await db.collection('properties').dropIndex('id_1');
      console.log("Index 'id_1' dropped successfully");
    }
    
    // Get all counties
    const counties = await db.collection('counties').find({}).toArray();
    console.log(`Found ${counties.length} counties in database`);
    
    // Create sample properties for each county
    let totalPropertiesAdded = 0;
    
    for (const county of counties) {
      console.log(`\nProcessing county: ${county.name}`);
      
      // Get state for this county
      let stateName = "Unknown";
      let stateAbbr = "XX";
      
      if (county.stateId) {
        const state = await db.collection('states').findOne({ _id: county.stateId });
        if (state) {
          stateName = state.name;
          stateAbbr = state.abbreviation;
        }
      }
      
      // Check how many properties this county already has
      const existingPropertyCount = await db.collection('properties').countDocuments({ 
        countyId: county._id 
      });
      
      console.log(`County ${county.name} already has ${existingPropertyCount} properties`);
      
      // Add 1 property if the county has less than 1
      if (existingPropertyCount < 1) {
        console.log(`Adding sample property to ${county.name}, ${stateName}`);
        
        try {
          const propertyResult = await db.collection('properties').insertOne({
            address: {
              street: `123 Main St`,
              city: county.name,
              state: stateAbbr,
              zipCode: `12345`,
              formatted: `123 Main St, ${county.name}, ${stateAbbr} 12345`
            },
            type: "residential",
            subType: "single_family",
            status: "active",
            parentId: county._id,
            countyId: county._id,
            stateId: county.stateId,
            geometry: {
              type: "Point",
              coordinates: county.geometry && county.geometry.coordinates ? 
                [
                  county.geometry.coordinates[0][0][0] + 0.01, 
                  county.geometry.coordinates[0][0][1] + 0.01
                ] : 
                [0, 0]
            },
            metadata: {
              bedrooms: 3,
              bathrooms: 2,
              squareFeet: 1800,
              lotSize: 0.25,
              yearBuilt: 1990,
              lastSaleDate: new Date(),
              lastSaleAmount: 350000,
              taxAssessment: 320000,
              taxYear: 2023,
              propertyTaxes: 3200,
              taxStatus: "current",
              ownerName: "John Doe",
              ownerAddress: "Same as property",
              ownerOccupied: true
            },
            controllers: [],
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          console.log(`Added property with ID: ${propertyResult.insertedId}`);
          totalPropertiesAdded++;
          
          // Update county property count
          await db.collection('counties').updateOne(
            { _id: county._id },
            { $set: { "metadata.totalProperties": existingPropertyCount + 1 } }
          );
          
          // Update state property count
          if (county.stateId) {
            await db.collection('states').updateOne(
              { _id: county.stateId },
              { $inc: { "metadata.totalProperties": 1 } }
            );
          }
        } catch (err) {
          console.error(`Error adding property to ${county.name}:`, err.message);
          
          // Check if there's a hidden property with id field issue
          if (err.code === 11000 && err.keyPattern?.id) {
            console.log("Checking for problematic properties with id field...");
            const problematicProperties = await db.collection('properties').find({ id: null }).toArray();
            
            if (problematicProperties.length > 0) {
              console.log(`Found ${problematicProperties.length} problematic properties with id: null`);
              
              for (const prop of problematicProperties) {
                console.log(`Fixing property ${prop._id}...`);
                await db.collection('properties').updateOne(
                  { _id: prop._id },
                  { $unset: { id: "" } }
                );
              }
            }
          }
        }
      }
    }
    
    console.log(`\nTotal properties added: ${totalPropertiesAdded}`);
    
    // Update overall property count in US Maps
    const totalProperties = await db.collection('properties').countDocuments();
    console.log(`Total properties in database: ${totalProperties}`);
    
    // Initialize state property counts to 0 if not exists
    const states = await db.collection('states').find({}).toArray();
    for (const state of states) {
      if (!state.metadata?.totalProperties) {
        await db.collection('states').updateOne(
          { _id: state._id },
          { 
            $set: { 
              "metadata.totalProperties": 0 
            }
          }
        );
      }
    }
    
    // Update in usmaps collection
    const usMap = await db.collection('usmaps').findOne({ type: "us_map" });
    if (usMap) {
      await db.collection('usmaps').updateOne(
        { _id: usMap._id },
        { $set: { "metadata.totalProperties": totalProperties } }
      );
      console.log("Updated US Map (usmaps) property count");
    }
    
    // Update in usmap collection
    const usMapSingular = await db.collection('usmap').findOne({ type: "us_map" });
    if (usMapSingular) {
      await db.collection('usmap').updateOne(
        { _id: usMapSingular._id },
        { $set: { "metadata.totalProperties": totalProperties } }
      );
      console.log("Updated US Map (usmap) property count");
    }
    
    // Display updated property counts
    console.log("\nCounty property counts:");
    for (const county of counties) {
      const propertyCount = await db.collection('properties').countDocuments({ countyId: county._id });
      console.log(`- ${county.name}: ${propertyCount} properties`);
    }
    
    console.log("\nState property counts:");
    for (const state of states) {
      const propertyCount = await db.collection('properties').countDocuments({ stateId: state._id });
      const statePropertyCount = await db.collection('states').findOne({ _id: state._id }).then(s => s?.metadata?.totalProperties || 0);
      
      console.log(`- ${state.name} (${state.abbreviation}): ${propertyCount} properties (metadata: ${statePropertyCount})`);
      
      // Fix state property count if it doesn't match
      if (propertyCount !== statePropertyCount) {
        await db.collection('states').updateOne(
          { _id: state._id },
          { $set: { "metadata.totalProperties": propertyCount } }
        );
        console.log(`  Updated ${state.name} property count to ${propertyCount}`);
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
insertProperties(); 