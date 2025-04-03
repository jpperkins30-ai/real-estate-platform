import express, { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import Property from '../models/property.model';
import { authenticate } from '../middleware/auth';
import { authorize } from '../middleware/roleAuth';
import { PropertyFilters, PropertyStatus } from '../types/property';
import { logPropertyAction, logDbOperation, startPerformanceTimer } from '../utils/appLogger';
import { logError } from '../utils/logger';
import { TransformationPipeline } from '../services/transformation/TransformationPipeline';
import logger from '../utils/logger';

const router = express.Router();
const transformationPipeline = new TransformationPipeline();

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const dir = './uploads/properties';
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage });

/**
 * @swagger
 * /properties:
 *   get:
 *     summary: Get all properties with optional filtering
 *     tags: [Property]
 *     parameters:
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *         description: Filter by property type
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: minArea
 *         schema:
 *           type: number
 *         description: Minimum area in square meters
 *       - in: query
 *         name: maxArea
 *         schema:
 *           type: number
 *         description: Maximum area in square meters
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 properties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 */
router.get('/', async (req: Request, res: Response) => {
  const endTimer = startPerformanceTimer('property-list');
  
  try {
    const {
      propertyType,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      city,
      page = 1,
      limit = 20
    } = req.query;

    const filter: any = {};

    // Apply filters if they exist
    if (propertyType) filter.propertyType = propertyType;
    if (city) filter.city = { $regex: new RegExp(String(city), 'i') };
    if (minPrice) filter.price = { ...filter.price, $gte: Number(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: Number(maxPrice) };
    if (minArea) filter.area = { ...filter.area, $gte: Number(minArea) };
    if (maxArea) filter.area = { ...filter.area, $lte: Number(maxArea) };

    // Log database query
    logDbOperation('find', 'properties', filter);

    // Convert page and limit to numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);
    
    // Get total count for pagination
    const total = await Property.countDocuments(filter);
    
    // Calculate total pages
    const pages = Math.ceil(total / limitNum);
    
    // Get data with pagination
    const properties = await Property.find(filter)
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    logDbOperation('find-result', 'properties', filter, { 
      count: properties.length, 
      total, 
      page: pageNum, 
      limit: limitNum,
      responseTime: endTimer()
    });

    res.json({
      total,
      page: pageNum,
      pages,
      properties
    });
  } catch (error) {
    logger.error('Error fetching properties', error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /properties/{id}:
 *   get:
 *     summary: Get a property by ID
 *     tags: [Property]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  const endTimer = startPerformanceTimer('property-detail');
  
  try {
    const propertyId = req.params.id;
    
    logDbOperation('findById', 'properties', { id: propertyId });
    
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    logDbOperation('findById-result', 'properties', { id: propertyId }, {
      found: !!property,
      responseTime: endTimer()
    });
    
    res.json(property);
  } catch (error) {
    logger.error(`Error fetching property ${req.params.id}`, error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Property]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       400:
 *         description: Invalid property data
 */
router.post('/', authenticate, authorize(['admin', 'agent']), upload.array('images', 10), async (req: Request, res: Response) => {
  const endTimer = startPerformanceTimer('property-create');
  const userId = req.user?.id;
  
  try {
    // Transform and normalize the property data
    const transformedData = await transformationPipeline.transform(req.body);
    
    // Process uploaded images
    const files = req.files as Express.Multer.File[];
    const imageUrls = files.map(file => `/uploads/properties/${file.filename}`);
    
    // Create a new property with the transformed data
    const property = await Property.create({
      ...transformedData,
      images: imageUrls || transformedData.images,
      agent: userId,
    });
    
    logPropertyAction('create', property._id, userId, {
      propertyType: property.propertyType,
      price: property.price,
      responseTime: endTimer()
    });
    
    res.status(201).json(property);
  } catch (error) {
    logger.error('Error creating property', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /properties/{id}:
 *   put:
 *     summary: Update a property
 *     tags: [Property]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Property'
 *       404:
 *         description: Property not found
 */
router.put('/:id', authenticate, authorize(['admin', 'agent']), upload.array('newImages', 10), async (req: Request, res: Response) => {
  const endTimer = startPerformanceTimer('property-update');
  const userId = req.user?.id;
  const propertyId = req.params.id;
  
  try {
    // Verify property exists and user has permission
    const existingProperty = await Property.findById(propertyId);
    
    if (!existingProperty) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Only the property agent or admin can update
    if (userId !== existingProperty.agent.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this property' });
    }
    
    // Transform and normalize the property data
    const transformedData = await transformationPipeline.transform(req.body);
    
    // Process any new images
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const newImageUrls = files.map(file => `/uploads/properties/${file.filename}`);
      
      // If we have existing images to keep
      if (req.body.keepImages && Array.isArray(req.body.keepImages)) {
        transformedData.images = [...req.body.keepImages, ...newImageUrls];
      } else {
        transformedData.images = newImageUrls;
      }
    }
    
    // If status changed to SOLD, add soldDate
    if (transformedData.status === PropertyStatus.SOLD && existingProperty.status !== PropertyStatus.SOLD) {
      transformedData.soldDate = new Date();
    }
    
    // Update property
    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      transformedData,
      { new: true, runValidators: true }
    );

    logPropertyAction('update', propertyId, userId, {
      changes: Object.keys(transformedData),
      status: transformedData.status,
      responseTime: endTimer()
    });
    
    res.json(updatedProperty);
  } catch (error) {
    logger.error(`Error updating property ${propertyId}`, error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.message
      });
    }
    
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Property]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       404:
 *         description: Property not found
 */
router.delete('/:id', authenticate, authorize(['admin', 'agent']), async (req: Request, res: Response) => {
  const endTimer = startPerformanceTimer('property-delete');
  const userId = req.user?.id;
  const propertyId = req.params.id;
  
  try {
    // Verify property exists and user has permission
    const property = await Property.findById(propertyId);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Only the property agent or admin can delete
    if (userId !== property.agent.toString() && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this property' });
    }
    
    // Delete property images from disk
    if (property.images && property.images.length > 0) {
      property.images.forEach(imagePath => {
        const filePath = path.join(__dirname, '..', '..', '..', 'uploads', 'properties', path.basename(imagePath));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    // Delete property
    await Property.findByIdAndDelete(propertyId);
    
    logPropertyAction('delete', propertyId, userId, {
      responseTime: endTimer()
    });
    
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    logger.error(`Error deleting property ${propertyId}`, error);
    res.status(500).json({
      error: 'Server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 