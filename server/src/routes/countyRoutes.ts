import { Router } from 'express';
import { getCounties, getCounty, getCountyStats, getCountyProperties } from '../controllers/countyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /counties:
 *   get:
 *     summary: Get all counties
 *     description: Retrieves a list of counties, with optional filtering
 *     tags: [Counties]
 *     parameters:
 *       - in: query
 *         name: stateId
 *         schema:
 *           type: string
 *         description: Filter by state ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of counties to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: A list of counties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 counties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/County'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', getCounties);

/**
 * @swagger
 * /counties/{id}:
 *   get:
 *     summary: Get a county
 *     description: Retrieves a specific county by ID
 *     tags: [Counties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: County ID
 *     responses:
 *       200:
 *         description: The county
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/County'
 *       404:
 *         description: County not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', getCounty);

/**
 * @swagger
 * /counties/{id}/stats:
 *   get:
 *     summary: Get county stats
 *     description: Retrieves statistics for a specific county
 *     tags: [Counties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: County ID
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [1m, 3m, 6m, 1y, 3y, 5y, all]
 *           default: 1y
 *         description: Stats timeframe
 *     responses:
 *       200:
 *         description: County statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountyStats'
 *       404:
 *         description: County not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/stats', getCountyStats);

/**
 * @swagger
 * /counties/{id}/properties:
 *   get:
 *     summary: Get county properties
 *     description: Retrieves properties in a specific county
 *     tags: [Counties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: County ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of properties to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, date_asc, date_desc]
 *           default: date_desc
 *         description: Sort order
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *         description: Filter by property type
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *     responses:
 *       200:
 *         description: County properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 properties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       404:
 *         description: County not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/properties', getCountyProperties);

export default router; 