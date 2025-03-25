/**
 * US Map API routes
 */

import express from 'express';
import { USMap } from '../models';
import logger, { logError } from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * /api/usmap:
 *   get:
 *     summary: Get US Map data
 *     description: Returns the US Map data with metadata
 *     tags: [Geographic]
 *     responses:
 *       200:
 *         description: US Map data retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', async (req, res) => {
  try {
    const usMap = await USMap.findOne();
    
    if (!usMap) {
      return res.status(404).json({ message: 'US Map not found' });
    }
    
    res.json(usMap);
  } catch (error: unknown) {
    logError('Error fetching US Map:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

/**
 * @swagger
 * /api/usmap/stats:
 *   get:
 *     summary: Get US Map statistics
 *     description: Returns statistics for the entire US Map
 *     tags: [Geographic]
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/stats', async (req, res) => {
  try {
    const usMap = await USMap.findOne();
    
    if (!usMap) {
      return res.status(404).json({ message: 'US Map not found' });
    }
    
    res.json({
      totalStates: usMap.metadata.totalStates,
      totalCounties: usMap.metadata.totalCounties,
      totalProperties: usMap.metadata.totalProperties,
      totalTaxLiens: usMap.metadata.statistics.totalTaxLiens,
      totalValue: usMap.metadata.statistics.totalValue
    });
  } catch (error: unknown) {
    logError('Error fetching US Map statistics:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
});

export default router; 