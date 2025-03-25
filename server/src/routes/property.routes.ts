import { Router } from 'express';
import { PropertyService } from '../services/property.service';
import { PropertyObject, PropertySearchCriteria, PropertyTaxStatus } from '../types/inventory';
import { County } from '../models/county.model';
import { Property } from '../models/property.model';

const router = Router();
const propertyService = new PropertyService();

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties
 *     description: Returns a list of all properties
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/', async (req, res) => {
  try {
    const properties = await propertyService.getAllProperties();
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get a property by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The property object
 *       404:
 *         description: Property not found
 */
router.get('/:id', async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching property', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyObject'
 *     responses:
 *       201:
 *         description: Property created successfully
 */
router.post('/', async (req, res) => {
  try {
    const property = await propertyService.createProperty(req.body);
    res.status(201).json(property);
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating property', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyObject'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       404:
 *         description: Property not found
 */
router.put('/:id', async (req, res) => {
  try {
    const property = await propertyService.updateProperty(req.params.id, req.body);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (error: any) {
    res.status(400).json({ message: 'Error updating property', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       404:
 *         description: Property not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await propertyService.deleteProperty(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting property', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/search:
 *   get:
 *     summary: Search for properties by exact identifier
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: countyId
 *         schema:
 *           type: string
 *         required: true
 *         description: County ID
 *       - in: query
 *         name: parcelId
 *         schema:
 *           type: string
 *         description: Parcel ID to search for
 *       - in: query
 *         name: taxAccountNumber
 *         schema:
 *           type: string
 *         description: Tax account number to search for
 *     responses:
 *       200:
 *         description: List of matching properties
 *       400:
 *         description: Invalid search parameters
 *       404:
 *         description: County not found
 */
router.get('/search', async (req, res) => {
  try {
    const { countyId, parcelId, taxAccountNumber } = req.query;
    
    if (!countyId) {
      return res.status(400).json({ message: 'County ID is required' });
    }
    
    if (!parcelId && !taxAccountNumber) {
      return res.status(400).json({ message: 'At least one search parameter is required' });
    }
    
    // Get the county to check if it exists
    const county = await County.findById(countyId);
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    // Build search query
    const searchQuery: any = { 
      'location.address.county': county.name 
    };
    
    if (parcelId) {
      searchQuery['location.parcelId'] = parcelId;
    }
    
    if (taxAccountNumber) {
      searchQuery['taxStatus.accountNumber'] = taxAccountNumber;
    }
    
    // Execute search
    const properties = await Property.find(searchQuery)
      .limit(10)
      .exec();
    
    res.json({ properties });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/properties/fuzzy-search:
 *   post:
 *     summary: Fuzzy search for properties
 *     tags: [Properties]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - countyId
 *             properties:
 *               query:
 *                 type: string
 *                 description: The search query
 *               countyId:
 *                 type: string
 *                 description: County ID
 *               lookupMethod:
 *                 type: string
 *                 description: Method to use for lookup (parcel_id or account_number)
 *               threshold:
 *                 type: number
 *                 description: Minimum similarity threshold (0-1)
 *     responses:
 *       200:
 *         description: List of fuzzy matches
 *       400:
 *         description: Invalid search parameters
 *       404:
 *         description: County not found
 */
router.post('/fuzzy-search', async (req, res) => {
  try {
    const { query, countyId, lookupMethod = 'parcel_id', threshold = 0.7 } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    if (!countyId) {
      return res.status(400).json({ message: 'County ID is required' });
    }
    
    // Get the county to check if it exists
    const county = await County.findById(countyId);
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    // Determine search field based on lookup method
    const searchField = lookupMethod === 'account_number'
      ? 'taxStatus.accountNumber'
      : 'location.parcelId';
    
    // Get all properties in the county
    const countyProperties = await Property.find({
      'location.address.county': county.name
    }).exec();
    
    // Perform fuzzy matching
    const matches = countyProperties
      .map(property => {
        const fieldValue = searchField === 'taxStatus.accountNumber'
          ? property.taxStatus.accountNumber
          : property.location.parcelId;
          
        // Skip if property doesn't have the field value
        if (!fieldValue) return null;
        
        // Calculate similarity score (simple implementation)
        // In a real app, you would use a proper fuzzy matching algorithm like Levenshtein distance
        const similarity = calculateSimilarity(query.toString(), fieldValue.toString());
        
        return {
          property,
          similarity
        };
      })
      .filter(match => match !== null && match.similarity >= threshold)
      .sort((a, b) => b!.similarity - a!.similarity);
    
    res.json({ matches });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to calculate string similarity (Jaccard index)
function calculateSimilarity(str1: string, str2: string): number {
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();
  
  // Create sets of characters for each string
  const set1 = new Set(str1.split(''));
  const set2 = new Set(str2.split(''));
  
  // Calculate intersection
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  
  // Calculate union
  const union = new Set([...set1, ...set2]);
  
  // Jaccard similarity coefficient
  return intersection.size / union.size;
}

/**
 * @swagger
 * /api/properties/search:
 *   get:
 *     summary: Search properties based on criteria
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertySearchCriteria'
 *     responses:
 *       200:
 *         description: Search results with pagination
 */
router.get('/search', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const criteria = req.body as PropertySearchCriteria;
    
    const results = await propertyService.searchProperties(criteria, page, pageSize);
    res.json(results);
  } catch (error: any) {
    res.status(400).json({ message: 'Error searching properties', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/{id}/taxStatus:
 *   get:
 *     summary: Get tax status for a property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property tax status
 *       404:
 *         description: Property not found
 */
router.get('/:id/taxStatus', async (req, res) => {
  try {
    const taxStatus = await propertyService.getPropertyTaxStatus(req.params.id);
    res.json(taxStatus);
  } catch (error: any) {
    if (error.message === 'Property not found') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(500).json({ message: 'Error fetching tax status', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/{id}/taxStatus:
 *   put:
 *     summary: Update tax status for a property
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyTaxStatus'
 *     responses:
 *       200:
 *         description: Tax status updated successfully
 *       404:
 *         description: Property not found
 */
router.put('/:id/taxStatus', async (req, res) => {
  try {
    const property = await propertyService.updatePropertyTaxStatus(req.params.id, req.body);
    res.json(property);
  } catch (error: any) {
    if (error.message === 'Property not found') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(400).json({ message: 'Error updating tax status', error: error.message });
  }
});

export default router; 