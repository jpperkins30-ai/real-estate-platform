/**
 * Simple MongoDB connection test
 */
console.log('Starting MongoDB connection test...');

// Import mongoose
const mongoose = require('mongoose');

// MongoDB URI
const MONGODB_URI = 'mongodb://localhost:27017/real-estate-platform';
console.log(`Attempting to connect to: ${MONGODB_URI}`);

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('✅ Successfully connected to MongoDB');
    
    // Get all collections
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      console.log(`\nFound ${collections.length} collections:`);
      collections.forEach((coll, i) => {
        console.log(`${i + 1}. ${coll.name}`);
      });
      
      // Get sample data from states collection
      if (collections.some(c => c.name === 'states')) {
        const states = await mongoose.connection.db.collection('states').find().limit(3).toArray();
        console.log(`\nFound ${states.length} states (sample):`);
        states.forEach((state, i) => {
          console.log(`${i + 1}. ${state.name || 'Unnamed'} (${state.abbreviation || 'N/A'})`);
        });
      }
    } catch (err) {
      console.error('Error fetching collections:', err);
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  })
  .catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err);
  })
  .finally(() => {
    console.log('Test completed');
  }); 