const fs = require('fs');
const path = require('path');
const axios = require('axios');
const newman = require('newman');

// Configuration
const config = {
  baseUrl: process.env.API_BASE_URL || 'http://localhost:5000/api',
  authEmail: process.env.AUTH_EMAIL || 'test@example.com',
  authPassword: process.env.AUTH_PASSWORD || 'password123',
  outputDir: path.join(__dirname, '../data'),
  collectionPath: path.join(__dirname, '../collections/layouts.json'),
  environmentPath: path.join(__dirname, '../environments/testing.json')
};

// Ensure output directory exists
if (!fs.existsSync(config.outputDir)) {
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Load the Postman collection and environment
const collection = require(config.collectionPath);
const environment = require(config.environmentPath);

// Update environment variables
const envVars = environment.values;
for (let i = 0; i < envVars.length; i++) {
  if (envVars[i].key === 'baseUrl') {
    envVars[i].value = config.baseUrl;
  }
  if (envVars[i].key === 'userEmail') {
    envVars[i].value = config.authEmail;
  }
  if (envVars[i].key === 'userPassword') {
    envVars[i].value = config.authPassword;
  }
}

// Save updated environment
fs.writeFileSync(
  path.join(config.outputDir, 'environment.json'),
  JSON.stringify(environment, null, 2)
);

// Generate sample layouts for testing
const sampleLayouts = [
  {
    name: 'Single Panel Layout',
    type: 'single',
    panels: [
      {
        id: 'default',
        contentType: 'map',
        title: 'Map View',
        position: { row: 0, col: 0 },
        size: { width: 100, height: 100 }
      }
    ]
  },
  {
    name: 'Dual Panel Layout',
    type: 'dual',
    panels: [
      {
        id: 'left',
        contentType: 'map',
        title: 'Map View',
        position: { row: 0, col: 0 },
        size: { width: 60, height: 100 }
      },
      {
        id: 'right',
        contentType: 'property',
        title: 'Property Details',
        position: { row: 0, col: 1 },
        size: { width: 40, height: 100 }
      }
    ]
  },
  {
    name: 'Quad Panel Layout',
    type: 'quad',
    panels: [
      {
        id: 'top-left',
        contentType: 'map',
        title: 'Map View',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'top-right',
        contentType: 'property',
        title: 'Property List',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'bottom-left',
        contentType: 'filter',
        title: 'Search Filters',
        position: { row: 1, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'bottom-right',
        contentType: 'stats',
        title: 'Statistics',
        position: { row: 1, col: 1 },
        size: { width: 50, height: 50 }
      }
    ]
  }
];

// Save sample layouts
fs.writeFileSync(
  path.join(config.outputDir, 'sample-layouts.json'),
  JSON.stringify(sampleLayouts, null, 2)
);

// Run the collection to generate test data
async function generateTestData() {
  try {
    console.log('Generating test data...');
    
    // First, authenticate to get a token
    console.log('Authenticating...');
    const authResponse = await axios.post(`${config.baseUrl}/auth/login`, {
      email: config.authEmail,
      password: config.authPassword
    });
    
    const authToken = authResponse.data.token;
    console.log('Authentication successful');
    
    // Update environment with token
    for (let i = 0; i < envVars.length; i++) {
      if (envVars[i].key === 'authToken') {
        envVars[i].value = authToken;
      }
    }
    
    fs.writeFileSync(
      path.join(config.outputDir, 'environment.json'),
      JSON.stringify(environment, null, 2)
    );
    
    // Create sample layouts using the API
    console.log('Creating sample layouts...');
    
    const layoutIds = [];
    
    for (const layout of sampleLayouts) {
      const response = await axios.post(
        `${config.baseUrl}/layouts`,
        layout,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      layoutIds.push(response.data.id);
      console.log(`Layout created: ${layout.name} (ID: ${response.data.id})`);
    }
    
    // Save layout IDs
    fs.writeFileSync(
      path.join(config.outputDir, 'layout-ids.json'),
      JSON.stringify({ layoutIds }, null, 2)
    );
    
    console.log('Test data generation complete');
    return layoutIds;
  } catch (error) {
    console.error('Error generating test data:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return [];
  }
}

// Execute if this script is run directly
if (require.main === module) {
  generateTestData().then(layoutIds => {
    console.log('Generated layout IDs:', layoutIds);
  });
}

module.exports = { generateTestData }; 