import { Router } from 'express';
import { StateService } from '../services/state.service';
import { StateObject } from '../types/inventory';

const router = Router();
const stateService = new StateService();

/**
 * @swagger
 * /api/states:
 *   get:
 *     summary: Get all states
 *     description: Returns a list of all states
 *     responses:
 *       200:
 *         description: List of states
 */
router.get('/', async (req, res) => {
  try {
    const states = await stateService.getAllStates();
    res.json(states);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching states', error: error.message });
  }
});

/**
 * @swagger
 * /api/states/{id}:
 *   get:
 *     summary: Get a state by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The state object
 *       404:
 *         description: State not found
 */
router.get('/:id', async (req, res) => {
  try {
    const state = await stateService.getStateById(req.params.id);
    if (!state) {
      return res.status(404).json({ message: 'State not found' });
    }
    res.json(state);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching state', error: error.message });
  }
});

/**
 * @swagger
 * /api/states:
 *   post:
 *     summary: Create a new state
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StateObject'
 *     responses:
 *       201:
 *         description: State created successfully
 */
router.post('/', async (req, res) => {
  try {
    const state = await stateService.createState(req.body);
    res.status(201).json(state);
  } catch (error: any) {
    res.status(400).json({ message: 'Error creating state', error: error.message });
  }
});

/**
 * @swagger
 * /api/states/{id}:
 *   put:
 *     summary: Update a state
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
 *             $ref: '#/components/schemas/StateObject'
 *     responses:
 *       200:
 *         description: State updated successfully
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
  } catch (error: any) {
    res.status(400).json({ message: 'Error updating state', error: error.message });
  }
});

/**
 * @swagger
 * /api/states/{id}:
 *   delete:
 *     summary: Delete a state
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: State deleted successfully
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
  } catch (error: any) {
    res.status(500).json({ message: 'Error deleting state', error: error.message });
  }
});

/**
 * @swagger
 * /api/states/{id}/counties:
 *   get:
 *     summary: Get counties for a state
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of counties
 *       404:
 *         description: State not found
 */
router.get('/:id/counties', async (req, res) => {
  try {
    const counties = await stateService.getStateCounties(req.params.id);
    res.json(counties);
  } catch (error: any) {
    if (error.message === 'State not found') {
      return res.status(404).json({ message: 'State not found' });
    }
    res.status(500).json({ message: 'Error fetching counties', error: error.message });
  }
});

/**
 * @swagger
 * /api/states/{id}/statistics:
 *   get:
 *     summary: Get statistics for a state
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
  } catch (error: any) {
    if (error.message === 'State not found') {
      return res.status(404).json({ message: 'State not found' });
    }
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
});

/**
 * @swagger
 * /api/states/{id}/controllers:
 *   get:
 *     summary: Get controllers for a state
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
 *         description: State not found
 */
router.get('/:id/controllers', async (req, res) => {
  try {
    const controllers = await stateService.getStateControllers(req.params.id);
    res.json(controllers);
  } catch (error: any) {
    if (error.message === 'State not found') {
      return res.status(404).json({ message: 'State not found' });
    }
    res.status(500).json({ message: 'Error fetching controllers', error: error.message });
  }
});

export default router; 