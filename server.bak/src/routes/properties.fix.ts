// src/routes/properties.fix.ts
import express, { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../middleware/auth';
import Property from '../models/Property';
import { propertyValidation } from '../middleware/validation';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import routeHandler from '../utils/routeHandler';

const router = express.Router();

// Helper function to handle validation errors
const handleValidationErrors = (req: Request, res: Response): boolean => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return true;
  }
  return false;
};

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Retrieve properties with filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *       - in: query
 *         name: county
 *         schema:
 *           type: string
 *         description: Filter by county
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *         description: Filter by property type
 *       - in: query
 *         name: saleType
 *         schema:
 *           type: string
 *         description: Filter by sale type
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum sale price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum sale price
 *       - in: query
 *         name: searchTerm
 *         schema:
 *           type: string
 *         description: Search across multiple fields
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
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: lastUpdated
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: A list of properties with pagination info
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 */
router.get('/', authenticateToken, routeHandler((req: Request, res: Response, next: NextFunction) => {
  // Extract query parameters
  const { 
    state, 
    county, 
    propertyType, 
    saleType, 
    minPrice, 
    maxPrice, 
    searchTerm,
    page = '1', 
    limit = '20', 
    sort = 'lastUpdated', 
    order = 'desc'
  } = req.query;

  // Build filter conditions
  const filter: any = {};
  
  if (state) filter.state = state;
  if (county) filter.county = county;
  if (propertyType) filter.propertyType = propertyType;
  if (saleType) filter['saleInfo.saleType'] = saleType;
  
  if (minPrice) {
    filter['saleInfo.saleAmount'] = { $gte: Number(minPrice) };
  }
  
  if (maxPrice) {
    filter['saleInfo.saleAmount'] = { 
      ...filter['saleInfo.saleAmount'],
      $lte: Number(maxPrice) 
    };
  }
  
  // Text search across multiple fields
  if (searchTerm) {
    filter.$or = [
      { ownerName: { $regex: searchTerm, $options: 'i' } },
      { propertyAddress: { $regex: searchTerm, $options: 'i' } },
      { parcelId: { $regex: searchTerm, $options: 'i' } },
      { taxAccountNumber: { $regex: searchTerm, $options: 'i' } }
    ];
  }
  
  // Calculate pagination
  const pageNum = Number(page);
  const limitNum = Number(limit);
  const skip = (pageNum - 1) * limitNum;
  
  // Determine sort order
  const sortObj: any = {};
  sortObj[String(sort)] = order === 'desc' ? -1 : 1;
  
  // Use Promises instead of async/await for compatibility
  Property.find(filter)
    .sort(sortObj)
    .skip(skip)
    .limit(limitNum)
    .then(properties => {
      Property.countDocuments(filter)
        .then(total => {
          res.json({
            properties,
            pagination: {
              total,
              page: pageNum,
              limit: limitNum,
              pages: Math.ceil(total / limitNum)
            }
          });
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
}));

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get a property by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property details
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 *       404:
 *         description: Property not found
 */
router.get('/:id', authenticateToken, routeHandler((req: Request, res: Response) => {
  return Property.findById(req.params.id)
    .then(property => {
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      return res.json(property);
    });
}));

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - state
 *               - county
 *             properties:
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               county:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               propertyType:
 *                 type: string
 *               price:
 *                 type: number
 *               saleType:
 *                 type: string
 *                 enum: ['Tax Lien', 'Deed', 'Conventional']
 *     responses:
 *       201:
 *         description: Property created successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 */
router.post('/', authenticateToken, propertyValidation, routeHandler((req: Request, res: Response) => {
  if (handleValidationErrors(req, res)) {
    return;
  }

  const property = new Property(req.body);
  return property.save()
    .then(savedProperty => {
      return res.status(201).json(savedProperty);
    });
}));

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               county:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               propertyType:
 *                 type: string
 *               price:
 *                 type: number
 *               saleType:
 *                 type: string
 *                 enum: ['Tax Lien', 'Deed', 'Conventional']
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 *       404:
 *         description: Property not found
 */
router.put('/:id', authenticateToken, propertyValidation, routeHandler((req: Request, res: Response) => {
  if (handleValidationErrors(req, res)) {
    return;
  }

  return Property.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  )
    .then(property => {
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      return res.json(property);
    });
}));

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Invalid token
 *       404:
 *         description: Property not found
 */
router.delete('/:id', authenticateToken, routeHandler((req: Request, res: Response) => {
  return Property.findByIdAndDelete(req.params.id)
    .then(property => {
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      return res.json({ message: 'Property deleted successfully' });
    });
}));

/**
 * @swagger
 * /api/properties/stats/county:
 *   get:
 *     summary: Get property statistics by county
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filter by state
 *     responses:
 *       200:
 *         description: Property statistics by county
 *       500:
 *         description: Server error
 */
// Stats route needs to be defined before the /:id route or it will be treated as an ID parameter
router.get('/stats/county', routeHandler((req: Request, res: Response) => {
  const { state } = req.query;
  
  const filter: any = {};
  if (state) filter.state = state;
  
  return Property.aggregate([
    { $match: filter },
    { 
      $group: {
        _id: { state: '$state', county: '$county' },
        count: { $sum: 1 },
        avgPrice: { $avg: '$saleInfo.saleAmount' },
        minPrice: { $min: '$saleInfo.saleAmount' },
        maxPrice: { $max: '$saleInfo.saleAmount' },
        propertyTypes: { $addToSet: '$propertyType' }
      }
    },
    {
      $project: {
        _id: 0,
        state: '$_id.state',
        county: '$_id.county',
        count: 1,
        avgPrice: 1,
        minPrice: 1,
        maxPrice: 1,
        propertyTypes: 1
      }
    },
    { $sort: { state: 1, county: 1 } }
  ])
    .then(stats => {
      return res.json(stats);
    });
}));

export default router; 