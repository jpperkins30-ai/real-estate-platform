import { Router } from 'express';
import layoutRoutes from './layoutRoutes';
import countyRoutes from './countyRoutes';
import userPreferencesRoutes from './userPreferencesRoutes';

const router = Router();

router.use('/layouts', layoutRoutes);
router.use('/counties', countyRoutes);
router.use('/user/preferences', userPreferencesRoutes);

export default router; 