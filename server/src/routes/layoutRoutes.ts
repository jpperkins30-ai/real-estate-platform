import { Router } from 'express';
import { getLayouts, getLayout, createLayout, updateLayout, deleteLayout, cloneLayout } from '../controllers/layoutController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /layouts:
 *   get:
 *     summary: Get all layouts for the current user
 *     description: Retrieves all layout configurations belonging to the current user
 *     tags: [Layouts]
 *     parameters:
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Include public layouts
 *     responses:
 *       200:
 *         description: An array of layout configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LayoutConfig'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getLayouts);

/**
 * @swagger
 * /layouts/{id}:
 *   get:
 *     summary: Get a specific layout
 *     description: Retrieves a specific layout configuration by ID
 *     tags: [Layouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Layout ID
 *     responses:
 *       200:
 *         description: The layout configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LayoutConfig'
 *       404:
 *         description: Layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', getLayout);

/**
 * @swagger
 * /layouts:
 *   post:
 *     summary: Create a new layout
 *     description: Creates a new layout configuration
 *     tags: [Layouts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LayoutConfig'
 *     responses:
 *       201:
 *         description: Created layout configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LayoutConfig'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', createLayout);

/**
 * @swagger
 * /layouts/{id}:
 *   put:
 *     summary: Update a layout
 *     description: Updates an existing layout configuration
 *     tags: [Layouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Layout ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LayoutConfig'
 *     responses:
 *       200:
 *         description: Updated layout configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LayoutConfig'
 *       404:
 *         description: Layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', updateLayout);

/**
 * @swagger
 * /layouts/{id}:
 *   delete:
 *     summary: Delete a layout
 *     description: Deletes a layout configuration
 *     tags: [Layouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Layout ID
 *     responses:
 *       200:
 *         description: Layout deleted successfully
 *       404:
 *         description: Layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteLayout);

/**
 * @swagger
 * /layouts/{id}/clone:
 *   post:
 *     summary: Clone a layout
 *     description: Creates a new layout based on an existing one
 *     tags: [Layouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Layout ID to clone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name for the cloned layout
 *     responses:
 *       201:
 *         description: Cloned layout configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LayoutConfig'
 *       404:
 *         description: Layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:id/clone', cloneLayout);

export default router; 