import { Router } from 'express';
import { PropertyService } from '../services/property.service';
import { PropertyObject, PropertySearchCriteria, PropertyTaxStatus } from '../types/inventory';

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