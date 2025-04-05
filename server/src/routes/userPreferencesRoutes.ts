import { Router } from 'express';
import { getUserPreferences, updateUserPreferences, resetUserPreferences } from '../controllers/userPreferencesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /user/preferences:
 *   get:
 *     summary: Get user preferences
 *     description: Retrieves preferences for the current user
 *     tags: [User Preferences]
 *     responses:
 *       200:
 *         description: User preferences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreferences'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', getUserPreferences);

/**
 * @swagger
 * /user/preferences:
 *   put:
 *     summary: Update user preferences
 *     description: Updates preferences for the current user
 *     tags: [User Preferences]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPreferences'
 *     responses:
 *       200:
 *         description: Updated user preferences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreferences'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/', updateUserPreferences);

/**
 * @swagger
 * /user/preferences/reset:
 *   post:
 *     summary: Reset user preferences
 *     description: Resets preferences to defaults for the current user
 *     tags: [User Preferences]
 *     responses:
 *       200:
 *         description: Reset user preferences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreferences'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/reset', resetUserPreferences);

export default router; 