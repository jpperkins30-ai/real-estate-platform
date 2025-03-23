# Mongoose Guide

## Setup and Configuration

### Installation
```bash
npm install mongoose
npm install @types/mongoose # For TypeScript support
```

### Connection Setup
```typescript
// src/config/database.ts
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
```

## Schema Definitions

### User Schema
```typescript
// src/models/User.ts
import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, {
  timestamps: true,
});

// Pre-save middleware for password hashing
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = model<IUser>('User', userSchema);
```

### Property Schema
```typescript
// src/models/Property.ts
import { Schema, model, Document } from 'mongoose';

export interface IProperty extends Document {
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
}

const propertySchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  location: {
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      index: '2dsphere',
    },
  },
  features: [{
    type: String,
    trim: true,
  }],
  images: [{
    type: String,
    required: [true, 'At least one image is required'],
  }],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Property owner is required'],
  },
}, {
  timestamps: true,
});

// Index for text search
propertySchema.index({
  title: 'text',
  description: 'text',
  'location.address': 'text',
  'location.city': 'text',
});

export const Property = model<IProperty>('Property', propertySchema);
```

## Querying Data

### Basic CRUD Operations
```typescript
// Create
const newUser = await User.create({
  email: 'user@example.com',
  password: 'password123',
  name: 'John Doe',
});

// Read
const user = await User.findById(userId);
const users = await User.find({ role: 'user' });

// Update
const updatedUser = await User.findByIdAndUpdate(
  userId,
  { name: 'Jane Doe' },
  { new: true, runValidators: true }
);

// Delete
await User.findByIdAndDelete(userId);
```

### Advanced Queries
```typescript
// Pagination
const page = 1;
const limit = 10;
const properties = await Property.find()
  .skip((page - 1) * limit)
  .limit(limit)
  .sort('-createdAt');

// Population
const property = await Property.findById(propertyId)
  .populate('owner', 'name email');

// Aggregation
const cityStats = await Property.aggregate([
  {
    $group: {
      _id: '$location.city',
      avgPrice: { $avg: '$price' },
      count: { $sum: 1 }
    }
  },
  { $sort: { avgPrice: -1 } }
]);

// Geospatial Query
const nearbyProperties = await Property.find({
  'location.coordinates': {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      $maxDistance: 10000 // 10km
    }
  }
});
```

## Middleware and Hooks

### Pre and Post Hooks
```typescript
// Pre-save hook
schema.pre('save', function(next) {
  // Do something before saving
  next();
});

// Post-save hook
schema.post('save', function(doc) {
  // Do something after saving
});

// Error handling middleware
schema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('Duplicate key error'));
  } else {
    next(error);
  }
});
```

## Validation

### Custom Validators
```typescript
const propertySchema = new Schema({
  price: {
    type: Number,
    validate: {
      validator: function(value: number) {
        return value >= 0;
      },
      message: 'Price must be non-negative'
    }
  },
  images: {
    type: [String],
    validate: {
      validator: function(v: string[]) {
        return v.length <= 10;
      },
      message: 'Maximum 10 images allowed'
    }
  }
});
```

## Error Handling

### Common Errors and Solutions
```typescript
try {
  await document.save();
} catch (error) {
  if (error.name === 'ValidationError') {
    // Handle validation errors
    Object.values(error.errors).forEach(err => {
      console.error(err.message);
    });
  } else if (error.code === 11000) {
    // Handle duplicate key errors
    console.error('Duplicate key error');
  } else {
    // Handle other errors
    console.error('Database error:', error);
  }
}
```

## Performance Optimization

### Indexing
```typescript
// Single field index
schema.index({ email: 1 });

// Compound index
schema.index({ location: '2dsphere', price: 1 });

// Text index
schema.index({
  title: 'text',
  description: 'text'
});
```

### Query Optimization
```typescript
// Select specific fields
const user = await User.findById(id).select('name email');

// Lean queries for better performance
const users = await User.find().lean();

// Explain query execution
const explanation = await User.find()
  .explain('executionStats');
```

## Best Practices

1. **Schema Design**
   - Keep schemas focused and cohesive
   - Use appropriate data types
   - Implement proper validation
   - Add indexes for frequently queried fields

2. **Query Optimization**
   - Use lean() for read-only operations
   - Implement pagination
   - Select only required fields
   - Use appropriate indexes

3. **Error Handling**
   - Implement proper error handling middleware
   - Use try-catch blocks
   - Handle common MongoDB errors
   - Implement proper validation

4. **Security**
   - Hash sensitive data
   - Implement access control
   - Validate input data
   - Use environment variables for credentials

## Troubleshooting

### Common Issues

1. **Connection Issues**
```typescript
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
});
```

2. **Memory Leaks**
```typescript
// Clean up resources
mongoose.connection.close();

// Handle process termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
});
```

3. **Performance Issues**
```typescript
// Enable debugging
mongoose.set('debug', true);

// Monitor query performance
schema.pre('find', function() {
  this._startTime = Date.now();
});

schema.post('find', function() {
  if (Date.now() - this._startTime > 100) {
    console.warn('Slow query detected');
  }
});
``` 