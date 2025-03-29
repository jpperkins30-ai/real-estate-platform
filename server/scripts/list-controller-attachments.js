/**
 * Script to list all controller attachments
 * 
 * Usage: node list-controller-attachments.js [controllerId] [countyId]
 */

const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

// Import TypeScript modules via ts-node/register
require('ts-node/register');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/real-estate-platform';

// Main function
async function main() {
  console.log('Listing controller attachments...');
  
  // Get command line args - optional filters
  const args = process.argv.slice(2);
  const controllerId = args[0];
  const countyId = args[1];
  
  try {
    // Connect to MongoDB
    console.log(`Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Load the models
    const Controller = require('../src/models/Controller').Controller;
    const County = require('../src/models/County').County;
    
    console.log('\n=== CONTROLLER ATTACHMENTS ===\n');
    
    // Build controller query
    const controllerQuery = {};
    if (controllerId) {
      if (!ObjectId.isValid(controllerId)) {
        console.error('Invalid controller ID format');
        process.exit(1);
      }
      controllerQuery._id = new ObjectId(controllerId);
    }
    
    // Get controllers
    const controllers = await Controller.find(controllerQuery)
      .select('_id name type controllerType attachedTo');
    
    console.log(`Found ${controllers.length} controllers\n`);
    
    // Build county query
    const countyQuery = {};
    if (countyId) {
      if (!ObjectId.isValid(countyId)) {
        console.error('Invalid county ID format');
        process.exit(1);
      }
      countyQuery._id = new ObjectId(countyId);
    }
    
    // Get counties
    const counties = await County.find(countyQuery)
      .select('_id name stateId controllers');
    
    console.log(`Found ${counties.length} counties\n`);
    
    // Display controllers and their attachments
    console.log('Controllers with attachments:');
    console.log('----------------------------');
    
    for (const controller of controllers) {
      console.log(`Controller: ${controller.name} (${controller._id})`);
      console.log(`Type: ${controller.type}, Controller Type: ${controller.controllerType}`);
      
      if (!controller.attachedTo || controller.attachedTo.length === 0) {
        console.log('No attachments found for this controller');
      } else {
        console.log(`Attached to ${controller.attachedTo.length} objects:`);
        
        for (const attachment of controller.attachedTo) {
          if (attachment.objectType === 'county') {
            const county = counties.find(c => c._id.toString() === attachment.objectId.toString());
            console.log(`- County: ${county ? county.name : 'Unknown'} (${attachment.objectId})`);
          } else {
            console.log(`- ${attachment.objectType}: ${attachment.objectId}`);
          }
        }
      }
      console.log('----------------------------');
    }
    
    // Display counties with controllers
    console.log('\nCounties with controllers:');
    console.log('----------------------------');
    
    for (const county of counties) {
      console.log(`County: ${county.name} (${county._id})`);
      
      if (!county.controllers || county.controllers.length === 0) {
        console.log('No controllers attached to this county');
      } else {
        console.log(`Has ${county.controllers.length} controllers:`);
        
        for (const countyController of county.controllers) {
          const controller = controllers.find(c => c._id.toString() === countyController.controllerId.toString());
          console.log(`- Controller: ${controller ? controller.name : 'Unknown'} (${countyController.controllerId})`);
          console.log(`  Type: ${countyController.controllerType}, Enabled: ${countyController.enabled}`);
          console.log(`  Last Run: ${countyController.lastRun || 'Never'}`);
          console.log(`  Next Run: ${countyController.nextScheduledRun || 'Not scheduled'}`);
          console.log(`  Configuration: ${JSON.stringify(countyController.configuration, null, 2)}`);
        }
      }
      console.log('----------------------------');
    }
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the main function
main(); 