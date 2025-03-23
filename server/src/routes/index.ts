import express from 'express';
import propertyRoutes from './property';
import authRoutes from './auth';
import userRoutes from './user';
import collectionRoutes from './collection';
import dataSourceRoutes from './data-source';
import healthRoutes from './health';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Health and status checks
 *   - name: Auth
 *     description: Authentication and authorization
 *   - name: User
 *     description: User management
 *   - name: Property
 *     description: Property data management
 *   - name: DataSource
 *     description: Data source management
 *   - name: Collection
 *     description: Data collection management
 */

// Register route modules
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/data-sources', dataSourceRoutes);
router.use('/collections', collectionRoutes);

export default router; 