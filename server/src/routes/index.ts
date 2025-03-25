import express from 'express';
import authRoutes from './auth';
import userRoutes from './user';
import propertyRoutes from './properties';
import collectionRoutes from './collection';
import dataSourceRoutes from './data-source';
import healthRoutes from './health';
import controllerRoutes from './controller.routes';
import exportRoutes from './export.routes';
import taxLienRoutes from './tax-lien.routes';

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
 *   - name: TaxLien
 *     description: Tax lien status checking
 */

// Base routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/properties', propertyRoutes);
router.use('/collections', collectionRoutes);
router.use('/data-sources', dataSourceRoutes);
router.use('/controllers', controllerRoutes.main);
router.use('/controller-types', controllerRoutes.types);
router.use('/collector-types', controllerRoutes.collectorTypes);
router.use('/exports', exportRoutes);
router.use('/tax-liens', taxLienRoutes);

export default router; 