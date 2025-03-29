// Script to run state-county aggregation query
const { MongoClient } = require('mongodb');

// Connection URI
const uri = 'mongodb://localhost:27017/real-estate-platform';

async function runAggregation() {
  console.log('Starting state-county aggregation query...');
  const client = new MongoClient(uri);
  
  try {
    console.log('Connecting to MongoDB...');
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get the database
    const db = client.db('real-estate-platform');
    
    // Run the aggregation query
    console.log('\nRunning aggregation query to get states with their counties...');
    const results = await db.collection('states').aggregate([
      {
        $lookup: {
          from: "counties",
          localField: "_id",
          foreignField: "stateId",
          as: "counties"
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          abbreviation: 1,
          "metadata.totalCounties": 1,
          "metadata.totalProperties": 1,
          "counties.name": 1,
          "counties._id": 1,
          "counties.metadata.totalProperties": 1
        }
      }
    ]).toArray();
    
    // Format and display the results
    console.log('\n=== STATES WITH COUNTIES ===');
    if (results.length === 0) {
      console.log('No results found.');
    } else {
      results.forEach((state, index) => {
        console.log(`\nState #${index + 1}: ${state.name} (${state.abbreviation})`);
        console.log(`- ID: ${state._id}`);
        console.log(`- Total Counties: ${state.metadata?.totalCounties || 0}`);
        console.log(`- Total Properties: ${state.metadata?.totalProperties || 0}`);
        
        if (state.counties && state.counties.length > 0) {
          console.log(`\n  Counties (${state.counties.length}):`);
          state.counties.forEach((county, countyIndex) => {
            console.log(`  ${countyIndex + 1}. ${county.name} (ID: ${county._id})`);
            console.log(`     Properties: ${county.metadata?.totalProperties || 0}`);
          });
        } else {
          console.log('  No counties found for this state.');
        }
      });
    }
    
    // Output JSON format for easier consumption if needed
    console.log('\n=== JSON RESULTS ===');
    console.log(JSON.stringify(results, null, 2));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the function
console.log('Script started');
runAggregation().then(() => {
  console.log('Script completed');
}).catch(err => {
  console.error('Script failed:', err);
}); 