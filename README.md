# Real Estate Platform

A comprehensive real estate investment platform with property listing, user management, and advanced analytics.

## Features

- User authentication and authorization
- Property listing and search
- Property analysis and valuation
- User dashboard with investment tracking
- Admin panel for platform management
- Comprehensive logging and analytics system
- RESTful API for third-party integration
- Data Collection Framework with configurable collectors
- Interactive US Map visualization
- Export functionality for property data
- MongoDB-powered layout and preferences persistence

## Architecture

The platform consists of several key components:

- **Backend API Server**: Node.js/Express.js with TypeScript
- **Frontend Client**: React with Material-UI
- **Admin Dashboard**: React-based administration interface
- **Database**: MongoDB with Mongoose ODM
- **Logging System**: Winston-based structured logging with analytics
- **Collection Framework**: Modular data collection system
- **GitHub Workflows**: Automated CI/CD pipelines
- **Layout Persistence**: MongoDB schema for multi-frame layout configurations
- **User Preferences**: MongoDB schema for user-specific settings

## Testing

The platform has a comprehensive testing strategy to ensure reliability and quality:

- **Unit Testing**: Testing individual components and functions
- **Integration Testing**: Testing interactions between components
- **End-to-End Testing**: Testing complete user workflows
- **Performance Testing**: Ensuring the system meets performance requirements
- **Database Testing**: MongoDB integration testing with in-memory database

The project implements a standardized testing approach with the following key features:
- Unique test case IDs that link to the test plan
- Flattened test directory structure with consistent naming
- Test files are named with test case IDs (e.g., TC101_components_*)
- Automated validation through pre-commit and pre-push hooks
- Pre-test validation that runs before test execution
- Comprehensive test generators and validation tools
- Helper scripts for fixing imports and formatting issues

For detailed information about our testing approach, refer to:
- [TEST-GUIDE.md](./client/TEST-GUIDE.md) - Quick reference guide for developers
- [TESTING.md](./client/TESTING.md) - Comprehensive testing documentation
- [test-plan.json](./client/test-plan.json) - Complete test case catalog with requirements traceability

## Branch Structure

The repository follows a structured branching strategy:

- `main` - Production-ready code
- `develop` - Integration branch for feature development
- Feature branches:
  - `feature/inventory-consolidated` - Inventory management with collector framework
  - `feature/export-consolidated` - Data export functionality
  - `feature/map-consolidated` - Interactive map visualization
  - `feature/mongodb-layout-api` - MongoDB integration for layout persistence

### Branch Protection Rules

The repository implements branch protection rules to maintain code quality:

- Protected branches: `main`, `develop`
- Required reviews before merging
- Status checks must pass before merging
- Up-to-date branch required before merge

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- MongoDB 5.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/real-estate-platform.git
   cd real-estate-platform
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   npm start
   ```

## Getting Started with PowerShell Scripts

This project includes several PowerShell scripts to make development easier, especially on Windows systems where the `&&` operator in command lines isn't supported.

### Quick Start

To quickly get up and running:

1. Run the setup script (first-time setup):
   ```powershell
   .\setup.ps1
   ```

2. Start the full application (server & client):
   ```powershell
   .\start-app.ps1
   ```

### Interactive Menu

For an interactive menu of all available commands:
```powershell
.\run.ps1
```

### Available Scripts

- `run.ps1` - Interactive menu with all commands
- `setup.ps1` - First-time setup (installs dependencies, creates .env file, initializes data)
- `start-app.ps1` - Starts both server and client applications
- `server\scripts\start-server.ps1` - Starts just the server
- `server\scripts\create-usmap.ps1` - Initializes the US Map in the database
- `server\scripts\check-swagger.ps1` - Checks if Swagger documentation is working
- `fix-test-imports.ps1` - Fixes import paths in test files
- `fix-test-quotes.ps1` - Fixes quote issues in test files

## MongoDB Integration

The platform uses MongoDB to store and manage various types of data:

### MongoDB Schema

- **LayoutConfig**: Stores multi-frame layout configurations
  - Layout types (single, dual, tri, quad, advanced)
  - Panel configurations and positions
  - User-specific layouts
  - Default system layouts

- **UserPreferences**: Stores user-specific application settings
  - Theme preferences
  - Dashboard configurations
  - Filter presets
  - Panel state persistence

### Layout Persistence

The platform provides seamless layout persistence:

1. **User Layouts**: Save and load custom layouts
2. **Panel States**: Remember panel positions, sizes, and content
3. **Filter Configurations**: Save filter presets for quick access
4. **Cross-Device Sync**: Access your layouts from any device

## Accessing the Application

- **Backend API**: http://localhost:4000/api
- **Swagger Documentation**: http://localhost:4000/api-docs
- **Frontend Client**: http://localhost:5173 (or the port configured in your client)

## Logging System

The platform includes a comprehensive logging system for monitoring, troubleshooting, and auditing:

### Log Management CLI

Analyze and manage logs from the command line:

```bash
# Search logs with filters
npm run logs search --level error --date 2023-07-01

# View log statistics
npm run logs stats --days 7

# Clean old log files
npm run logs clean --days 30 --dry-run
```

### Admin Log Dashboard

Access rich log visualizations in the admin dashboard:

1. Log in to the admin panel
2. Navigate to the "Logs" section
3. Use filters to analyze log data by:
   - Date range
   - Log level
   - Database collection
   - User ID
   - Message content

### Log API Endpoints

The following API endpoints are available for log access:

- `GET /api/logs/stats` - Retrieve log statistics with various filters
- `GET /api/logs/search` - Search logs with filtering options
- `GET /api/logs/files` - List available log files
- `GET /api/logs/download/:filename` - Download a specific log file

## Documentation

The platform includes comprehensive documentation:

- [API Documentation](http://localhost:5000/api-docs) - Interactive API documentation
- [Admin Dashboard Guide](./docs/admin-dashboard.md) - Complete guide to the admin interface
- [Logging System Documentation](./docs/logging-system.md) - Overview of the logging architecture
- [Filter System Documentation](./docs/filter-system/architecture.md) - Filter system architecture and best practices
- [Log Dashboard Guide](./admin-dashboard/docs/logs-dashboard-guide.md) - Guide to using the log visualization dashboard
- [Log Tools Documentation](./server/src/scripts/README.md) - CLI tools for log management
- [TEST-GUIDE.md](./client/TEST-GUIDE.md) - Quick reference for test standards
- [TESTING.md](./client/TESTING.md) - Comprehensive testing methodology
- [test-plan.json](./client/test-plan.json) - Test case catalog
- [Comprehensive Test Plan](./docs/test-plan.md) - Detailed test cases and quality assurance procedures

## Development

### Project Structure

```
├── server/                  # Backend Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   │   ├── LayoutConfig.ts  # MongoDB layout schema
│   │   │   └── UserPreferences.ts # MongoDB preferences schema
│   │   ├── routes/          # Express routes
│   │   │   ├── layoutRoutes.ts # Layout API endpoints
│   │   │   └── userPreferencesRoutes.ts # Preferences API
│   │   ├── collectors/      # Data collection modules
│   │   ├── scripts/         # CLI utilities
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Entry point
│   └── tsconfig.json        # TypeScript configuration
├── admin-dashboard/         # Admin interface
├── client/                  # User-facing frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── common/      # Shared components
│   │   │   ├── inventory/   # Inventory management
│   │   │   ├── multiframe/  # Multi-frame layout components
│   │   │   └── map/         # Map visualization
│   │   ├── hooks/           # Custom React hooks
│   │   ├── context/         # React context providers
│   │   ├── test/            # Test utilities 
│   │   │   ├── mocks/       # Mock components for testing
│   │   │   └── setup.ts     # Test setup configuration
│   │   ├── _tests_/         # Test files with TC{ID} prefixes
│   │   └── App.tsx          # Main application
│   └── tsconfig.json        # TypeScript configuration
├── .github/                # GitHub configuration
│   └── workflows/          # CI/CD workflows
├── docs/                    # Documentation
└── package.json             # Project dependencies
```

### Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run logs` - Run log management tools

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/real-estate-platform](https://github.com/yourusername/real-estate-platform)

## Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the powerful database
- All contributors who have helped with code and documentation

## Development Setup

### Using Git

The repository includes scripts to help with Git setup and configuration:

1. Navigate to the scripts directory:
   ```
   cd scripts
   ```

2. Run the Git setup script:
   - Windows: `git-setup.bat`
   - Linux/macOS: `chmod +x git-setup.sh && ./git-setup.sh`

These scripts will initialize the Git repository if needed, create a suitable `.gitignore` file, and provide instructions for connecting to a remote repository.

### Using Docker for the POC

The platform includes a proof-of-concept implementation demonstrating the data collection and transformation capabilities. The POC can be run both with and without Docker.

1. Navigate to the POC directory:
   ```
   cd poc
   ```

2. Run the Docker script:
   - Windows: `run-docker.bat`
   - Linux/macOS: `chmod +x run-docker.sh && ./run-docker.sh`

Docker will build and run the container, executing the POC and storing results in the `poc/data` directory.

### Running the POC without Docker

Follow the instructions in the `poc/README.md` file for traditional execution methods

# Claude Code for Windows

This setup allows you to use Claude Code on Windows through Docker, as Claude Code doesn't natively support Windows.

## Prerequisites

1. [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/) must be installed and running
2. PowerShell or Command Prompt (CMD)

## Running Claude Code

### Using PowerShell

```powershell
.\run-claude-code-all-in-one.ps1
```

### Using Command Prompt (CMD)

```
run-claude-code-all-in-one.bat
```

## Inside the Container

Once inside the container:

1. Your current directory is mounted to `/app`