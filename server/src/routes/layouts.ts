import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { 
  getLayouts, 
  getLayout, 
  createLayout, 
  updateLayout, 
  deleteLayout, 
  cloneLayout 
} from '../controllers/layoutController';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validation';

const router = express.Router();

/**
 * @swagger
 * /api/layouts:
 *   get:
 *     summary: Get all layouts for the current user
 *     description: Retrieves all layouts owned by the logged-in user, optionally including public layouts
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: isPublic
 *         in: query
 *         description: If true, includes public layouts created by other users
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of layouts
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authMiddleware, getLayouts);

/**
 * @swagger
 * /api/layouts/{id}:
 *   get:
 *     summary: Get a specific layout
 *     description: Retrieves a specific layout by ID, if owned by the user or public
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Layout ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Layout details
 *       404:
 *         description: Layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', authMiddleware, getLayout);

/**
 * @swagger
 * /api/layouts:
 *   post:
 *     summary: Create a new layout
 *     description: Creates a new layout for the current user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - layoutType
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *               isPublic:
 *                 type: boolean
 *               layoutType:
 *                 type: string
 *                 enum: [single, dual, tri, quad]
 *               panels:
 *                 type: array
 *     responses:
 *       201:
 *         description: Layout created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  authMiddleware,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('layoutType')
      .isIn(['single', 'dual', 'tri', 'quad'])
      .withMessage('Layout type must be single, dual, tri, or quad'),
    validateRequest
  ],
  createLayout
);

/**
 * @swagger
 * /api/layouts/{id}:
 *   put:
 *     summary: Update a layout
 *     description: Updates an existing layout owned by the user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Layout ID
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Layout updated
 *       404:
 *         description: Layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', authMiddleware, updateLayout);

/**
 * @swagger
 * /api/layouts/{id}:
 *   delete:
 *     summary: Delete a layout
 *     description: Deletes a layout owned by the user
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Layout ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Layout deleted
 *       404:
 *         description: Layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', authMiddleware, deleteLayout);

/**
 * @swagger
 * /api/layouts/{id}/clone:
 *   post:
 *     summary: Clone a layout
 *     description: Creates a copy of an existing layout
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Layout ID to clone
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the cloned layout
 *     responses:
 *       201:
 *         description: Layout cloned
 *       404:
 *         description: Source layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:id/clone', authMiddleware, cloneLayout);

export default router; 