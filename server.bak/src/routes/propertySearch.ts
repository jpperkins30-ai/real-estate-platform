import { Router, Request, Response, NextFunction } from 'express';
import { query, ValidationChain } from 'express-validator';
import Property from '../models/Property';
import { authenticateToken } from '../middleware/auth';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

interface SearchQuery {
  minPrice?: string;
  maxPrice?: string;
  state?: string;
  city?: string;
  county?: string;
  zipCode?: string;
  propertyType?: string;
  saleType?: string;
  status?: string;
  minBedrooms?: string;
  maxBedrooms?: string;
  minBathrooms?: string;
  maxBathrooms?: string;
  minLotSize?: string;
  maxLotSize?: string;
  minYearBuilt?: string;
  maxYearBuilt?: string;
  features?: string[];
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
}

const router = Router();

type RequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any, ReqQuery = ParsedQs> = (
  req: Request<P, ResBody, ReqBody, ReqQuery>,
  res: Response<ResBody>,
  next: NextFunction
) => Promise<void>;

// Validation rules for search parameters
const searchValidation: ValidationChain[] = [
  query('minPrice')
    .optional()
    .isNumeric()
    .withMessage('Minimum price must be a number'),

  query('maxPrice')
    .optional()
    .isNumeric()
    .withMessage('Maximum price must be a number'),

  query('state')
    .optional()
    .isLength({ min: 2, max: 2 })
    .withMessage('State must be a 2-letter code'),

  query('city')
    .optional()
    .isString()
    .withMessage('City must be a string'),

  query('county')
    .optional()
    .isString()
    .withMessage('County must be a string'),

  query('zipCode')
    .optional()
    .matches(/^\d{5}(-\d{4})?$/)
    .withMessage('Invalid zip code format'),

  query('propertyType')
    .optional()
    .isIn(['Single Family', 'Multi Family', 'Condo', 'Townhouse', 'Land', 'Commercial', 'Industrial', 'Agricultural'])
    .withMessage('Invalid property type'),

  query('saleType')
    .optional()
    .isIn(['Tax Lien', 'Deed', 'Conventional'])
    .withMessage('Invalid sale type'),

  query('status')
    .optional()
    .isIn(['Available', 'Under Contract', 'Sold', 'Off Market'])
    .withMessage('Invalid status'),

  query('minBedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum bedrooms must be a non-negative integer'),

  query('maxBedrooms')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Maximum bedrooms must be a non-negative integer'),

  query('minBathrooms')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum bathrooms must be a non-negative number'),

  query('maxBathrooms')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum bathrooms must be a non-negative number'),

  query('minLotSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum lot size must be a positive number'),

  query('maxLotSize')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum lot size must be a positive number'),

  query('minYearBuilt')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Invalid minimum year built'),

  query('maxYearBuilt')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Invalid maximum year built'),

  query('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('sortBy')
    .optional()
    .isIn(['price', 'createdAt', 'updatedAt', 'yearBuilt', 'lotSize', 'bedrooms', 'bathrooms'])
    .withMessage('Invalid sort field'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

/**
 * @swagger
 * /api/properties/search:
 *   get:
 *     summary: Search properties with filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *       - in: query
 *         name: county
 *         schema:
 *           type: string
 *       - in: query
 *         name: zipCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *           enum: [Single Family, Multi Family, Condo, Townhouse, Land, Commercial, Industrial, Agricultural]
 *       - in: query
 *         name: saleType
 *         schema:
 *           type: string
 *           enum: [Tax Lien, Deed, Conventional]
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Available, Under Contract, Sold, Off Market]
 *       - in: query
 *         name: minBedrooms
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxBedrooms
 *         schema:
 *           type: integer
 *       - in: query
 *         name: minBathrooms
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxBathrooms
 *         schema:
 *           type: number
 *       - in: query
 *         name: minLotSize
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxLotSize
 *         schema:
 *           type: number
 *       - in: query
 *         name: minYearBuilt
 *         schema:
 *           type: integer
 *       - in: query
 *         name: maxYearBuilt
 *         schema:
 *           type: integer
 *       - in: query
 *         name: features
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [price, createdAt, updatedAt, yearBuilt, lotSize, bedrooms, bathrooms]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: List of properties matching the search criteria
 *       400:
 *         description: Invalid search parameters
 */
const searchProperties = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      minPrice,
      maxPrice,
      state,
      city,
      county,
      zipCode,
      propertyType,
      saleType,
      status,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minLotSize,
      maxLotSize,
      minYearBuilt,
      maxYearBuilt,
      features,
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query: any = {};
    
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    
    if (state) query.state = state;
    if (city) query.city = city;
    if (county) query.county = county;
    if (zipCode) query.zipCode = zipCode;
    if (propertyType) query.propertyType = propertyType;
    if (saleType) query.saleType = saleType;
    if (status) query.status = status;

    if (minBedrooms || maxBedrooms) {
      query.bedrooms = {};
      if (minBedrooms) query.bedrooms.$gte = Number(minBedrooms);
      if (maxBedrooms) query.bedrooms.$lte = Number(maxBedrooms);
    }

    if (minBathrooms || maxBathrooms) {
      query.bathrooms = {};
      if (minBathrooms) query.bathrooms.$gte = Number(minBathrooms);
      if (maxBathrooms) query.bathrooms.$lte = Number(maxBathrooms);
    }

    if (minLotSize || maxLotSize) {
      query.lotSize = {};
      if (minLotSize) query.lotSize.$gte = Number(minLotSize);
      if (maxLotSize) query.lotSize.$lte = Number(maxLotSize);
    }

    if (minYearBuilt || maxYearBuilt) {
      query.yearBuilt = {};
      if (minYearBuilt) query.yearBuilt.$gte = Number(minYearBuilt);
      if (maxYearBuilt) query.yearBuilt.$lte = Number(maxYearBuilt);
    }

    if (features && Array.isArray(features)) {
      query.features = { $all: features };
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query with pagination and sorting
    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / Number(limit));
    const hasNextPage = Number(page) < totalPages;
    const hasPrevPage = Number(page) > 1;

    res.json({
      properties,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    next(error);
  }
};

router.get('/', authenticateToken, searchValidation, searchProperties);

export default router; 