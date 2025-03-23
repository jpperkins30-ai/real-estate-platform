# Development Environment Setup Guide

This guide provides detailed instructions for setting up the development environment for the Real Estate Platform.

## System Requirements

### Software Prerequisites

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | v16.0.0 or higher | JavaScript runtime |
| npm | v7.0.0 or higher | Package manager |
| MongoDB | v4.4.0 or higher | Database |
| Git | v2.25.0 or higher | Version control |
| Docker (optional) | v20.10.0 or higher | Containerization |

### Hardware Recommendations

- **CPU**: 4+ cores
- **Memory**: 8GB+ RAM
- **Disk Space**: 10GB+ free

## Installation Steps

### 1. Install Node.js and npm

**Windows**:
- Download and install from [nodejs.org](https://nodejs.org/)
- Verify installation:
  ```
  node -v
  npm -v
  ```

**macOS**:
- Using Homebrew:
  ```
  brew install node
  ```

**Linux**:
- Ubuntu/Debian:
  ```
  sudo apt update
  sudo apt install nodejs npm
  ```
- Verify installation:
  ```
  node -v
  npm -v
  ```

### 2. Install MongoDB

**Windows**:
- Download and install MongoDB Community Edition from [mongodb.com](https://www.mongodb.com/try/download/community)
- Add MongoDB to your PATH

**macOS**:
- Using Homebrew:
  ```
  brew tap mongodb/brew
  brew install mongodb-community
  ```

**Linux**:
- Ubuntu/Debian:
  ```
  sudo apt update
  sudo apt install mongodb
  sudo systemctl start mongodb
  sudo systemctl enable mongodb
  ```

Verify MongoDB installation:
```
mongo --version
```

### 3. Clone the Repository

```bash
git clone https://github.com/your-username/real-estate-platform.git
cd real-estate-platform
```

### 4. Initialize Git (if not cloned)

If you downloaded the project without Git:

**Using scripts**:
- Windows CMD: `initialize-git.bat`
- Windows PowerShell: `PowerShell -ExecutionPolicy Bypass -File .\initialize-git.ps1`

**Manual setup**:
```bash
git init
git add .
git commit -m "Initial commit with all project files"
```

See `GIT-SETUP.md` for more details on Git configuration.

## Project Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/real-estate
MONGODB_TEST_URI=mongodb://localhost:27017/real-estate-test

# Authentication
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Admin Dashboard
ENABLE_ADMIN_DASHBOARD=true

# Logging Configuration
LOG_LEVEL=debug  # Levels: error, warn, info, http, debug
LOGS_RETENTION_DAYS=14
LOGS_DIR=logs    # Directory for log storage
LOG_FORMAT=json  # Log format: json or text
```

### 3. Initialize MongoDB

Start MongoDB if not running:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongodb
```

### 4. Start Development Servers

**Start the Development Server**:
```bash
npm run dev
```

**Using POC (Proof of Concept)**:
```bash
npm run poc
```

## Project Structure

### Server (Backend)

- **Technology**: Node.js, Express, TypeScript, MongoDB with Mongoose
- **Key Files and Directories**:
  - `server/src/index.ts`: Main application entry point
  - `server/src/routes/`: API routes
  - `server/src/models/`: Database models
  - `server/src/middleware/`: Custom middleware
  - `server/src/utils/`: Utility functions
  - `server/src/scripts/`: Utility scripts (including log tools)
  - `logs/`: Application logs directory

### Logging System

- **Technology**: Winston, Winston Daily Rotate File, Express Winston
- **Key Files**:
  - `server/src/utils/logger.ts`: Main logger configuration
  - `server/src/middleware/requestLogger.ts`: HTTP request/response logging
  - `server/src/utils/appLogger.ts`: Application-specific logging utilities
  - `server/src/middleware/activityLogger.ts`: User activity logging
  - `server/src/scripts/log-tools.ts`: Command-line log analysis tools
  - `server/src/routes/logs.ts`: API endpoints for log access
  - `admin-dashboard/src/services/logsService.ts`: Frontend service for log API
  - `admin-dashboard/src/pages/Logs.tsx`: Admin dashboard log visualization

## Logging Tools and Features

### Command-Line Log Analysis

The platform includes a comprehensive CLI for working with logs:

```bash
# Search logs with filters
npm run logs search --level error --date 2023-07-01 --message "error text" --user userId

# View log statistics
npm run logs stats --days 7 --level error --collection users

# Clean old log files
npm run logs clean --days 30 --dry-run
```

See `server/src/scripts/README.md` for complete documentation of all commands and options.

### Log API Endpoints

The platform exposes several API endpoints for log access:

- `GET /api/logs/stats` - Get log statistics with filtering options
- `GET /api/logs/search` - Search logs with filtering
- `GET /api/logs/files` - List available log files
- `GET /api/logs/download/:filename` - Download a specific log file

### Admin Dashboard Log Visualization

The admin dashboard includes a dedicated Logs page for:
- Visualizing log volume over time
- Analyzing logs by level distribution
- Identifying top error messages
- Monitoring database collection activity
- Filtering logs by various criteria

To access:
1. Ensure `ENABLE_ADMIN_DASHBOARD=true` in your `.env`
2. Start the server: `npm run dev`
3. Navigate to: `http://localhost:5000/admin/`
4. Log in and access the Logs section

## Key Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| express | ^4.18.2 | Web framework |
| mongoose | ^8.0.3 | MongoDB ODM |
| winston | ^3.11.0 | Logging library |
| winston-daily-rotate-file | ^4.7.1 | Log rotation |
| express-winston | ^4.2.0 | Express logging middleware |
| commander | ^11.1.0 | Command-line interface |
| jsonwebtoken | ^9.0.2 | JWT authentication |
| bcrypt | ^5.1.1 | Password hashing |
| express-validator | ^7.0.1 | Request validation |
| swagger-jsdoc | ^6.2.8 | API documentation |
| swagger-ui-express | ^5.0.0 | Swagger UI |
| multer | ^1.4.5-lts.1 | File uploads |
| uuid | ^9.0.1 | UUID generation |
| helmet | ^7.1.0 | Security headers |
| cors | ^2.8.5 | CORS support |
| dotenv | ^16.3.1 | Environment variables |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.3.3 | TypeScript compiler |
| ts-node | ^10.9.2 | TypeScript execution |
| nodemon | ^3.0.2 | Auto-restart server |
| eslint | ^8.56.0 | Linting |
| jest | ^29.7.0 | Testing |
| supertest | ^6.3.3 | API testing |

For a full list of dependencies, see `package.json`.

## Development Workflow

1. **Make code changes** in your preferred editor
2. **Test changes** with appropriate testing tools
3. **Review logs** using log analysis tools
4. **Commit changes** to Git
5. **Create backups** before major changes

## Accessing Tools and Components

### API Documentation
- Swagger UI: `http://localhost:5000/api-docs`

### Log Analysis
- Command-line tools: `npm run logs <command> [options]`
- Log files: `logs/` directory
- Admin dashboard: `http://localhost:5000/admin/` → Logs section

## Troubleshooting

### Common Issues

#### Logs Not Being Created
1. Check that `LOG_LEVEL` in `.env` is properly set
2. Ensure the logs directory exists and is writable
3. Restart the server

#### Log Analysis Tools Not Working
1. Verify that the `logs` script is in `package.json`
2. Ensure TypeScript is properly installed
3. Try running directly: `node -r ts-node/register server/src/scripts/log-tools.ts`

#### Admin Dashboard Logs Not Loading
1. Check browser console for errors
2. Verify the logs API routes are properly registered in `server/src/index.ts`
3. Ensure you have log files generated for analysis

## Additional Resources

- [Logging System Documentation](../docs/logging-system.md)
- [Log Tools Reference](../server/src/scripts/README.md)
- [Log Dashboard Guide](../admin-dashboard/docs/logs-dashboard-guide.md) 