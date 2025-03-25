import { Request, Response, NextFunction } from 'express';
import { Property } from '../models/property.model';
import { County } from '../models/county.model';
import { State } from '../models/state.model';

/**
 * @swagger
 * components:
 *   schemas:
 *     PropertySearchQuery:
 *       type: object
 *       properties:
 *         stateId:
 *           type: string
 *           description: Filter properties by state ID
 *         countyId:
 *           type: string
 *           description: Filter properties by county ID
 *         status:
 *           type: string
 *           description: Filter by property status
 *         minValue:
 *           type: number
 *           description: Minimum property value
 *         maxValue:
 *           type: number
 *           description: Maximum property value
 *         propertyType:
 *           type: string
 *           description: Type of property
 *         condition:
 *           type: string
 *           description: Property condition
 *         minBedrooms:
 *           type: number
 *           description: Minimum number of bedrooms
 *         maxBedrooms:
 *           type: number
 *           description: Maximum number of bedrooms
 *         minBathrooms:
 *           type: number
 *           description: Minimum number of bathrooms
 *         maxBathrooms:
 *           type: number
 *           description: Maximum number of bathrooms
 *         minYearBuilt:
 *           type: number
 *           description: Minimum year built
 *         maxYearBuilt:
 *           type: number
 *           description: Maximum year built
 *         minLotSize:
 *           type: number
 *           description: Minimum lot size
 *         maxLotSize:
 *           type: number
 *           description: Maximum lot size
 *         taxLienStatus:
 *           type: string
 *           description: Tax lien status
 *         minSquareFeet:
 *           type: number
 *           description: Minimum square footage
 *         maxSquareFeet:
 *           type: number
 *           description: Maximum square footage
 *         zipCode:
 *           type: string
 *           description: Property zip code
 *         city:
 *           type: string
 *           description: Property city
 *         page:
 *           type: number
 *           description: Page number for pagination
 *         limit:
 *           type: number
 *           description: Number of results per page
 *         sortBy:
 *           type: string
 *           description: Field to sort by
 *         sortOrder:
 *           type: string
 *           enum: [asc, desc]
 *           description: Sort order (ascending or descending)
 *         parcelId:
 *           type: string
 *           description: Direct search by parcel ID
 *         taxAccountNumber:
 *           type: string
 *           description: Direct search by tax account number
 *         searchQuery:
 *           type: string
 *           description: General search query
 *         threshold:
 *           type: number
 *           description: Similarity threshold for fuzzy search
 */
interface PropertySearchQuery {
  stateId?: string;
  countyId?: string;
  status?: string;
  minValue?: number;
  maxValue?: number;
  propertyType?: string;
  condition?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minYearBuilt?: number;
  maxYearBuilt?: number;
  minLotSize?: number;
  maxLotSize?: number;
  taxLienStatus?: string;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  zipCode?: string;
  city?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Direct search parameters
  parcelId?: string;
  taxAccountNumber?: string;
  searchQuery?: string;
  threshold?: number;
}

/**
 * Middleware for building complex property search queries
 * Supports hierarchical filtering (state → county → property) and various property attributes
 * 
 * @swagger
 * components:
 *   schemas:
 *     PropertySearchResult:
 *       type: object
 *       properties:
 *         properties:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Property'
 *         total:
 *           type: integer
 *           description: Total number of matching properties
 *         page:
 *           type: integer
 *           description: Current page number
 *         limit:
 *           type: integer
 *           description: Number of results per page
 */
export const propertySearchMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract query parameters
    const {
      stateId,
      countyId,
      status,
      minValue,
      maxValue,
      propertyType,
      condition,
      minBedrooms,
      maxBedrooms,
      minBathrooms,
      maxBathrooms,
      minYearBuilt,
      maxYearBuilt,
      minLotSize,
      maxLotSize,
      taxLienStatus,
      minSquareFeet,
      maxSquareFeet,
      zipCode,
      city,
      page = 1,
      limit = 20,
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = req.query as unknown as PropertySearchQuery;

    // Build the query
    const query: any = {};

    // Handle hierarchical filtering
    if (stateId) {
      // If stateId is provided, get all counties in that state
      if (!countyId) {
        const counties = await County.find({ parentId: stateId }).select('_id').lean();
        const countyIds = counties.map(county => county._id);
        query.parentId = { $in: countyIds };
      }
    }

    if (countyId) {
      query.parentId = countyId;
    }

    // Handle property status
    if (status) {
      query.status = status;
    }

    // Handle property value range
    if (minValue !== undefined || maxValue !== undefined) {
      query['taxStatus.assessedValue'] = {};
      if (minValue !== undefined) {
        query['taxStatus.assessedValue'].$gte = Number(minValue);
      }
      if (maxValue !== undefined) {
        query['taxStatus.assessedValue'].$lte = Number(maxValue);
      }
    }

    // Handle property type and condition
    if (propertyType) {
      query['features.type'] = propertyType;
    }
    
    if (condition) {
      query['features.condition'] = condition;
    }

    // Handle bedrooms range
    if (minBedrooms !== undefined || maxBedrooms !== undefined) {
      query['features.bedrooms'] = {};
      if (minBedrooms !== undefined) {
        query['features.bedrooms'].$gte = Number(minBedrooms);
      }
      if (maxBedrooms !== undefined) {
        query['features.bedrooms'].$lte = Number(maxBedrooms);
      }
    }

    // Handle bathrooms range
    if (minBathrooms !== undefined || maxBathrooms !== undefined) {
      query['features.bathrooms'] = {};
      if (minBathrooms !== undefined) {
        query['features.bathrooms'].$gte = Number(minBathrooms);
      }
      if (maxBathrooms !== undefined) {
        query['features.bathrooms'].$lte = Number(maxBathrooms);
      }
    }

    // Handle year built range
    if (minYearBuilt !== undefined || maxYearBuilt !== undefined) {
      query['features.yearBuilt'] = {};
      if (minYearBuilt !== undefined) {
        query['features.yearBuilt'].$gte = Number(minYearBuilt);
      }
      if (maxYearBuilt !== undefined) {
        query['features.yearBuilt'].$lte = Number(maxYearBuilt);
      }
    }

    // Handle lot size range
    if (minLotSize !== undefined || maxLotSize !== undefined) {
      query['features.lotSize'] = {};
      if (minLotSize !== undefined) {
        query['features.lotSize'].$gte = Number(minLotSize);
      }
      if (maxLotSize !== undefined) {
        query['features.lotSize'].$lte = Number(maxLotSize);
      }
    }

    // Handle square feet range
    if (minSquareFeet !== undefined || maxSquareFeet !== undefined) {
      query['features.squareFeet'] = {};
      if (minSquareFeet !== undefined) {
        query['features.squareFeet'].$gte = Number(minSquareFeet);
      }
      if (maxSquareFeet !== undefined) {
        query['features.squareFeet'].$lte = Number(maxSquareFeet);
      }
    }

    // Handle tax lien status
    if (taxLienStatus) {
      query['taxStatus.taxLienStatus'] = taxLienStatus;
    }

    // Handle location-based filtering
    if (zipCode) {
      query['location.address.zipCode'] = zipCode;
    }

    if (city) {
      query['location.address.city'] = new RegExp(city, 'i'); // Case insensitive search
    }

    // Add the query to the request object for use in the controller
    req.propertySearchQuery = {
      query,
      pagination: {
        page: Number(page),
        limit: Math.min(Number(limit), 100) // Cap at 100 to prevent excessive queries
      },
      sort: {
        [sortBy]: sortOrder === 'asc' ? 1 : -1
      }
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to validate the property hierarchy (State → County → Property)
 * Ensures that the specified countyId belongs to the specified stateId
 * 
 * @swagger
 * components:
 *   parameters:
 *     PropertyHierarchyParams:
 *       name: filters
 *       in: query
 *       schema:
 *         type: object
 *         properties:
 *           stateId:
 *             type: string
 *             description: State ID
 *           countyId:
 *             type: string
 *             description: County ID
 */
export const validatePropertyHierarchy = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { propertyId, countyId, stateId } = req.params;

    // If only property ID is provided, we don't need to validate hierarchy
    if (propertyId && !countyId && !stateId) {
      return next();
    }

    // Get the property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    // If county ID is provided, validate that the property belongs to this county
    if (countyId) {
      if (property.parentId.toString() !== countyId) {
        return res.status(400).json({ message: 'Property does not belong to the specified county' });
      }

      // If state ID is also provided, validate that the county belongs to this state
      if (stateId) {
        const county = await County.findById(countyId);
        if (!county || county.parentId.toString() !== stateId) {
          return res.status(400).json({ message: 'County does not belong to the specified state' });
        }
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to prepare strings for fuzzy matching
 * Removes spaces, converts to lowercase, and filters non-alphanumeric characters
 */
const prepareForFuzzy = (str?: string): string => {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Middleware for direct property search by specific identifiers
 * Supports searching by parcelId or taxAccountNumber
 * 
 * @swagger
 * components:
 *   parameters:
 *     DirectSearchParams:
 *       name: directSearch
 *       in: query
 *       schema:
 *         type: object
 *         properties:
 *           parcelId:
 *             type: string
 *             description: Parcel ID for direct search
 *           taxAccountNumber:
 *             type: string
 *             description: Tax account number for direct search
 */
export const directPropertySearch = async (req: Request, res: Response, next: NextFunction) => {
  const { countyId, parcelId, taxAccountNumber, searchQuery } = req.query as unknown as PropertySearchQuery;
  
  // If neither parcelId nor taxAccountNumber is provided, skip direct search
  if (!parcelId && !taxAccountNumber && !searchQuery) {
    return next();
  }
  
  try {
    // Build search query
    const searchParams: any = {};
    
    if (countyId) {
      searchParams.parentId = countyId;
    }
    
    if (parcelId) {
      searchParams['identifiers.parcelId'] = parcelId;
    }
    
    if (taxAccountNumber) {
      searchParams['identifiers.taxAccountNumber'] = taxAccountNumber;
    }
    
    if (searchQuery) {
      // Perform a text search across multiple fields
      searchParams.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { 'location.address.street': { $regex: searchQuery, $options: 'i' } },
        { 'location.address.city': { $regex: searchQuery, $options: 'i' } },
        { 'owner.name': { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    // Execute search
    const properties = await Property.find(searchParams).limit(10);
    
    // If properties found, return them
    if (properties.length > 0) {
      return res.json({
        properties,
        searchMethod: 'direct',
        total: properties.length
      });
    }
    
    // If no properties found with direct search, continue to fuzzy search
    next();
  } catch (error) {
    console.error('Direct search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
};

/**
 * Endpoint for fuzzy property search
 * Finds properties with similar values using Levenshtein distance
 * 
 * @swagger
 * /api/properties/fuzzy-search:
 *   get:
 *     summary: Search properties using fuzzy matching
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: searchQuery
 *         schema:
 *           type: string
 *         description: General search query
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: number
 *           default: 0.7
 *         description: Similarity threshold (0.0 to 1.0)
 *       - in: query
 *         name: stateId
 *         schema:
 *           type: string
 *         description: State ID to limit search scope
 *       - in: query
 *         name: countyId
 *         schema:
 *           type: string
 *         description: County ID to limit search scope
 *     responses:
 *       200:
 *         description: List of properties matching the fuzzy search criteria
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 properties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Property'
 *                 total:
 *                   type: integer
 */
export const fuzzyPropertySearch = async (req: Request, res: Response) => {
  const { 
    countyId, 
    parcelId, 
    taxAccountNumber, 
    searchQuery, 
    threshold = 0.7 
  } = req.query as unknown as PropertySearchQuery;
  
  try {
    // Determine what to search for
    let searchValue = '';
    let searchField = '';
    
    if (parcelId) {
      searchValue = parcelId;
      searchField = 'identifiers.parcelId';
    } else if (taxAccountNumber) {
      searchValue = taxAccountNumber;
      searchField = 'identifiers.taxAccountNumber';
    } else if (searchQuery) {
      // If neither parcelId nor taxAccountNumber, use text search
      const possibleMatches = await Property.find({
        $or: [
          { 'owner.name': { $regex: searchQuery, $options: 'i' } },
          { 'location.address.street': { $regex: searchQuery, $options: 'i' } },
          { name: { $regex: searchQuery, $options: 'i' } }
        ]
      }).limit(20);
      
      if (possibleMatches.length > 0) {
        return res.json({
          properties: possibleMatches,
          searchMethod: 'fuzzy',
          total: possibleMatches.length
        });
      }
      
      return res.json({
        properties: [],
        searchMethod: 'fuzzy',
        total: 0
      });
    } else {
      return res.json({
        properties: [],
        searchMethod: 'fuzzy',
        total: 0,
        message: 'No search criteria provided'
      });
    }
    
    // Get search configuration if countyId provided
    let lookupMethod = null;
    if (countyId) {
      const county = await County.findById(countyId);
      // Check if county has searchConfig with a lookupMethod in additionalFilters
      if (county?.searchConfig?.searchCriteria?.additionalFilters?.lookupMethod) {
        lookupMethod = county.searchConfig.searchCriteria.additionalFilters.lookupMethod;
      }
    }
    
    // Get properties to search against
    let queryParams: any = {};
    if (countyId) {
      queryParams.parentId = countyId;
    }
    
    // If we know the lookup method, prioritize the right field
    if (lookupMethod) {
      if (lookupMethod === 'account_number' && searchField === 'identifiers.taxAccountNumber') {
        queryParams['identifiers.taxAccountNumber'] = { $exists: true };
      } else if (lookupMethod === 'parcel_id' && searchField === 'identifiers.parcelId') {
        queryParams['identifiers.parcelId'] = { $exists: true };
      }
    }
    
    const properties = await Property.find(queryParams).limit(1000).lean();
    
    // Prepare search value for fuzzy comparison
    const preparedSearchValue = prepareForFuzzy(searchValue);
    
    // Manual fuzzy search since we can't use external libraries directly
    // Filter results by similarity threshold
    const filteredResults = properties.filter(property => {
      // Extract the value to compare based on the searchField
      let propertyValue = '';
      
      // Use optional chaining and type assertion since this is coming from MongoDB
      if (searchField === 'identifiers.parcelId') {
        propertyValue = (property as any)?.identifiers?.parcelId || '';
      } else if (searchField === 'identifiers.taxAccountNumber') {
        propertyValue = (property as any)?.identifiers?.taxAccountNumber || '';
      }
      
      const preparedPropertyValue = prepareForFuzzy(propertyValue);
      const similarity = calculateSimilarity(preparedSearchValue, preparedPropertyValue);
      return similarity >= Number(threshold);
    });
    
    res.json({
      properties: filteredResults,
      searchMethod: 'fuzzy',
      total: filteredResults.length
    });
  } catch (error) {
    console.error('Fuzzy search error:', error);
    res.status(500).json({ error: 'Fuzzy search failed' });
  }
};

/**
 * Calculate similarity between two strings (simplified Levenshtein-based measure)
 */
function calculateSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1.0; // Both strings are empty
  
  const distance = levenshteinDistance(str1, str2);
  return 1.0 - (distance / maxLength);
}

/**
 * Levenshtein distance calculation
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  
  // Create matrix
  const d: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0));
  
  // Initialize first row and column
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return d[m][n];
}

// Extend Express Request interface to include the property search query
declare global {
  namespace Express {
    interface Request {
      propertySearchQuery: {
        query: any;
        pagination: {
          page: number;
          limit: number;
        };
        sort: Record<string, 1 | -1>;
      };
    }
  }
} 