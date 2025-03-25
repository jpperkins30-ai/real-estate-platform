import { Router } from 'express';
import { ControllerService } from '../services/controller.service';
import { ControllerObject, ControllerObjectReference, ControllerExecutionRequest } from '../types/inventory';

const router = Router();
const typesRouter = Router();
const collectorTypesRouter = Router();
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
router.get('/', async (req, res) => {
  try {
    const controllers = await controllerService.getAllControllers();
    res.json(controllers);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
router.get('/:id', async (req, res) => {
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
router.post('/', async (req, res) => {
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
router.put('/:id', async (req, res) => {
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
router.delete('/:id', async (req, res) => {
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
router.get('/:id/attachedObjects', async (req, res) => {
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
router.post('/:id/attach', async (req, res) => {
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
router.delete('/:id/detach', async (req, res) => {
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
router.post('/:id/execute', async (req, res) => {
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
router.get('/:id/history', async (req, res) => {
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
router.post('/:id/validate', async (req, res) => {
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
router.post('/:id/test', async (req, res) => {
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
router.post('/:id/docs', async (req, res) => {
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
      { id: 'tax_sale', name: 'Tax Sale', description: 'Manages tax sale data collection' },
      { id: 'map', name: 'Map', description: 'Manages geographical data collection' },
      { id: 'property', name: 'Property', description: 'Manages property data collection' },
      { id: 'demographics', name: 'Demographics', description: 'Manages demographic data collection' }
    ];
    
    res.json(controllerTypes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
      { id: 'web_scraper', name: 'Web Scraper', description: 'Collects data by scraping websites', supportedSourceTypes: ['county-website', 'state-records'] },
      { id: 'api_client', name: 'API Client', description: 'Collects data from APIs', supportedSourceTypes: ['api'] },
      { id: 'file_parser', name: 'File Parser', description: 'Parses files like PDFs or CSVs', supportedSourceTypes: ['pdf', 'csv'] },
      { id: 'database_connector', name: 'Database Connector', description: 'Connects to external databases', supportedSourceTypes: ['tax-database'] }
    ];
    
    res.json(collectorTypes);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Export controllers
export default {
  main: router,
  types: typesRouter,
  collectorTypes: collectorTypesRouter
}; 