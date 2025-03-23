# Application Structure Guide

## Directory Structure
```
src/
├── config/           # Configuration files
├── controllers/      # Route controllers
├── middleware/       # Custom middleware
├── models/          # Database models
├── routes/          # API routes
├── services/        # Business logic
├── utils/           # Utility functions
└── types/           # TypeScript type definitions
```

## Routes

### Route Organization
```typescript
// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth.routes';
import propertyRoutes from './property.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/properties', propertyRoutes);
router.use('/users', userRoutes);

export default router;
```

### Route Definition
```typescript
// src/routes/property.routes.ts
import { Router } from 'express';
import { PropertyController } from '../controllers/property.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateProperty } from '../middleware/validation.middleware';

const router = Router();
const controller = new PropertyController();

router.get('/', controller.getAllProperties);
router.get('/:id', controller.getPropertyById);
router.post('/', 
  authMiddleware, 
  validateProperty, 
  controller.createProperty
);
router.put('/:id', 
  authMiddleware, 
  validateProperty, 
  controller.updateProperty
);
router.delete('/:id', 
  authMiddleware, 
  controller.deleteProperty
);

export default router;
```

## Controllers

### Controller Structure
```typescript
// src/controllers/property.controller.ts
import { Request, Response } from 'express';
import { PropertyService } from '../services/property.service';
import { ApiError } from '../utils/api-error';

export class PropertyController {
  private service: PropertyService;

  constructor() {
    this.service = new PropertyService();
  }

  async getAllProperties(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const properties = await this.service.findAll({
        page: Number(page),
        limit: Number(limit),
        ...filters
      });
      res.json(properties);
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch properties');
    }
  }

  async createProperty(req: Request, res: Response) {
    try {
      const property = await this.service.create({
        ...req.body,
        owner: req.user.id
      });
      res.status(201).json(property);
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(400, 'Property already exists');
      }
      throw error;
    }
  }
}
```

## Middleware

### Authentication Middleware
```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      throw new ApiError(401, 'No token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
```

### Validation Middleware
```typescript
// src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/api-error';

export const validateProperty = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('location.address').trim().notEmpty().withMessage('Address is required'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', errors.array());
    }
    next();
  }
];
```

### Error Handling Middleware
```typescript
// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      error: error.message,
      details: error.details
    });
  }

  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};
```

## Models

### Base Model
```typescript
// src/models/base.model.ts
import { Schema, Document } from 'mongoose';

export interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

export const baseSchema = new Schema({
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

baseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});
```

### Property Model
```typescript
// src/models/property.model.ts
import { Schema, model } from 'mongoose';
import { BaseDocument, baseSchema } from './base.model';

export interface IProperty extends BaseDocument {
  title: string;
  description: string;
  price: number;
  location: {
    address: string;
    city: string;
    coordinates: [number, number];
  };
  features: string[];
  images: string[];
  owner: Schema.Types.ObjectId;
  status: 'active' | 'pending' | 'sold';
}

const propertySchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
    index: true
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      index: '2dsphere'
    }
  },
  features: [{
    type: String,
    trim: true
  }],
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property owner is required']
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'sold'],
    default: 'active'
  }
}).add(baseSchema);

// Indexes
propertySchema.index({ title: 'text', description: 'text' });
propertySchema.index({ 'location.coordinates': '2dsphere' });

export const Property = model<IProperty>('Property', propertySchema);
```

## Services

### Service Layer
```typescript
// src/services/property.service.ts
import { Property } from '../models/property.model';
import { ApiError } from '../utils/api-error';

export class PropertyService {
  async findAll(query: any) {
    try {
      const { page, limit, ...filters } = query;
      const skip = (page - 1) * limit;

      const [properties, total] = await Promise.all([
        Property.find(filters)
          .skip(skip)
          .limit(limit)
          .sort('-createdAt')
          .populate('owner', 'name email'),
        Property.countDocuments(filters)
      ]);

      return {
        properties,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new ApiError(500, 'Failed to fetch properties');
    }
  }

  async create(data: any) {
    try {
      const property = await Property.create(data);
      return property;
    } catch (error) {
      if (error.code === 11000) {
        throw new ApiError(400, 'Property already exists');
      }
      throw error;
    }
  }
}
```

## Common Issues and Solutions

### 1. Route Issues
```typescript
// Problem: Routes not working
// Solution: Check route registration
app.use('/api', routes); // Make sure routes are registered with correct prefix

// Problem: Route parameters not being parsed
// Solution: Add body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

### 2. Controller Issues
```typescript
// Problem: Controller methods not being called
// Solution: Check method binding
class PropertyController {
  constructor() {
    this.getAllProperties = this.getAllProperties.bind(this);
    this.createProperty = this.createProperty.bind(this);
  }
}

// Problem: Request body undefined
// Solution: Add body parser middleware
app.use(express.json());
```

### 3. Middleware Issues
```typescript
// Problem: Middleware not executing
// Solution: Check middleware order
app.use(express.json());
app.use(authMiddleware);
app.use(routes);

// Problem: Validation errors not being caught
// Solution: Add error handling middleware
app.use(errorHandler);
```

### 4. Model Issues
```typescript
// Problem: Mongoose model not found
// Solution: Check model registration
import { model } from 'mongoose';
import { IProperty } from '../types/property.types';

const Property = model<IProperty>('Property', propertySchema);

// Problem: Schema validation failing
// Solution: Check schema definition
const propertySchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  }
});
```

### 5. Service Issues
```typescript
// Problem: Service methods not working
// Solution: Check service instantiation
const propertyService = new PropertyService();

// Problem: Database operations failing
// Solution: Add error handling
try {
  const result = await Property.create(data);
  return result;
} catch (error) {
  console.error('Database error:', error);
  throw new ApiError(500, 'Failed to create property');
}
```

## Best Practices

1. **Route Organization**
   - Group related routes
   - Use route parameters
   - Implement proper HTTP methods
   - Add route documentation

2. **Controller Design**
   - Keep controllers thin
   - Move business logic to services
   - Handle errors properly
   - Use proper HTTP status codes

3. **Middleware Usage**
   - Order middleware correctly
   - Implement proper error handling
   - Use async/await properly
   - Add request validation

4. **Model Design**
   - Use proper schema validation
   - Add appropriate indexes
   - Implement virtuals when needed
   - Use TypeScript interfaces

5. **Service Layer**
   - Keep business logic in services
   - Implement proper error handling
   - Use transactions when needed
   - Add logging for debugging 