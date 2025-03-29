// src/routes/properties.ts
import express, { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import Property from '../models/property.model';
import { propertyValidation } from '../middleware/validation';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';
import { TypedRequestHandler } from '../types/express';
import { PropertyRequestBody, PropertyIdParam, PropertyQueryParams, PropertyRequest } from '../types/properties';

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
// Note: This route must be defined BEFORE the '/:id' route to ensure it has precedence
router.get('/stats/county', authenticate(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { state } = req.query;
    
    const filter: any = {};
    if (state) filter.state = state;
    
    const stats = await Property.aggregate([
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
    ]);
    
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/properties:
 *   get:
 *     summary: Get properties with authentication
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of properties
 *       401:
 *         description: Unauthorized - Missing token
 *       403:
 *         description: Forbidden - Invalid token
 */
router.get('/', authenticate(), (req: Request, res: Response, next: NextFunction) => {
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

  try {
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
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   get:
 *     summary: Get a property by ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Property details
 *       401:
 *         description: Unauthorized - Missing token
 *       403:
 *         description: Forbidden - Invalid token
 *       404:
 *         description: Property not found
 */
router.get('/:id', authenticate(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/properties:
 *   post:
 *     summary: Create a new property
 *     tags: [Properties]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       201:
 *         description: Property created successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized - Missing token
 *       403:
 *         description: Forbidden - Invalid token
 */
router.post('/', authenticate(['admin']), propertyValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (handleValidationErrors(req, res)) {
      return;
    }

    const property = new Property(req.body);
    const savedProperty = await property.save();
    res.status(201).json(savedProperty);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   put:
 *     summary: Update a property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Property'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Unauthorized - Missing token
 *       403:
 *         description: Forbidden - Invalid token
 *       404:
 *         description: Property not found
 */
router.put('/:id', authenticate(['admin']), propertyValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (handleValidationErrors(req, res)) {
      return;
    }

    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json(property);
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /api/properties/{id}:
 *   delete:
 *     summary: Delete a property
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *       401:
 *         description: Unauthorized - Missing token
 *       403:
 *         description: Forbidden - Invalid token
 *       404:
 *         description: Property not found
 */
router.delete('/:id', authenticate(['admin']), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router; 