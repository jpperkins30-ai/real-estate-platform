# Troubleshooting Guide

## Common Issues and Solutions

### Authentication Issues

#### 1. Login Failures
```typescript
// Problem: Users unable to log in
// Check authentication middleware
const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('No token provided');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error('User not found');
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
};
```

**Solutions:**
1. Check token expiration
2. Verify JWT secret in environment variables
3. Ensure user exists in database
4. Check password hashing

#### 2. Token Refresh Issues
```typescript
// Implement token refresh endpoint
app.post('/auth/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new Error('No refresh token');
    
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newToken = generateAccessToken(decoded.id);
    
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

### Database Connection Issues

#### 1. MongoDB Connection Failures
```typescript
// Check connection configuration
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  retryWrites: true,
}).catch(error => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Monitor connection events
mongoose.connection.on('error', err => {
  console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});
```

**Solutions:**
1. Verify MongoDB URI
2. Check network connectivity
3. Ensure MongoDB service is running
4. Check firewall settings

#### 2. Performance Issues
```typescript
// Enable query debugging
mongoose.set('debug', true);

// Add query timing middleware
const queryTiming = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow query detected: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
};
```

### API Endpoint Issues

#### 1. Rate Limiting Problems
```typescript
// Configure rate limiter
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later',
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});
```

**Solutions:**
1. Adjust rate limit thresholds
2. Implement caching
3. Add request queuing
4. Monitor API usage patterns

#### 2. Request Timeout Issues
```typescript
// Set timeout middleware
const timeout = (req: Request, res: Response, next: NextFunction) => {
  res.setTimeout(5000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });
  next();
};

// Monitor long-running requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 5000) {
      console.warn(`Long request: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  next();
});
```

### File Upload Issues

#### 1. Image Upload Failures
```typescript
// Configure multer with error handling
const upload = multer({
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images are allowed'));
    }
    cb(null, true);
  }
}).array('images', 10);

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large' });
      }
      return res.status(400).json({ error: err.message });
    }
    // Handle successful upload
  });
});
```

**Solutions:**
1. Check file size limits
2. Verify file types
3. Ensure storage permissions
4. Monitor upload progress

### Search Issues

#### 1. Search Performance
```typescript
// Optimize search query
const searchProperties = async (query: string) => {
  try {
    const results = await Property.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .lean();
    
    return results;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// Monitor search performance
const searchTiming = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 500) {
      console.warn(`Slow search: "${req.query.q}" - ${duration}ms`);
    }
  });
  next();
};
```

### Memory Issues

#### 1. Memory Leaks
```typescript
// Monitor memory usage
const memoryCheck = setInterval(() => {
  const used = process.memoryUsage();
  console.log({
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`
  });
}, 30000);

// Clean up resources
process.on('SIGTERM', () => {
  clearInterval(memoryCheck);
  mongoose.connection.close();
  process.exit(0);
});
```

### Deployment Issues

#### 1. Environment Configuration
```typescript
// Validate environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'AWS_ACCESS_KEY',
  'AWS_SECRET_KEY'
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`);
  }
};
```

#### 2. Build Issues
```typescript
// Add build validation script
const validateBuild = async () => {
  try {
    // Check TypeScript compilation
    await exec('tsc --noEmit');
    
    // Run tests
    await exec('npm test');
    
    // Check bundle size
    const stats = await exec('npm run build:stats');
    const size = parseInt(stats.stdout);
    if (size > 5 * 1024 * 1024) {
      throw new Error('Bundle size too large');
    }
    
    console.log('Build validation passed');
  } catch (error) {
    console.error('Build validation failed:', error);
    process.exit(1);
  }
};
```

## Admin Dashboard Issues

### Missing Admin Dashboard Build Folder

**Problem:** The admin dashboard isn't visible when accessing http://localhost:3000/admin.

**Cause:** The `build` folder in the `admin-dashboard` directory is missing. This folder is required for the server to serve the admin dashboard static files.

**Solution:**

1. Create the build folder by running the build command:

```bash
# For Linux/macOS
cd admin-dashboard && npm run build

# For Windows CMD
cd admin-dashboard && npm run build

# For Windows PowerShell (which doesn't support &&)
cd admin-dashboard; npm run build
```

2. Alternatively, use the provided build scripts:

```bash
# For Linux/macOS
./build-admin.sh

# For Windows
build-admin.bat
```

3. If you encounter build errors, you can create a minimal placeholder by:
   - Manually creating the `admin-dashboard/build` directory
   - Creating an `index.html` file in this directory with basic content

### Windows PowerShell Command Syntax

**Problem:** Commands using the `&&` operator fail in PowerShell with the error:
```
The token '&&' is not a valid statement separator in this version.
```

**Cause:** PowerShell uses semicolons (`;`) as command separators instead of the ampersand (`&&`) used in bash and CMD.

**Solution:** 

1. Replace `&&` with `;` in PowerShell:

   Instead of:
   ```
   cd server && npm run dev
   ```

   Use:
   ```
   cd server; npm run dev
   ```

2. Alternatively, use CMD instead of PowerShell:
   ```
   cmd /c "cd server && npm run dev"
   ```

3. Use separate commands:
   ```
   cd server
   npm run dev
   ```

## Monitoring and Debugging

### 1. Logging Configuration
```typescript
// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Add request logging
app.use((req, res, next) => {
  logger.info({
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});
```

### 2. Error Tracking
```typescript
// Global error handler
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.id
  });
  
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  });
});
```

## Recovery Procedures

### 1. Database Recovery
```typescript
// Backup script
const backupDatabase = async () => {
  try {
    const timestamp = new Date().toISOString();
    const backupPath = `./backups/db-${timestamp}.gz`;
    
    await exec(`mongodump --uri="${process.env.MONGODB_URI}" --gzip --archive=${backupPath}`);
    console.log(`Backup created: ${backupPath}`);
  } catch (error) {
    console.error('Backup failed:', error);
  }
};

// Restore script
const restoreDatabase = async (backupPath: string) => {
  try {
    await exec(`mongorestore --uri="${process.env.MONGODB_URI}" --gzip --archive=${backupPath}`);
    console.log('Database restored successfully');
  } catch (error) {
    console.error('Restore failed:', error);
  }
};
```

### 2. Application Recovery
```typescript
// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    memory: process.memoryUsage(),
    mongodb: mongoose.connection.readyState === 1,
    redis: redisClient.connected
  };
  
  const status = health.mongodb && health.redis ? 200 : 503;
  res.status(status).json(health);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Starting graceful shutdown...');
  
  // Close server
  server.close(() => {
    console.log('HTTP server closed');
  });
  
  // Close database connection
  await mongoose.connection.close();
  console.log('Database connection closed');
  
  // Close Redis connection
  await redisClient.quit();
  console.log('Redis connection closed');
  
  process.exit(0);
});
```

## Performance Optimization

### 1. Caching Strategy
```typescript
// Redis cache middleware
const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        return res.json(JSON.parse(cached));
      }
      
      const originalJson = res.json;
      res.json = (body: any) => {
        redisClient.setex(key, duration, JSON.stringify(body));
        return originalJson.call(res, body);
      };
      
      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};
```

## Creating Backups

### Git Backup Process

Creating regular backups is essential to ensure you can recover from unexpected issues. The project includes backup scripts to help you create Git-based backups quickly.

#### Using Backup Scripts

1. **PowerShell Script** (Windows PowerShell):
   ```powershell
   .\create-backup.ps1
   ```

2. **Batch Script** (Windows CMD):
   ```batch
   create-backup.bat
   ```

The backup scripts will:
1. Initialize Git if not already initialized
2. Create a new branch with a timestamp (e.g., `backup-2023-03-21-235959`)
3. Add all current files to the backup
4. Commit the changes with a descriptive message
5. Return to the main branch

#### Restoring from a Backup

To restore from a backup:

1. List available backup branches:
   ```bash
   git branch
   ```

2. Checkout the desired backup branch:
   ```bash
   git checkout backup-YYYY-MM-DD-HHMMSS
   ```

3. If you want to restore the entire project to this state:
   ```bash
   git checkout -b restored-branch
   ```

#### Manual Backup Process

If you prefer to create backups manually:

1. Create a new branch with a descriptive name:
   ```bash
   git checkout -b backup-manual-YYYY-MM-DD
   ```

2. Add all files:
   ```bash
   git add .
   ```

3. Commit the changes:
   ```bash
   git commit -m "Manual backup created on YYYY-MM-DD"
   ```

4. Return to the main branch:
   ```bash
   git checkout main
   ```

### Database Backup

For database backups:

1. Using MongoDB's built-in tools:
   ```bash
   mongodump --uri="mongodb://localhost:27017/real-estate" --out=./backups/db-YYYY-MM-DD
   ```

2. Restore from a backup:
   ```bash
   mongorestore --uri="mongodb://localhost:27017/real-estate" --dir=./backups/db-YYYY-MM-DD/real-estate
   ```