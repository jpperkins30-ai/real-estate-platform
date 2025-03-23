# Logging System Quick Reference

This document provides a quick reference for using the Real Estate Platform's logging system.

## Core Logging Functions

Located in `server/src/utils/logger.ts`:

```typescript
// Basic logging functions
logInfo(message, metadata);      // For general information
logError(message, error, metadata); // For errors (includes stack trace)
logWarning(message, metadata);   // For potential issues
logDebug(message, metadata);     // For debug information
logHttp(message, metadata);      // For HTTP requests/responses
```

## Domain-Specific Logging

Located in `server/src/utils/appLogger.ts`:

```typescript
// Database operations
logDbOperation(operation, collection, query, result);

// Authentication events
logAuthEvent(event, userId, success, metadata);

// Property management
logPropertyAction(action, propertyId, userId, metadata);

// Performance metrics
logPerformance(metricName, durationMs, metadata);
startPerformanceTimer(metricName, metadata); // Returns a function to end timing

// API requests
logApiRequest(method, endpoint, userId, metadata);
```

## Activity Logging Middleware

Located in `server/src/middleware/activityLogger.ts`:

```typescript
// In your route definitions
import activityLogger from '../middleware/activityLogger';

router.get('/:id', 
  authenticate, 
  activityLogger.viewResource('property'),
  controllerFunction
);

router.post('/', 
  authenticate,
  activityLogger.createResource('property', ['sensitiveField']),
  controllerFunction
);

router.put('/:id',
  authenticate,
  activityLogger.updateResource('property'),
  controllerFunction
);

router.delete('/:id',
  authenticate,
  activityLogger.deleteResource('property'),
  controllerFunction
);
```

## Command Line Log Tools

Located in `server/src/scripts/log-tools.ts`, run with `npm run logs`:

```bash
# Search logs with filters
npm run logs search --level error --date 2023-07-01 --message "error text" --user userId

# Show statistics about logs
npm run logs stats --days 7

# Clean old log files
npm run logs clean --days 30 --dry-run
```

### Search Command Options

| Option | Description |
|--------|-------------|
| `-l, --level <level>` | Filter by log level (error, warn, info, http, debug) |
| `-d, --date <date>` | Filter by date (YYYY-MM-DD) |
| `-m, --message <text>` | Search in message text |
| `-u, --user <userId>` | Filter by user ID |
| `-f, --files <pattern>` | File pattern to search in (regex) |
| `-j, --json` | Output results as JSON |

### Stats Command Options

| Option | Description |
|--------|-------------|
| `-d, --days <number>` | Number of days to analyze (default: 7) |

### Clean Command Options

| Option | Description |
|--------|-------------|
| `-d, --days <number>` | Delete files older than this many days (default: 30) |
| `--dry-run` | Don't actually delete files, just show what would be deleted |

## Log File Structure

```
logs/
├── application-YYYY-MM-DD.log     # Standard daily logs
├── application-YYYY-MM-DD.log.gz  # Compressed older logs
├── error-YYYY-MM-DD.log           # Error-only logs
└── error-YYYY-MM-DD.log.gz        # Compressed older error logs
```

## Log Entry Format

JSON structure:
```json
{
  "level": "info",
  "message": "User logged in",
  "timestamp": "2023-07-01 12:34:56:789",
  "service": "real-estate-api",
  "meta": {
    "userId": "123abc",
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0...",
    "success": true
  }
}
```

## Best Practices

1. Use the appropriate log level
2. Include relevant context in metadata
3. Avoid logging sensitive information
4. Use structured logging
5. Use domain-specific logging utilities

For detailed documentation, see the [full Logging System Documentation](logging-system.md). 