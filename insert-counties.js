// Script to insert counties and update counts
const { MongoClient, ObjectId } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function insertCounties() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // Check for problematic indexes
    console.log("Checking collection indexes...");
    const indexes = await db.collection('counties').indexes();
    console.log("Current indexes:", indexes.map(idx => `${idx.name} (${JSON.stringify(idx.key)})`).join(', '));
    
    // Check for problematic id index (not _id)
    const idIndex = indexes.find(idx => idx.name === 'id_1');
    if (idIndex) {
      console.log("Found problematic 'id' index, dropping it...");
      await db.collection('counties').dropIndex('id_1');
      console.log("Index 'id_1' dropped successfully");
    }
    
    // Get the USMap _id
    const usMap = await db.collection('usmaps').findOne({ type: "us_map" });
    if (!usMap) {
      console.error('US Map not found in usmaps collection. Please run insert-usmap.js first.');
      return;
    }
    console.log('Found US Map with ID:', usMap._id);
    
    // Initialize metadata for USMap if it doesn't exist
    if (!usMap.metadata) {
      console.log("Initializing US Map metadata...");
      await db.collection('usmaps').updateOne(
        { _id: usMap._id },
        { 
          $set: { 
            metadata: {
              totalStates: 0,
              totalCounties: 0,
              totalProperties: 0
            }
          }
        }
      );
      console.log("US Map metadata initialized");
    }
    
    // Get Maryland state _id
    const mdState = await db.collection('states').findOne({ abbreviation: "MD" });
    if (!mdState) {
      console.error('Maryland state not found. Please run insert-states.js first.');
      return;
    }
    console.log('Found Maryland state with ID:', mdState._id);
    
    // Initialize metadata for Maryland if it doesn't exist
    if (!mdState.metadata) {
      console.log("Initializing Maryland metadata...");
      await db.collection('states').updateOne(
        { _id: mdState._id },
        { 
          $set: { 
            metadata: {
              totalCounties: 0,
              totalProperties: 0
            }
          }
        }
      );
      console.log("Maryland metadata initialized");
    }
    
    // Get Texas state _id
    const txState = await db.collection('states').findOne({ abbreviation: "TX" });
    if (!txState) {
      console.error('Texas state not found. Please run insert-states.js first.');
      return;
    }
    console.log('Found Texas state with ID:', txState._id);
    
    // Initialize metadata for Texas if it doesn't exist
    if (!txState.metadata) {
      console.log("Initializing Texas metadata...");
      await db.collection('states').updateOne(
        { _id: txState._id },
        { 
          $set: { 
            metadata: {
              totalCounties: 0,
              totalProperties: 0
            }
          }
        }
      );
      console.log("Texas metadata initialized");
    }
    
    // Get California state
    const caState = await db.collection('states').findOne({ abbreviation: "CA" });
    if (caState) {
      console.log('Found California state with ID:', caState._id);
      
      // Initialize metadata for California if it doesn't exist
      if (!caState.metadata) {
        console.log("Initializing California metadata...");
        await db.collection('states').updateOne(
          { _id: caState._id },
          { 
            $set: { 
              metadata: {
                totalCounties: 0,
                totalProperties: 0
              }
            }
          }
        );
        console.log("California metadata initialized");
      }
    }
    
    // Check if St. Mary's County already exists
    const existingStMarys = await db.collection('counties').findOne({ 
      name: "St. Mary's"
    });
    
    // Create St. Mary's County if it doesn't exist, or update it
    if (!existingStMarys) {
      console.log("Inserting St. Mary's County...");
      try {
        const stMarysResult = await db.collection('counties').insertOne({
          name: "St. Mary's",
          type: "county",
          parentId: mdState._id,
          stateId: mdState._id,
          geometry: {
            type: "Polygon",
            coordinates: [[[-76.7000, 38.5000], [-76.5000, 38.5000], [-76.3000, 38.3000], 
                          [-76.4000, 38.1000], [-76.7000, 38.1000], [-76.7000, 38.5000]]]
          },
          metadata: {
            totalProperties: 0,
            statistics: {
              totalTaxLiens: 0,
              totalValue: 0
            },
            searchConfig: {
              searchUrl: "https://sdat.dat.maryland.gov/RealProperty/",
              lookupMethod: "account_number",
              selectors: {
                ownerName: ".SDAT_Value:contains('Owner Name')",
                propertyAddress: ".SDAT_Value:contains('Premise Address')",
                marketValue: ".SDAT_Label:contains('Total:')",
                taxStatus: ".SDAT_Value:contains('Tax Status')"
              },
              lienUrl: null
            }
          },
          controllers: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log("Inserted St. Mary's County with ID:", stMarysResult.insertedId);
      } catch (err) {
        console.error("Error inserting St. Mary's County:", err.message);
      }
    } else {
      console.log("St. Mary's County already exists with ID:", existingStMarys._id);
      // Update it to connect to Maryland
      try {
        const updateResult = await db.collection('counties').updateOne(
          { _id: existingStMarys._id },
          { 
            $set: {
              stateId: mdState._id,
              parentId: mdState._id,
              updatedAt: new Date()
            } 
          }
        );
        console.log("Updated St. Mary's County:", updateResult.modifiedCount === 1 ? "Success" : "No changes needed");
      } catch (updateErr) {
        console.error("Error updating St. Mary's County:", updateErr.message);
      }
    }
    
    // Check if Harris County already exists
    const existingHarris = await db.collection('counties').findOne({ 
      name: "Harris"
    });
    
    // Create Harris County if it doesn't exist, or update it
    if (!existingHarris) {
      console.log("Inserting Harris County...");
      try {
        const harrisResult = await db.collection('counties').insertOne({
          name: "Harris",
          type: "county",
          parentId: txState._id,
          stateId: txState._id,
          geometry: {
            type: "Polygon",
            coordinates: [[[-95.8000, 30.1000], [-95.5000, 30.1000], [-95.2000, 29.8000], 
                          [-95.5000, 29.5000], [-95.8000, 29.5000], [-95.8000, 30.1000]]]
          },
          metadata: {
            totalProperties: 0,
            statistics: {
              totalTaxLiens: 0,
              totalValue: 0
            },
            searchConfig: {
              searchUrl: "https://hcad.org/property-search",
              lookupMethod: "account_number",
              selectors: {
                ownerName: "#ownerName",
                propertyAddress: "#situsAddress",
                marketValue: "#marketValue",
                taxStatus: "#taxStatus"
              },
              lienUrl: "https://www.hctax.net/Property/AccountSearch"
            }
          },
          controllers: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log("Inserted Harris County with ID:", harrisResult.insertedId);
      } catch (err) {
        console.error("Error inserting Harris County:", err.message);
        
        // Check if there's a hidden Harris County with id field issue
        console.log("Checking for Harris County with id field issue...");
        const problematicHarris = await db.collection('counties').findOne({ id: null, name: "Harris" });
        
        if (problematicHarris) {
          console.log("Found problematic Harris County with id: null, ID:", problematicHarris._id);
          console.log("Updating problematic Harris County...");
          
          // Update the problematic record
          await db.collection('counties').updateOne(
            { _id: problematicHarris._id },
            { 
              $set: {
                stateId: txState._id,
                parentId: txState._id,
                updatedAt: new Date()
              },
              $unset: { id: "" }
            }
          );
          console.log("Updated problematic Harris County");
        }
      }
    } else {
      console.log("Harris County already exists with ID:", existingHarris._id);
      // Update it to connect to Texas
      try {
        const updateResult = await db.collection('counties').updateOne(
          { _id: existingHarris._id },
          { 
            $set: {
              stateId: txState._id,
              parentId: txState._id,
              updatedAt: new Date()
            } 
          }
        );
        console.log("Updated Harris County:", updateResult.modifiedCount === 1 ? "Success" : "No changes needed");
      } catch (updateErr) {
        console.error("Error updating Harris County:", updateErr.message);
      }
    }
    
    // Also fix the existing California counties
    const existingCaliforniaCounties = await db.collection('counties').find({ 
      name: /California County [0-9]/
    }).toArray();
    
    if (existingCaliforniaCounties.length > 0) {
      console.log(`Found ${existingCaliforniaCounties.length} California counties to fix...`);
      
      // Get California state
      if (caState) {
        for (const county of existingCaliforniaCounties) {
          try {
            const updateResult = await db.collection('counties').updateOne(
              { _id: county._id },
              { 
                $set: {
                  stateId: caState._id,
                  parentId: caState._id,
                  updatedAt: new Date()
                } 
              }
            );
            console.log(`Updated ${county.name}:`, updateResult.modifiedCount === 1 ? "Success" : "No changes needed");
          } catch (updateErr) {
            console.error(`Error updating ${county.name}:`, updateErr.message);
          }
        }
      } else {
        console.log("California state not found, cannot fix county references");
      }
    }
    
    // Count counties for each state after updates
    const mdCountyCount = await db.collection('counties').countDocuments({ stateId: mdState._id });
    const txCountyCount = await db.collection('counties').countDocuments({ stateId: txState._id });
    let caCountyCount = 0;
    
    if (caState) {
      caCountyCount = await db.collection('counties').countDocuments({ stateId: caState._id });
    }
    
    const totalCountyCount = await db.collection('counties').countDocuments();
    
    console.log(`Maryland counties: ${mdCountyCount}`);
    console.log(`Texas counties: ${txCountyCount}`);
    console.log(`California counties: ${caCountyCount}`);
    console.log(`Total counties: ${totalCountyCount}`);
    
    // Update state county counts
    console.log("Updating Maryland state county count...");
    const mdUpdateResult = await db.collection('states').updateOne(
      { _id: mdState._id },
      { $set: { "metadata.totalCounties": mdCountyCount } }
    );
    console.log("Maryland update result:", mdUpdateResult.modifiedCount === 1 ? "Success" : "No changes needed");
    
    console.log("Updating Texas state county count...");
    const txUpdateResult = await db.collection('states').updateOne(
      { _id: txState._id },
      { $set: { "metadata.totalCounties": txCountyCount } }
    );
    console.log("Texas update result:", txUpdateResult.modifiedCount === 1 ? "Success" : "No changes needed");
    
    if (caState) {
      console.log("Updating California state county count...");
      const caUpdateResult = await db.collection('states').updateOne(
        { _id: caState._id },
        { $set: { "metadata.totalCounties": caCountyCount } }
      );
      console.log("California update result:", caUpdateResult.modifiedCount === 1 ? "Success" : "No changes needed");
    }
    
    // Update USMap county count
    console.log("Updating US Map county count...");
    const usMapUpdateResult = await db.collection('usmaps').updateOne(
      { _id: usMap._id },
      { $set: { "metadata.totalCounties": totalCountyCount } }
    );
    console.log("US Map update result:", usMapUpdateResult.modifiedCount === 1 ? "Success" : "No changes needed");
    
    // Also update the usmap collection if it exists
    const usMapSingular = await db.collection('usmap').findOne({ type: "us_map" });
    if (usMapSingular) {
      // Initialize metadata if it doesn't exist
      if (!usMapSingular.metadata) {
        console.log("Initializing US Map (singular) metadata...");
        await db.collection('usmap').updateOne(
          { _id: usMapSingular._id },
          { 
            $set: { 
              metadata: {
                totalStates: 0,
                totalCounties: 0,
                totalProperties: 0
              }
            }
          }
        );
        console.log("US Map (singular) metadata initialized");
      }
      
      const usMapSingularUpdate = await db.collection('usmap').updateOne(
        { _id: usMapSingular._id },
        { $set: { "metadata.totalCounties": totalCountyCount } }
      );
      console.log("US Map (singular) update result:", usMapSingularUpdate.modifiedCount === 1 ? "Success" : "No changes needed");
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
insertCounties(); 