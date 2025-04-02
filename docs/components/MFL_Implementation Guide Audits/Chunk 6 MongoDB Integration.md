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

export interface PanelPosition {
  row: number;
  col: number;
}

export interface PanelSize {
  width: number;
  height: number;
}

export interface PanelConfig {
  id: string;
  contentType: string;
  title: string;
  position?: PanelPosition;
  size?: PanelSize;
  state?: any;
  visible?: boolean;
}

export interface ILayoutConfig extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  layoutType: 'single' | 'dual' | 'tri' | 'quad';
  panels: PanelConfig[];
  createdAt: Date;
  updatedAt: Date;
}

const LayoutConfigSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  isDefault: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  layoutType: {
    type: String,
    enum: ['single', 'dual', 'tri', 'quad'],
    required: true
  },
  panels: [{
    id: {
      type: String,
      required: true
    },
    contentType: {
      type: String,
      required: true
    },
    title: String,
    position: {
      row: Number,
      col: Number
    },
    size: {
      width: Number,
      height: Number
    },
    state: Schema.Types.Mixed,
    visible: {
      type: Boolean,
      default: true
    }
  }],
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
LayoutConfigSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const LayoutConfig = mongoose.model<ILayoutConfig>('LayoutConfig', LayoutConfigSchema);
```

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
  stateId: string;
  name: string;
  fips: string;
  boundaries: any; // GeoJSON
  population: number;
  propertyCount: number;
  stats: {
    medianHomePrice: number;
    avgDaysOnMarket: number;
    listingCount: number;
    priceChangeYoY: number;
    lastUpdated: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CountySchema = new Schema({
  stateId: {
    type: String,
    required: true,
    index: true
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
    medianHomePrice: Number,
    avgDaysOnMarket: Number,
    listingCount: Number,
    priceChangeYoY: Number,
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
  next();
});

// Indexes for optimization
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

I'll continue with the implementation of Chunk 6, focusing on completing the API controllers and routes with proper attention to county-level functionality.

#### 3. Create API Controllers (continued)

📄 **server/src/controllers/layoutController.ts** (continued)
```typescript
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
      .select('name fips population propertyCount')
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
    
    const county = await County.findOne({ _id: countyId })
      .select('stats population propertyCount');
    
    if (!county) {
      return res.status(404).json({ message: 'County not found' });
    }
    
    res.status(200).json({
      ...county.stats.toObject(),
      population: county.population,
      propertyCount: county.propertyCount
    });
  } catch (error) {
    console.error(`Error fetching county stats ${req.params.countyId}:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get county controller status
 */
export const getCountyControllerStatus = async (req: Request, res: Response) => {
  try {
    const { countyId } = req.params;
    
    // This would connect to your controller system
    // For now, returning mock data
    const hasController = Math.random() > 0.5;
    
    let status = null;
    let lastRun = null;
    
    if (hasController) {
      const statuses = ['active', 'inactive', 'error'];
      status = statuses[Math.floor(Math.random() * statuses.length)];
      lastRun = new Date(Date.now() - Math.random() * 86400000 * 30).toISOString();
    }
    
    res.status(200).json({
      hasController,
      status,
      lastRun
    });
  } catch (error) {
    console.error(`Error fetching county controller status ${req.params.countyId}:`, error);
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

