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
import layoutRoutes from './layoutRoutes';
import countyRoutes from './countyRoutes';
import userPreferencesRoutes from './userPreferencesRoutes';

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
 *   - name: Layout
 *     description: Layout configuration management
 *   - name: County
 *     description: County data and boundaries
 *   - name: UserPreferences
 *     description: User preferences management
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

// New layout and preferences routes
router.use('/layouts', layoutRoutes);
router.use('/counties', countyRoutes);
router.use('/user/preferences', userPreferencesRoutes);

export default router; 