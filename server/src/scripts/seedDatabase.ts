import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import '../models/state.model';
import '../models/county.model';
import '../models/property.model';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Basic state data
const states = [
  {
    id: uuidv4(),
    name: 'California',
    abbreviation: 'CA',
    type: 'state',
    parentId: 'root',
    geometry: {
      type: 'Polygon',
      coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
    },
    metadata: {
      totalCounties: 2,
      totalProperties: 4,
      statistics: {
        totalTaxLiens: 0,
        totalValue: 0,
        averagePropertyValue: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  },
  {
    id: uuidv4(),
    name: 'New York',
    abbreviation: 'NY',
    type: 'state',
    parentId: 'root',
    geometry: {
      type: 'Polygon',
      coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
    },
    metadata: {
      totalCounties: 2,
      totalProperties: 4,
      statistics: {
        totalTaxLiens: 0,
        totalValue: 0,
        averagePropertyValue: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  },
  {
    id: uuidv4(),
    name: 'Texas',
    abbreviation: 'TX',
    type: 'state',
    parentId: 'root',
    geometry: {
      type: 'Polygon',
      coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]
    },
    metadata: {
      totalCounties: 2,
      totalProperties: 4,
      statistics: {
        totalTaxLiens: 0,
        totalValue: 0,
        averagePropertyValue: 0,
        lastUpdated: new Date().toISOString()
      }
    }
  }
];

// Generate counties for each state
function generateCounties(stateId: string, stateName: string) {
  const counties = [];
  
  for (let i = 1; i <= 2; i++) {
    counties.push({
      id: uuidv4(),
      name: `${stateName} County ${i}`,
      stateId,
      type: 'county',
      parentId: stateId,
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]] // Simple square placeholder
      },
      metadata: {
        totalProperties: 2,
        statistics: {
          totalTaxLiens: 0,
          totalValue: 0,
          averagePropertyValue: 0,
          lastUpdated: new Date().toISOString()
        }
      }
    });
  }
  
  return counties;
}

// Generate properties for each county
function generateProperties(countyId: string, stateId: string, countyName: string) {
  const properties = [];
  
  for (let i = 1; i <= 2; i++) {
    properties.push({
      id: uuidv4(),
      parcelId: `P-${stateId.substr(0, 4)}-${countyId.substr(0, 4)}-${i}`,
      taxAccountNumber: `TAX-${stateId.substr(0, 4)}-${countyId.substr(0, 4)}-${i}`,
      type: 'property',
      parentId: countyId,
      countyId,
      stateId,
      ownerName: `Owner ${i}`,
      propertyAddress: `${i} Main St, ${countyName}`,
      address: {
        street: `${i} Main St`,
        city: countyName,
        state: stateId,
        zip: `${10000 + parseInt(stateId.substr(0, 4), 16) % 90000}`
      },
      propertyType: 'residential',
      metadata: {
        propertyType: 'residential',
        taxStatus: 'Paid',
        assessedValue: 200000 + (i * 50000),
        marketValue: 250000 + (i * 50000),
        lastUpdated: new Date().toISOString()
      }
    });
  }
  
  return properties;
}

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB');
    
    // Check if models exist
    const State = mongoose.model('State');
    const County = mongoose.model('County');
    const Property = mongoose.model('Property');
    
    // Clear existing data (be careful in production!)
    await State.deleteMany({});
    await County.deleteMany({});
    await Property.deleteMany({});
    console.log('Cleared existing data');
    
    // Create states
    await State.insertMany(states);
    console.log(`Created ${states.length} states`);
    
    // Create counties for each state
    for (const state of states) {
      const counties = generateCounties(state.id, state.name);
      await County.insertMany(counties);
      console.log(`Created ${counties.length} counties for ${state.name}`);
      
      // Create properties for each county
      for (const county of counties) {
        const properties = generateProperties(county.id, state.id, county.name);
        await Property.insertMany(properties);
        console.log(`Created ${properties.length} properties for ${county.name}`);
      }
    }
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export default seedDatabase; 