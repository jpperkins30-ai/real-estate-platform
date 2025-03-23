import express from 'express';
import mongoose from 'mongoose';
import logger from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Get system health status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   example: "2023-06-01T12:00:00.000Z"
 *                 uptime:
 *                   type: number
 *                   example: 3600
 *                 database:
 *                   type: object
 *                   properties:
 *                     connected:
 *                       type: boolean
 *                       example: true
 *                     status:
 *                       type: string
 *                       example: connected
 *       500:
 *         description: System is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 timestamp:
 *                   type: string
 *                   example: "2023-06-01T12:00:00.000Z"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/', async (req, res) => {
  try {
    // Check MongoDB connection
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbConnected = mongoose.connection.readyState === 1;
    
    // Calculate uptime
    const uptime = process.uptime();
    
    // Return health status
    res.json({
      status: dbConnected ? 'ok' : 'warning',
      timestamp: new Date().toISOString(),
      uptime,
      database: {
        connected: dbConnected,
        status: dbStatus
      },
      environment: process.env.NODE_ENV
    });
    
    logger.info(`Health check performed: ${dbStatus}, uptime: ${uptime}`);
  } catch (error) {
    logger.error('Health check failed', error);
    
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 