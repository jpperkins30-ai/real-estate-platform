import { Router } from 'express';
import { StateService } from '../services/state.service';
import { StateObject } from '../types/inventory';
import { State } from '../models';
import { getSimplifiedStateGeometry, getCountyFeatureCollection } from '../utils/geoDataUtils';
import logger, { logError } from '../utils/logger';
import { GeoJSONUtils } from '../utils/geoJSONUtils';

const router = Router();

const stateService = new StateService();

/**
 * @swagger
 * components:
 *   schemas:
 *     State:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The state ID
 *         name:
 *           type: string
 *           description: The state name
 *         abbreviation:
 *           type: string
 *           description: The state abbreviation
 *         type:
 *           type: string
 *           enum: [state]
 *           description: Object type
 *         parentId:
 *           type: string
 *           description: Reference to the parent US map ID
 *         region:
 *           type: string
 *           description: Geographic region
 *         metadata:
 *           type: object
 *           properties:
 *             totalCounties:
 *               type: number
 *               description: Total number of counties in the state
 *             totalProperties:
 *               type: number
 *               description: Total number of properties in the state
 *             statistics:
 *               type: object
 *               properties:
 *                 totalTaxLiens:
 *                   type: number
 *                   description: Total number of tax liens
 *                 totalValue:
 *                   type: number
 *                   description: Total property value
 */

/**
 * @swagger
 * /api/states:
 *   get:
 *     summary: Retrieve all states
 *     description: Returns a list of all states with optional filters
 *     tags: [States]
 *     parameters:
 *       - in: query
 *         name: includeGeometry
 *         schema:
 *           type: boolean
 *         description: Whether to include geometry in the response
 *     responses:
 *       200:
 *         description: A list of states
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/State'
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const { includeGeometry } = req.query;
    
    // Create projection based on whether to include geometry
    const projection = includeGeometry === 'true' ? {} : { geometry: 0 };
    
    const states = await State.find({}, projection).sort({ name: 1 });
    
    res.json(states);
  } catch (error: any) {
    logger.error('Error fetching states:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/states/{abbreviation}:
 *   get:
 *     summary: Get state by abbreviation
 *     description: Returns a state by its abbreviation
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: abbreviation
 *         required: true
 *         schema:
 *           type: string
 *         description: State abbreviation (e.g., 'CA', 'TX')
 *     responses:
 *       200:
 *         description: State object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/State'
 *       404:
 *         description: State not found
 *       500:
 *         description: Server error
 */
router.get('/:abbreviation', async (req, res) => {
  try {
    const { abbreviation } = req.params;
    
    const state = await State.findOne({ abbreviation: abbreviation.toUpperCase() });
    
    if (!state) {
      return res.status(404).json({ message: `State ${abbreviation} not found` });
    }
    
    res.json(state);
  } catch (error: any) {
    logger.error(`Error fetching state ${req.params.abbreviation}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/states/{abbreviation}/simplified:
 *   get:
 *     summary: Get simplified geometry for a state
 *     description: Returns a simplified version of the state geometry
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: abbreviation
 *         required: true
 *         schema:
 *           type: string
 *         description: State abbreviation (e.g., 'CA', 'TX')
 *     responses:
 *       200:
 *         description: Simplified state geometry
 *       404:
 *         description: State not found
 *       500:
 *         description: Server error
 */
router.get('/:abbreviation/simplified', async (req, res) => {
  try {
    const { abbreviation } = req.params;
    
    const simplifiedGeometry = await getSimplifiedStateGeometry(abbreviation.toUpperCase());
    
    res.json(simplifiedGeometry);
  } catch (error: any) {
    logger.error(`Error fetching simplified geometry for state ${req.params.abbreviation}:`, error);
    
    if (error.message && error.message.includes('not found')) {
      return res.status(404).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/states/{abbreviation}/counties:
 *   get:
 *     summary: Get counties for a state
 *     description: Returns a list of counties for a state
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: abbreviation
 *         required: true
 *         schema:
 *           type: string
 *         description: State abbreviation (e.g., 'CA', 'TX')
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, geojson]
 *         description: Format to return data in
 *     responses:
 *       200:
 *         description: List of counties or GeoJSON FeatureCollection
 *       404:
 *         description: State not found
 *       500:
 *         description: Server error
 */
router.get('/:abbreviation/counties', async (req, res) => {
  try {
    const { abbreviation } = req.params;
    const { format } = req.query;
    
    const state = await State.findOne({ abbreviation: abbreviation.toUpperCase() });
    
    if (!state) {
      return res.status(404).json({ message: `State ${abbreviation} not found` });
    }
    
    if (format === 'geojson') {
      // Return counties as GeoJSON FeatureCollection
      const featureCollection = await getCountyFeatureCollection(abbreviation.toUpperCase());
      return res.json(featureCollection);
    }
    
    // Return counties as JSON array
    const counties = await State.aggregate([
      { $match: { abbreviation: abbreviation.toUpperCase() } },
      { 
        $lookup: {
          from: 'counties',
          localField: '_id',
          foreignField: 'stateId',
          as: 'counties'
        }
      },
      { $unwind: '$counties' },
      { $replaceRoot: { newRoot: '$counties' } },
      { $project: { geometry: 0 } },
      { $sort: { name: 1 } }
    ]);
    
    res.json(counties);
  } catch (error: any) {
    logger.error(`Error fetching counties for state ${req.params.abbreviation}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/states/{abbreviation}/statistics:
 *   get:
 *     summary: Get statistics for a state
 *     description: Returns statistics for a state
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: abbreviation
 *         required: true
 *         schema:
 *           type: string
 *         description: State abbreviation (e.g., 'CA', 'TX')
 *     responses:
 *       200:
 *         description: State statistics
 *       404:
 *         description: State not found
 *       500:
 *         description: Server error
 */
router.get('/:abbreviation/statistics', async (req, res) => {
  try {
    const { abbreviation } = req.params;
    
    const state = await State.findOne({ abbreviation: abbreviation.toUpperCase() });
    
    if (!state) {
      return res.status(404).json({ message: `State ${abbreviation} not found` });
    }
    
    res.json({
      totalCounties: state.metadata.totalCounties,
      totalProperties: state.metadata.totalProperties,
      totalTaxLiens: state.metadata.statistics.totalTaxLiens,
      totalValue: state.metadata.statistics.totalValue
    });
  } catch (error: any) {
    logger.error(`Error fetching statistics for state ${req.params.abbreviation}:`, error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * @swagger
 * /api/states:
 *   post:
 *     summary: Create a new state
 *     tags: [States]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StateObject'
 *     responses:
 *       201:
 *         description: State created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/State'
 *       400:
 *         description: Error creating state
 *       404:
 *         description: Parent US Map not found
 */
router.post('/', async (req, res) => {
  try {
    const state = await stateService.createState(req.body);
    res.status(201).json(state);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if ('code' in error && error.code === 11000) {
        return res.status(400).json({ message: 'State with this name or abbreviation already exists', error: error.message });
      }
      res.status(400).json({ message: 'Error creating state', error: error.message });
    } else {
      res.status(400).json({ message: 'Error creating state', error: 'Unknown error occurred' });
    }
  }
});

/**
 * @swagger
 * /api/states/{id}:
 *   put:
 *     summary: Update a state
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: State ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StateObject'
 *     responses:
 *       200:
 *         description: State updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/State'
 *       404:
 *         description: State not found
 */
router.put('/:id', async (req, res) => {
  try {
    const state = await stateService.updateState(req.params.id, req.body);
    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }
    res.json(state);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(400).json({ message: 'Error updating state', error: errorMessage });
  }
});

/**
 * @swagger
 * /api/states/{id}:
 *   delete:
 *     summary: Delete a state
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: State ID
 *     responses:
 *       200:
 *         description: State deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: State deleted successfully
 *       400:
 *         description: Cannot delete state with counties
 *       404:
 *         description: State not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await stateService.deleteState(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'State not found' });
    }
    res.json({ message: 'State deleted successfully' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes('Cannot delete state with counties')) {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error deleting state', error: error.message });
    } else {
      res.status(500).json({ message: 'Error deleting state', error: 'Unknown error occurred' });
    }
  }
});

/**
 * @swagger
 * /api/states/{id}/counties:
 *   get:
 *     summary: Get counties for a state
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: State ID
 *       - in: query
 *         name: includeGeometry
 *         schema:
 *           type: boolean
 *         description: Include geometry information in response
 *     responses:
 *       200:
 *         description: List of counties
 *       404:
 *         description: State not found
 */
router.get('/:id/counties', async (req, res) => {
  try {
    const includeGeometry = req.query.includeGeometry === 'true';
    const counties = await stateService.getStateCounties(req.params.id, includeGeometry);
    res.json(counties);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'State not found') {
        return res.status(404).json({ message: 'State not found' });
      }
      res.status(500).json({ message: 'Error fetching counties', error: error.message });
    } else {
      res.status(500).json({ message: 'Error fetching counties', error: 'Unknown error occurred' });
    }
  }
});

/**
 * @swagger
 * /api/states/{id}/statistics:
 *   get:
 *     summary: Get statistics for a state
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: State ID
 *     responses:
 *       200:
 *         description: State statistics
 *       404:
 *         description: State not found
 */
router.get('/:id/statistics', async (req, res) => {
  try {
    const statistics = await stateService.getStateStatistics(req.params.id);
    res.json(statistics);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'State not found') {
        return res.status(404).json({ message: 'State not found' });
      }
      res.status(500).json({ message: 'Error fetching statistics', error: error.message });
    } else {
      res.status(500).json({ message: 'Error fetching statistics', error: 'Unknown error occurred' });
    }
  }
});

/**
 * @swagger
 * /api/states/{id}/controllers:
 *   get:
 *     summary: Get controllers for a state
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: State ID
 *     responses:
 *       200:
 *         description: List of controllers
 *       404:
 *         description: State not found
 */
router.get('/:id/controllers', async (req, res) => {
  try {
    const controllers = await stateService.getStateControllers(req.params.id);
    res.json(controllers);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'State not found') {
        return res.status(404).json({ message: 'State not found' });
      }
      res.status(500).json({ message: 'Error fetching controllers', error: error.message });
    } else {
      res.status(500).json({ message: 'Error fetching controllers', error: 'Unknown error occurred' });
    }
  }
});

/**
 * @swagger
 * /api/states/{id}/recalculate:
 *   post:
 *     summary: Recalculate state statistics based on counties
 *     tags: [States]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: State ID
 *     responses:
 *       200:
 *         description: State statistics updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: State statistics updated successfully
 *                 statistics:
 *                   type: object
 *       404:
 *         description: State not found
 */
router.post('/:id/recalculate', async (req, res) => {
  try {
    const state = await stateService.recalculateStateStatistics(req.params.id);
    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }
    res.json({ message: 'State statistics updated successfully', statistics: state.metadata.statistics });
  } catch (error: any) {
    res.status(500).json({ message: 'Error recalculating state statistics', error: error.message });
  }
});

export default router; 