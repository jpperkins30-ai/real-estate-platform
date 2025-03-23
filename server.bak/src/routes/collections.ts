import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { CollectorManager } from '../dataCollection/manager/CollectorManager';
import { HtmlTableCollector } from '../dataCollection/collectors/HtmlTableCollector';
import { SdatPropertyDetailCollector } from '../dataCollection/collectors/SdatPropertyDetailCollector';
import { stMarysCountyConfig } from '../dataCollection/sources/stMarysCounty/config';
import { sdatConfig } from '../dataCollection/sources/sdat/config';
import Collection from '../models/Collection';
import DataSource from '../models/DataSource';
import { validationResult } from 'express-validator';

const router = express.Router();

// Initialize the collector manager as a singleton
const collectorManager = new CollectorManager();

// Initialize the collectors
const initializeCollectors = async () => {
  try {
    collectorManager.registerCollector('stMarysCounty', new HtmlTableCollector(stMarysCountyConfig));
    collectorManager.registerCollector('sdat', new SdatPropertyDetailCollector(sdatConfig));
    console.log('Collectors registered successfully');
  } catch (error) {
    console.error('Failed to register collectors:', error);
  }
};

// Initialize collectors when the module is loaded
initializeCollectors();

/**
 * @swagger
 * /api/collections:
 *   get:
 *     summary: Get all collection records
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of collections to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Number of collections to skip
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by collection status
 *     responses:
 *       200:
 *         description: A list of collections
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 */
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = parseInt(req.query.skip as string) || 0;
    const status = req.query.status as string;
    
    // Build query
    const query: any = {};
    if (status) {
      query.status = status;
    }
    
    // Fetch collections with pagination
    const collections = await Collection.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sourceId');
    
    // Get total count for pagination
    const total = await Collection.countDocuments(query);
    
    res.json({
      collections,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + collections.length < total
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/collections/{id}:
 *   get:
 *     summary: Get a specific collection by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection details
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 *       404:
 *         description: Collection not found
 */
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('sourceId');
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/collections/execute:
 *   post:
 *     summary: Execute data collection for all sources
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               concurrency:
 *                 type: integer
 *                 description: Maximum number of parallel collectors
 *                 default: 3
 *     responses:
 *       202:
 *         description: Collection started
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 */
router.post('/execute', authenticateToken, async (req, res, next) => {
  try {
    const concurrency = req.body.concurrency || 3;
    
    // Return an immediate response and run the collection in the background
    res.status(202).json({ 
      message: 'Collection process started',
      timestamp: new Date()
    });
    
    // Start the collection process (don't await it)
    collectorManager.executeParallelCollections(undefined, concurrency)
      .then(results => {
        console.log(`Collection process completed with ${results.size} results`);
      })
      .catch(error => {
        console.error('Collection process failed:', error);
      });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/collections/execute/{sourceId}:
 *   post:
 *     summary: Execute collection for a specific data source
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       202:
 *         description: Collection started
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 *       404:
 *         description: Data source not found
 */
router.post('/execute/:sourceId', authenticateToken, async (req, res, next) => {
  try {
    const sourceId = req.params.sourceId;
    
    // Check if source exists
    const source = await DataSource.findById(sourceId);
    if (!source) {
      return res.status(404).json({ message: 'Data source not found' });
    }
    
    // Return an immediate response and run the collection in the background
    res.status(202).json({ 
      message: `Collection process started for source: ${source.name}`,
      sourceId,
      timestamp: new Date()
    });
    
    // Start the collection process for the specified source
    collectorManager.executeParallelCollections([sourceId])
      .then(results => {
        const result = results.get(sourceId);
        console.log(`Collection process for source ${sourceId} completed: ${result.success ? 'success' : 'failed'}`);
      })
      .catch(error => {
        console.error(`Collection process for source ${sourceId} failed:`, error);
      });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/collections/health:
 *   get:
 *     summary: Get health status of the data collection system
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *         description: Lookback period in hours (default 24)
 *     responses:
 *       200:
 *         description: Health status of the data collection system
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 */
router.get('/health', authenticateToken, async (req, res, next) => {
  try {
    const period = parseInt(req.query.period as string) || 24;
    const health = await collectorManager.checkHealth(period);
    res.json(health);
  } catch (error) {
    next(error);
  }
});

export default router; 