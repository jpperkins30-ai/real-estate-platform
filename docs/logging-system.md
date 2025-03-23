# Logging System Documentation

This document provides comprehensive information about the Real Estate Platform's logging system.

## Overview

The platform includes a robust logging system based on Winston that provides:

- Structured logging for all application events
- HTTP request and response logging
- Authentication event tracking
- Database operation logging
- Performance monitoring
- User activity tracking
- Automatic log rotation and compression
- Command-line tools for log analysis
- Admin dashboard for log visualization and analysis

## Logging Architecture

The logging system is built with the following components:

1. **Core Logger** (`server/src/utils/logger.ts`) - The main logger configuration based on Winston.
2. **Request Logger Middleware** (`server/src/middleware/requestLogger.ts`) - HTTP request/response logging.
3. **Activity Logger** (`server/src/middleware/activityLogger.ts`) - User activity logging.
4. **App Logger Utilities** (`server/src/utils/appLogger.ts`) - Domain-specific logging utilities.
5. **Command-line Tools** (`server/src/scripts/log-tools.ts`) - CLI for log analysis and management.
6. **Admin Dashboard Visualization** (`admin-dashboard/src/pages/Logs.tsx`) - Visual analytics for logs.
7. **Logs API** (`server/src/routes/logs.ts`) - API endpoints to retrieve and analyze log data.

## Log Levels

The system uses the following log levels (in order of severity):

1. **error** - Critical errors requiring immediate attention.
2. **warn** - Warning conditions that should be investigated.
3. **info** - Informational messages about normal operation.
4. **http** - HTTP request/response logging.
5. **debug** - Detailed debug information for development.

The active log level is controlled by the `LOG_LEVEL` environment variable, which defaults to `info` in production and `debug` in development.

## Log Format

Logs are stored in JSON format for easy parsing and analysis:

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

## Log Files

The platform generates the following log files:

- `logs/application-YYYY-MM-DD.log` - Daily application logs
- `logs/error-YYYY-MM-DD.log` - Error-only logs
- `logs/combined.log` - All logs (used for certain types of analysis)

Older log files are automatically compressed with gzip to save disk space, resulting in files with `.gz` extension.

## Log Rotation

Logs are automatically rotated using winston-daily-rotate-file:

- A new log file is created each day
- Log files older than the retention period (default: 14 days) are compressed
- Logs can be cleaned using the `logs clean` command

## Using the Logging System

### Basic Logging

```typescript
import { logInfo, logError, logWarning, logDebug } from '../utils/logger';

// Information logging
logInfo('Operation completed successfully', { operationId: '123', duration: 45 });

// Error logging
try {
  // Some operation
} catch (error) {
  logError('Failed to complete operation', error, { operationId: '123' });
}

// Warning logging
logWarning('Resource usage high', { cpuUsage: 85, memoryUsage: 75 });

// Debug logging
logDebug('Processing item', { itemId: '456', state: 'processing' });
```

### Domain-Specific Logging

```typescript
import { logDbOperation, logAuthEvent, logPropertyAction } from '../utils/appLogger';

// Database operation logging
logDbOperation('find', 'users', { email: 'user@example.com' }, { _id: '123', email: 'user@example.com' });

// Authentication event logging
logAuthEvent('login', userId, true, { ip: req.ip, userAgent: req.headers['user-agent'] });

// Property action logging
logPropertyAction('update', propertyId, userId, { changes: { price: '350000', status: 'pending' } });
```

### Activity Logging Middleware

```typescript
import activityLogger from '../middleware/activityLogger';

// In your route definitions
router.get('/:id', 
  authenticate, 
  activityLogger.viewResource('property'),
  propertyController.getProperty
);

router.post('/', 
  authenticate,
  validatePropertyData,
  activityLogger.createResource('property', ['sensitiveField']),
  propertyController.createProperty
);
```

## Command-line Log Tools

The platform includes a command-line utility for working with logs:

```bash
# Search logs
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

## Admin Dashboard Log Visualization

The Admin Dashboard includes a dedicated Logs page for visualizing and analyzing log data. This provides a more user-friendly interface than the command-line tools for exploring log patterns.

### Accessing the Logs Dashboard

1. Log in to the Admin Dashboard
2. Click on "Logs" in the left sidebar navigation
3. The Logs Analytics page will display visualizations of log data

### Features

The Logs Analytics dashboard provides:

#### 1. Filtering Options
- **Log Level** - Filter by severity level (error, warn, info, http, debug)
- **Collection** - Filter by database collection (users, properties, etc.)
- **User ID** - Filter logs by specific user
- **Message** - Search for text in log messages
- **Date Range** - Specify start and end dates for analysis

#### 2. Summary Cards
- **Total Log Entries** - Count of log entries matching the current filters
- **Error Rate** - Percentage of logs that are errors
- **Most Active Collection** - Collection with the most operations

#### 3. Visualizations
- **Daily Log Volume Chart** - Bar chart showing log volume by day
- **Log Level Distribution** - Pie chart showing distribution by log level
- **Collection Operations** - Bar chart showing database operations by collection
- **Top Error Messages** - Bar chart of most frequent error messages

### Use Cases

The Logs dashboard is useful for:

1. **Troubleshooting** - Identify and investigate errors affecting users
2. **Performance Monitoring** - Track system performance over time
3. **Security Analysis** - Detect unusual authentication patterns
4. **Resource Usage** - Monitor database operations by collection
5. **User Activity** - Analyze patterns of user engagement

## Best Practices

1. **Use the appropriate log level**:
   - Use `error` only for actual errors that require attention
   - Use `warn` for potentially problematic situations
   - Use `info` for normal events that demonstrate application flow
   - Use `debug` for detailed information useful during development

2. **Structure your logs**:
   - Always include relevant context in the metadata object
   - Use consistent property names across similar log messages
   - Avoid including sensitive information (passwords, tokens)

3. **Be descriptive but concise**:
   - Log messages should be clear and descriptive
   - Keep messages reasonably short for easier reading and parsing
   - Include specific identifiers (user ID, order ID, etc.) in metadata

4. **Use domain-specific logging utilities**:
   - The application provides specialized logging functions for common operations
   - These ensure consistent format and required context information

5. **Monitor and analyze logs regularly**:
   - Use the Admin Dashboard to identify trends and issues
   - Set up automated alerts for critical error patterns
   - Clean old logs to manage disk space

## Log Retention and Compliance

By default, logs are retained for 14 days before being automatically cleaned up. This retention period can be customized using the `LOGS_RETENTION_DAYS` environment variable.

For compliance with data protection regulations:
- Ensure no sensitive personal data is included in log messages
- Use the `sanitize` option in activity loggers to omit sensitive fields
- Adjust retention periods according to your compliance requirements

## Extending the Logging System

To add new domain-specific logging utilities:

1. Add new logging functions to `server/src/utils/appLogger.ts`
2. Follow the existing patterns for consistent formatting
3. Ensure appropriate metadata is included
4. Update this documentation to reflect new capabilities

To extend the Admin Dashboard visualizations:

1. Modify `admin-dashboard/src/pages/Logs.tsx` to add new charts or filters
2. Add any required data processing to the API endpoints in `server/src/routes/logs.ts`
3. Update this documentation to reflect new capabilities 