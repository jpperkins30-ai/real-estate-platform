import { Router } from 'express';
import { USMapService } from '../services/usmap.service';

const router = Router();
const usMapService = new USMapService();

/**
 * @swagger
 * /api/usmap:
 *   get:
 *     summary: Get the US Map object
 *     description: Returns the complete US Map object with all its metadata and states
 *     responses:
 *       200:
 *         description: The US Map object
 *       404:
 *         description: US Map not found
 */
router.get('/', async (req, res) => {
  try {
    const usMap = await usMapService.getUSMap();
    if (!usMap) {
      return res.status(404).json({ message: 'US Map not found' });
    }
    res.json(usMap);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching US Map', error: error.message });
  }
});

/**
 * @swagger
 * /api/usmap/statistics:
 *   get:
 *     summary: Get US Map statistics
 *     description: Returns the statistics for the US Map
 *     responses:
 *       200:
 *         description: The US Map statistics
 *       404:
 *         description: US Map not found
 */
router.get('/statistics', async (req, res) => {
  try {
    const statistics = await usMapService.getStatistics();
    res.json(statistics);
  } catch (error: any) {
    if (error.message === 'US Map not found') {
      return res.status(404).json({ message: 'US Map not found' });
    }
    res.status(500).json({ message: 'Error fetching US Map statistics', error: error.message });
  }
});

/**
 * @swagger
 * /api/usmap/states:
 *   get:
 *     summary: Get all states
 *     description: Returns all states in the US Map
 *     responses:
 *       200:
 *         description: Array of states
 *       404:
 *         description: US Map not found
 */
router.get('/states', async (req, res) => {
  try {
    const states = await usMapService.getStates();
    res.json(states);
  } catch (error: any) {
    if (error.message === 'US Map not found') {
      return res.status(404).json({ message: 'US Map not found' });
    }
    res.status(500).json({ message: 'Error fetching states', error: error.message });
  }
});

export default router; 