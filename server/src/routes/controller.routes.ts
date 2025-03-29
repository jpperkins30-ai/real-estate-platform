import express from 'express';
import { auth } from '../middleware/auth';
import { logError } from '../utils/logger';
import { ControllerService } from '../services/controller.service';
import { ControllerObject, ControllerObjectReference, ControllerExecutionRequest } from '../types/inventory';

// Create main router
const mainRouter = express.Router();
const typesRouter = express.Router();
const collectorTypesRouter = express.Router();
const controllerService = new ControllerService();

/**
 * @swagger
 * /api/controllers:
 *   get:
 *     summary: Get all controllers
 *     tags: [Controllers]
 *     responses:
 *       200:
 *         description: List of controllers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ControllerObject'
 */
mainRouter.get('/', auth, async (req, res) => {
  try {
    const controllers = await controllerService.getAllControllers();
    res.json(controllers);
  } catch (error: any) {
    logError('Error fetching controllers', error);
    res.status(500).json({ error: 'Error fetching controllers' });
  }
});

/**
 * @swagger
 * /api/controllers/{id}:
 *   get:
 *     summary: Get a controller by ID
 *     tags: [Controllers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Controller details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ControllerObject'
 *       404:
 *         description: Controller not found
 */
mainRouter.get('/:id', async (req, res) => {
  try {
    const controller = await controllerService.getControllerById(req.params.id);
    if (!controller) {
      return res.status(404).json({ message: 'Controller not found' });
    }
    res.json(controller);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/controllers:
 *   post:
 *     summary: Create a new controller
 *     tags: [Controllers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ControllerObject'
 *     responses:
 *       201:
 *         description: Controller created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ControllerObject'
 */
mainRouter.post('/', async (req, res) => {
  try {
    const controller = await controllerService.createController(req.body);
    res.status(201).json(controller);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/controllers/{id}:
 *   put:
 *     summary: Update a controller
 *     tags: [Controllers]
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
 *             $ref: '#/components/schemas/ControllerObject'
 *     responses:
 *       200:
 *         description: Controller updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ControllerObject'
 *       404:
 *         description: Controller not found
 */
mainRouter.put('/:id', async (req, res) => {
  try {
    const controller = await controllerService.updateController(req.params.id, req.body);
    if (!controller) {
      return res.status(404).json({ message: 'Controller not found' });
    }
    res.json(controller);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/controllers/{id}:
 *   delete:
 *     summary: Delete a controller
 *     tags: [Controllers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Controller deleted successfully
 *       404:
 *         description: Controller not found
 */
mainRouter.delete('/:id', async (req, res) => {
  try {
    const success = await controllerService.deleteController(req.params.id);
    if (!success) {
      return res.status(404).json({ message: 'Controller not found' });
    }
    res.json({ message: 'Controller deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/controllers/{id}/attachedObjects:
 *   get:
 *     summary: Get attached objects for a controller
 *     tags: [Controllers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of attached objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ControllerObjectReference'
 *       404:
 *         description: Controller not found
 */
mainRouter.get('/:id/attachedObjects', async (req, res) => {
  try {
    const attachedObjects = await controllerService.getAttachedObjects(req.params.id);
    res.json(attachedObjects);
  } catch (error: any) {
    if (error.message === 'Controller not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/controllers/{id}/attach:
 *   post:
 *     summary: Attach objects to a controller
 *     tags: [Controllers]
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
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/ControllerObjectReference'
 *     responses:
 *       200:
 *         description: Objects attached successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ControllerObject'
 *       404:
 *         description: Controller not found
 */
mainRouter.post('/:id/attach', async (req, res) => {
  try {
    const objects = req.body as ControllerObjectReference[];
    const controller = await controllerService.attachObjects(req.params.id, objects);
    res.json(controller);
  } catch (error: any) {
    if (error.message === 'Controller not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/controllers/{id}/detach:
 *   delete:
 *     summary: Detach objects from a controller
 *     tags: [Controllers]
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
 *             type: array
 *             items:
 *               type: string
 *     responses:
 *       200:
 *         description: Objects detached successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ControllerObject'
 *       404:
 *         description: Controller not found
 */
mainRouter.delete('/:id/detach', async (req, res) => {
  try {
    const objectIds = req.body as string[];
    const controller = await controllerService.detachObjects(req.params.id, objectIds);
    res.json(controller);
  } catch (error: any) {
    if (error.message === 'Controller not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/controllers/{id}/execute:
 *   post:
 *     summary: Execute a controller
 *     tags: [Controllers]
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
 *             $ref: '#/components/schemas/ControllerExecutionRequest'
 *     responses:
 *       200:
 *         description: Controller executed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ControllerObject'
 *       404:
 *         description: Controller not found
 *       400:
 *         description: Controller is disabled
 */
mainRouter.post('/:id/execute', async (req, res) => {
  try {
    const request = req.body as ControllerExecutionRequest;
    const controller = await controllerService.executeController(req.params.id, request);
    res.json(controller);
  } catch (error: any) {
    if (error.message === 'Controller not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Controller is disabled') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/controllers/{id}/history:
 *   get:
 *     summary: Get execution history for a controller
 *     tags: [Controllers]
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
 *                 $ref: '#/components/schemas/ControllerExecutionHistory'
 *       404:
 *         description: Controller not found
 */
mainRouter.get('/:id/history', async (req, res) => {
  try {
    const history = await controllerService.getExecutionHistory(req.params.id);
    res.json(history);
  } catch (error: any) {
    if (error.message === 'Controller not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/controllers/validate/{id}:
 *   post:
 *     summary: Validate a controller
 *     tags: [Controllers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Controller validated successfully
 *       404:
 *         description: Controller not found
 */
mainRouter.post('/:id/validate', async (req, res) => {
  try {
    // Get the controller
    const controller = await controllerService.getControllerById(req.params.id);
    if (!controller) {
      return res.status(404).json({ message: 'Controller not found' });
    }

    // Perform validation logic
    const validationResult = await controllerService.validateController(req.params.id);
    
    res.json({
      status: 'Success',
      result: validationResult
    });
  } catch (error: any) {
    if (error.message === 'Controller not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/controllers/{id}/test:
 *   post:
 *     summary: Test a controller by running a sample collection
 *     tags: [Controllers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Controller test completed successfully
 *       404:
 *         description: Controller not found
 */
mainRouter.post('/:id/test', async (req, res) => {
  try {
    // Get the controller
    const controller = await controllerService.getControllerById(req.params.id);
    if (!controller) {
      return res.status(404).json({ message: 'Controller not found' });
    }

    // Perform test collection with sample data
    const testResult = await controllerService.testController(req.params.id);
    
    res.json({
      status: 'Success',
      result: testResult
    });
  } catch (error: any) {
    if (error.message === 'Controller not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/controllers/{id}/docs:
 *   post:
 *     summary: Generate API documentation for a controller
 *     tags: [Controllers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: API documentation generated successfully
 *       404:
 *         description: Controller not found
 */
mainRouter.post('/:id/docs', async (req, res) => {
  try {
    // Get the controller
    const controller = await controllerService.getControllerById(req.params.id);
    if (!controller) {
      return res.status(404).json({ message: 'Controller not found' });
    }

    // Generate API documentation for the controller
    const docResult = await controllerService.generateControllerDocs(req.params.id);
    
    res.json({
      status: 'Success',
      result: docResult
    });
  } catch (error: any) {
    if (error.message === 'Controller not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// Controller types routes
/**
 * @swagger
 * /api/controller-types:
 *   get:
 *     summary: Get all controller types
 *     tags: [Controllers]
 *     responses:
 *       200:
 *         description: List of controller types
 */
typesRouter.get('/', async (req, res) => {
  try {
    const controllerTypes = [
      { id: 'data', name: 'Data Controller', description: 'Collects data from external sources' },
      { id: 'processing', name: 'Processing Controller', description: 'Processes collected data' }
    ];
    
    res.json(controllerTypes);
  } catch (error: any) {
    logError('Error fetching controller types', error);
    res.status(500).json({ error: 'Error fetching controller types' });
  }
});

// Collector types routes
/**
 * @swagger
 * /api/collector-types:
 *   get:
 *     summary: Get all collector types
 *     tags: [Controllers]
 *     responses:
 *       200:
 *         description: List of collector types
 */
collectorTypesRouter.get('/', async (req, res) => {
  try {
    const collectorTypes = [
      { id: 'web', name: 'Web Scraper', description: 'Collects data by scraping websites' },
      { id: 'api', name: 'API Connector', description: 'Collects data from external APIs' }
    ];
    
    res.json(collectorTypes);
  } catch (error: any) {
    logError('Error fetching collector types', error);
    res.status(500).json({ error: 'Error fetching collector types' });
  }
});

// Export controllers
export default {
  main: mainRouter,
  types: typesRouter,
  collectorTypes: collectorTypesRouter
}; 