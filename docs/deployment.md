# Deployment Guide

## Overview

This guide covers the deployment process for the Real Estate Platform, including environment setup, deployment strategies, and monitoring.

## Prerequisites

- Node.js 14.x or higher
- MongoDB 4.4 or higher
- PM2 or similar process manager
- SSL certificate
- Domain name

## Environment Setup

### Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb://user:pass@host:port/database
JWT_SECRET=your-secure-jwt-secret
JWT_EXPIRATION=24h
CORS_ORIGIN=https://your-frontend-domain.com
```

### Production Configuration

```typescript
// config/production.ts
export default {
  server: {
    port: process.env.PORT || 4000,
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true
    }
  },
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10
    }
  },
  logging: {
    level: 'error',
    filename: 'logs/app.log'
  }
};
```

## Build Process

### Building the Application

```bash
# Install dependencies
npm ci

# Build TypeScript
npm run build

# Verify build
npm run test
```

### Docker Setup

```dockerfile
# Dockerfile
FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY .env.production ./.env

EXPOSE 4000

CMD ["npm", "start"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
    restart: unless-stopped

  mongodb:
    image: mongo:4.4
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

## Deployment Strategies

### PM2 Deployment

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'real-estate-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: 'logs/err.log',
    out_file: 'logs/out.log'
  }]
};
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/real-estate-api
server {
    listen 443 ssl http2;
    server_name api.your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Database Management

### MongoDB Indexes

```javascript
// Create indexes in production
db.properties.createIndex({ "address.location": "2dsphere" });
db.properties.createIndex({ price: 1, status: 1 });
db.users.createIndex({ email: 1 }, { unique: true });
```

### Backup Strategy

```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d)
mongodump --uri="$MONGODB_URI" --out="/backups/$DATE"
aws s3 sync /backups/$DATE s3://your-bucket/backups/$DATE
```

## Monitoring

### Health Check Endpoint

```typescript
// src/routes/health.ts
router.get('/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      mongodb: 'connected'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      details: error.message
    });
  }
});
```

### Prometheus Metrics

```typescript
// src/middleware/metrics.ts
import prometheus from 'prom-client';

const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration / 1000);
  });
  next();
});
```

## Security Measures

### SSL Configuration

```javascript
// src/server.ts
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('/path/to/key.pem'),
  cert: fs.readFileSync('/path/to/cert.pem')
};

https.createServer(options, app).listen(443);
```

### Security Headers

```typescript
// src/middleware/security.ts
import helmet from 'helmet';

app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    scriptSrc: ["'self'"]
  }
}));
```

## Continuous Deployment

### GitHub Actions Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app/real-estate-platform
            git pull
            npm ci
            npm run build
            pm2 reload ecosystem.config.js --env production
```

## Rollback Procedure

```bash
# Rollback script
#!/bin/bash
VERSION=$1

# Stop current version
pm2 stop real-estate-api

# Checkout specific version
git checkout $VERSION

# Rebuild
npm ci
npm run build

# Start new version
pm2 start ecosystem.config.js --env production
```

## Performance Optimization

### Node.js Settings

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'real-estate-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    node_args: '--max-old-space-size=4096',
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
```

### Caching Strategy

```typescript
// src/services/cache.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3
});

export const cacheMiddleware = (duration: number) => async (req, res, next) => {
  const key = `__express__${req.originalUrl}`;
  const cached = await redis.get(key);

  if (cached) {
    return res.json(JSON.parse(cached));
  }

  res.sendResponse = res.json;
  res.json = (body) => {
    redis.setex(key, duration, JSON.stringify(body));
    res.sendResponse(body);
  };

  next();
};
```

## Maintenance

### Log Rotation

```javascript
// winston-config.js
import winston from 'winston';
import 'winston-daily-rotate-file';

const transport = new winston.transports.DailyRotateFile({
  filename: 'logs/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d'
});
```

### Database Maintenance

```bash
# MongoDB maintenance script
#!/bin/bash

# Compact database
mongo $MONGODB_URI --eval "db.runCommand({ compact: 'properties' })"

# Repair database
mongod --repair --dbpath /var/lib/mongodb

# Analyze indexes
mongo $MONGODB_URI --eval "db.properties.aggregate([{'\$indexStats': {}}])"
``` 