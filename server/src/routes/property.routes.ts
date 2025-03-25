import { Router } from 'express';
import { PropertyService } from '../services/property.service';
import { PropertyObject, PropertySearchCriteria, PropertyTaxStatus } from '../types/inventory';
import { County } from '../models/county.model';
import { Property } from '../models/property.model';
import { propertySearchMiddleware, validatePropertyHierarchy, directPropertySearch, fuzzyPropertySearch } from '../middleware/propertySearch.middleware';

const router = Router();
const propertyService = new PropertyService();

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get all properties with pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of properties
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const { properties, total } = await propertyService.getAllProperties(page, limit);
    res.json({
      properties,
      total,
      page,
      limit
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/search:
 *   get:
 *     summary: Search properties with various filters
 *     description: Flexible search endpoint with support for multiple filters
 *     parameters:
 *       - in: query
 *         name: stateId
 *         schema:
 *           type: string
 *         description: State ID to filter properties
 *       - in: query
 *         name: countyId
 *         schema:
 *           type: string
 *         description: County ID to filter properties
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Property status
 *       - in: query
 *         name: minValue
 *         schema:
 *           type: number
 *         description: Minimum property value
 *       - in: query
 *         name: maxValue
 *         schema:
 *           type: number
 *         description: Maximum property value
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Matched properties
 */
router.get('/search', propertySearchMiddleware, async (req, res) => {
  try {
    const { query, pagination, sort } = req.propertySearchQuery;
    
    const { properties, total } = await propertyService.searchProperties(
      query,
      pagination.page,
      pagination.limit,
      sort
    );
    
    res.json({
      properties,
      total,
      page: pagination.page,
      limit: pagination.limit
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error searching properties', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/direct-search:
 *   get:
 *     summary: Direct property search by exact identifiers
 *     description: Search properties by parcel ID, tax account number, or text query
 *     parameters:
 *       - in: query
 *         name: countyId
 *         schema:
 *           type: string
 *         description: County ID to filter properties
 *       - in: query
 *         name: parcelId
 *         schema:
 *           type: string
 *         description: Exact parcel ID to search for
 *       - in: query
 *         name: taxAccountNumber
 *         schema:
 *           type: string
 *         description: Exact tax account number to search for
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         description: Text search across multiple fields
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/direct-search', directPropertySearch, fuzzyPropertySearch);

/**
 * @swagger
 * /api/properties/fuzzy-search:
 *   get:
 *     summary: Fuzzy property search for partial matches
 *     description: Search properties with fuzzy matching for identifiers
 *     parameters:
 *       - in: query
 *         name: countyId
 *         schema:
 *           type: string
 *         description: County ID to filter properties
 *       - in: query
 *         name: parcelId
 *         schema:
 *           type: string
 *         description: Partial parcel ID to search for
 *       - in: query
 *         name: taxAccountNumber
 *         schema:
 *           type: string
 *         description: Partial tax account number to search for
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         description: General search query
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: number
 *           default: 0.7
 *         description: Similarity threshold (0-1) for fuzzy matching
 *     responses:
 *       200:
 *         description: Fuzzy search results
 */
router.get('/fuzzy-search', fuzzyPropertySearch);

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
 *       400:
 *         description: Error creating property
 *       404:
 *         description: Parent county not found
 */
router.post('/', async (req, res) => {
  try {
    const property = await propertyService.createProperty(req.body);
    res.status(201).json(property);
  } catch (error: any) {
    if (error.message === 'Parent county not found') {
      return res.status(404).json({ message: error.message });
    }
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
    if (error.message.includes('Cannot update parentId directly')) {
      return res.status(400).json({ message: error.message });
    }
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
 * /api/properties/{id}/tax-status:
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
router.get('/:id/tax-status', async (req, res) => {
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
 * /api/properties/{id}/tax-status:
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
router.put('/:id/tax-status', async (req, res) => {
  try {
    const property = await propertyService.updatePropertyTaxStatus(req.params.id, req.body);
    res.json({
      message: 'Tax status updated successfully',
      taxStatus: property.taxStatus
    });
  } catch (error: any) {
    if (error.message === 'Property not found') {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(400).json({ message: 'Error updating tax status', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/{id}/move:
 *   post:
 *     summary: Move a property to a different county
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
 *             type: object
 *             required:
 *               - newCountyId
 *             properties:
 *               newCountyId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Property moved successfully
 *       404:
 *         description: Property or county not found
 */
router.post('/:id/move', async (req, res) => {
  try {
    const { newCountyId } = req.body;
    
    if (!newCountyId) {
      return res.status(400).json({ message: 'New county ID is required' });
    }
    
    const property = await propertyService.moveProperty(req.params.id, newCountyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.json({
      message: 'Property moved successfully',
      property
    });
  } catch (error: any) {
    if (error.message.includes('County not found')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(400).json({ message: 'Error moving property', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/states/{stateId}:
 *   get:
 *     summary: Get properties by state ID
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of properties in the state
 *       404:
 *         description: State not found
 */
router.get('/states/:stateId', async (req, res) => {
  try {
    // Use property search middleware for more complex queries
    const query = { stateId: req.params.stateId };
    const properties = await propertyService.searchProperties(query);
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/counties/{countyId}:
 *   get:
 *     summary: Get properties by county ID
 *     parameters:
 *       - in: path
 *         name: countyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of properties in the county
 *       404:
 *         description: County not found
 */
router.get('/counties/:countyId', async (req, res) => {
  try {
    // Use property search middleware for more complex queries
    const query = { parentId: req.params.countyId };
    const properties = await propertyService.searchProperties(query);
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
});

/**
 * @swagger
 * /api/properties/states/{stateId}/counties/{countyId}:
 *   get:
 *     summary: Get properties by state and county ID
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: countyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of properties in the specified county
 *       404:
 *         description: State or county not found
 */
router.get('/states/:stateId/counties/:countyId', async (req, res) => {
  try {
    const { stateId, countyId } = req.params;
    
    const properties = await propertyService.getPropertiesByCountyAndState(countyId, stateId);
    res.json({ properties, total: properties.length });
  } catch (error: any) {
    if (error.message.includes('County not found in the specified state')) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
});

export default router; 