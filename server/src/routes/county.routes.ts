import { Router } from 'express';
import { CountyService } from '../services/county.service';
import { CountyObject, CountySearchConfig } from '../types/inventory';
import { County, State } from '../models';
import { objectToGeoJSONFeature } from '../utils/geoJSONUtils';
import logger, { logError } from '../utils/logger';

const router = Router();
const countyService = new CountyService();

/**
 * @swagger
 * /api/counties:
 *   get:
 *     summary: Get all counties
 *     description: Returns a list of all counties with optional filtering
 *     tags: [Geographic]
 *     parameters:
 *       - in: query
 *         name: stateId
 *         schema:
 *           type: string
 *         description: Filter counties by state ID
 *       - in: query
 *         name: stateAbbr
 *         schema:
 *           type: string
 *         description: Filter counties by state abbreviation
 *       - in: query
 *         name: includeGeometry
 *         schema:
 *           type: boolean
 *         description: Whether to include geometry in the response
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit the number of results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of counties
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { stateId, stateAbbr, includeGeometry, limit = 100, page = 1 } = req.query;
    const query: any = {};
    
    // Apply state filters if provided
    if (stateId) {
      query.stateId = stateId;
    } else if (stateAbbr) {
      // Find state by abbreviation first
      const state = await State.findOne({ abbreviation: String(stateAbbr).toUpperCase() });
      if (state) {
        query.stateId = state._id;
      } else {
        // If state doesn't exist, return empty array
        return res.json([]);
      }
    }
    
    // Create projection based on whether to include geometry
    const projection = includeGeometry === 'true' ? {} : { geometry: 0 };
    
    // Parse pagination parameters
    const limitNum = parseInt(String(limit), 10);
    const pageNum = parseInt(String(page), 10);
    const skip = (pageNum - 1) * limitNum;
    
    // Execute query with pagination
    const counties = await County.find(query, projection)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limitNum);
    
    // Get total count for pagination metadata
    const totalCount = await County.countDocuments(query);
    
    res.json({
      data: counties,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error: any) {
    logError('Error fetching counties:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/counties/{id}:
 *   get:
 *     summary: Get county by ID
 *     description: Returns a county by its ID
 *     tags: [Geographic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: County ID
 *     responses:
 *       200:
 *         description: County object
 *       404:
 *         description: County not found
 *       500:
 *         description: Server error
 */
router.get('/:id', async (req, res) => {
  try {
    const county = await County.findById(req.params.id);
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    res.json(county);
  } catch (error: any) {
    logError(`Error fetching county ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/counties/byName/{stateAbbr}/{countyName}:
 *   get:
 *     summary: Get county by name and state
 *     description: Returns a county by its name and state abbreviation
 *     tags: [Geographic]
 *     parameters:
 *       - in: path
 *         name: stateAbbr
 *         required: true
 *         schema:
 *           type: string
 *         description: State abbreviation (e.g., 'CA', 'TX')
 *       - in: path
 *         name: countyName
 *         required: true
 *         schema:
 *           type: string
 *         description: County name
 *     responses:
 *       200:
 *         description: County object
 *       404:
 *         description: County or state not found
 *       500:
 *         description: Server error
 */
router.get('/byName/:stateAbbr/:countyName', async (req, res) => {
  try {
    const { stateAbbr, countyName } = req.params;
    
    // Find the state first
    const state = await State.findOne({ abbreviation: stateAbbr.toUpperCase() });
    
    if (!state) {
      return res.status(404).json({ message: `State ${stateAbbr} not found` });
    }
    
    // Find the county by name and state ID
    const county = await County.findOne({
      name: new RegExp(`^${countyName}$`, 'i'), // Case-insensitive exact match
      stateId: state._id
    });
    
    if (!county) {
      return res.status(404).json({ message: `County ${countyName} not found in ${stateAbbr}` });
    }
    
    res.json(county);
  } catch (error: any) {
    logError(`Error fetching county ${req.params.countyName} in ${req.params.stateAbbr}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/counties/{id}/geojson:
 *   get:
 *     summary: Get county as GeoJSON
 *     description: Returns a county as a GeoJSON Feature
 *     tags: [Geographic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: County ID
 *     responses:
 *       200:
 *         description: GeoJSON Feature
 *       404:
 *         description: County not found
 *       500:
 *         description: Server error
 */
router.get('/:id/geojson', async (req, res) => {
  try {
    // Find county and populate state information
    const county = await County.findById(req.params.id).populate('stateId', 'name abbreviation');
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    if (!county.geometry) {
      return res.status(404).json({ message: 'County geometry not found' });
    }
    
    // Create GeoJSON Feature
    const state = county.stateId as any; // Use type assertion to access the populated fields
    const feature = objectToGeoJSONFeature(
      county.toObject(),
      {
        state: state.abbreviation,
        stateName: state.name,
        countyName: county.name,
        totalProperties: county.metadata?.totalProperties || 0,
        totalTaxLiens: county.metadata?.statistics?.totalTaxLiens || 0,
        totalValue: county.metadata?.statistics?.totalValue || 0
      }
    );
    
    res.json(feature);
  } catch (error: unknown) {
    logError(`Error fetching county GeoJSON for ${req.params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

/**
 * @swagger
 * /api/counties/{id}/statistics:
 *   get:
 *     summary: Get county statistics
 *     description: Returns statistics for a county
 *     tags: [Geographic]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: County ID
 *     responses:
 *       200:
 *         description: County statistics
 *       404:
 *         description: County not found
 *       500:
 *         description: Server error
 */
router.get('/:id/statistics', async (req, res) => {
  try {
    const county = await County.findById(req.params.id);
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    res.json({
      totalProperties: county.metadata.totalProperties,
      totalTaxLiens: county.metadata.statistics.totalTaxLiens,
      totalValue: county.metadata.statistics.totalValue
    });
  } catch (error: unknown) {
    logError(`Error fetching statistics for county ${req.params.id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

/**
 * @swagger
 * /api/counties:
 *   post:
 *     summary: Create a new county
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CountyObject'
 *     responses:
 *       201:
 *         description: County created successfully
 */
router.post('/', async (req, res) => {
  try {
    const county = await countyService.createCounty(req.body);
    res.status(201).json(county);
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating county', error: error.message });
  }
});

/**
 * @swagger
 * /api/counties/{id}:
 *   put:
 *     summary: Update a county
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
 *             $ref: '#/components/schemas/CountyObject'
 *     responses:
 *       200:
 *         description: County updated successfully
 *       404:
 *         description: County not found
 */
router.put('/:id', async (req, res) => {
  try {
    const county = await countyService.updateCounty(req.params.id, req.body);
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    res.json(county);
  } catch (error: any) {
    res.status(400).json({ message: 'Error updating county', error: error.message });
  }
});

/**
 * @swagger
 * /api/counties/{id}:
 *   delete:
 *     summary: Delete a county
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: County deleted successfully
 *       404:
 *         description: County not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await countyService.deleteCounty(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'County not found' });
    }
    res.json({ message: 'County deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting county', error: error.message });
  }
});

/**
 * @swagger
 * /api/counties/{id}/properties:
 *   get:
 *     summary: Get properties for a county
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of properties
 *       404:
 *         description: County not found
 */
router.get('/:id/properties', async (req, res) => {
  try {
    const properties = await countyService.getCountyProperties(req.params.id);
    res.json(properties);
  } catch (error: any) {
    if (error.message === 'County not found') {
      return res.status(404).json({ message: 'County not found' });
    }
    res.status(500).json({ message: 'Error fetching properties', error: error.message });
  }
});

/**
 * @swagger
 * /api/counties/{id}/controllers:
 *   get:
 *     summary: Get controllers for a county
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of controllers
 *       404:
 *         description: County not found
 */
router.get('/:id/controllers', async (req, res) => {
  try {
    const controllers = await countyService.getCountyControllers(req.params.id);
    res.json(controllers);
  } catch (error: any) {
    if (error.message === 'County not found') {
      return res.status(404).json({ message: 'County not found' });
    }
    res.status(500).json({ message: 'Error fetching controllers', error: error.message });
  }
});

/**
 * @swagger
 * /api/counties/{id}/searchConfig:
 *   get:
 *     summary: Get search configuration for a county
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: County search configuration
 *       404:
 *         description: County not found
 */
router.get('/:id/searchConfig', async (req, res) => {
  try {
    const searchConfig = await countyService.getCountySearchConfig(req.params.id);
    res.json(searchConfig);
  } catch (error: any) {
    if (error.message === 'County not found') {
      return res.status(404).json({ message: 'County not found' });
    }
    res.status(500).json({ message: 'Error fetching search configuration', error: error.message });
  }
});

/**
 * @swagger
 * /api/counties/{id}/searchConfig:
 *   put:
 *     summary: Update search configuration for a county
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
 *             $ref: '#/components/schemas/CountySearchConfig'
 *     responses:
 *       200:
 *         description: Search configuration updated successfully
 *       404:
 *         description: County not found
 */
router.put('/:id/searchConfig', async (req, res) => {
  try {
    const county = await countyService.updateCountySearchConfig(req.params.id, req.body);
    res.json(county);
  } catch (error: any) {
    if (error.message === 'County not found') {
      return res.status(404).json({ message: 'County not found' });
    }
    res.status(400).json({ message: 'Error updating search configuration', error: error.message });
  }
});

export default router; 