import { Router } from 'express';
import { CollectionService } from '../services/collection.service';
import { CollectionObject, CollectionExecutionRequest } from '../types/inventory';

const router = Router();
const collectionService = new CollectionService();

/**
 * @swagger
 * /api/collections:
 *   get:
 *     summary: Get all collections
 *     tags: [Collections]
 *     responses:
 *       200:
 *         description: List of collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CollectionObject'
 */
router.get('/', async (req, res) => {
  try {
    const collections = await collectionService.getAllCollections();
    res.json(collections);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/collections/{id}:
 *   get:
 *     summary: Get a collection by ID
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollectionObject'
 *       404:
 *         description: Collection not found
 */
router.get('/:id', async (req, res) => {
  try {
    const collection = await collectionService.getCollectionById(req.params.id);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json(collection);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/collections/source/{sourceId}:
 *   get:
 *     summary: Get collections by source ID
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: sourceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of collections for the source
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CollectionObject'
 */
router.get('/source/:sourceId', async (req, res) => {
  try {
    const collections = await collectionService.getCollectionsBySource(req.params.sourceId);
    res.json(collections);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/collections:
 *   post:
 *     summary: Create a new collection
 *     tags: [Collections]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CollectionObject'
 *     responses:
 *       201:
 *         description: Collection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollectionObject'
 *       404:
 *         description: Data source not found
 */
router.post('/', async (req, res) => {
  try {
    const collection = await collectionService.createCollection(req.body);
    res.status(201).json(collection);
  } catch (error: any) {
    if (error.message === 'Data source not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/collections/{id}:
 *   put:
 *     summary: Update a collection
 *     tags: [Collections]
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
 *             $ref: '#/components/schemas/CollectionObject'
 *     responses:
 *       200:
 *         description: Collection updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollectionObject'
 *       404:
 *         description: Collection not found
 */
router.put('/:id', async (req, res) => {
  try {
    const collection = await collectionService.updateCollection(req.params.id, req.body);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json(collection);
  } catch (error: any) {
    if (error.message === 'Data source not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/collections/{id}:
 *   delete:
 *     summary: Delete a collection
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection deleted successfully
 *       404:
 *         description: Collection not found
 */
router.delete('/:id', async (req, res) => {
  try {
    const success = await collectionService.deleteCollection(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    res.json({ message: 'Collection deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/collections/execute/{sourceId}:
 *   post:
 *     summary: Execute collections for a data source
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: sourceId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CollectionExecutionRequest'
 *     responses:
 *       200:
 *         description: Collections executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CollectionObject'
 *       404:
 *         description: Data source not found
 *       400:
 *         description: Data source is not active
 */
router.post('/execute/:sourceId', async (req, res) => {
  try {
    const request = req.body as CollectionExecutionRequest;
    const collections = await collectionService.getCollectionsBySource(req.params.sourceId);
    
    const results = await Promise.all(
      collections.map(collection => 
        collectionService.executeCollection(collection.id, request)
      )
    );

    res.json(results);
  } catch (error: any) {
    if (error.message === 'Data source not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Data source is not active') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/collections/{id}/history:
 *   get:
 *     summary: Get execution history for a collection
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of execution history entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CollectionExecutionHistory'
 *       404:
 *         description: Collection not found
 */
router.get('/:id/history', async (req, res) => {
  try {
    const history = await collectionService.getExecutionHistory(req.params.id);
    res.json(history);
  } catch (error: any) {
    if (error.message === 'Collection not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/collections/{id}/status:
 *   get:
 *     summary: Get collection status
 *     tags: [Collections]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [Active, Inactive, Error, Running]
 *                 error:
 *                   type: string
 *       404:
 *         description: Collection not found
 */
router.get('/:id/status', async (req, res) => {
  try {
    const status = await collectionService.getStatus(req.params.id);
    res.json(status);
  } catch (error: any) {
    if (error.message === 'Collection not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

export default router; 