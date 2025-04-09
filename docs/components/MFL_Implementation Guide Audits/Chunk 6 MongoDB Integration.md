# 🧩 Chunk 6: MongoDB Integration & Layout API

✅ **Status**: Ready for Implementation  
📅 **Target Completion**: [YYYY-MM-DD]  
📄 **Doc Path**: /docs/components/multi-frame/chunk-6-mongodb-api.md

## 🎯 Objective

Implement MongoDB schema, API endpoints, and controllers for storing and retrieving layout configurations, user preferences, and panel states. This chunk establishes the backend infrastructure to support persistent layouts, state/county/property data, and sharing configurations between users.

## 🧭 Implementation Workflow

### 🔧 BEFORE YOU BEGIN

Create your Git branch:
```bash
git checkout main
git pull
git checkout -b feature/mongodb-layout-api
```

Required folders:
```
server/src/models/
server/src/controllers/
server/src/routes/
server/src/middleware/
```

Install necessary packages:
```bash
npm install mongoose express express-validator jsonwebtoken
```

### 🏗️ DURING IMPLEMENTATION

#### 1. Create MongoDB Schemas

📄 **server/src/models/LayoutConfig.ts**
```typescript
import mongoose, { Document, Schema } from 'mongoose';

// Define layout schema setup function
export const setupLayoutSchema = () => {
  // Only create schema if it doesn't already exist
  if (mongoose.models.Layout) {
    return mongoose.models.Layout;
  }
  
  const PanelPositionSchema = new mongoose.Schema({
    // For standard layouts
    row: { type: Number },
    col: { type: Number },
    // For advanced layouts
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number }
  }, { _id: false });
  
  const PanelSizeSchema = new mongoose.Schema({
    width: { type: Number },
    height: { type: Number }
  }, { _id: false });
  
  const PanelSchema = new mongoose.Schema({
    id: { type: String, required: true },
    contentType: { 
      type: String, 
      enum: ['map', 'state', 'county', 'property', 'filter', 'stats', 'chart'],
      required: true 
    },
    title: { type: String, required: true },
    position: PanelPositionSchema,
    size: PanelSizeSchema,
    state: { type: mongoose.Schema.Types.Mixed },
    visible: { type: Boolean, default: true },
    closable: { type: Boolean, default: false },
    maximizable: { type: Boolean, default: true }
  }, { _id: false });
  
  const layoutSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    type: { 
      type: String, 
      enum: ['single', 'dual', 'tri', 'quad', 'advanced'],
      required: true 
    },
    panels: [PanelSchema],
    isDefault: { type: Boolean, default: false },
    isPublic: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  // Middleware to update the updatedAt field on save
  layoutSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
  });
  
  // Create indexes for more efficient queries
  layoutSchema.index({ userId: 1 });
  layoutSchema.index({ isPublic: 1 });
  layoutSchema.index({ type: 1 });
  
  return mongoose.model('Layout', layoutSchema);
};

// Example Test Code
/*
// Test schema validation
const layout = new LayoutModel({
  name: 'Test Layout',
  type: 'quad',
  panels: [
    {
      id: 'panel-1',
      contentType: 'map',
      title: 'Map Panel',
      position: { row: 0, col: 0 },
      size: { width: 50, height: 50 }
    },
    {
      id: 'panel-2',
      contentType: 'property',
      title: 'Property Panel',
      position: { row: 0, col: 1 },
      size: { width: 50, height: 50 }
    }
  ]
});
*/

📄 **server/src/models/UserPreferences.ts**
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  defaultLayout: mongoose.Types.ObjectId;
  panelPreferences: Map<string, any>;
  themePreferences: {
    colorMode: 'light' | 'dark' | 'system';
    mapStyle: 'standard' | 'satellite' | 'terrain';
    accentColor?: string;
    fontSize?: 'small' | 'medium' | 'large';
  };
  filterPreferences: {
    defaultFilters: any;
    showFilterPanel: boolean;
    applyFiltersAutomatically: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  defaultLayout: {
    type: Schema.Types.ObjectId,
    ref: 'LayoutConfig'
  },
  panelPreferences: {
    type: Map,
    of: Schema.Types.Mixed
  },
  themePreferences: {
    colorMode: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    mapStyle: {
      type: String,
      enum: ['standard', 'satellite', 'terrain'],
      default: 'standard'
    },
    accentColor: String,
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    }
  },
  filterPreferences: {
    defaultFilters: Schema.Types.Mixed,
    showFilterPanel: {
      type: Boolean,
      default: true
    },
    applyFiltersAutomatically: {
      type: Boolean,
      default: true
    }
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
UserPreferencesSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const UserPreferences = mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);
```

📄 **server/src/models/County.ts**
```typescript
import mongoose, { Document, Schema } from 'mongoose';

export interface ICounty extends Document {
  stateId: mongoose.Types.ObjectId;  // Reference to State, using proper ObjectId type
  name: string;                      // County name (required)
  fips: string;                      // Federal Information Processing Standard code (required)
  boundaries: any;                   // GeoJSON representation of county boundaries (required)
  population: number;                // County population
  propertyCount: number;             // Number of properties in county
  
  // Consolidated statistics
  stats: {
    medianHomeValue: number;         // Median home value in USD
    medianIncome: number;            // Median household income
    unemploymentRate: number;        // Unemployment rate percentage
    avgDaysOnMarket: number;         // Average days on market for listings
    listingCount: number;            // Number of active listings
    priceChangeYoY: number;          // Year-over-year price change percentage
    lastUpdated: Date;               // Last statistics update timestamp
  };
  
  createdAt: Date;                   // Document creation timestamp
  updatedAt: Date;                   // Document last update timestamp
}

const CountySchema = new Schema({
  stateId: {
    type: Schema.Types.ObjectId,
    ref: 'State',
    required: true,
    index: true
  },
  name: {
    type: String,
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
    required: true
  },
  population: {
    type: Number,
    default: 0
  },
  propertyCount: {
    type: Number,
    default: 0
  },
  stats: {
    medianHomeValue: {
      type: Number,
      default: 0
    },
    medianIncome: {
      type: Number,
      default: 0
    },
    unemploymentRate: {
      type: Number,
      default: 0
    },
    avgDaysOnMarket: {
      type: Number,
      default: 0
    },
    listingCount: {
      type: Number,
      default: 0
    },
    priceChangeYoY: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
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
  
  // If stats are being updated, also update the lastUpdated timestamp
  if (this.isModified('stats')) {
    this.stats.lastUpdated = new Date();
  }
  
  next();
});

// Create a geospatial index on boundaries for optimized geo queries
CountySchema.index({ boundaries: '2dsphere' });

// Create compound index for state+name for faster lookups
CountySchema.index({ stateId: 1, name: 1 });

export const County = mongoose.model<ICounty>('County', CountySchema);
```

#### 2. Create Auth Middleware

📄 **server/src/middleware/authMiddleware.ts**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
    
    // Add user from payload
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};
```

#### 3. Create API Controllers

📄 **server/src/controllers/layoutController.ts**
```typescript
import { Request, Response } from 'express';
import { LayoutConfig } from '../models/LayoutConfig';

/**
 * Get all layouts for the current user
 */
export const getLayouts = async (req: Request, res: Response) => {
  try {
    const { isPublic } = req.query;
    const userId = req.user.id; // Assuming authentication middleware sets req.user
    
    // Build query
    const query: any = { userId };
    
    // Include public layouts if requested
    if (isPublic === 'true') {
      query.$or = [{ userId }, { isPublic: true }];
    }
    
    const layouts = await LayoutConfig.find(query).sort({ updatedAt: -1 });
    
    res.status(200).json(layouts);
  } catch (error) {
    console.error('Error fetching layouts:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a specific layout
 */
export const getLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const layout = await LayoutConfig.findOne({
      _id: id,
      $or: [{ userId }, { isPublic: true }]
    });
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    res.status(200).json(layout);
  } catch (error) {
    console.error(`Error fetching layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Create a new layout
 */
export const createLayout = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Check if this is set as default
    if (req.body.isDefault) {
      // Unset any existing default layouts
      await LayoutConfig.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    const layout = new LayoutConfig({
      ...req.body,
      userId
    });
    
    await layout.save();
    
    res.status(201).json(layout);
  } catch (error) {
    console.error('Error creating layout:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update a layout
 */
export const updateLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    // Find the layout
    const layout = await LayoutConfig.findOne({ _id: id, userId });
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    // Check if this is being set as default
    if (req.body.isDefault && !layout.isDefault) {
      // Unset any existing default layouts
      await LayoutConfig.updateMany(
        { userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }
    
    // Update the layout
    Object.entries(req.body).forEach(([key, value]) => {
      // @ts-ignore
      layout[key] = value;
    });
    
    await layout.save();
    
    res.status(200).json(layout);
  } catch (error) {
    console.error(`Error updating layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete a layout
 */
export const deleteLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const layout = await LayoutConfig.findOneAndDelete({ _id: id, userId });
    
    if (!layout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    res.status(200).json({ message: 'Layout deleted successfully' });
  } catch (error) {
    console.error(`Error deleting layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Clone a layout
 */
export const cloneLayout = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;
    
    // Find the source layout
    const sourceLayout = await LayoutConfig.findOne({
      _id: id,
      $or: [{ userId }, { isPublic: true }]
    });
    
    if (!sourceLayout) {
      return res.status(404).json({ message: 'Layout not found' });
    }
    
    // Create a new layout based on the source
    const newLayout = new LayoutConfig({
      ...sourceLayout.toObject(),
      _id: undefined, // Let MongoDB generate a new ID
      userId,
      name: name || `Copy of ${sourceLayout.name}`,
      isDefault: false, // Never set a clone as default
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await newLayout.save();
    
    res.status(201).json(newLayout);
  } catch (error) {
    console.error(`Error cloning layout ${req.params.id}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

📄 **server/src/controllers/countyController.ts**
```typescript
import { Request, Response } from 'express';
import { County } from '../models/County';

/**
 * Get all counties for a state
 */
export const getCountiesByState = async (req: Request, res: Response) => {
  try {
    const { stateId } = req.params;
    
    const counties = await County.find({ stateId })
      .select('name fips population propertyCount stats.medianHomeValue')
      .sort({ name: 1 });
    
    res.status(200).json(counties);
  } catch (error) {
    console.error(`Error fetching counties for state ${req.params.stateId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a specific county
 */
export const getCounty = async (req: Request, res: Response) => {
  try {
    const { countyId } = req.params;
    
    const county = await County.findOne({ _id: countyId });
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    res.status(200).json(county);
  } catch (error) {
    console.error(`Error fetching county ${req.params.countyId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get county boundaries (GeoJSON)
 */
export const getCountyBoundaries = async (req: Request, res: Response) => {
  try {
    const { countyId } = req.params;
    
    const county = await County.findOne({ _id: countyId })
      .select('boundaries');
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    res.status(200).json(county.boundaries);
  } catch (error) {
    console.error(`Error fetching county boundaries ${req.params.countyId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get county statistics
 */
export const getCountyStats = async (req: Request, res: Response) => {
  try {
    const { countyId } = req.params;
    const { timeframe = '1y' } = req.query;
    
    // Get the county with stats
    const county = await County.findById(countyId)
      .select('stats population propertyCount');
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    // Option to return the stored stats directly 
    if (req.query.useStoredStats === 'true') {
      // Return stats with additional population and property count fields
      const statsResponse = {
        medianHomeValue: county.stats.medianHomeValue,
        medianIncome: county.stats.medianIncome,
        unemploymentRate: county.stats.unemploymentRate,
        avgDaysOnMarket: county.stats.avgDaysOnMarket,
        listingCount: county.stats.listingCount,
        priceChangeYoY: county.stats.priceChangeYoY,
        lastUpdated: county.stats.lastUpdated,
        population: county.population,
        propertyCount: county.propertyCount
      };
      
      return res.status(200).json(statsResponse);
    }
    
    // Calculate date range based on timeframe
    const now = new Date();
    let startDate = new Date();
    
    // Set time range based on query parameter
    switch (timeframe) {
      case '1m': startDate.setMonth(startDate.getMonth() - 1); break;
      case '3m': startDate.setMonth(startDate.getMonth() - 3); break;
      case '6m': startDate.setMonth(startDate.getMonth() - 6); break;
      case '1y': startDate.setFullYear(startDate.getFullYear() - 1); break;
      case 'all': startDate = new Date(0); break;
      default: startDate.setFullYear(startDate.getFullYear() - 1);
    }
    
    // Calculate up-to-date statistics from property data
    const propertyData = await Property.find({
      countyId, 
      createdAt: { $gte: startDate }
    }).select('price status listDate soldDate stats.daysOnMarket');
    
    // Update stats with fresh data for specified time period
    const stats = {
      medianHomeValue: county.stats.medianHomeValue,
      medianIncome: county.stats.medianIncome,
      unemploymentRate: county.stats.unemploymentRate,
      avgDaysOnMarket: 0,
      listingCount: propertyData.filter(p => p.status === 'active').length,
      priceChangeYoY: county.stats.priceChangeYoY,
      lastUpdated: new Date(),
      population: county.population,
      propertyCount: county.propertyCount
    };
    
    // Calculate metrics from property data
    if (propertyData.length > 0) {
      // Calculate median home value from actual properties
      const sortedPrices = propertyData
        .filter(p => p.price > 0)
        .map(p => p.price)
        .sort((a, b) => a - b);
        
      if (sortedPrices.length > 0) {
        const midIndex = Math.floor(sortedPrices.length / 2);
        stats.medianHomeValue = sortedPrices.length % 2 === 0
          ? Math.round((sortedPrices[midIndex - 1] + sortedPrices[midIndex]) / 2)
          : sortedPrices[midIndex];
      }
      
      // Calculate average days on market
      let totalDays = 0;
      let propertiesWithDom = 0;
      
      propertyData.forEach(p => {
        if (p.stats?.daysOnMarket > 0) {
          totalDays += p.stats.daysOnMarket;
          propertiesWithDom++;
        }
      });
      
      if (propertiesWithDom > 0) {
        stats.avgDaysOnMarket = Math.round(totalDays / propertiesWithDom);
      }
    }
    
    // Option to update county with new calculated stats
    if (req.query.updateStats === 'true') {
      await County.findByIdAndUpdate(countyId, {
        $set: {
          'stats.medianHomeValue': stats.medianHomeValue,
          'stats.avgDaysOnMarket': stats.avgDaysOnMarket,
          'stats.listingCount': stats.listingCount,
          'stats.lastUpdated': stats.lastUpdated
        }
      });
    }
    
    res.status(200).json(stats);
  } catch (error) {
    console.error(`Error fetching county stats ${req.params.countyId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update county statistics
 */
export const updateCountyStats = async (req: Request, res: Response) => {
  try {
    const { countyId } = req.params;
    const statsUpdate = req.body;
    
    // Validate input
    if (!statsUpdate || typeof statsUpdate !== 'object') {
      return res.status(400).json({ message: 'Invalid statistics data' });
    }

    // Find the county
    const county = await County.findById(countyId);
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    // Update only valid stats fields
    const validFields = [
      'medianHomeValue', 
      'medianIncome', 
      'unemploymentRate', 
      'avgDaysOnMarket', 
      'listingCount', 
      'priceChangeYoY'
    ];
    
    const updateData: any = {};
    
    validFields.forEach(field => {
      if (field in statsUpdate) {
        updateData[`stats.${field}`] = statsUpdate[field];
      }
    });
    
    // Add lastUpdated timestamp
    updateData['stats.lastUpdated'] = new Date();
    
    // Also update population and propertyCount if provided
    if ('population' in statsUpdate) {
      updateData.population = statsUpdate.population;
    }
    
    if ('propertyCount' in statsUpdate) {
      updateData.propertyCount = statsUpdate.propertyCount;
    }
    
    // Update the county
    const updatedCounty = await County.findByIdAndUpdate(
      countyId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      message: 'Statistics updated successfully',
      stats: updatedCounty?.stats,
      population: updatedCounty?.population,
      propertyCount: updatedCounty?.propertyCount
    });
  } catch (error) {
    console.error(`Error updating stats for county ${req.params.countyId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Search counties by name or FIPS code
 */
export const searchCounties = async (req: Request, res: Response) => {
  try {
    const { query, stateId } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Build search conditions
    const searchConditions: any = {
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { fips: { $regex: query, $options: 'i' } }
      ]
    };
    
    // Add stateId filter if provided
    if (stateId) {
      searchConditions.stateId = stateId;
    }
    
    const counties = await County.find(searchConditions)
      .select('name fips stateId population stats.medianHomeValue')
      .limit(20)
      .sort({ name: 1 });
    
    res.status(200).json(counties);
  } catch (error) {
    console.error('Error searching counties:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

📄 **server/src/controllers/userPreferencesController.ts**
```typescript
import { Request, Response } from 'express';
import { UserPreferences } from '../models/UserPreferences';

// Default preferences
const DEFAULT_PREFERENCES = {
  themePreferences: {
    colorMode: 'system',
    mapStyle: 'standard',
    fontSize: 'medium'
  },
  filterPreferences: {
    defaultFilters: {},
    showFilterPanel: true,
    applyFiltersAutomatically: true
  },
  panelPreferences: new Map([
    ['defaultContentTypes', {
      'top-left': 'map',
      'top-right': 'state',
      'bottom-left': 'county',
      'bottom-right': 'property'
    }]
  ])
};

/**
 * Get user preferences
 */
export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    let preferences = await UserPreferences.findOne({ userId });
    
    if (!preferences) {
      // Create default preferences if none exist
      preferences = new UserPreferences({
        userId,
        ...DEFAULT_PREFERENCES
      });
      
      await preferences.save();
    }
    
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    let preferences = await UserPreferences.findOne({ userId });
    
    if (!preferences) {
      // Create preferences if they don't exist
      preferences = new UserPreferences({
        userId,
        ...DEFAULT_PREFERENCES,
        ...req.body
      });
    } else {
      // Update existing preferences
      Object.entries(req.body).forEach(([key, value]) => {
        // @ts-ignore
        preferences[key] = value;
      });
    }
    
    await preferences.save();
    
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Reset user preferences to defaults
 */
export const resetUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // Delete existing preferences
    await UserPreferences.findOneAndDelete({ userId });
    
    // Create new default preferences
    const preferences = new UserPreferences({
      userId,
      ...DEFAULT_PREFERENCES
    });
    
    await preferences.save();
    
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
```

#### 4. Create API Routes

📄 **server/src/routes/layoutRoutes.ts**
```typescript
import { Router } from 'express';
import { getLayouts, getLayout, createLayout, updateLayout, deleteLayout, cloneLayout } from '../controllers/layoutController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Layout routes
router.get('/', getLayouts);
router.get('/:id', getLayout);
router.post('/', createLayout);
router.put('/:id', updateLayout);
router.delete('/:id', deleteLayout);
router.post('/:id/clone', cloneLayout);

export default router;
```

📄 **server/src/routes/countyRoutes.ts**
```typescript
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
```

📄 **server/src/routes/userPreferencesRoutes.ts**
```typescript
import { Router } from 'express';
import { getUserPreferences, updateUserPreferences, resetUserPreferences } from '../controllers/userPreferencesController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// User preferences routes
router.get('/', getUserPreferences);
router.put('/', updateUserPreferences);
router.post('/reset', resetUserPreferences);

export default router;
```

📄 **server/src/routes/index.ts**
```typescript
import { Router } from 'express';
import layoutRoutes from './layoutRoutes';
import countyRoutes from './countyRoutes';
import userPreferencesRoutes from './userPreferencesRoutes';

const router = Router();

router.use('/layouts', layoutRoutes);
router.use('/counties', countyRoutes);
router.use('/user/preferences', userPreferencesRoutes);

export default router;
```

#### 5. Set up MongoDB Connection

📄 **server/src/config/db.ts**
```typescript
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/real-estate-platform');
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    process.exit(1);
  }
};
```

#### 6. Initialize Express Server

📄 **server/src/server.ts**
```typescript
import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import { connectDB } from './config/db';
import routes from './routes';

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(json());

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
```

### ✅ AFTER IMPLEMENTATION

#### 🔍 Testing

1. Create test files for MongoDB schemas and controllers

📄 **server/src/__tests__/models/LayoutConfig.test.ts**
```typescript
import mongoose from 'mongoose';
import { LayoutConfig } from '../../models/LayoutConfig';

// Create a new MongoDB memory server for testing
// Note: This requires mongodb-memory-server package
// npm install --save-dev mongodb-memory-server
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('LayoutConfig Model', () => {
  it('should create a new layout config', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const layoutData = {
      userId,
      name: 'Test Layout',
      description: 'Test layout description',
      isDefault: true,
      isPublic: false,
      layoutType: 'quad' as const,
      panels: [
        {
          id: 'panel1',
          contentType: 'map',
          title: 'Map Panel'
        },
        {
          id: 'panel2',
          contentType: 'state',
          title: 'State Panel'
        },
        {
          id: 'panel3',
          contentType: 'county',
          title: 'County Panel'
        },
        {
          id: 'panel4',
          contentType: 'property',
          title: 'Property Panel'
        }
      ]
    };
    
    const layout = new LayoutConfig(layoutData);
    await layout.save();
    
    const savedLayout = await LayoutConfig.findById(layout._id);
    
    expect(savedLayout).toBeTruthy();
    expect(savedLayout?.name).toBe('Test Layout');
    expect(savedLayout?.layoutType).toBe('quad');
    expect(savedLayout?.panels).toHaveLength(4);
    expect(savedLayout?.panels[2].contentType).toBe('county');
  });
  
  it('should handle nested panel position and size', async () => {
    const userId = new mongoose.Types.ObjectId();
    
    const layoutData = {
      userId,
      name: 'Layout with Positions',
      layoutType: 'dual' as const,
      panels: [
        {
          id: 'panel1',
          contentType: 'map',
          title: 'Map Panel',
          position: { row: 0, col: 0 },
          size: { width: 50, height: 100 }
        },
        {
          id: 'panel2',
          contentType: 'property',
          title: 'Property Panel',
          position: { row: 0, col: 1 },
          size: { width: 50, height: 100 }
        }
      ]
    };
    
    const layout = new LayoutConfig(layoutData);
    await layout.save();
    
    const savedLayout = await LayoutConfig.findById(layout._id);
    
    expect(savedLayout?.panels[0].position.row).toBe(0);
    expect(savedLayout?.panels[0].position.col).toBe(0);
    expect(savedLayout?.panels[0].size.width).toBe(50);
    expect(savedLayout?.panels[1].size.height).toBe(100);
  });
});
```

2. Test the API endpoints with Postman or similar tool

3. Create a client for testing MongoDB connection

```bash
npm test
```

#### ✅ Commit your changes

```bash
git add .
git commit -m "Chunk 6: Implement MongoDB schemas and API routes with county support"
git push origin feature/mongodb-layout-api
```

#### 🔃 Create a Pull Request

1. Go to your repository on GitHub
2. Click on "Pull requests" > "New pull request"
3. Select your branch `feature/mongodb-layout-api`
4. Add a title: "Implement MongoDB Schemas and API Routes"
5. Add a description explaining the MongoDB schema design and API routes
6. Request review from team members

## 📈 Implementation References

### MongoDB Schema Design

The MongoDB schema design follows these principles:

1. **Document-Oriented**: Each entity (layout, user preferences, county) is represented as a document
2. **Nested Objects**: Complex objects like panel configurations are stored as nested documents
3. **References**: Related documents use references (e.g., defaultLayout in UserPreferences)
4. **Indexing**: Important fields are indexed for performance optimization

### API Endpoint Design

API endpoints follow RESTful conventions:

| Method | Endpoint                           | Description                           |
|--------|-----------------------------------|---------------------------------------|
| GET    | /api/layouts                      | Get all layouts for user              |
| GET    | /api/layouts/:id                  | Get specific layout                   |
| POST   | /api/layouts                      | Create new layout                     |
| PUT    | /api/layouts/:id                  | Update existing layout                |
| DELETE | /api/layouts/:id                  | Delete layout                         |
| POST   | /api/layouts/:id/clone            | Clone existing layout                 |
| GET    | /api/counties/state/:stateId      | Get counties for a state              |
| GET    | /api/counties/:countyId           | Get county details                    |
| GET    | /api/counties/:countyId/boundaries| Get county GeoJSON boundaries         |
| GET    | /api/counties/:countyId/stats     | Get county statistics                 |
| GET    | /api/user/preferences             | Get user preferences                  |
| PUT    | /api/user/preferences             | Update user preferences               |
| POST   | /api/user/preferences/reset       | Reset user preferences to defaults    |

