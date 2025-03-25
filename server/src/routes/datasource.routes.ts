import { Router } from 'express';
import { DataSourceService } from '../services/datasource.service';
import { DataSourceObject } from '../types/inventory';

const router = Router();
const dataSourceService = new DataSourceService();

/**
 * @swagger
 * /api/datasources:
 *   get:
 *     summary: Get all data sources
 *     tags: [Data Sources]
 *     responses:
 *       200:
 *         description: List of data sources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/DataSourceObject'
 */
router.get('/', async (req, res) => {
  try {
    const dataSources = await dataSourceService.getAllDataSources();
    res.json(dataSources);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/datasources/{id}:
 *   get:
 *     summary: Get a data source by ID
 *     tags: [Data Sources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data source details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataSourceObject'
 *       404:
 *         description: Data source not found
 */
router.get('/:id', async (req, res) => {
  try {
    const dataSource = await dataSourceService.getDataSourceById(req.params.id);
    if (!dataSource) {
      return res.status(404).json({ message: 'Data source not found' });
    }
    res.json(dataSource);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/datasources:
 *   post:
 *     summary: Create a new data source
 *     tags: [Data Sources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DataSourceObject'
 *     responses:
 *       201:
 *         description: Data source created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataSourceObject'
 */
router.post('/', async (req, res) => {
  try {
    const dataSource = await dataSourceService.createDataSource(req.body);
    res.status(201).json(dataSource);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/datasources/{id}:
 *   put:
 *     summary: Update a data source
 *     tags: [Data Sources]
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
 *             $ref: '#/components/schemas/DataSourceObject'
 *     responses:
 *       200:
 *         description: Data source updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DataSourceObject'
 *       404:
 *         description: Data source not found
 */
router.put('/:id', async (req, res) => {
  try {
    const dataSource = await dataSourceService.updateDataSource(req.params.id, req.body);
    if (!dataSource) {
      return res.status(404).json({ message: 'Data source not found' });
    }
    res.json(dataSource);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/datasources/{id}:
 *   delete:
 *     summary: Delete a data source
 *     tags: [Data Sources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data source deleted successfully
 *       404:
 *         description: Data source not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const success = await dataSourceService.deleteDataSource(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Data source not found' });
    }
    res.json({ message: 'Data source deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/datasources/{id}/test:
 *   post:
 *     summary: Test data source connection
 *     tags: [Data Sources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Connection test successful
 *       404:
 *         description: Data source not found
 *       500:
 *         description: Connection test failed
 */
router.post('/:id/test', async (req, res) => {
  try {
    const success = await dataSourceService.testConnection(req.params.id);
    res.json({ message: 'Connection test successful' });
  } catch (error: any) {
    if (error.message === 'Data source not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/datasources/{id}/status:
 *   get:
 *     summary: Get data source status
 *     tags: [Data Sources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Data source status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [Active, Inactive, Error, Syncing]
 *                 error:
 *                   type: string
 *       404:
 *         description: Data source not found
 */
router.get('/:id/status', async (req, res) => {
  try {
    const status = await dataSourceService.getStatus(req.params.id);
    res.json(status);
  } catch (error: any) {
    if (error.message === 'Data source not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router; 