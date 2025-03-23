# Development Guide

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Git

### Development Environment Setup

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/real-estate-platform.git
cd real-estate-platform
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/real-estate
MONGODB_TEST_URI=mongodb://localhost:27017/real-estate-test

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1d

# Email Service
EMAIL_SERVICE=smtp.example.com
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=debug
```

4. **Start Development Server**
```bash
npm run dev
```

## Project Structure

```
.
├── docs/                   # Documentation files
├── server/
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   │   ├── env.ts     # Environment configuration
│   │   │   └── db.ts      # Database configuration
│   │   ├── middleware/    # Custom middleware
│   │   │   ├── auth.ts    # Authentication middleware
│   │   │   └── validation.ts # Input validation
│   │   ├── models/        # Mongoose models
│   │   │   ├── User.ts    # User model
│   │   │   └── Property.ts # Property model
│   │   ├── routes/        # API routes
│   │   │   ├── auth.ts    # Authentication routes
│   │   │   └── properties.ts # Property routes
│   │   ├── utils/         # Utility functions
│   │   │   ├── auth.ts    # Auth utilities
│   │   │   └── email.ts   # Email utilities
│   │   └── app.ts         # Express app setup
│   └── tests/             # Test files
│       ├── auth.test.ts   # Auth tests
│       └── properties.test.ts # Property tests
├── .env.example           # Example environment variables
├── .gitignore
├── package.json
└── tsconfig.json
```

## Code Style Guide

### TypeScript Guidelines

1. **Type Definitions**
```typescript
// Use interfaces for object types
interface IUser {
  email: string;
  password: string;
  resetToken?: string;
  resetTokenExpires?: Date;
}

// Use type for unions or complex types
type SortOrder = 'asc' | 'desc';
type PropertyStatus = 'Available' | 'Under Contract' | 'Sold' | 'Off Market';
```

2. **Async/Await**
```typescript
// Prefer async/await over promises
async function getUser(id: string): Promise<IUser> {
  try {
    const user = await User.findById(id);
    if (!user) throw new Error('User not found');
    return user;
  } catch (error) {
    throw error;
  }
}
```

3. **Error Handling**
```typescript
// Use custom error classes
class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Handle errors consistently
try {
  // ... code
} catch (error) {
  if (error instanceof APIError) {
    // Handle known errors
  } else {
    // Handle unknown errors
  }
}
```

### API Design Guidelines

1. **Route Structure**
```typescript
// Group related routes
router.route('/properties')
  .get(listProperties)
  .post(createProperty);

router.route('/properties/:id')
  .get(getProperty)
  .put(updateProperty)
  .delete(deleteProperty);
```

2. **Controller Pattern**
```typescript
// Separate route logic into controllers
export const listProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Implementation
  } catch (error) {
    next(error);
  }
};
```

3. **Middleware Usage**
```typescript
// Chain middleware effectively
router.post(
  '/properties',
  authenticateToken,
  propertyValidation,
  handleValidationErrors,
  createProperty
);
```

## Testing

### Unit Tests
```typescript
describe('User Model', () => {
  it('should hash password before saving', async () => {
    const user = new User({
      email: 'test@example.com',
      password: 'password123'
    });
    await user.save();
    expect(user.password).not.toBe('password123');
    expect(user.password).toMatch(/^\$2[aby]\$\d+\$/);
  });
});
```

### Integration Tests
```typescript
describe('Property API', () => {
  it('should create a new property', async () => {
    const response = await request(app)
      .post('/api/properties')
      .set('Authorization', `Bearer ${token}`)
      .send({
        address: '123 Main St',
        city: 'Boston',
        // ... other required fields
      });
    expect(response.status).toBe(201);
    expect(response.body.property).toHaveProperty('_id');
  });
});
```

## Database

### Indexes
```typescript
// Property Model indexes
PropertySchema.index({ location: '2dsphere' });
PropertySchema.index({ price: 1, propertyType: 1 });
PropertySchema.index({ createdAt: -1 });
```

### Migrations
```typescript
// Example migration script
async function migrate() {
  try {
    await Property.updateMany(
      { status: { $exists: false } },
      { $set: { status: 'Available' } }
    );
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
```

## Debugging

### Logging
```typescript
// Use debug package for development logging
import debug from 'debug';
const log = debug('app:properties');

log('Fetching properties with filters:', filters);
```

### Error Tracking
```typescript
// Integrate with error tracking service
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV
});
```

## Performance Optimization

### Caching
```typescript
// Example Redis caching
import Redis from 'ioredis';
const redis = new Redis();

async function getProperty(id: string) {
  // Try cache first
  const cached = await redis.get(`property:${id}`);
  if (cached) return JSON.parse(cached);

  // Fetch from database
  const property = await Property.findById(id);
  
  // Cache for 1 hour
  await redis.set(
    `property:${id}`,
    JSON.stringify(property),
    'EX',
    3600
  );

  return property;
}
```

### Query Optimization
```typescript
// Use lean queries for read operations
const properties = await Property.find(query)
  .lean()
  .select('address city price')
  .limit(10);

// Use aggregation for complex queries
const stats = await Property.aggregate([
  { $match: { status: 'Sold' } },
  { $group: {
    _id: '$city',
    avgPrice: { $avg: '$price' },
    count: { $sum: 1 }
  }}
]);
```

## Deployment

### Production Build
```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

### Docker Support
```dockerfile
FROM node:14-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY dist/ ./dist/

CMD ["npm", "start"]
```

### Environment Variables
```bash
# Production environment
export NODE_ENV=production
export MONGODB_URI=mongodb+srv://...
export JWT_SECRET=...
```

## Contributing

### Pull Request Process
1. Create feature branch
2. Write tests
3. Update documentation
4. Submit PR with description
5. Wait for review

### Code Review Guidelines
- Check type safety
- Verify test coverage
- Review security implications
- Validate documentation
- Check performance impact

## Security

### Authentication
- Use secure session management
- Implement rate limiting
- Validate JWT tokens
- Secure password reset flow

### Data Protection
- Sanitize user input
- Validate file uploads
- Implement CORS properly
- Use HTTPS in production

## Monitoring

### Health Checks
```typescript
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});
```

### Metrics
```typescript
import prometheus from 'prom-client';

// Define metrics
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status']
});
```

## Additional Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Docker Documentation](https://docs.docker.com/) 