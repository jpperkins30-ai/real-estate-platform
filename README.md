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

## Architecture

The platform consists of several key components:

- **Backend API Server**: Node.js/Express.js with TypeScript
- **Frontend Client**: React with Material-UI
- **Admin Dashboard**: React-based administration interface
- **Database**: MongoDB with Mongoose ODM
- **Logging System**: Winston-based structured logging with analytics

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
- [Log Dashboard Guide](./admin-dashboard/docs/logs-dashboard-guide.md) - Guide to using the log visualization dashboard
- [Log Tools Documentation](./server/src/scripts/README.md) - CLI tools for log management

## Development

### Project Structure

```
├── server/                  # Backend Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routes
│   │   ├── scripts/         # CLI utilities
│   │   ├── utils/           # Utility functions
│   │   └── index.ts         # Entry point
│   └── tsconfig.json        # TypeScript configuration
├── admin-dashboard/         # Admin interface
├── client/                  # User-facing frontend
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

1. Your current directory is mounted to `/app` in the container
2. Claude Code will be automatically installed
3. Use the `claude` command to run Claude Code
4. Type `exit` to leave the container

## Example Usage

Inside the Docker container:

```bash
# Basic usage
claude "Explain how to use Claude Code"

# List available commands
claude --help

# Run in print mode (non-interactive)
claude -p "Generate a React component that displays a counter"
```

## Troubleshooting

- If Docker isn't running, start Docker Desktop
- If you encounter permission issues, run your terminal as Administrator
- If the container fails to start, check your internet connection 