const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');

// Configuration
const config = {
  collectionsDir: path.join(__dirname, '../collections'),
  environmentsDir: path.join(__dirname, '../environments'),
  schemaPath: path.join(__dirname, '../schemas/collection-schema.json')
};

// Postman collection schema
const collectionSchema = {
  "type": "object",
  "required": ["info", "item"],
  "properties": {
    "info": {
      "type": "object",
      "required": ["_postman_id", "name", "schema"],
      "properties": {
        "_postman_id": { "type": "string" },
        "name": { "type": "string" },
        "description": { "type": "string" },
        "schema": { "type": "string" }
      }
    },
    "item": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "request": { "type": "object" },
          "response": { "type": "array" },
          "event": { "type": "array" },
          "item": { "type": "array" }
        },
        "required": ["name"]
      }
    }
  }
};

// Initialize Ajv
const ajv = new Ajv();
const validate = ajv.compile(collectionSchema);

// Get all collection files
function getCollectionFiles() {
  return fs.readdirSync(config.collectionsDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(config.collectionsDir, file));
}

// Validate a single collection
function validateCollection(filePath) {
  try {
    const collection = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const valid = validate(collection);
    
    if (!valid) {
      console.error(`[FAIL] ${path.basename(filePath)}: Validation errors:`);
      console.error(JSON.stringify(validate.errors, null, 2));
      return false;
    }
    
    // Additional custom validations
    let isValid = true;
    
    // Check if each request has at least one test
    const checkTests = (items) => {
      for (const item of items) {
        if (item.item && Array.isArray(item.item)) {
          checkTests(item.item);
        } else if (item.request) {
          const hasTests = item.event && item.event.some(e => e.listen === 'test');
          if (!hasTests) {
            console.warn(`[WARN] ${path.basename(filePath)}: Request "${item.name}" has no tests`);
            // isValid = false; // Uncomment to make this a failure case
          }
        }
      }
    };
    
    checkTests(collection.item);
    
    console.log(`[PASS] ${path.basename(filePath)}: Valid Postman collection`);
    return isValid;
  } catch (error) {
    console.error(`[FAIL] ${path.basename(filePath)}: ${error.message}`);
    return false;
  }
}

// Validate all collections
function validateAllCollections() {
  console.log('Validating Postman collections...');
  
  const collectionFiles = getCollectionFiles();
  let allValid = true;
  
  for (const file of collectionFiles) {
    const isValid = validateCollection(file);
    allValid = allValid && isValid;
  }
  
  if (allValid) {
    console.log('All collections are valid!');
    return 0;
  } else {
    console.error('Some collections have validation errors!');
    return 1;
  }
}

// Execute if this script is run directly
if (require.main === module) {
  const exitCode = validateAllCollections();
  process.exit(exitCode);
}

module.exports = { validateCollection, validateAllCollections }; 