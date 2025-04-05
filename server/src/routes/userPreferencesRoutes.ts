import { Router } from 'express';
import { getUserPreferences, updateUserPreferences, resetUserPreferences } from '../controllers/userPreferencesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// User preferences routes
router.get('/', getUserPreferences);
router.put('/', updateUserPreferences);
router.post('/reset', resetUserPreferences);

export default router; 