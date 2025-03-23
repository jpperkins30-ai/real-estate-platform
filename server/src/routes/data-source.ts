import express from 'express';
import DataSource from '../models/DataSource';
import { collectorManager } from '../services/dataCollection/CollectorManager';
import logger from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * /data-sources:
 *   get:
 *     summary: Get all data sources
 *     tags: [DataSource]
 *     responses:
 *       200:
 *         description: A list of data sources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DataSource'
 */
router.get('/', async (req, res) => {
  try {
    const dataSources = await DataSource.find();
    res.json(dataSources);
  } catch (error) {
    logger.error('Error fetching data sources', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /data-sources/{id}:
 *   get:
 *     summary: Get a data source by ID
 *     tags: [DataSource]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data source found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataSource'
 *       404:
 *         description: Data source not found
 */
router.get('/:id', async (req, res) => {
  try {
    const dataSource = await DataSource.findById(req.params.id);
    if (!dataSource) {
      return res.status(404).json({ message: 'Data source not found' });
    }
    res.json(dataSource);
  } catch (error) {
    logger.error(`Error fetching data source ${req.params.id}`, error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /data-sources:
 *   post:
 *     summary: Create a new data source
 *     tags: [DataSource]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DataSource'
 *     responses:
 *       201:
 *         description: Data source created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataSource'
 *       400:
 *         description: Invalid request data
 */
router.post('/', async (req, res) => {
  try {
    // Check if a collector is available for the specified collector type
    const collectors = collectorManager.getCollectors();
    const collectorExists = collectors.some(c => c.id === req.body.collectorType);
    
    if (!collectorExists) {
      return res.status(400).json({
        message: `Collector type '${req.body.collectorType}' does not exist`,
        availableCollectors: collectors.map(c => ({ id: c.id, name: c.name }))
      });
    }
    
    // Create the data source in the database
    const dataSource = await DataSource.create(req.body);
    
    // Register the data source with the collector manager
    // (on next initialization, it will pick up the new source)
    
    logger.info(`Created data source: ${dataSource.name} (${dataSource._id})`);
    
    res.status(201).json(dataSource);
  } catch (error) {
    logger.error('Error creating data source', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /data-sources/{id}:
 *   put:
 *     summary: Update a data source
 *     tags: [DataSource]
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
 *             $ref: '#/components/schemas/DataSource'
 *     responses:
 *       200:
 *         description: Data source updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataSource'
 *       404:
 *         description: Data source not found
 */
router.put('/:id', async (req, res) => {
  try {
    const dataSource = await DataSource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!dataSource) {
      return res.status(404).json({ message: 'Data source not found' });
    }
    
    logger.info(`Updated data source: ${dataSource.name} (${dataSource._id})`);
    
    res.json(dataSource);
  } catch (error) {
    logger.error(`Error updating data source ${req.params.id}`, error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /data-sources/{id}:
 *   delete:
 *     summary: Delete a data source
 *     tags: [DataSource]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data source deleted
 *       404:
 *         description: Data source not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const dataSource = await DataSource.findByIdAndDelete(req.params.id);
    
    if (!dataSource) {
      return res.status(404).json({ message: 'Data source not found' });
    }
    
    logger.info(`Deleted data source: ${dataSource.name} (${dataSource._id})`);
    
    res.json({ message: 'Data source deleted' });
  } catch (error) {
    logger.error(`Error deleting data source ${req.params.id}`, error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 