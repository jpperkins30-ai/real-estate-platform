# Security Documentation

## Overview
This document outlines the security measures, best practices, and guidelines implemented in the Real Estate Platform to protect user data, prevent unauthorized access, and maintain system integrity.

## Authentication and Authorization

### JWT Implementation
```javascript
// JWT configuration
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id,
      email: user.email,
      role: user.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '24h',
      algorithm: 'HS256'
    }
  );
};

// Token verification middleware
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new Error('No token provided');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
```

### Password Security
```javascript
// Password hashing configuration
const bcrypt = require('bcrypt');
const SALT_ROUNDS = 12;

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
    next();
  } catch (error) {
    next(error);
  }
});

// Password validation method
userSchema.methods.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};
```

### Role-Based Access Control (RBAC)
```javascript
// Role definitions
const ROLES = {
  ADMIN: 'admin',
  AGENT: 'agent',
  USER: 'user'
};

// Role-based middleware
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions'
      });
    }
    next();
  };
};

// Usage example
router.post('/properties',
  verifyToken,
  checkRole([ROLES.ADMIN, ROLES.AGENT]),
  createProperty
);
```

## Data Protection

### Input Validation and Sanitization
```javascript
// Input validation middleware
const { body, validationResult } = require('express-validator');

const propertyValidation = [
  body('address')
    .trim()
    .escape()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
    
  body('price')
    .isFloat({ min: 0, max: 1000000000 })
    .withMessage('Invalid price range'),
    
  // Validate and sanitize other fields
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

### File Upload Security
```javascript
// File upload configuration
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow only specific file types
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    cb(new Error('Invalid file type'), false);
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});
```

### Data Encryption
```javascript
// Encryption utility
const crypto = require('crypto');

const encryption = {
  algorithm: 'aes-256-gcm',
  
  encrypt: (text) => {
    const iv = crypto.randomBytes(16);
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    
    const cipher = crypto.createCipheriv(encryption.algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    return {
      content: encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  },
  
  decrypt: (encrypted) => {
    const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
    const iv = Buffer.from(encrypted.iv, 'hex');
    const authTag = Buffer.from(encrypted.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv(encryption.algorithm, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted.content, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
};
```

## API Security

### Rate Limiting
```javascript
// Rate limiting configuration
const rateLimit = require('express-rate-limit');

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Strict limiter for authentication routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many login attempts, please try again later'
});

// Apply limiters
app.use(globalLimiter);
app.use('/api/auth', authLimiter);
```

### CORS Configuration
```javascript
// CORS setup
const cors = require('cors');

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS.split(','),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));
```

### Request Validation
```javascript
// Request validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: error.details[0].message
      });
    }
    next();
  };
};

// Usage with Joi schema
const propertySchema = Joi.object({
  address: Joi.string().required().min(5).max(200),
  price: Joi.number().required().min(0).max(1000000000),
  // ... other validations
});

router.post('/properties',
  validateRequest(propertySchema),
  createProperty
);
```

## Session Management

### Session Configuration
```javascript
// Session setup
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
  secret: process.env.SESSION_SECRET,
  name: 'sessionId', // Don't use default connect.sid
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 24 hours
  }),
  resave: false,
  saveUninitialized: false
}));
```

### Session Management
```javascript
// Session management utilities
const sessionManager = {
  // Create new session
  create: (req, user) => {
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.lastActive = Date.now();
  },
  
  // Validate session
  validate: (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({
        error: 'Session expired'
      });
    }
    
    // Update last active timestamp
    req.session.lastActive = Date.now();
    next();
  },
  
  // Destroy session
  destroy: (req) => {
    return new Promise((resolve) => {
      req.session.destroy((err) => {
        if (err) console.error('Session destruction error:', err);
        resolve();
      });
    });
  }
};
```

## Security Headers

### Helmet Configuration
```javascript
// Security headers setup
const helmet = require('helmet');

app.use(helmet());

// Custom CSP configuration
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", "https://api.example.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
}));
```

## Logging and Monitoring

### Security Event Logging
```javascript
// Security event logger
const winston = require('winston');

const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: 'logs/security.log',
      level: 'info'
    })
  ]
});

// Log security events
const logSecurityEvent = (event) => {
  securityLogger.info({
    ...event,
    timestamp: new Date(),
    environment: process.env.NODE_ENV
  });
};

// Usage example
app.post('/api/auth/login', async (req, res) => {
  try {
    // ... login logic
    logSecurityEvent({
      type: 'LOGIN_SUCCESS',
      user: user.email,
      ip: req.ip
    });
  } catch (error) {
    logSecurityEvent({
      type: 'LOGIN_FAILURE',
      attempt: req.body.email,
      ip: req.ip,
      reason: error.message
    });
  }
});
```

### Activity Monitoring
```javascript
// Activity monitoring middleware
const monitorActivity = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  const requestLog = {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date()
  };
  
  // Log response details
  res.on('finish', () => {
    const duration = Date.now() - start;
    const responseLog = {
      ...requestLog,
      statusCode: res.statusCode,
      duration,
      user: req.user?.id
    };
    
    // Log suspicious activity
    if (duration > 5000 || res.statusCode >= 400) {
      logSecurityEvent({
        type: 'SUSPICIOUS_ACTIVITY',
        ...responseLog
      });
    }
  });
  
  next();
};
```

## Security Best Practices

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- No common passwords
- No personal information

### API Security Checklist
1. Use HTTPS everywhere
2. Implement proper authentication
3. Use secure session management
4. Validate all inputs
5. Implement rate limiting
6. Use security headers
7. Monitor for suspicious activity
8. Regular security audits
9. Keep dependencies updated
10. Implement proper error handling

### Development Guidelines
1. Never commit sensitive data
2. Use environment variables
3. Regular dependency updates
4. Code review security aspects
5. Regular security training
6. Incident response plan
7. Regular backups
8. Audit logging
9. Secure deployment process
10. Regular penetration testing

## Incident Response

### Response Plan
1. Identify and isolate the incident
2. Assess the damage
3. Notify affected parties
4. Fix the vulnerability
5. Review and improve security measures

### Contact Information
- Security Team: security@example.com
- Emergency Contact: +1-XXX-XXX-XXXX
- Legal Team: legal@example.com

## Compliance

### GDPR Compliance
- Data minimization
- User consent management
- Data deletion requests
- Privacy policy
- Data breach notification

### PCI Compliance
- Secure card data handling
- Regular security assessments
- Incident response procedures
- Employee training
- Access control 