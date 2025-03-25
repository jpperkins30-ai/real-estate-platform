import { Router } from 'express';
import { CountyService } from '../services/county.service';
import { CountyObject, CountySearchConfig } from '../types/inventory';

const router = Router();
const countyService = new CountyService();

/**
 * @swagger
 * /api/counties:
 *   get:
 *     summary: Get all counties
 *     description: Returns a list of all counties
 *     responses:
 *       200:
 *         description: List of counties
 */
router.get('/', async (req, res) => {
  try {
    const counties = await countyService.getAllCounties();
    res.json(counties);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching counties', error: error.message });
  }
});

/**
 * @swagger
 * /api/counties/{id}:
 *   get:
 *     summary: Get a county by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: The county object
 *       404:
 *         description: County not found
 */
router.get('/:id', async (req, res) => {
  try {
    const county = await countyService.getCountyById(req.params.id);
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    res.json(county);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching county', error: error.message });
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
 * /api/counties/{id}/statistics:
 *   get:
 *     summary: Get statistics for a county
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: County statistics
 *       404:
 *         description: County not found
 */
router.get('/:id/statistics', async (req, res) => {
  try {
    const statistics = await countyService.getCountyStatistics(req.params.id);
    res.json(statistics);
  } catch (error: any) {
    if (error.message === 'County not found') {
      return res.status(404).json({ message: 'County not found' });
    }
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
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