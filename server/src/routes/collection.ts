import express from 'express';
import Collection from '../models/Collection';
import DataSource from '../models/DataSource';
import { collectorManager } from '../services/dataCollection/CollectorManager';
import logger from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * /collections:
 *   get:
 *     summary: Get all collection entries
 *     tags: [Collection]
 *     responses:
 *       200:
 *         description: A list of collection entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Collection'
 */
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find()
      .sort({ timestamp: -1 })
      .limit(100);
      
    res.json(collections);
  } catch (error) {
    logger.error('Error fetching collections', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /collections/{id}:
 *   get:
 *     summary: Get a collection entry by ID
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection entry found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Collection'
 *       404:
 *         description: Collection entry not found
 */
router.get('/:id', async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id);
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    res.json(collection);
  } catch (error) {
    logger.error(`Error fetching collection ${req.params.id}`, error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /collections/source/{sourceId}:
 *   get:
 *     summary: Get collection entries for a specific data source
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: sourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection entries found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Collection'
 */
router.get('/source/:sourceId', async (req, res) => {
  try {
    const collections = await Collection.find({ sourceId: req.params.sourceId })
      .sort({ timestamp: -1 });
    
    res.json(collections);
  } catch (error) {
    logger.error(`Error fetching collections for source ${req.params.sourceId}`, error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /collections/execute/{sourceId}:
 *   post:
 *     summary: Execute collection for a specific data source
 *     tags: [Collection]
 *     parameters:
 *       - in: path
 *         name: sourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Collection'
 *       404:
 *         description: Data source not found
 *       500:
 *         description: Error executing collection
 */
router.post('/execute/:sourceId', async (req, res) => {
  try {
    // Check if the data source exists
    const dataSource = await DataSource.findById(req.params.sourceId);
    
    if (!dataSource) {
      return res.status(404).json({ message: 'Data source not found' });
    }
    
    // Execute the collection
    logger.info(`Executing collection for source: ${dataSource.name} (${dataSource._id})`);
    
    const result = await collectorManager.executeCollection(req.params.sourceId);
    
    if (result.success) {
      // Get the latest collection entry
      const collection = await Collection.findOne({ 
        sourceId: req.params.sourceId,
        timestamp: { $gte: result.timestamp }
      });
      
      res.json({
        success: true,
        message: result.message,
        collection: collection
      });
    } else {
      res.status(500).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    logger.error(`Error executing collection for source ${req.params.sourceId}`, error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 