import { Router } from 'express';
import { getCountiesByState, getCounty, getCountyBoundaries, getCountyStats, getCountyControllerStatus } from '../controllers/countyController';

const router = Router();

// County routes
router.get('/state/:stateId', getCountiesByState);
router.get('/:countyId', getCounty);
router.get('/:countyId/boundaries', getCountyBoundaries);
router.get('/:countyId/stats', getCountyStats);
router.get('/:countyId/controller-status', getCountyControllerStatus);

export default router; 