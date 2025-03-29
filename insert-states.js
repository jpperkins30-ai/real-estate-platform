// Script to insert states and update US Map
const { MongoClient, ObjectId } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function insertStates() {
  const client = new MongoClient(uri);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // Get the USMap _id
    const usMap = await db.collection('usmaps').findOne({ type: "us_map" });
    if (!usMap) {
      console.error('US Map not found in usmaps collection. Trying usmap collection...');
      const usMap2 = await db.collection('usmap').findOne({ type: "us_map" });
      if (!usMap2) {
        console.error('US Map not found in either collection. Please run insert-usmap.js first.');
        return;
      }
      console.log('Found US Map in usmap collection with ID:', usMap2._id);
      usMapId = usMap2._id;
    } else {
      console.log('Found US Map in usmaps collection with ID:', usMap._id);
      usMapId = usMap._id;
    }
    
    // Check if states already exist (by abbreviation)
    const existingMD = await db.collection('states').findOne({ abbreviation: 'MD' });
    const existingTX = await db.collection('states').findOne({ abbreviation: 'TX' });
    const existingPA = await db.collection('states').findOne({ abbreviation: 'PA' });
    
    console.log('Existing states check:');
    console.log('- Maryland exists:', existingMD ? 'Yes' : 'No');
    console.log('- Texas exists:', existingTX ? 'Yes' : 'No');
    console.log('- Pennsylvania exists:', existingPA ? 'Yes' : 'No');
    
    // Create Maryland state if it doesn't exist
    if (!existingMD) {
      console.log('Inserting Maryland state...');
      try {
        const mdResult = await db.collection('states').insertOne({
          name: "Maryland",
          abbreviation: "MD",
          type: "state",
          parentId: usMapId,
          geometry: {
            type: "Polygon",
            coordinates: [[[-79.4778, 39.7198], [-78.3725, 39.7198], [-75.7878, 39.7198], 
                           [-75.7878, 38.4600], [-76.9131, 38.0150], [-79.4778, 38.4600], [-79.4778, 39.7198]]]
          },
          metadata: {
            totalCounties: 0,
            totalProperties: 0,
            statistics: {
              totalTaxLiens: 0,
              totalValue: 0
            }
          },
          controllers: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Inserted Maryland with ID:', mdResult.insertedId);
      } catch (err) {
        console.error('Error inserting Maryland:', err.message);
        if (err.message.includes('duplicate key')) {
          console.log('Trying to update existing Maryland record instead...');
          try {
            const updateResult = await db.collection('states').updateOne(
              { name: "Maryland" },
              { 
                $set: {
                  abbreviation: "MD",
                  type: "state",
                  parentId: usMapId,
                  updatedAt: new Date()
                } 
              }
            );
            console.log('Update result:', updateResult.matchedCount, updateResult.modifiedCount);
          } catch (updateErr) {
            console.error('Error updating Maryland:', updateErr.message);
          }
        }
      }
    } else {
      console.log('Maryland already exists with ID:', existingMD._id);
    }
    
    // Create Texas state if it doesn't exist
    if (!existingTX) {
      console.log('Inserting Texas state...');
      try {
        const txResult = await db.collection('states').insertOne({
          name: "Texas",
          abbreviation: "TX",
          type: "state",
          parentId: usMapId,
          geometry: {
            type: "Polygon",
            coordinates: [[[-106.6456, 36.5007], [-103.0020, 36.5007], [-100.0000, 36.5007],
                           [-100.0000, 32.0000], [-106.6456, 32.0000], [-106.6456, 36.5007]]]
          },
          metadata: {
            totalCounties: 0,
            totalProperties: 0,
            statistics: {
              totalTaxLiens: 0,
              totalValue: 0
            }
          },
          controllers: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Inserted Texas with ID:', txResult.insertedId);
      } catch (err) {
        console.error('Error inserting Texas:', err.message);
        if (err.message.includes('duplicate key')) {
          console.log('Trying to update existing Texas record instead...');
          try {
            const updateResult = await db.collection('states').updateOne(
              { name: "Texas" },
              { 
                $set: {
                  abbreviation: "TX",
                  type: "state",
                  parentId: usMapId,
                  updatedAt: new Date()
                } 
              }
            );
            console.log('Update result:', updateResult.matchedCount, updateResult.modifiedCount);
          } catch (updateErr) {
            console.error('Error updating Texas:', updateErr.message);
          }
        }
      }
    } else {
      console.log('Texas already exists with ID:', existingTX._id);
    }
    
    // Create Pennsylvania state if it doesn't exist
    if (!existingPA) {
      console.log('Inserting Pennsylvania state...');
      try {
        const paResult = await db.collection('states').insertOne({
          name: "Pennsylvania",
          abbreviation: "PA",
          type: "state",
          parentId: usMapId,
          geometry: {
            type: "Polygon",
            coordinates: [[[-80.5195, 42.0000], [-77.0000, 42.0000], [-75.0000, 42.0000],
                           [-75.0000, 39.7198], [-80.5195, 39.7198], [-80.5195, 42.0000]]]
          },
          metadata: {
            totalCounties: 0,
            totalProperties: 0,
            statistics: {
              totalTaxLiens: 0,
              totalValue: 0
            }
          },
          controllers: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Inserted Pennsylvania with ID:', paResult.insertedId);
      } catch (err) {
        console.error('Error inserting Pennsylvania:', err.message);
        if (err.message.includes('duplicate key')) {
          console.log('Trying to update existing Pennsylvania record instead...');
          try {
            const updateResult = await db.collection('states').updateOne(
              { name: "Pennsylvania" },
              { 
                $set: {
                  abbreviation: "PA",
                  type: "state",
                  parentId: usMapId,
                  updatedAt: new Date()
                } 
              }
            );
            console.log('Update result:', updateResult.matchedCount, updateResult.modifiedCount);
          } catch (updateErr) {
            console.error('Error updating Pennsylvania:', updateErr.message);
          }
        }
      }
    } else {
      console.log('Pennsylvania already exists with ID:', existingPA._id);
    }
    
    // Count states after insertion
    const stateCount = await db.collection('states').countDocuments();
    console.log(`Total states in database: ${stateCount}`);
    
    // List all states
    console.log('All states in database:');
    const allStates = await db.collection('states').find({}).toArray();
    allStates.forEach(state => {
      console.log(`- ${state.name} (${state.abbreviation}): ID=${state._id}, ParentID=${state.parentId}`);
    });
    
    // Update USMap with state count in both collections
    try {
      const updateResult = await db.collection('usmaps').updateOne(
        { _id: usMapId },
        { $set: { "metadata.totalStates": stateCount } }
      );
      console.log(`Updated USMap in usmaps collection with state count: ${stateCount}`);
      console.log('Update result:', updateResult.matchedCount === 1 ? 'Success' : 'Failed');
    } catch (err) {
      console.error('Error updating usmaps collection:', err.message);
    }
    
    try {
      const updateResult2 = await db.collection('usmap').updateOne(
        { type: "us_map" },
        { $set: { "metadata.totalStates": stateCount } }
      );
      console.log(`Updated USMap in usmap collection with state count: ${stateCount}`);
      console.log('Update result:', updateResult2.matchedCount === 1 ? 'Success' : 'Failed');
    } catch (err) {
      console.error('Error updating usmap collection:', err.message);
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
insertStates(); 