I'll help you create Chunk 9: Swagger & GitHub Workflow Integration following the template format from Chunk 7, while addressing all the recommendations and requirements you've outlined.

# 🧩 Chunk 9: Swagger & GitHub Workflow Integration

✅ **Status**: Ready for Implementation  
📅 **Target Completion**: [YYYY-MM-DD]  
📄 **Doc Path**: /docs/components/multi-frame/chunk-9-swagger-github-workflow.md

## 🎯 Objective

Implement comprehensive API documentation using Swagger and set up improved GitHub workflow integration to streamline the development process. This chunk establishes standardized API endpoints, proper documentation, and smooth integration with the existing CI/CD pipeline.

## 🧭 Implementation Workflow

### 🔧 BEFORE YOU BEGIN

Create your Git branch:
```bash
git checkout main
git pull
git checkout -b feature/swagger-github-workflow
```

Required folders:
```
server/src/swagger/
server/src/middlewares/
server/src/routes/
.github/workflows/
```

Install necessary packages:
```bash
# Server-side
npm install --save swagger-jsdoc swagger-ui-express
npm install --save-dev @types/swagger-jsdoc @types/swagger-ui-express

# Optional utility packages
npm install --save lodash cors
```

### 🏗️ DURING IMPLEMENTATION

#### 1. Create Swagger Configuration

📄 **server/src/swagger/config.ts**
```typescript
import swaggerJSDoc from 'swagger-jsdoc';
import { version } from '../../package.json';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Real Estate Platform API',
      version,
      description: 'API documentation for the Real Estate Platform',
      contact: {
        name: 'Development Team',
        email: 'dev@example.com'
      },
      license: {
        name: 'Private',
        url: 'https://example.com'
      }
    },
    servers: [
      {
        url: '/api',
        description: 'API Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          required: ['message'],
          properties: {
            message: {
              type: 'string'
            },
            error: {
              type: 'string'
            },
            statusCode: {
              type: 'integer'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  // Path to the API docs
  apis: [
    './src/routes/*.ts',
    './src/models/*.ts',
    './src/controllers/*.ts',
    './src/swagger/definitions/*.ts'
  ]
};

export const swaggerSpec = swaggerJSDoc(options);
```

#### 2. Create Swagger Middleware

📄 **server/src/middlewares/swaggerMiddleware.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../swagger/config';

export const setupSwagger = (app) => {
  // Serve swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve swagger spec as JSON
  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  console.log('Swagger documentation initialized at /api-docs');
};

// Middleware to include requestId in each request for better tracking
export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.locals.requestId = requestId;
  next();
};
```

#### 3. Create Swagger Schema Definitions

📄 **server/src/swagger/definitions/layout.definition.ts**
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     PanelPosition:
 *       type: object
 *       properties:
 *         row:
 *           type: integer
 *           description: Row position in the layout grid
 *         col:
 *           type: integer
 *           description: Column position in the layout grid
 *       required:
 *         - row
 *         - col
 *       example:
 *         row: 0
 *         col: 1
 *     
 *     PanelSize:
 *       type: object
 *       properties:
 *         width:
 *           type: number
 *           description: Width as a percentage of the container width
 *         height:
 *           type: number
 *           description: Height as a percentage of the container height
 *       required:
 *         - width
 *         - height
 *       example:
 *         width: 50
 *         height: 50
 *     
 *     PanelConfig:
 *       type: object
 *       required:
 *         - id
 *         - contentType
 *         - title
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the panel
 *         contentType:
 *           type: string
 *           enum: [map, property, filter, stats, chart, list, state, county]
 *           description: Type of content displayed in the panel
 *         title:
 *           type: string
 *           description: Panel title displayed in the header
 *         position:
 *           $ref: '#/components/schemas/PanelPosition'
 *         size:
 *           $ref: '#/components/schemas/PanelSize'
 *         state:
 *           type: object
 *           description: Current state of the panel content
 *         visible:
 *           type: boolean
 *           default: true
 *           description: Whether the panel is visible
 *       example:
 *         id: map-panel
 *         contentType: map
 *         title: US Map
 *         position:
 *           row: 0
 *           col: 0
 *         size:
 *           width: 50
 *           height: 50
 *     
 *     LayoutConfig:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - panels
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier for the layout
 *         name:
 *           type: string
 *           description: Name of the layout
 *         description:
 *           type: string
 *           description: Description of the layout
 *         type:
 *           type: string
 *           enum: [single, dual, tri, quad]
 *           description: Layout type
 *         panels:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PanelConfig'
 *           description: Panels in the layout
 *         isDefault:
 *           type: boolean
 *           default: false
 *           description: Whether this is the default layout
 *         isPublic:
 *           type: boolean
 *           default: false
 *           description: Whether this layout is public
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */
```

📄 **server/src/swagger/definitions/preferences.definition.ts**
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     ThemePreferences:
 *       type: object
 *       properties:
 *         colorMode:
 *           type: string
 *           enum: [light, dark, system]
 *           description: Color theme mode
 *         mapStyle:
 *           type: string
 *           enum: [standard, satellite, terrain]
 *           description: Map visualization style
 *         accentColor:
 *           type: string
 *           description: Accent color in hex format
 *         fontSize:
 *           type: string
 *           enum: [small, medium, large]
 *           description: Base font size
 *       required:
 *         - colorMode
 *         - mapStyle
 *       example:
 *         colorMode: system
 *         mapStyle: standard
 *         accentColor: "#2196f3"
 *         fontSize: medium
 *     
 *     PanelPreferences:
 *       type: object
 *       properties:
 *         defaultContentTypes:
 *           type: object
 *           additionalProperties:
 *             type: string
 *           description: Default content types for panel positions
 *         showPanelHeader:
 *           type: boolean
 *           description: Whether to show panel headers
 *         enablePanelResizing:
 *           type: boolean
 *           description: Whether panel resizing is enabled
 *         enablePanelDragging:
 *           type: boolean
 *           description: Whether panel dragging is enabled
 *       example:
 *         defaultContentTypes:
 *           top-left: map
 *           top-right: state
 *           bottom-left: county
 *           bottom-right: property
 *         showPanelHeader: true
 *         enablePanelResizing: true
 *         enablePanelDragging: true
 *     
 *     LayoutPreferences:
 *       type: object
 *       properties:
 *         defaultLayout:
 *           type: string
 *           description: ID of the default layout
 *         saveLayoutOnExit:
 *           type: boolean
 *           description: Whether to save layout on exit
 *         rememberLastLayout:
 *           type: boolean
 *           description: Whether to use the last layout on start
 *       example:
 *         defaultLayout: default-quad
 *         saveLayoutOnExit: true
 *         rememberLastLayout: true
 *     
 *     FilterPreferences:
 *       type: object
 *       properties:
 *         defaultFilters:
 *           type: object
 *           description: Default filter values
 *         showFilterPanel:
 *           type: boolean
 *           description: Whether to show filter panel by default
 *         applyFiltersAutomatically:
 *           type: boolean
 *           description: Whether to apply filters automatically
 *       example:
 *         defaultFilters: {}
 *         showFilterPanel: true
 *         applyFiltersAutomatically: true
 *     
 *     UserPreferences:
 *       type: object
 *       required:
 *         - theme
 *         - panel
 *         - layout
 *         - filter
 *       properties:
 *         theme:
 *           $ref: '#/components/schemas/ThemePreferences'
 *         panel:
 *           $ref: '#/components/schemas/PanelPreferences'
 *         layout:
 *           $ref: '#/components/schemas/LayoutPreferences'
 *         filter:
 *           $ref: '#/components/schemas/FilterPreferences'
 */
```

📄 **server/src/swagger/definitions/county.definition.ts**
```typescript
/**
 * @swagger
 * components:
 *   schemas:
 *     County:
 *       type: object
 *       required:
 *         - name
 *         - stateId
 *         - fips
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the county
 *         name:
 *           type: string
 *           description: County name
 *         stateId:
 *           type: string
 *           description: Reference to the state
 *         fips:
 *           type: string
 *           description: FIPS code
 *         boundaries:
 *           type: object
 *           description: GeoJSON boundaries
 *         population:
 *           type: number
 *           description: Population count
 *         medianIncome:
 *           type: number
 *           description: Median household income
 *         medianHomeValue:
 *           type: number
 *           description: Median home value
 *         unemploymentRate:
 *           type: number
 *           description: Unemployment rate percentage
 *         propertyCount:
 *           type: number
 *           description: Number of properties in the county
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "5f8b0a7f6e3b1d0017e98b3a"
 *         name: "King County"
 *         stateId: "5f8b0a7f6e3b1d0017e98b39"
 *         fips: "53033"
 *         population: 2252782
 *         medianIncome: 95009
 *         medianHomeValue: 629000
 *         unemploymentRate: 3.8
 *         propertyCount: 875421
 *     
 *     CountyStats:
 *       type: object
 *       properties:
 *         propertyCount:
 *           type: number
 *           description: Total number of properties
 *         avgPrice:
 *           type: number
 *           description: Average property price
 *         medianPrice:
 *           type: number
 *           description: Median property price
 *         priceChange:
 *           type: number
 *           description: Price change percentage (year over year)
 *         salesVolume:
 *           type: number
 *           description: Total sales volume
 *         daysOnMarket:
 *           type: number
 *           description: Average days on market
 *         inventoryCount:
 *           type: number
 *           description: Current inventory count
 *         monthsOfInventory:
 *           type: number
 *           description: Months of inventory
 *       example:
 *         propertyCount: 45321
 *         avgPrice: 485000
 *         medianPrice: 425000
 *         priceChange: 5.2
 *         salesVolume: 532000000
 *         daysOnMarket: 28
 *         inventoryCount: 1245
 *         monthsOfInventory: 2.4
 */
```

#### 4. Create API Routes with Swagger Documentation

📄 **server/src/routes/layoutRoutes.ts**
```typescript
import { Router } from 'express';
import { getLayouts, getLayout, createLayout, updateLayout, deleteLayout, cloneLayout } from '../controllers/layoutController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /layouts:
 *   get:
 *     summary: Get all layouts for the current user
 *     description: Retrieves all layout configurations belonging to the current user
 *     tags: [Layouts]
 *     parameters:
 *       - in: query
 *         name: isPublic
 *         schema:
 *           type: boolean
 *         description: Include public layouts
 *     responses:
 *       200:
 *         description: An array of layout configurations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LayoutConfig'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getLayouts);

/**
 * @swagger
 * /layouts/{id}:
 *   get:
 *     summary: Get a specific layout
 *     description: Retrieves a specific layout configuration by ID
 *     tags: [Layouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Layout ID
 *     responses:
 *       200:
 *         description: The layout configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LayoutConfig'
 *       404:
 *         description: Layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', getLayout);

/**
 * @swagger
 * /layouts:
 *   post:
 *     summary: Create a new layout
 *     description: Creates a new layout configuration
 *     tags: [Layouts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LayoutConfig'
 *     responses:
 *       201:
 *         description: Created layout configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LayoutConfig'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', createLayout);

/**
 * @swagger
 * /layouts/{id}:
 *   put:
 *     summary: Update a layout
 *     description: Updates an existing layout configuration
 *     tags: [Layouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Layout ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LayoutConfig'
 *     responses:
 *       200:
 *         description: Updated layout configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LayoutConfig'
 *       404:
 *         description: Layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/:id', updateLayout);

/**
 * @swagger
 * /layouts/{id}:
 *   delete:
 *     summary: Delete a layout
 *     description: Deletes a layout configuration
 *     tags: [Layouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Layout ID
 *     responses:
 *       200:
 *         description: Layout deleted successfully
 *       404:
 *         description: Layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete('/:id', deleteLayout);

/**
 * @swagger
 * /layouts/{id}/clone:
 *   post:
 *     summary: Clone a layout
 *     description: Creates a new layout based on an existing one
 *     tags: [Layouts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Layout ID to clone
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name for the cloned layout
 *     responses:
 *       201:
 *         description: Cloned layout configuration
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LayoutConfig'
 *       404:
 *         description: Layout not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/:id/clone', cloneLayout);

export default router;
```

📄 **server/src/routes/userPreferencesRoutes.ts**
```typescript
import { Router } from 'express';
import { getUserPreferences, updateUserPreferences, resetUserPreferences } from '../controllers/userPreferencesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /user/preferences:
 *   get:
 *     summary: Get user preferences
 *     description: Retrieves preferences for the current user
 *     tags: [User Preferences]
 *     responses:
 *       200:
 *         description: User preferences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreferences'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', getUserPreferences);

/**
 * @swagger
 * /user/preferences:
 *   put:
 *     summary: Update user preferences
 *     description: Updates preferences for the current user
 *     tags: [User Preferences]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserPreferences'
 *     responses:
 *       200:
 *         description: Updated user preferences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreferences'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.put('/', updateUserPreferences);

/**
 * @swagger
 * /user/preferences/reset:
 *   post:
 *     summary: Reset user preferences
 *     description: Resets preferences to defaults for the current user
 *     tags: [User Preferences]
 *     responses:
 *       200:
 *         description: Reset user preferences
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreferences'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/reset', resetUserPreferences);

export default router;
```

📄 **server/src/routes/countyRoutes.ts**
```typescript
import { Router } from 'express';
import { getCounties, getCounty, getCountyStats, getCountyProperties } from '../controllers/countyController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * @swagger
 * /counties:
 *   get:
 *     summary: Get all counties
 *     description: Retrieves a list of counties, with optional filtering
 *     tags: [Counties]
 *     parameters:
 *       - in: query
 *         name: stateId
 *         schema:
 *           type: string
 *         description: Filter by state ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of counties to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: A list of counties
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 counties:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/County'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', getCounties);

/**
 * @swagger
 * /counties/{id}:
 *   get:
 *     summary: Get a county
 *     description: Retrieves a specific county by ID
 *     tags: [Counties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: County ID
 *     responses:
 *       200:
 *         description: The county
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/County'
 *       404:
 *         description: County not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id', getCounty);

/**
 * @swagger
 * /counties/{id}/stats:
 *   get:
 *     summary: Get county stats
 *     description: Retrieves statistics for a specific county
 *     tags: [Counties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: County ID
 *       - in: query
 *         name: timeframe
 *         schema:
 *           type: string
 *           enum: [1m, 3m, 6m, 1y, 3y, 5y, all]
 *           default: 1y
 *         description: Stats timeframe
 *     responses:
 *       200:
 *         description: County statistics
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CountyStats'
 *       404:
 *         description: County not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/stats', getCountyStats);

/**
 * @swagger
 * /counties/{id}/properties:
 *   get:
 *     summary: Get county properties
 *     description: Retrieves properties in a specific county
 *     tags: [Counties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: County ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of properties to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, date_asc, date_desc]
 *           default: date_desc
 *         description: Sort order
 *       - in: query
 *         name: propertyType
 *         schema:
 *           type: string
 *         description: Filter by property type
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price
 *     responses:
 *       200:
 *         description: County properties
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
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *       404:
 *         description: County not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/:id/properties', getCountyProperties);

export default router;
```

#### 5. Create County Controller Implementation

📄 **server/src/controllers/countyController.ts**
```typescript
import { Request, Response } from 'express';
import { County } from '../models/County';
import { Property } from '../models/Property';

/**
 * Get all counties
 */
export const getCounties = async (req: Request, res: Response) => {
  try {
    const { stateId, limit = 100, page = 1 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build query
    const query: any = {};
    if (stateId) {
      query.stateId = stateId;
    }
    
    // Execute query with pagination
    const [counties, total] = await Promise.all([
      County.find(query)
        .sort({ name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      County.countDocuments(query)
    ]);
    
    res.status(200).json({
      counties,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error('Error fetching counties:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a specific county
 */
export const getCounty = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const county = await County.findById(id);
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    res.status(200).json(county);
  } catch (error) {
    console.error(`Error fetching county ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get county statistics
 */
export const getCountyStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { timeframe = '
I'll continue writing the county controller implementation:

```typescript
export const getCountyStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { timeframe = '1y' } = req.query;
    
    // Check if county exists
    const county = await County.findById(id);
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '1m':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3m':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '6m':
        startDate = new Date(now.setMonth(now.getMonth() - 6));
        break;
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      case '3y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 3));
        break;
      case '5y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 5));
        break;
      case 'all':
      default:
        startDate = new Date(0); // Beginning of time
        break;
    }
    
    // Get all properties in this county within the timeframe
    const properties = await Property.find({
      countyId: id,
      listDate: { $gte: startDate }
    });
    
    // Calculate statistics
    const stats = {
      propertyCount: properties.length,
      avgPrice: 0,
      medianPrice: 0,
      priceChange: 0,
      salesVolume: 0,
      daysOnMarket: 0,
      inventoryCount: 0,
      monthsOfInventory: 0
    };
    
    if (properties.length > 0) {
      // Calculate avg price
      const totalPrice = properties.reduce((sum, prop) => sum + prop.price, 0);
      stats.avgPrice = Math.round(totalPrice / properties.length);
      
      // Calculate median price
      const sortedPrices = properties.map(p => p.price).sort((a, b) => a - b);
      const midIndex = Math.floor(sortedPrices.length / 2);
      stats.medianPrice = sortedPrices.length % 2 === 0
        ? Math.round((sortedPrices[midIndex - 1] + sortedPrices[midIndex]) / 2)
        : sortedPrices[midIndex];
      
      // Calculate days on market
      const totalDays = properties.reduce((sum, prop) => {
        const listDate = new Date(prop.listDate);
        const soldDate = prop.soldDate ? new Date(prop.soldDate) : new Date();
        const days = Math.round((soldDate.getTime() - listDate.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
      }, 0);
      stats.daysOnMarket = Math.round(totalDays / properties.length);
      
      // Calculate price change (simplified for this example)
      // In a real implementation, you would compare to previous period
      stats.priceChange = 5.2; // Example value
      
      // Calculate sales volume
      const soldProperties = properties.filter(p => p.status === 'sold');
      stats.salesVolume = soldProperties.reduce((sum, prop) => sum + prop.price, 0);
      
      // Calculate inventory count
      stats.inventoryCount = properties.filter(p => p.status === 'active').length;
      
      // Calculate months of inventory
      const monthlySales = soldProperties.length / (timeframe === '1m' ? 1 : 
                          timeframe === '3m' ? 3 : 
                          timeframe === '6m' ? 6 : 
                          timeframe === '1y' ? 12 : 
                          timeframe === '3y' ? 36 : 
                          timeframe === '5y' ? 60 : 12);
      
      stats.monthsOfInventory = monthlySales > 0 
        ? parseFloat((stats.inventoryCount / monthlySales).toFixed(1)) 
        : 0;
    }
    
    res.status(200).json(stats);
  } catch (error) {
    console.error(`Error fetching stats for county ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get county properties
 */
export const getCountyProperties = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      limit = 50, 
      page = 1, 
      sort = 'date_desc',
      propertyType,
      minPrice,
      maxPrice
    } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    // Check if county exists
    const county = await County.findById(id);
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    // Build query
    const query: any = { countyId: id };
    
    // Apply filters
    if (propertyType) {
      query.propertyType = propertyType;
    }
    
    if (minPrice) {
      query.price = { ...query.price, $gte: Number(minPrice) };
    }
    
    if (maxPrice) {
      query.price = { ...query.price, $lte: Number(maxPrice) };
    }
    
    // Determine sort order
    let sortOptions = {};
    switch (sort) {
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'date_asc':
        sortOptions = { listDate: 1 };
        break;
      case 'date_desc':
      default:
        sortOptions = { listDate: -1 };
        break;
    }
    
    // Execute query with pagination
    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(query)
    ]);
    
    res.status(200).json({
      properties,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    console.error(`Error fetching properties for county ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

#### 6. Create County Model Implementation

📄 **server/src/models/County.ts**
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ICounty extends Document {
  name: string;
  stateId: mongoose.Types.ObjectId;
  fips: string;
  boundaries?: any; // GeoJSON object
  population?: number;
  medianIncome?: number;
  medianHomeValue?: number;
  unemploymentRate?: number;
  propertyCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CountySchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  stateId: {
    type: Schema.Types.ObjectId,
    ref: 'State',
    required: true,
    index: true
  },
  fips: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  boundaries: {
    type: Schema.Types.Mixed,
    default: null
  },
  population: {
    type: Number,
    default: 0
  },
  medianIncome: {
    type: Number,
    default: 0
  },
  medianHomeValue: {
    type: Number,
    default: 0
  },
  unemploymentRate: {
    type: Number,
    default: 0
  },
  propertyCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update timestamps
CountySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create a geospatial index on boundaries
CountySchema.index({ boundaries: '2dsphere' });

export const County = mongoose.model<ICounty>('County', CountySchema);
```

#### 7. Create GitHub Workflow Files

📄 **.github/workflows/pr-checks.yml**
```yaml
name: Pull Request Checks

on:
  pull_request:
    branches: [ main, development ]
    paths:
      - '**.ts'
      - '**.tsx'
      - '**.js'
      - '**.jsx'
      - '**.json'
      - 'package.json'
      - 'package-lock.json'
      - '.github/workflows/**'

jobs:
  validate:
    name: Validate Code
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint code
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Run tests
        run: npm test
  
  build:
    name: Build Check
    runs-on: ubuntu-latest
    needs: validate
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
```

📄 **.github/workflows/api-docs.yml**
```yaml
name: Generate API Documentation

on:
  push:
    branches: [ main ]
    paths:
      - 'server/src/routes/**'
      - 'server/src/models/**'
      - 'server/src/controllers/**'
      - 'server/src/swagger/**'
      - '.github/workflows/api-docs.yml'

jobs:
  build-docs:
    name: Build and Deploy API Docs
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd server
          npm ci
      
      - name: Generate Swagger JSON
        run: |
          cd server
          npm run generate-swagger
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./server/docs
          publish_branch: gh-pages
          destination_dir: api-docs
```

#### 8. Implement Improved State Management with Context Boundaries

📄 **client/src/context/LayoutContext.tsx**
```typescript
import React, { createContext, useReducer, useContext } from 'react';
import { LayoutType, PanelConfig } from '../types/layout.types';

// Define the state type
interface LayoutState {
  layoutType: LayoutType;
  panels: Record<string, PanelConfig>;
  panelOrder: string[]; // Maintain panel order
  isInitialized: boolean;
}

// Define action types
type LayoutAction = 
  | { type: 'SET_LAYOUT_TYPE'; payload: LayoutType }
  | { type: 'REGISTER_PANEL'; payload: PanelConfig }
  | { type: 'UNREGISTER_PANEL'; payload: string }
  | { type: 'UPDATE_PANEL_POSITION'; payload: { id: string; position: { row: number; col: number } } }
  | { type: 'UPDATE_PANEL_SIZE'; payload: { id: string; size: { width: number; height: number } } }
  | { type: 'REORDER_PANELS'; payload: string[] }
  | { type: 'LOAD_LAYOUT'; payload: { layoutType: LayoutType; panels: PanelConfig[] } };

// Initial state
const initialState: LayoutState = {
  layoutType: 'single',
  panels: {},
  panelOrder: [],
  isInitialized: false
};

// Create context
interface LayoutContextType {
  state: LayoutState;
  dispatch: React.Dispatch<LayoutAction>;
  setLayoutType: (type: LayoutType) => void;
  registerPanel: (panel: PanelConfig) => void;
  unregisterPanel: (id: string) => void;
  updatePanelPosition: (id: string, position: { row: number; col: number }) => void;
  updatePanelSize: (id: string, size: { width: number; height: number }) => void;
  reorderPanels: (panelOrder: string[]) => void;
  loadLayout: (layoutType: LayoutType, panels: PanelConfig[]) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Reducer function
function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'SET_LAYOUT_TYPE':
      return {
        ...state,
        layoutType: action.payload
      };
    
    case 'REGISTER_PANEL': {
      const panel = action.payload;
      return {
        ...state,
        panels: {
          ...state.panels,
          [panel.id]: panel
        },
        panelOrder: state.panelOrder.includes(panel.id) 
          ? state.panelOrder 
          : [...state.panelOrder, panel.id]
      };
    }
    
    case 'UNREGISTER_PANEL': {
      const id = action.payload;
      const { [id]: removedPanel, ...remainingPanels } = state.panels;
      return {
        ...state,
        panels: remainingPanels,
        panelOrder: state.panelOrder.filter(panelId => panelId !== id)
      };
    }
    
    case 'UPDATE_PANEL_POSITION': {
      const { id, position } = action.payload;
      if (!state.panels[id]) return state;
      
      return {
        ...state,
        panels: {
          ...state.panels,
          [id]: {
            ...state.panels[id],
            position
          }
        }
      };
    }
    
    case 'UPDATE_PANEL_SIZE': {
      const { id, size } = action.payload;
      if (!state.panels[id]) return state;
      
      return {
        ...state,
        panels: {
          ...state.panels,
          [id]: {
            ...state.panels[id],
            size
          }
        }
      };
    }
    
    case 'REORDER_PANELS':
      return {
        ...state,
        panelOrder: action.payload
      };
    
    case 'LOAD_LAYOUT': {
      const { layoutType, panels } = action.payload;
      const panelsRecord: Record<string, PanelConfig> = {};
      const panelOrder: string[] = [];
      
      panels.forEach(panel => {
        panelsRecord[panel.id] = panel;
        panelOrder.push(panel.id);
      });
      
      return {
        ...state,
        layoutType,
        panels: panelsRecord,
        panelOrder,
        isInitialized: true
      };
    }
    
    default:
      return state;
  }
}

// Provider component
export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState);
  
  // Define action creators
  const setLayoutType = (type: LayoutType) => {
    dispatch({ type: 'SET_LAYOUT_TYPE', payload: type });
  };
  
  const registerPanel = (panel: PanelConfig) => {
    dispatch({ type: 'REGISTER_PANEL', payload: panel });
  };
  
  const unregisterPanel = (id: string) => {
    dispatch({ type: 'UNREGISTER_PANEL', payload: id });
  };
  
  const updatePanelPosition = (id: string, position: { row: number; col: number }) => {
    dispatch({ type: 'UPDATE_PANEL_POSITION', payload: { id, position } });
  };
  
  const updatePanelSize = (id: string, size: { width: number; height: number }) => {
    dispatch({ type: 'UPDATE_PANEL_SIZE', payload: { id, size } });
  };
  
  const reorderPanels = (panelOrder: string[]) => {
    dispatch({ type: 'REORDER_PANELS', payload: panelOrder });
  };
  
  const loadLayout = (layoutType: LayoutType, panels: PanelConfig[]) => {
    dispatch({ type: 'LOAD_LAYOUT', payload: { layoutType, panels } });
  };
  
  return (
    <LayoutContext.Provider value={{
      state,
      dispatch,
      setLayoutType,
      registerPanel,
      unregisterPanel,
      updatePanelPosition,
      updatePanelSize,
      reorderPanels,
      loadLayout
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

// Custom hook to use the context
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
```

📄 **client/src/context/PanelSyncContext.tsx**
```typescript
import React, { createContext, useContext, useCallback, useRef } from 'react';

// Define the event type
export interface PanelSyncEvent {
  type: string;
  payload: any;
  source: string;
  timestamp: number;
}

// Define callback type
export type PanelSyncCallback = (event: PanelSyncEvent) => void;

// Define context type
interface PanelSyncContextType {
  broadcast: (type: string, payload: any, source: string) => void;
  subscribe: (callback: PanelSyncCallback) => () => void;
  isSubscribed: (callback: PanelSyncCallback) => boolean;
}

// Create context
const PanelSyncContext = createContext<PanelSyncContextType | undefined>(undefined);

// Provider component
export const PanelSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use ref for listeners to avoid re-renders
  const listenersRef = useRef<Set<PanelSyncCallback>>(new Set());
  
  // Broadcast event to all subscribers
  const broadcast = useCallback((type: string, payload: any, source: string) => {
    const event: PanelSyncEvent = {
      type,
      payload,
      source,
      timestamp: Date.now()
    };
    
    // Notify all listeners
    listenersRef.current.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in panel sync listener:', error);
      }
    });
  }, []);
  
  // Subscribe to events
  const subscribe = useCallback((callback: PanelSyncCallback) => {
    listenersRef.current.add(callback);
    
    // Return unsubscribe function
    return () => {
      listenersRef.current.delete(callback);
    };
  }, []);
  
  // Check if callback is subscribed
  const isSubscribed = useCallback((callback: PanelSyncCallback) => {
    return listenersRef.current.has(callback);
  }, []);
  
  return (
    <PanelSyncContext.Provider value={{ broadcast, subscribe, isSubscribed }}>
      {children}
    </PanelSyncContext.Provider>
  );
};

// Custom hook to use the context
export const usePanelSync = () => {
  const context = useContext(PanelSyncContext);
  if (context === undefined) {
    throw new Error('usePanelSync must be used within a PanelSyncProvider');
  }
  return context;
};
```

#### 9. Implement Panel Registry with Type Safety

📄 **client/src/registry/panelRegistry.ts**
```typescript
import React from 'react';
import { PanelContentProps } from '../types/panel.types';

// Define allowed panel types
export type PanelType = 
  | 'map' 
  | 'property' 
  | 'filter' 
  | 'stats' 
  | 'chart' 
  | 'list' 
  | 'state' 
  | 'county';

// Panel component type
export type PanelComponent = React.ComponentType<PanelContentProps>;

// Registry interface
interface PanelRegistry {
  register: (type: PanelType, component: PanelComponent) => void;
  unregister: (type: PanelType) => void;
  get: (type: PanelType) => PanelComponent | null;
  getAll: () => Record<PanelType, PanelComponent>;
  getAvailableTypes: () => PanelType[];
}

// Create registry
class PanelRegistryImpl implements PanelRegistry {
  private registry: Partial<Record<PanelType, PanelComponent>> = {};
  
  register(type: PanelType, component: PanelComponent): void {
    this.registry[type] = component;
    console.log(`Panel component registered: ${type}`);
  }
  
  unregister(type: PanelType): void {
    if (this.registry[type]) {
      delete this.registry[type];
      console.log(`Panel component unregistered: ${type}`);
    }
  }
  
  get(type: PanelType): PanelComponent | null {
    return this.registry[type] || null;
  }
  
  getAll(): Record<PanelType, PanelComponent> {
    return this.registry as Record<PanelType, PanelComponent>;
  }
  
  getAvailableTypes(): PanelType[] {
    return Object.keys(this.registry) as PanelType[];
  }
}

// Create singleton instance
export const panelRegistry: PanelRegistry = new PanelRegistryImpl();

/**
 * React hook to get a panel component
 */
export function usePanelComponent(type: PanelType): PanelComponent | null {
  return React.useMemo(() => panelRegistry.get(type), [type]);
}

/**
 * Utility to register multiple panel components at once
 */
export function registerPanels(components: Partial<Record<PanelType, PanelComponent>>): void {
  Object.entries(components).forEach(([type, component]) => {
    panelRegistry.register(type as PanelType, component);
  });
}

/**
 * HOC to register a panel component
 */
export function withPanelRegistration<P extends PanelContentProps>(
  type: PanelType,
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  // Register the component
  panelRegistry.register(type, Component as unknown as PanelComponent);
  
  // Return the original component
  return Component;
}
```

#### 10. Implement React Grid Layout Integration

📄 **client/src/components/multiframe/GridLayoutPanel.tsx**
```typescript
import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider, Layout } from 'react-grid-layout';
import { useLayout } from '../../context/LayoutContext';
import { PanelContainer } from './PanelContainer';
import { PanelConfig } from '../../types/layout.types';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './GridLayoutPanel.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Layout presets based on layout type
const layoutPresets = {
  single: [
    { i: 'default', x: 0, y: 0, w: 12, h: 12, static: false }
  ],
  dual: [
    { i: 'left', x: 0, y: 0, w: 6, h: 12, static: false },
    { i: 'right', x: 6, y: 0, w: 6, h: 12, static: false }
  ],
  tri: [
    { i: 'top-left', x: 0, y: 0, w: 6, h: 6, static: false },
    { i: 'top-right', x: 6, y: 0, w: 6, h: 6, static: false },
    { i: 'bottom', x: 0, y: 6, w: 12, h: 6, static: false }
  ],
  quad: [
    { i: 'top-left', x: 0, y: 0, w: 6, h: 6, static: false },
    { i: 'top-right', x: 6, y: 0, w: 6, h: 6, static: false },
    { i: 'bottom-left', x: 0, y: 6, w: 6, h: 6, static: false },
    { i: 'bottom-right', x: 6, y: 6, w: 6, h: 6, static: false }
  ]
};

// Convert panel configurations to grid layout
const panelsToLayout = (panels: Record<string, PanelConfig>): Layout[] => {
  return Object.values(panels).map(panel => {
    const { id, position, size } = panel;
    const x = position?.col || 0;
    const y = position?.row || 0;
    const w = Math.round((size?.width || 50) / 100 * 12); // Convert percentage to grid units
    const h = Math.round((size?.height || 50) / 100 * 12);
    
    return { i: id, x, y, w, h, static: false };
  });
};

// Convert grid layout to panel configurations
const layoutToPanels = (layout: Layout[], panels: Record<string, PanelConfig>): Record<string, PanelConfig> => {
  const updatedPanels = { ...panels };
  
  layout.forEach(item => {
    const { i: id, x, y, w, h } = item;
    
    if (updatedPanels[id]) {
      updatedPanels[id] = {
        ...updatedPanels[id],
        position: { row: y, col: x },
        size: { 
          width: Math.round(w / 12 * 100), // Convert grid units to percentage
          height: Math.round(h / 12 * 100)
        }
      };
    }
  });
  
  return updatedPanels;
};

interface GridLayoutPanelProps {
  className?: string;
}

export const GridLayoutPanel: React.FC<GridLayoutPanelProps> = ({ className = '' }) => {
  const { state, updatePanelPosition, updatePanelSize } = useLayout();
  const { layoutType, panels, isInitialized } = state;
  
  // State for layout
  const [layouts, setLayouts] = useState({
    lg: layoutPresets[layoutType] || []
  });
  
  // Update layout when panels change
  useEffect(() => {
    if (isInitialized) {
      setLayouts({
        lg: panelsToLayout(panels)
      });
    } else {
      // Use default layout if not initialized
      setLayouts({
        lg: layoutPresets[layoutType] || []
      });
    }
  }, [layoutType, panels, isInitialized]);
  
  // Handle layout change
  const handleLayoutChange = (currentLayout: Layout[], allLayouts: any) => {
    // Update panel positions and sizes based on layout
    const updatedPanels = layoutToPanels(currentLayout, panels);
    
    // Update all panels at once
    Object.entries(updatedPanels).forEach(([id, panel]) => {
      if (panel.position) {
        updatePanelPosition(id, panel.position);
      }
      
      if (panel.size) {
        updatePanelSize(id, panel.size);
      }
    });
    
    // Save the new layout
    setLayouts({ lg: currentLayout });
  };
  
  // Render grid layout
  return (
    <div className={`grid-layout-panel ${className}`}>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 12, sm: 12, xs: 12, xxs: 12 }}
        rowHeight={30}
        margin={[10, 10]}
        onLayoutChange={handleLayoutChange}
        draggableHandle=".panel-header"
        resizeHandles={['se']}
      >
        {Object.values(panels).map(panel => (
          <div key={panel.id} className="grid-panel-wrapper">
            <PanelContainer
              id={panel.id}
              title={panel.title}
              contentType={panel.contentType}
              initialState={panel.state}
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};
```

📄 **client/src/components/multiframe/GridLayoutPanel.css**
```css
.grid-layout-panel {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.grid-panel-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: var(--panel-border-radius, 4px);
  box-shadow: var(--panel-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
  background-color: var(--surface-color, #ffffff);
  display: flex;
  flex-direction: column;
}

/* Style overrides for react-grid-layout */
.react-grid-item {
  transition: all 200ms ease;
  transition-property: left, top, width, height;
}

.react-grid-item.react-grid-placeholder {
  background: var(--primary-color-light, #e3f2fd);
  opacity: 0.5;
  border-radius: var(--panel-border-radius
I'll complete the CSS for the GridLayoutPanel component and continue with the implementation:

```css
.react-grid-item.react-grid-placeholder {
  background: var(--primary-color-light, #e3f2fd);
  opacity: 0.5;
  border-radius: var(--panel-border-radius, 4px);
  border: 1px dashed var(--primary-color, #2196f3);
}

.react-resizable-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="6" height="6"><path d="M6 6H0V4.2H4.2V0H6v6z" opacity=".302"/></svg>');
  background-position: bottom right;
  padding: 0 3px 3px 0;
  background-repeat: no-repeat;
  background-origin: content-box;
  box-sizing: border-box;
  cursor: se-resize;
}

/* Hidden resize handles except for the southeast one */
.react-resizable-handle-ne,
.react-resizable-handle-nw,
.react-resizable-handle-sw,
.react-resizable-handle-w,
.react-resizable-handle-e,
.react-resizable-handle-n,
.react-resizable-handle-s {
  display: none;
}
```

#### 11. Implement Default Layouts Configuration

📄 **client/src/config/defaultLayouts.ts**
```typescript
import { LayoutConfig } from '../types/layout.types';

export const defaultLayouts: LayoutConfig[] = [
  {
    id: 'default-single',
    name: 'Single Panel View',
    description: 'Simple view with a full map',
    type: 'single',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 100, height: 100 }
      }
    ],
    isDefault: true,
    isPublic: true
  },
  {
    id: 'default-dual-map-property',
    name: 'Map & Property View',
    description: 'Dual panel layout with map and property details',
    type: 'dual',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 60, height: 100 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Property Details',
        position: { row: 0, col: 1 },
        size: { width: 40, height: 100 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-county-explorer',
    name: 'County Explorer',
    description: 'Focus on county data visualization',
    type: 'dual',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'Counties Map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 100 }
      },
      {
        id: 'county',
        contentType: 'county',
        title: 'County Details',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 100 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-tri-analysis',
    name: 'Analysis View',
    description: 'Three panel layout for data analysis',
    type: 'tri',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 60 }
      },
      {
        id: 'filter',
        contentType: 'filter',
        title: 'Filters',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 60 }
      },
      {
        id: 'stats',
        contentType: 'stats',
        title: 'Statistics',
        position: { row: 1, col: 0 },
        size: { width: 100, height: 40 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-quad-full',
    name: 'Complete Analysis View',
    description: 'Full analysis dashboard with all panel types',
    type: 'quad',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'state',
        contentType: 'state',
        title: 'State Information',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'county',
        contentType: 'county',
        title: 'County Details',
        position: { row: 1, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Properties',
        position: { row: 1, col: 1 },
        size: { width: 50, height: 50 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-property-scout',
    name: 'Property Scout View',
    description: 'Optimized for property browsing and evaluation',
    type: 'quad',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'Property Map',
        position: { row: 0, col: 0 },
        size: { width: 70, height: 70 }
      },
      {
        id: 'filter',
        contentType: 'filter',
        title: 'Search Filters',
        position: { row: 0, col: 1 },
        size: { width: 30, height: 70 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Property Details',
        position: { row: 1, col: 0 },
        size: { width: 70, height: 30 }
      },
      {
        id: 'stats',
        contentType: 'stats',
        title: 'Market Stats',
        position: { row: 1, col: 1 },
        size: { width: 30, height: 30 }
      }
    ],
    isPublic: true
  }
];

/**
 * Initialize default layouts in the system
 */
export async function initializeDefaultLayouts(layoutService: any): Promise<void> {
  try {
    // Fetch existing layouts first to avoid duplicates
    const existingLayouts = await layoutService.fetchLayouts(true);
    
    // Check for each default layout
    for (const defaultLayout of defaultLayouts) {
      // Check if this default layout already exists
      const exists = existingLayouts.some(layout => layout.id === defaultLayout.id);
      
      if (!exists) {
        // Create the default layout
        await layoutService.saveLayout(defaultLayout);
      }
    }
    
    console.log('Default layouts initialized successfully');
  } catch (error) {
    console.error('Error initializing default layouts:', error);
  }
}
```

#### 12. Implement Theme System with CSS Variables

📄 **client/src/styles/theme.css**
```css
:root {
  /* Base colors */
  --primary-color: #2196f3;
  --primary-color-light: #e3f2fd;
  --primary-color-dark: #1976d2;
  --secondary-color: #ff9800;
  --accent-color: #2196f3;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --danger-color: #f44336;
  
  /* Typography */
  --base-font-size: 16px;
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  --heading-font-weight: 600;
  --text-line-height: 1.5;
  
  /* Light mode colors */
  --background-color: #f5f5f5;
  --surface-color: #ffffff;
  --text-color: #333333;
  --text-secondary-color: #666666;
  --border-color: #e0e0e0;
  --hover-color: rgba(0, 0, 0, 0.05);
  --focus-ring-color: rgba(33, 150, 243, 0.4);
  
  /* Layout */
  --spacing-unit: 8px;
  --spacing-xs: calc(var(--spacing-unit) * 0.5);
  --spacing-sm: var(--spacing-unit);
  --spacing-md: calc(var(--spacing-unit) * 2);
  --spacing-lg: calc(var(--spacing-unit) * 3);
  --spacing-xl: calc(var(--spacing-unit) * 4);
  
  /* Components */
  --border-radius: 4px;
  --panel-border-radius: 4px;
  --panel-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --panel-header-height: 48px;
  --panel-padding: var(--spacing-md);
  --button-height: 36px;
  --input-height: 40px;
  
  /* Z-index levels */
  --z-index-dropdown: 1000;
  --z-index-modal: 2000;
  --z-index-tooltip: 3000;
}

/* Dark mode theme */
.dark-mode {
  --background-color: #121212;
  --surface-color: #1e1e1e;
  --text-color: #e0e0e0;
  --text-secondary-color: #a0a0a0;
  --border-color: #333333;
  --hover-color: rgba(255, 255, 255, 0.05);
  --panel-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  --primary-color-light: #1e3a5f;
}

/* Font sizes */
html {
  font-size: var(--base-font-size);
}

body {
  font-family: var(--font-family);
  line-height: var(--text-line-height);
  background-color: var(--background-color);
  color: var(--text-color);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Accessibility focus styles */
:focus-visible {
  outline: 2px solid var(--focus-ring-color);
  outline-offset: 2px;
}

/* Common utility classes */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Responsive media queries */
@media (max-width: 768px) {
  :root {
    --panel-padding: var(--spacing-sm);
  }
}
```

### ✅ AFTER IMPLEMENTATION

#### 🔍 Testing

1. Create Tests for Swagger Configuration

📄 **server/src/__tests__/swagger/config.test.ts**
```typescript
import { swaggerSpec } from '../../swagger/config';

describe('Swagger Configuration', () => {
  test('Swagger spec is properly configured', () => {
    expect(swaggerSpec).toBeDefined();
    expect(swaggerSpec.openapi).toBe('3.0.0');
    expect(swaggerSpec.info).toBeDefined();
    expect(swaggerSpec.info.title).toBe('Real Estate Platform API');
    expect(swaggerSpec.components.schemas).toBeDefined();
    expect(swaggerSpec.components.securitySchemes).toBeDefined();
  });
  
  test('Swagger spec includes error schema', () => {
    expect(swaggerSpec.components.schemas.Error).toBeDefined();
    expect(swaggerSpec.components.schemas.Error.properties.message).toBeDefined();
  });
  
  test('Swagger spec includes security scheme', () => {
    expect(swaggerSpec.components.securitySchemes.bearerAuth).toBeDefined();
    expect(swaggerSpec.components.securitySchemes.bearerAuth.type).toBe('http');
    expect(swaggerSpec.components.securitySchemes.bearerAuth.scheme).toBe('bearer');
  });
});
```

2. Create Tests for Panel Registry

📄 **client/src/__tests__/registry/panelRegistry.test.ts**
```typescript
import { panelRegistry, PanelType } from '../../registry/panelRegistry';
import React from 'react';
import { PanelContentProps } from '../../types/panel.types';

// Mock panel component
const MockPanel: React.FC<PanelContentProps> = () => <div data-testid="mock-panel" />;

describe('Panel Registry', () => {
  beforeEach(() => {
    // Clear registry before each test
    panelRegistry.getAvailableTypes().forEach(type => {
      panelRegistry.unregister(type);
    });
  });
  
  test('registers a panel component', () => {
    panelRegistry.register('map', MockPanel);
    
    const component = panelRegistry.get('map');
    expect(component).toBe(MockPanel);
  });
  
  test('unregisters a panel component', () => {
    panelRegistry.register('map', MockPanel);
    panelRegistry.unregister('map');
    
    const component = panelRegistry.get('map');
    expect(component).toBeNull();
  });
  
  test('returns null for unregistered component', () => {
    const component = panelRegistry.get('unknown' as PanelType);
    expect(component).toBeNull();
  });
  
  test('returns all registered components', () => {
    panelRegistry.register('map', MockPanel);
    panelRegistry.register('property', MockPanel);
    
    const all = panelRegistry.getAll();
    expect(Object.keys(all)).toHaveLength(2);
    expect(all.map).toBe(MockPanel);
    expect(all.property).toBe(MockPanel);
  });
  
  test('returns available types', () => {
    panelRegistry.register('map', MockPanel);
    panelRegistry.register('chart', MockPanel);
    
    const types = panelRegistry.getAvailableTypes();
    expect(types).toHaveLength(2);
    expect(types).toContain('map');
    expect(types).toContain('chart');
  });
});
```

3. Create Tests for Context Separation

📄 **client/src/__tests__/context/LayoutContext.test.tsx**
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { LayoutProvider, useLayout } from '../../context/LayoutContext';

// Test component to consume context
const TestComponent = () => {
  const { state, setLayoutType, registerPanel } = useLayout();
  
  return (
    <div>
      <div data-testid="layout-type">{state.layoutType}</div>
      <button 
        onClick={() => setLayoutType('dual')}
        data-testid="change-layout"
      >
        Change Layout
      </button>
      <button 
        onClick={() => registerPanel({
          id: 'test',
          contentType: 'map',
          title: 'Test Panel'
        })}
        data-testid="add-panel"
      >
        Add Panel
      </button>
      <div data-testid="panel-count">{Object.keys(state.panels).length}</div>
    </div>
  );
};

describe('LayoutContext', () => {
  test('provides initial layout state', () => {
    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );
    
    expect(screen.getByTestId('layout-type')).toHaveTextContent('single');
    expect(screen.getByTestId('panel-count')).toHaveTextContent('0');
  });
  
  test('updates layout type', () => {
    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );
    
    fireEvent.click(screen.getByTestId('change-layout'));
    
    expect(screen.getByTestId('layout-type')).toHaveTextContent('dual');
  });
  
  test('registers a panel', () => {
    render(
      <LayoutProvider>
        <TestComponent />
      </LayoutProvider>
    );
    
    fireEvent.click(screen.getByTestId('add-panel'));
    
    expect(screen.getByTestId('panel-count')).toHaveTextContent('1');
  });
});
```

4. Create Integration Tests for the Full System

📄 **client/src/__tests__/integration/MultiFrameSystem.test.tsx**
```typescript
import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { MultiFrameContainer } from '../../components/multiframe/MultiFrameContainer';
import { LayoutProvider } from '../../context/LayoutContext';
import { PanelSyncProvider } from '../../context/PanelSyncContext';
import { PreferencesProvider } from '../../context/PreferencesContext';
import { ThemeProvider } from '../../context/ThemeContext';
import { panelRegistry } from '../../registry/panelRegistry';
import { waitFor } from '@testing-library/dom';

// Mock panel components
const MockMapPanel = () => <div data-testid="map-panel">Map Panel</div>;
const MockPropertyPanel = () => <div data-testid="property-panel">Property Panel</div>;

// Register mock components
beforeAll(() => {
  panelRegistry.register('map', MockMapPanel);
  panelRegistry.register('property', MockPropertyPanel);
});

// Cleanup after tests
afterAll(() => {
  panelRegistry.unregister('map');
  panelRegistry.unregister('property');
});

describe('Multi-Frame System Integration', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <PreferencesProvider>
        <ThemeProvider>
          <LayoutProvider>
            <PanelSyncProvider>
              {ui}
            </PanelSyncProvider>
          </LayoutProvider>
        </ThemeProvider>
      </PreferencesProvider>
    );
  };
  
  test('initializes with correct layout type', () => {
    renderWithProviders(
      <MultiFrameContainer 
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
      />
    );
    
    expect(screen.getByTestId('single-layout')).toBeInTheDocument();
  });
  
  test('changes layout type', async () => {
    renderWithProviders(
      <MultiFrameContainer 
        initialLayout="single"
        defaultPanelContent={{ default: 'map' }}
      />
    );
    
    const layoutSelector = screen.getByTestId('layout-selector-dual');
    fireEvent.click(layoutSelector);
    
    await waitFor(() => {
      expect(screen.getByTestId('dual-layout')).toBeInTheDocument();
    });
  });
  
  test('renders correct panel content', () => {
    renderWithProviders(
      <MultiFrameContainer 
        initialLayout="dual"
        panels={[
          { id: 'map-panel', contentType: 'map', title: 'Map', position: { row: 0, col: 0 } },
          { id: 'property-panel', contentType: 'property', title: 'Property', position: { row: 0, col: 1 } }
        ]}
      />
    );
    
    expect(screen.getByTestId('map-panel')).toBeInTheDocument();
    expect(screen.getByTestId('property-panel')).toBeInTheDocument();
  });
});
```

#### 📝 Update Documentation

1. Create Swagger API Documentation README

📄 **server/docs/README.md**
```markdown
# Real Estate Platform API Documentation

This document provides an overview of the API endpoints and data models for the Real Estate Platform.

## Accessing Documentation

The API documentation is available in several formats:

- **Swagger UI**: Available at `/api-docs` when the server is running
- **OpenAPI JSON**: Available at `/api-docs.json` for consumption by API tools
- **GitHub Pages**: Available at [https://yourusername.github.io/project-name/api-docs/](https://yourusername.github.io/project-name/api-docs/)

## Authentication

All API endpoints require authentication using a JSON Web Token (JWT). Include the token in the Authorization header with the Bearer scheme:

```
Authorization: Bearer [your-token]
```

## API Endpoints

The API includes the following main resources:

### Layouts

- `GET /api/layouts` - Get all layouts
- `GET /api/layouts/{id}` - Get a specific layout
- `POST /api/layouts` - Create a new layout
- `PUT /api/layouts/{id}` - Update a layout
- `DELETE /api/layouts/{id}` - Delete a layout
- `POST /api/layouts/{id}/clone` - Clone a layout

### User Preferences

- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update user preferences
- `POST /api/user/preferences/reset` - Reset user preferences to defaults

### Counties

- `GET /api/counties` - Get all counties
- `GET /api/counties/{id}` - Get a specific county
- `GET /api/counties/{id}/stats` - Get county statistics
- `GET /api/counties/{id}/properties` - Get properties in a county

## Data Models

The main data models used in the API include:

- `LayoutConfig` - Configuration for multi-frame layouts
- `PanelConfig` - Configuration for individual panels
- `UserPreferences` - User-specific settings and preferences
- `County` - County geographic and demographic data
- `CountyStats` - Statistical data for counties

For detailed information about each endpoint and data model, please refer to the Swagger documentation.
```

2. Create Component Architecture Documentation

📄 **docs/components/multi-frame/architectural-overview.md**
```markdown
# Multi-Frame Layout Component System: Architectural Overview

This document provides a high-level overview of the architecture and design decisions behind the Multi-Frame Layout Component System.

## System Architecture

The Multi-Frame Layout system is built on several key architectural concepts:

### 1. Context Separation

We maintain clear boundaries between different types of state:

- **LayoutContext**: Manages structural concerns like panel positioning, sizing, and layout type
- **PanelSyncContext**: Handles event broadcasting between panels
- **PreferencesContext**: Manages user-specific settings and preferences
- **ThemeContext**: Controls visual theming and styling

This separation prevents state explosion and makes the system more maintainable and testable.

### 2. Component Registry

Panel content is registered through a type-safe registry that:

- Enforces type safety for panel components
- Supports dynamic registration/unregistration
- Facilitates lazy loading for performance optimization
- Provides React hooks for easy consumption

The registry approach allows for extensibility while maintaining strong typing.

### 3. Grid-Based Layout

We use react-grid-layout to provide:

- Drag-and-drop panel repositioning
- Resizable panels with constraints
- Responsive behavior across device sizes
- Collision detection and automatic repositioning

This provides a more robust experience than custom implementation and supports advanced layout features.

### 4. Theme System

The theme system uses CSS variables to:

- Support light/dark mode switching
- Allow accent color customization
- Enable responsive sizing and spacing
- Maintain accessibility standards

All components consume these variables for consistent styling.

## Data Flow

Data flows through the system in the following pattern:

1. User preferences and layouts are loaded from the API
2. Layout state is initialized with panel configurations
3. Panel components register themselves with the registry
4. Panel synchronization allows communication between panels
5. Changes are persisted back to the API

## Performance Considerations

The system optimizes performance through:

- **Component Memoization**: Using React.memo and useMemo where appropriate
- **Grid Layout Virtualization**: Only rendering visible panels when scrollable
- **Lazy Loading**: Loading panel content asynchronously
- **Minimized Re-renders**: Using context selectors to prevent cascading updates

## Security Considerations

The system includes several security measures:

- Authentication through JWT tokens
- Request validation using middleware
- Content Security Policy compliance
- CSRF protection for API requests

## Extensibility

The system can be extended in several ways:

- Adding new panel types through the registry
- Creating new layout types
- Implementing custom themes
- Extending the state management system

## Future Improvements

Planned improvements include:

- Collaborative layouts for multi-user scenarios
- Enhanced accessibility features
- Performance optimizations for large datasets
- Additional visualization options for data analysis
```

#### ✅ Commit your changes

```bash
git add .
git commit -m "Chunk 9: Implement Swagger documentation and GitHub workflow integration"
git push origin feature/swagger-github-workflow
```

#### 🔃 Create a Pull Request

1. Go to your repository on GitHub
2. Click on "Pull requests" > "New pull request"
3. Select your branch `feature/swagger-github-workflow`
4. Add a title: "Implement Swagger Documentation and GitHub Workflow Integration"
5. Add a description referencing this markdown doc
6. Add screenshots of the Swagger UI
7. Request review from team members

#### 🔗 Integration Targets

- This chunk integrates with the entire application, providing API documentation
- Affects the backend architecture through standardized API endpoints
- Improves developer workflow through GitHub Actions
- Facilitates better testing and debugging through Swagger documentation
- Addresses the original implementation concerns regarding context organization and component registration

#### 📋 Completion Log

- [ ] Swagger configuration implementation complete
- [ ] Swagger middleware implementation complete 
- [ ] Swagger schema definitions complete
- [ ] API routes with Swagger documentation complete
- [ ] County controller implementation complete
- [ ] County model implementation complete
- [ ] GitHub workflow files implementation complete
- [ ] Context separation implementation complete
- [ ] Panel registry implementation complete
- [ ] React Grid Layout integration complete
- [ ] Default layouts configuration complete
- [ ] Theme system implementation complete
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Pull request created

## 📈 Implementation References

### Example Usage

```typescript
// App initialization with all providers
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MultiFrameContainer } from './components/multiframe/MultiFrameContainer';
import { LayoutProvider } from './context/LayoutContext';
import { PanelSyncProvider } from './context/PanelSyncContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { ThemeProvider } from './context/ThemeContext';
import { registerPanels } from './registry/panelRegistry';
import { MapPanel } from './components/panels/MapPanel';
import { PropertyPanel } from './components/panels/PropertyPanel';
import { CountyPanel } from './components/panels/CountyPanel';
import { initializeDefaultLayouts } from './config/defaultLayouts';
import * as layoutService from './services/layoutService';
import './styles/theme.css';

// Register panel components
registerPanels({
  map: MapPanel,
  property: PropertyPanel,
  county: CountyPanel,
  // Add more panel types as needed
});

// Initialize default layouts
initializeDefaultLayouts(layoutService);

function App() {
  return (
    <BrowserRouter>
      <PreferencesProvider>
        <ThemeProvider>
          <LayoutProvider>
            <PanelSyncProvider>
              <div className="app">
                <MultiFrameContainer
                  initialLayout="quad"
                  defaultPanelContent={{
                    'top-left': 'map',
                    'top-right': 'property',
                    'bottom-left': 'county',
                    'bottom-right': 'stats'
                  }}
                />
              </div>
            </PanelSyncProvider>
          </LayoutProvider>
        </ThemeProvider>
      </PreferencesProvider>
    </BrowserRouter>
  );
}

export default App;
```

### API Usage Example

```typescript
// Example of using the API with Swagger documentation
import axios from 'axios';

// Configure axios with authentication
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get county statistics
async function getCountyStats(countyId: string, timeframe: string = '1y') {
  try {
    const response = await axios.get(`/api/counties/${countyId}/stats`, {
      params: { timeframe }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching county stats:', error);
    throw error;
  }
}

// Save user layout
async function saveUserLayout(layout) {
  try {
    const response = await axios.post('/api/layouts', layout);
    return response.data;
  } catch (error) {
    console.error('Error saving layout:', error);
    throw error;
  }
}
```

### Visual Structure

### Visual Structure

```
┌─────────────────────────────────────────────────────┐
│ Swagger UI Documentation                            │
│ ┌─────────────────────────────────────────────────┐ │
│ │ API Title & Description                         │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Endpoint Categories                             │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │
│ │ │ Layouts │ │ Counties│ │ States  │ │ Users   │ │ │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Endpoint Details                                │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Method, URL, Description                    │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Parameters, Request Body, Responses         │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────┐
│ GitHub Workflow                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Pull Request                                    │ │
│ │ ┌─────────────────┐ ┌─────────────────────────┐ │ │
│ │ │ Code Changes    │ │ Pull Request Template   │ │ │
│ │ └─────────────────┘ └─────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ GitHub Actions                                  │ │
│ │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ │ │
│ │ │ Lint    │ │ Build   │ │ Test    │ │ Deploy  │ │ │
│ │ └─────────┘ └─────────┘ └─────────┘ └─────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Check Results                                   │ │
│ │ ┌─────────────────────────────────────────────┐ │ │
│ │ │ Status Checks                               │ │ │
│ │ └─────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Improved Context Separation

The implementation includes separate contexts with clear boundaries:

1. **LayoutContext**: Focused exclusively on structural concerns
   - Panel positioning and sizing
   - Layout type management
   - Panel registration/unregistration
   - No event handling or content synchronization

2. **PanelSyncContext**: Dedicated solely to communication between panels
   - Event broadcasting system
   - Subscription mechanism
   - Prevents circular updates
   - No layout structure management

3. **PreferencesContext**: Manages user preferences separately
   - Theme settings
   - Default panels configuration
   - Layout behavior preferences
   - Filter defaults

This separation makes the system more maintainable, testable, and easier to reason about. Each context has a single responsibility and clear boundaries.

### Enhanced Drag-and-Drop with react-grid-layout

The implementation uses react-grid-layout instead of custom implementations:

```typescript
import React from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { PanelContainer } from './PanelContainer';
import { PanelConfig } from '../../types/layout.types';

export const QuadPanelLayout = ({ panels, onLayoutChange }) => {
  // Convert panel configs to layout format
  const layout = panels.map(panel => ({
    i: panel.id,
    x: panel.position.col,
    y: panel.position.row,
    w: panel.size.width / 25, // Convert percentage to grid units
    h: panel.size.height / 25,
    minW: 2,
    minH: 2
  }));

  // Handle layout changes
  const handleLayoutChange = (newLayout) => {
    // Convert back to panel format
    const updatedPanels = panels.map(panel => {
      const layoutItem = newLayout.find(item => item.i === panel.id);
      if (layoutItem) {
        return {
          ...panel,
          position: {
            row: layoutItem.y,
            col: layoutItem.x
          },
          size: {
            width: layoutItem.w * 25,
            height: layoutItem.h * 25
          }
        };
      }
      return panel;
    });
    
    onLayoutChange(updatedPanels);
  };

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={30}
      width={1200}
      onLayoutChange={handleLayoutChange}
      draggableHandle=".panel-header"
    >
      {panels.map(panel => (
        <div key={panel.id}>
          <PanelContainer
            id={panel.id}
            title={panel.title}
            contentType={panel.contentType}
            initialState={panel.state}
          />
        </div>
      ))}
    </GridLayout>
  );
};
```

### Improved Component Registration with TypeScript Safety

```typescript
// src/services/panelRegistry.ts
import React from 'react';

export type PanelComponentType = React.ComponentType<any>;
export type PanelContentType = 'map' | 'property' | 'filter' | 'stats' | 'chart' | 'county' | 'state';

// Panel registry to store available panel components
class PanelRegistry {
  private registry: Map<PanelContentType, PanelComponentType> = new Map();
  
  // Register a panel component
  register(type: PanelContentType, Component: PanelComponentType): void {
    this.registry.set(type, Component);
  }
  
  // Get a panel component by type
  get(type: PanelContentType): PanelComponentType | null {
    return this.registry.get(type) || null;
  }
  
  // Check if a panel type is registered
  has(type: PanelContentType): boolean {
    return this.registry.has(type);
  }
  
  // Get all registered panel types
  getTypes(): PanelContentType[] {
    return Array.from(this.registry.keys());
  }
  
  // Clear registry (mostly for testing)
  clear(): void {
    this.registry.clear();
  }
}

// Singleton instance
export const panelRegistry = new PanelRegistry();

// Usage example:
// import { MapPanel } from '../components/panels/MapPanel';
// panelRegistry.register('map', MapPanel);
```

### County Object Implementation

The county object was missing in the original implementation. Here is the proper implementation:

```typescript
// src/models/County.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ICounty extends Document {
  stateId: mongoose.Types.ObjectId;
  name: string;
  fips: string;
  population: number;
  boundaries: any; // GeoJSON 
  stats: {
    medianHomeValue: number;
    homeValueChange1Y: number;
    homeValueChange5Y: number;
    medianRent: number;
    propertyCount: number;
    listingsCount: number;
    avgDaysOnMarket: number;
  };
  lastUpdated: Date;
}

const CountySchema = new Schema({
  stateId: {
    type: Schema.Types.ObjectId,
    ref: 'State',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  fips: {
    type: String,
    required: true,
    unique: true
  },
  population: {
    type: Number,
    required: true
  },
  boundaries: {
    type: Schema.Types.Mixed,
    required: true
  },
  stats: {
    medianHomeValue: Number,
    homeValueChange1Y: Number,
    homeValueChange5Y: Number,
    medianRent: Number,
    propertyCount: Number,
    listingsCount: Number,
    avgDaysOnMarket: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update lastUpdated timestamp
CountySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Add Swagger documentation
/**
 * @swagger
 * components:
 *   schemas:
 *     County:
 *       type: object
 *       required:
 *         - stateId
 *         - name
 *         - fips
 *         - population
 *         - boundaries
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the county
 *         stateId:
 *           type: string
 *           description: Reference to the state this county belongs to
 *         name:
 *           type: string
 *           description: The name of the county
 *         fips:
 *           type: string
 *           description: Federal Information Processing Standard code
 *         population:
 *           type: number
 *           description: Population of the county
 *         boundaries:
 *           type: object
 *           description: GeoJSON representation of county boundaries
 *         stats:
 *           type: object
 *           properties:
 *             medianHomeValue:
 *               type: number
 *               description: Median home value in USD
 *             homeValueChange1Y:
 *               type: number
 *               description: Percentage change in home value over 1 year
 *             homeValueChange5Y:
 *               type: number
 *               description: Percentage change in home value over 5 years
 *             medianRent:
 *               type: number
 *               description: Median monthly rent in USD
 *             propertyCount:
 *               type: number
 *               description: Total number of properties in county
 *             listingsCount:
 *               type: number
 *               description: Number of active listings
 *             avgDaysOnMarket:
 *               type: number
 *               description: Average days on market for listings
 *         lastUpdated:
 *           type: string
 *           format: date-time
 *           description: The date of the last update
 */

export const County = mongoose.model<ICounty>('County', CountySchema);
```

### County Panel Component

```typescript
// src/components/panels/CountyPanel.tsx
import React, { useEffect, useState } from 'react';
import { usePanelSync } from '../../hooks/usePanelSync';
import { fetchCountyDetails, fetchCountyStats } from '../../services/countyService';
import { PanelContentProps } from '../../types/panel.types';
import './CountyPanel.css';

export const CountyPanel: React.FC<PanelContentProps> = ({
  panelId,
  initialState,
  onStateChange,
  onAction
}) => {
  // State
  const [countyId, setCountyId] = useState<string | null>(initialState?.countyId || null);
  const [countyData, setCountyData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statsTimeframe, setStatsTimeframe] = useState<string>('1y');
  
  // Hooks
  const { subscribe } = usePanelSync();
  
  // Subscribe to events from other panels
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.source !== panelId) {
        // Handle select events from other panels
        if (event.type === 'select' && event.payload.entityType === 'county') {
          setCountyId(event.payload.entityId);
          
          // Update parent state if callback provided
          if (onStateChange) {
            onStateChange({ countyId: event.payload.entityId });
          }
        }
      }
    });
    
    return unsubscribe;
  }, [panelId, subscribe, onStateChange]);
  
  // Fetch county data when ID changes
  useEffect(() => {
    const loadCountyData = async () => {
      if (!countyId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch county details
        const details = await fetchCountyDetails(countyId);
        // Fetch county stats with timeframe
        const stats = await fetchCountyStats(countyId, statsTimeframe);
        
        setCountyData({ ...details, stats });
        setLoading(false);
      } catch (err) {
        console.error('Error loading county data:', err);
        setError('Failed to load county data');
        setLoading(false);
      }
    };
    
    loadCountyData();
  }, [countyId, statsTimeframe]);
  
  // Handle timeframe change
  const handleTimeframeChange = (timeframe: string) => {
    setStatsTimeframe(timeframe);
  };
  
  // Render loading state
  if (loading) {
    return <div className="loading-indicator">Loading county data...</div>;
  }
  
  // Render error state
  if (error) {
    return <div className="error-message">{error}</div>;
  }
  
  // Render empty state
  if (!countyId) {
    return <div className="empty-state">Select a county from the map to view details</div>;
  }
  
  // Render county data
  return (
    <div className="county-panel">
      {countyData && (
        <>
          <div className="county-header">
            <h3>{countyData.name} County</h3>
            <div className="timeframe-selector">
              <button 
                className={statsTimeframe === '1y' ? 'active' : ''} 
                onClick={() => handleTimeframeChange('1y')}
              >
                1 Year
              </button>
              <button 
                className={statsTimeframe === '3y' ? 'active' : ''} 
                onClick={() => handleTimeframeChange('3y')}
              >
                3 Years
              </button>
              <button 
                className={statsTimeframe === '5y' ? 'active' : ''} 
                onClick={() => handleTimeframeChange('5y')}
              >
                5 Years
              </button>
            </div>
          </div>
          
          <div className="county-stats">
            <div className="stat-card">
              <div className="stat-label">Population</div>
              <div className="stat-value">{countyData.population.toLocaleString()}</div>
            </div>
            
            <div className="stat-card">
              <div className="stat-label">Median Home Value</div>
              <div className="stat-value">
                ${countyData.stats.medianHomeValue.toLocaleString()}
              </div>
              <div className={`change-indicator ${countyData.stats.homeValueChange1Y > 0 ? 'positive' : 'negative'}`}>
                {countyData.stats.homeValueChange1Y > 0 ? '+' : ''}
                {countyData.stats.homeValueChange1Y.toFixed(1)}%
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-label">Median Rent</div>
              <div className="stat-value">
                ${countyData.stats.medianRent.toLocaleString()}
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-label">Active Listings</div>
              <div className="stat-value">
                {countyData.stats.listingsCount.toLocaleString()}
              </div>
              <div className="stat-secondary">
                {countyData.stats.avgDaysOnMarket} days on market (avg)
              </div>
            </div>
          </div>
          
          <div className="county-actions">
            <button 
              className="view-properties-button"
              onClick={() => {
                if (onAction) {
                  onAction({
                    type: 'viewProperties',
                    payload: { countyId }
                  });
                }
              }}
            >
              View Properties
            </button>
          </div>
        </>
      )}
    </div>
  );
};
```

### Comprehensive Styling Architecture with Styled Components

```typescript
// src/styles/theme.ts
import { createGlobalStyle } from 'styled-components';

export const theme = {
  light: {
    primary: '#2196f3',
    secondary: '#607d8b',
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#333333',
    textSecondary: '#666666',
    border: '#e0e0e0',
    shadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  dark: {
    primary: '#90caf9',
    secondary: '#b0bec5',
    success: '#81c784',
    warning: '#ffb74d',
    danger: '#e57373',
    background: '#121212',
    surface: '#1e1e1e',
    text: '#e0e0e0',
    textSecondary: '#a0a0a0',
    border: '#333333',
    shadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    circle: '50%',
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    fontSize: {
      small: '14px',
      medium: '16px',
      large: '18px',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      bold: 600,
    },
    lineHeight: 1.5,
  },
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px',
  },
  transitions: {
    short: '150ms',
    medium: '300ms',
    long: '500ms',
  },
};

export type ThemeType = typeof theme.light;

export const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  html, body {
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-size: ${({ theme }) => theme.typography.fontSize.medium};
    line-height: ${({ theme }) => theme.typography.lineHeight};
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
    font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  }
  
  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }
  
  button {
    cursor: pointer;
    font-family: inherit;
  }
`;
```

### Default Layouts with User Personas

```typescript
// src/config/defaultLayouts.ts
import { LayoutConfig } from '../types/layout.types';

export const defaultLayouts: LayoutConfig[] = [
  {
    id: 'default-single',
    name: 'Single Panel View',
    description: 'Simple view with a full map',
    type: 'single',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 100, height: 100 }
      }
    ],
    isDefault: true,
    isPublic: true,
    persona: 'General User'
  },
  {
    id: 'default-dual-map-property',
    name: 'Map & Property View',
    description: 'Dual panel layout with map and property details',
    type: 'dual',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 60, height: 100 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Property Details',
        position: { row: 0, col: 1 },
        size: { width: 40, height: 100 }
      }
    ],
    isPublic: true,
    persona: 'Property Scout'
  },
  {
    id: 'default-dual-state-county',
    name: 'Geographic Analysis',
    description: 'Dual panel layout for geographic data analysis',
    type: 'dual',
    panels: [
      {
        id: 'state',
        contentType: 'state',
        title: 'State Overview',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 100 }
      },
      {
        id: 'county',
        contentType: 'county',
        title: 'County Details',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 100 }
      }
    ],
    isPublic: true,
    persona: 'Market Analyst'
  },
  {
    id: 'default-tri-analysis',
    name: 'Analysis View',
    description: 'Three panel layout for data analysis',
    type: 'tri',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 60 }
      },
      {
        id: 'filter',
        contentType: 'filter',
        title: 'Filters',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 60 }
      },
      {
        id: 'stats',
        contentType: 'stats',
        title: 'Statistics',
        position: { row: 1, col: 0 },
        size: { width: 100, height: 40 }
      }
    ],
    isPublic: true,
    persona: 'Market Analyst'
  },
  {
    id: 'default-quad-full',
    name: 'Complete Analysis View',
    description: 'Full analysis dashboard with all panel types',
    type: 'quad',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'state',
        contentType: 'state',
        title: 'State Information',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'county',
        contentType: 'county',
        title: 'County Details',
        position: { row: 1, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Properties',
        position: { row: 1, col: 1 },
        size: { width: 50, height: 50 }
      }
    ],
    isPublic: true,
    persona: 'Administrator'
  },
  {
    id: 'default-property-scout',
    name: 'Property Scout View',
    description: 'Optimized for property browsing and evaluation',
    type: 'quad',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'Property Map',
        position: { row: 0, col: 0 },
        size: { width: 70, height: 70 }
      },
      {
        id: 'filter',
        contentType: 'filter',
        title: 'Search Filters',
        position: { row: 0, col: 1 },
        size: { width: 30, height: 70 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Property Details',
        position: { row: 1, col: 0 },
        size: { width: 70, height: 30 }
      },
      {
        id: 'stats',
        contentType: 'stats',
        title: 'Market Stats',
        position: { row: 1, col: 1 },
        size: { width: 30, height: 30 }
      }
    ],
    isPublic: true,
    persona: 'Property Scout'
  }
];

// Function to initialize default layouts in the system
export async function initializeDefaultLayouts(layoutService: any): Promise<void> {
  try {
    // Fetch existing layouts first to avoid duplicates
    const existingLayouts = await layoutService.fetchLayouts(true);
    
    // Check for each default layout
    for (const defaultLayout of defaultLayouts) {
      // Check if this default layout already exists
      const exists = existingLayouts.some(layout => layout.id === defaultLayout.id);
      
      if (!exists) {
        // Create the default layout
        await layoutService.saveLayout(defaultLayout);
      }
    }
    
    console.log('Default layouts initialized successfully');
  } catch (error) {
    console.error('Error initializing default layouts:', error);
  }
}
```

### Personas and Layout Presets

| Persona | Default Layout | Description |
|---------|---------------|-------------|
| General User | Single Panel View | Simple view with full map |
| Property Scout | Map & Property View | Focus on browsing properties |
| Property Scout | Property Scout View | Optimized for property browsing |
| Market Analyst | Geographic Analysis | State and county analysis |
| Market Analyst | Analysis View | Data analysis with charts and stats |
| Administrator | Complete Analysis View | Full dashboard with all panels |

