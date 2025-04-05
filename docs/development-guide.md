# Real Estate Platform - Development Guide

> **Note**: This document is part of the Real Estate Platform's technical documentation suite. For related guides, see:
> - [Architecture Guide](./architecture.md) - System architecture and component design
> - [Security Guide](./SECURITY.md) - Security measures and best practices
> - [Component Testing Guide](./component-test-guide.md) - Testing procedures and guidelines
> - [Authentication Setup](./authentication-setup.md) - Authentication implementation details

This guide provides comprehensive instructions for setting up and working with the Real Estate Platform development environment.

## Development Environment Setup

### Required Tools

1. **Node.js and npm**
   - Node.js 16+ (LTS recommended)
   - npm 8+

2. **MongoDB**
   - MongoDB 5.0+
   - MongoDB Compass (optional, for GUI management)

3. **Git**
   - Git 2.30+
   - GitHub CLI (optional, for PR management)

4. **Development Tools**
   - Visual Studio Code (recommended)
   - MongoDB extension for VS Code
   - ESLint extension
   - Prettier extension

### Environment Configuration

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-org/real-estate-platform.git
   cd real-estate-platform
   ```

2. **Install Dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Variables**
   ```bash
   # Server environment
   cd server
   cp .env.example .env

   # Client environment
   cd ../client
   cp .env.example .env
   ```

4. **Configure MongoDB**
   - Create a new MongoDB database
   - Update .env with connection string
   - Run initial migrations:
     ```bash
     cd server
     npm run migrate:up
     ```

### Running the Application

1. **Development Mode**
   ```powershell
   # Using PowerShell script
   ./run-dev.ps1

   # Or manually:
   cd server
   npm run dev
   # In another terminal:
   cd client
   npm start
   ```

2. **Testing**
   ```bash
   # Run server tests
   cd server
   npm test

   # Run client tests
   cd client
   npm test
   ```

## Working with Consolidated Branches

### Branch Overview

The platform uses three main consolidated branches:

1. **feature/inventory-consolidated**
   - Core inventory management
   - Collector framework integration
   - Property data models
   - REST API endpoints

2. **feature/export-consolidated**
   - Export functionality
   - Data formatting
   - Template management
   - Batch processing

3. **feature/map-consolidated**
   - Map visualization
   - GeoJSON processing
   - Real-time updates
   - Interactive controls

### Development Workflow

1. **Starting New Work**
   ```bash
   # Checkout the appropriate consolidated branch
   git checkout feature/inventory-consolidated

   # Create a working branch
   git checkout -b feature/inventory/your-feature
   ```

2. **Making Changes**
   - Follow the component architecture
   - Update tests as needed
   - Document new features
   - Update relevant guides

3. **Testing Changes**
   ```bash
   # Run specific test suites
   npm test -- --grep="YourFeature"

   # Run integration tests
   npm run test:integration
   ```

4. **Submitting Changes**
   ```bash
   # Commit changes
   git add .
   git commit -m "feat: Your descriptive message"

   # Push to remote
   git push origin feature/inventory/your-feature

   # Create PR to consolidated branch
   gh pr create --base feature/inventory-consolidated
   ```

### Integration Testing

When working across consolidated branches:

1. **Local Integration**
   ```bash
   # Checkout consolidated branch
   git checkout feature/inventory-consolidated

   # Create integration branch
   git checkout -b integration/inventory-map

   # Merge map changes
   git merge feature/map-consolidated
   ```

2. **Testing Integration**
   - Run full test suite
   - Test cross-component features
   - Verify documentation accuracy

3. **Resolving Conflicts**
   - Use Visual Studio Code's merge conflict resolver
   - Maintain component boundaries
   - Update integration tests

## Development Workflow

### Branch Structure

The project follows a structured branching strategy:

- `main` - Production-ready code, protected branch
- `develop` - Integration branch for feature development
- Feature branches:
  - `feature/inventory-consolidated` - Inventory management with collector framework
  - `feature/export-consolidated` - Data export functionality
  - `feature/map-consolidated` - Interactive map visualization

### Branch Protection Rules

The repository implements branch protection rules to maintain code quality:

- Protected branches: `main`, `develop`
- Required reviews before merging
- Status checks must pass before merging
- Up-to-date branch required before merge

### Development Process

1. Create a new feature branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them:
   ```bash
   git add .
   git commit -m "feat: Your descriptive commit message"
   ```

3. Push your feature branch:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request to merge into `develop`
5. After review and approval, merge into `develop`
6. Delete the feature branch after successful merge

### Commit Message Format

Follow the conventional commits format:

- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `docs:` - Documentation updates
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `ci:` - CI/CD changes

## Testing Guide

The Real Estate Platform implements a standardized testing approach to ensure code quality and prevent regressions. Before writing or modifying any tests, review the testing standards documentation:

- [TEST-GUIDE.md](../client/TEST-GUIDE.md) - Quick reference guide for developers
- [TESTING.md](../client/TESTING.md) - Comprehensive testing documentation
- [test-plan.json](../client/test-plan.json) - Test case catalog with requirements mapping

### Standardized Testing Approach

All tests must follow our standardized approach:

1. **Test Case IDs**: Every test must include a test case ID from the test plan (format: "TC101: should do something")
2. **File Naming Convention**: Test files must follow the pattern `category_component_name.test.tsx`
3. **Flattened Structure**: Tests must be in the flattened directory structure at `src/__tests__/`
4. **Test Plan Validation**: Every test case ID must exist in `test-plan.json`

Our automated testing workflow includes:
- Pre-commit and pre-push hooks that validate tests
- Pre-test validation that runs before test execution
- Test generators to create properly structured tests
- CI/CD integration to validate tests during pull requests

### Creating New Tests

Use the test generator to create a proper test file structure:

```bash
# In the client directory
node create-test.js --component=components/path/to/component --testid=TC101
```

The generator will:
1. Create a properly named test file
2. Set up the correct import structure
3. Add the test case IDs from the test plan
4. Validate against test standards

### Test Structure

The project uses a flattened test directory structure:

```
client/src/__tests__/
├── components_*.test.tsx   # Component tests
├── hooks_*.test.tsx        # Custom React hook tests
├── integration_*.test.tsx  # Integration tests
├── services_*.test.tsx     # Service layer tests
└── setup/                  # Test setup utilities
```

### Running Tests

#### Running All Tests

```bash
# In the client directory
npm test

# Run with coverage report
npm test -- --coverage
```

#### Running Specific Tests

```bash
# Run a specific test file
npm test -- src/__tests__/hooks/useAdvancedLayout.test.tsx

# Run tests matching a pattern
npm test -- --grep="PanelIntegration"

# Run tests without watching
npm test -- --no-watch
```

#### Debugging Tests

```bash
# Run tests in debug mode
npm test -- --debug

# Run a single test with verbose output
npm test -- src/__tests__/hooks/usePanelState.test.tsx --verbose
```

### Writing Effective Tests

Follow these best practices when writing tests:

1. **Test Naming**
   - Use descriptive names that explain the test's purpose
   - Follow the pattern: `it('should do something when something happens')`

2. **Test Structure**
   - Arrange: Set up the test environment
   - Act: Perform the action being tested
   - Assert: Verify the expected outcome

3. **Isolation**
   - Each test should be independent
   - Use `beforeEach` to set up and `afterEach` to clean up
   - Mock external dependencies

4. **Mocking**
   - Use `vi.mock()` for module mocking
   - Use `vi.fn()` for function mocking
   - Keep mocks as simple as possible

Example of a well-structured test:

```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useMaximizable } from '../../hooks/useMaximizable';

describe('useMaximizable hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem = vi.fn();
    localStorage.setItem = vi.fn();
  });

  it('should toggle maximized state when toggleMaximize is called', () => {
    // Arrange
    const mockRef = { current: document.createElement('div') };
    const { result } = renderHook(() => useMaximizable());
    
    // Act
    act(() => {
      result.current.toggleMaximize(mockRef as React.RefObject<HTMLElement>);
    });
    
    // Assert
    expect(result.current.isMaximized).toBe(true);
  });
});
```

### Testing React Components

When testing React components:

1. Use React Testing Library's render function
2. Query elements using accessible selectors
3. Simulate user events with fireEvent or userEvent
4. Test component behavior, not implementation details

Example:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PanelHeader } from '../../components/multiframe/PanelHeader';

describe('PanelHeader', () => {
  it('should call onAction when maximize button is clicked', () => {
    // Arrange
    const handleAction = vi.fn();
    
    // Act
    render(<PanelHeader title="Test Panel" onAction={handleAction} />);
    fireEvent.click(screen.getByLabelText('Maximize panel'));
    
    // Assert
    expect(handleAction).toHaveBeenCalledWith({ type: 'maximize' });
  });
});
```

### Integration Testing

Integration tests verify that different parts of the application work together:

1. Test real component interactions
2. Minimal mocking - only external APIs
3. Focus on user workflows and data flow

Example:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { EnhancedPanelContainer } from '../../components/multiframe/EnhancedPanelContainer';

describe('Panel Integration', () => {
  it('should broadcast actions from panel content', () => {
    // Arrange
    const mockBroadcast = vi.fn();
    vi.mock('../../hooks/usePanelSync', () => ({
      usePanelSync: () => ({
        broadcast: mockBroadcast,
        subscribe: () => vi.fn()
      })
    }));
    
    // Act
    render(<EnhancedPanelContainer id="test-panel" title="Test" contentType="filter" />);
    fireEvent.click(screen.getByTestId('select-action-button'));
    
    // Assert
    expect(mockBroadcast).toHaveBeenCalledWith('select', expect.any(Object), 'test-panel');
  });
});
```

### Test Coverage Goals

Aim for the following minimum coverage targets:
- 80% overall code coverage
- 90% coverage for core layout functionality
- 100% coverage for critical components

For detailed information about all test cases, procedures, and requirements, refer to the [Comprehensive Test Plan](./test-plan.md).

## Overview

The Real Estate Platform consists of several integrated modules:

1. Inventory Module - Core property management
2. Collection Framework - Data acquisition system
3. Map Visualization - Geographic data display
4. Export Module - Data export functionality

The Inventory Module is a core component of the Real Estate Platform that manages the hierarchical data structure for real estate properties across the United States. This guide provides detailed information on setting up, extending, and working with the Inventory Module.

## Hierarchical Structure

The Inventory Module follows a hierarchical structure:

```
USMap
  └── State
       └── County
            └── Property
```

Each level contains geographic information (GeoJSON), metadata, and can have controllers attached to it.

## Setup Instructions

### Prerequisites

- Node.js 16+
- MongoDB 5.0+
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-org/real-estate-platform.git
cd real-estate-platform
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env file with your MongoDB connection string and API keys
```

4. Seed initial data:
```bash
npm run seed:inventory
```

### Running the Development Server

```bash
npm run dev
```

This will start both the Express backend server and the React frontend in development mode.

## Key Components

### Backend (server/src)

#### Models

- **USMapModel** (`server/src/models/usmap.model.ts`): Represents the entire United States
- **StateModel** (`server/src/models/state.model.ts`): Represents individual states
- **CountyModel** (`server/src/models/county.model.ts`): Represents counties within states
- **PropertyModel** (`server/src/models/property.model.ts`): Represents individual properties
- **ControllerModel** (`server/src/models/controller.model.ts`): Represents automation controllers

#### Services

- **InventoryService** (`server/src/services/inventory.service.ts`): Core service for inventory operations
- **GeoJsonHandler** (`server/src/utils/geoJsonHandler.ts`): Utility for processing GeoJSON data
- **ExportService** (`server/src/services/export.service.ts`): Service for exporting inventory data

#### Controllers

- **StateController** (`server/src/controllers/state.controller.ts`): Handles state-related API endpoints
- **CountyController** (`server/src/controllers/county.controller.ts`): Handles county-related API endpoints
- **PropertyController** (`server/src/controllers/property.controller.ts`): Handles property-related API endpoints
- **ControllerController** (`server/src/controllers/controller.controller.ts`): Handles controller-related endpoints
- **ExportController** (`server/src/controllers/export.controller.ts`): Handles export-related endpoints

### Frontend (client/src)

#### Components

- **InventoryTree** (`client/src/components/inventory/InventoryTree.tsx`): Tree view of inventory hierarchy
- **StateDetailView** (`client/src/components/inventory/details/StateDetailView.tsx`): Detailed view of a state
- **CountyDetailView** (`client/src/components/inventory/details/CountyDetailView.tsx`): Detailed view of a county
- **PropertyDetailView** (`client/src/components/inventory/details/PropertyDetailView.tsx`): Detailed view of a property
- **ControllerWizard** (`client/src/components/controllers/ControllerWizard.tsx`): UI for creating and configuring controllers

#### Services

- **inventoryService** (`client/src/services/inventory.service.ts`): Client-side service for inventory API calls
- **controllerService** (`client/src/services/controller.service.ts`): Client-side service for controller API calls
- **exportService** (`client/src/services/export.service.ts`): Client-side service for export API calls

## Implementation Examples

### Creating a State

#### Backend (Express API)

```typescript
// server/src/controllers/state.controller.ts
import { Request, Response } from 'express';
import { StateModel } from '../models/state.model';
import { GeoJsonHandler } from '../utils/geoJsonHandler';

export const createState = async (req: Request, res: Response) => {
  try {
    const { name, abbreviation, geometry } = req.body;
    
    // Validate the GeoJSON data
    const geoJsonHandler = new GeoJsonHandler();
    if (!geoJsonHandler.validateGeoJson(geometry)) {
      return res.status(400).json({ message: 'Invalid GeoJSON data' });
    }
    
    // Create the state
    const state = await StateModel.create({
      name,
      abbreviation,
      type: 'state',
      parentId: req.body.parentId, // Reference to US Map
      geometry,
      metadata: {
        totalCounties: 0,
        totalProperties: 0,
        statistics: {
          totalTaxLiens: 0,
          totalValue: 0,
          averagePropertyValue: 0,
          totalPropertiesWithLiens: 0,
          lastUpdated: new Date()
        }
      }
    });
    
    return res.status(201).json(state);
  } catch (error) {
    console.error('Error creating state:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
```

#### Frontend (React)

```tsx
// client/src/components/inventory/CreateStateForm.tsx
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { inventoryService } from '../../services/inventory.service';

interface CreateStateFormProps {
  onSuccess: (stateId: string) => void;
}

export const CreateStateForm: React.FC<CreateStateFormProps> = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [geoJsonFile, setGeoJsonFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Read the GeoJSON file
      const fileContent = await readFileAsText(geoJsonFile);
      const geometry = JSON.parse(fileContent);
      
      // Create the state
      const response = await inventoryService.createState({
        name,
        abbreviation,
        geometry,
        parentId: '60a2e2d5b054c62d8927d8b1' // US Map ID
      });
      
      onSuccess(response.data._id);
    } catch (error) {
      setError('Failed to create state. Please check your input and try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  const readFileAsText = (file: File | null): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form.Group className="mb-3">
        <Form.Label>State Name</Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>Abbreviation</Form.Label>
        <Form.Control
          type="text"
          value={abbreviation}
          onChange={(e) => setAbbreviation(e.target.value)}
          maxLength={2}
          required
        />
        <Form.Text className="text-muted">
          Two-letter state abbreviation (e.g., CA, NY)
        </Form.Text>
      </Form.Group>
      
      <Form.Group className="mb-3">
        <Form.Label>GeoJSON File</Form.Label>
        <Form.Control
          type="file"
          accept=".json,application/json"
          onChange={(e) => setGeoJsonFile(e.target.files?.[0] || null)}
          required
        />
        <Form.Text className="text-muted">
          Upload a GeoJSON file containing the state boundaries
        </Form.Text>
      </Form.Group>
      
      <Button variant="primary" type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create State'}
      </Button>
    </Form>
  );
};
```

### Processing GeoJSON

```typescript
// Usage example in a controller
import { GeoJsonHandler } from '../utils/geoJsonHandler';

export const uploadStateGeometry = async (req: Request, res: Response) => {
  try {
    const { stateId } = req.params;
    const geoJsonData = req.body;
    
    const geoJsonHandler = new GeoJsonHandler();
    
    // Validate the GeoJSON
    if (!geoJsonHandler.validateGeoJson(geoJsonData)) {
      return res.status(400).json({ message: 'Invalid GeoJSON format' });
    }
    
    // Extract and simplify geometry
    const geometry = geoJsonHandler.extractGeometry(geoJsonData);
    const simplifiedGeometry = geoJsonHandler.simplifyGeometry(geometry, 0.01);
    
    // Update state with simplified geometry
    await StateModel.findByIdAndUpdate(stateId, {
      geometry: simplifiedGeometry
    });
    
    return res.status(200).json({ message: 'State geometry updated successfully' });
  } catch (error) {
    console.error('Error uploading state geometry:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
```

### Exporting Data

```typescript
// Example usage in a controller
import { ExportService } from '../services/export.service';

export const exportCountyProperties = async (req: Request, res: Response) => {
  try {
    const { countyId } = req.params;
    const { format } = req.query;
    
    const exportService = new ExportService();
    const properties = await exportService.getPropertiesForCounty(countyId);
    
    if (format === 'csv') {
      const csv = await exportService.exportPropertiesToCsv(properties);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="properties-${countyId}.csv"`);
      return res.send(csv);
    } else if (format === 'excel') {
      const excel = await exportService.exportPropertiesToExcel(properties);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="properties-${countyId}.xlsx"`);
      return res.send(excel);
    } else {
      return res.status(400).json({ message: 'Invalid export format. Use "csv" or "excel".' });
    }
  } catch (error) {
    console.error('Error exporting county properties:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
```

## Controllers

Controllers are automation components that can be attached to inventory items (USMap, State, County, Property). They perform automated tasks like data scraping, tax lien analysis, or map generation.

### Controller Types

1. **Tax Sale Controller**: Scrapes tax sale data from county websites
2. **Map Controller**: Generates map visualizations
3. **Property Controller**: Updates property data from external sources
4. **Demographics Controller**: Retrieves demographic data for a region

### Creating a Custom Controller

1. Define the controller model:

```typescript
// Example of creating a new controller
const demographicsController = await ControllerModel.create({
  name: 'Census Demographics',
  type: 'controller',
  controllerType: 'Demographics',
  description: 'Fetches demographic data from Census API',
  configTemplate: {
    requiredFields: ['apiKey', 'dataPoints'],
    optionalFields: {
      updateFrequency: 'monthly',
      cacheResults: true
    }
  }
});
```

2. Attach the controller to an inventory object:

```typescript
// Attach to a state
await StateModel.findByIdAndUpdate(stateId, {
  $push: {
    controllers: {
      controllerId: demographicsController._id,
      controllerType: 'Demographics',
      enabled: true,
      configuration: {
        apiKey: 'your-census-api-key',
        dataPoints: ['population', 'median_income', 'housing_units']
      }
    }
  }
});
```

3. Implement controller execution logic:

```typescript
// server/src/services/controller.service.ts
export const executeController = async (
  objectId: string,
  objectType: 'us_map' | 'state' | 'county' | 'property',
  controllerId: string
) => {
  // Find the controller
  const controller = await ControllerModel.findById(controllerId);
  if (!controller) {
    throw new Error('Controller not found');
  }
  
  // Find the target object
  let targetObject;
  switch (objectType) {
    case 'state':
      targetObject = await StateModel.findById(objectId);
      break;
    case 'county':
      targetObject = await CountyModel.findById(objectId);
      break;
    // ... other cases
  }
  
  if (!targetObject) {
    throw new Error('Target object not found');
  }
  
  // Find the controller reference
  const controllerRef = targetObject.controllers.find(
    ref => ref.controllerId.toString() === controllerId
  );
  
  if (!controllerRef || !controllerRef.enabled) {
    throw new Error('Controller not enabled for this object');
  }
  
  // Execute based on controller type
  switch (controller.controllerType) {
    case 'Demographics':
      return executeDemographicsController(targetObject, controllerRef.configuration);
    // ... other cases
  }
};

// Implementation of a specific controller type
const executeDemographicsController = async (targetObject, config) => {
  // Implementation details...
  // Fetch data from Census API
  // Update the target object with the results
  // Return execution results
};
```

## Best Practices

1. **GeoJSON Processing**:
   - Always simplify geometries before storing to reduce database size
   - Use appropriate tolerance values based on the zoom level needed
   - Cache processed GeoJSON when possible

2. **Hierarchical Relationships**:
   - Always maintain proper parent-child relationships
   - Use direct references to ancestors for faster queries
   - Update counts and statistics when children are added/removed

3. **Controllers**:
   - Make controllers modular and reusable
   - Implement proper error handling and retries
   - Store execution history for debugging
   - Allow configuration via user interface

4. **Performance**:
   - Use appropriate indexes for common queries
   - Implement pagination for large result sets
   - Cache frequently accessed data

## Troubleshooting

### Common Issues

1. **GeoJSON Processing Errors**:
   - Check the format of your GeoJSON files
   - Ensure the coordinate system is correct (WGS84)
   - Verify that the geometry type is supported (Polygon, MultiPolygon)

2. **Hierarchical Relationship Issues**:
   - Ensure proper parent-child relationships are established
   - Check that IDs are correctly referenced
   - Verify that count updates are triggered when objects are added/removed

3. **Controller Execution Failures**:
   - Check controller configuration
   - Verify external API access and credentials
   - Review execution logs for errors

### Debugging

1. Enable detailed logging:

```typescript
// server/src/config/logger.ts
export const logger = {
  debug: (message: string, meta?: any) => {
    if (process.env.LOG_LEVEL === 'debug') {
      console.log(`DEBUG: ${message}`, meta);
    }
  },
  info: (message: string, meta?: any) => {
    console.log(`INFO: ${message}`, meta);
  },
  error: (message: string, error?: any) => {
    console.error(`ERROR: ${message}`, error);
  }
};
```

2. Use the logger in your code:

```typescript
import { logger } from '../config/logger';

export const createCounty = async (req: Request, res: Response) => {
  try {
    logger.info('Creating county', { body: req.body });
    // Implementation...
  } catch (error) {
    logger.error('Error creating county', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
```

## Resource Links

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Bootstrap Documentation](https://react-bootstrap.github.io/)
- [GeoJSON Specification](https://geojson.org/)
- [Turf.js for Geospatial Analysis](https://turfjs.org/)
- [Census API Documentation](https://www.census.gov/data/developers/guidance.html)

## Development

### Project Structure

```
├── server/                  # Backend Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # Express routes
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
│   │   │   └── map/         # Map visualization
│   │   ├── hooks/           # Custom React hooks
│   │   └── App.tsx          # Main application
│   └── tsconfig.json        # TypeScript configuration
├── .github/                # GitHub configuration
│   └── workflows/          # CI/CD workflows
├── docs/                    # Documentation
│   ├── filter-system/       # Filter system documentation
│   │   ├── architecture.md  # Filter system architecture
│   │   ├── best-practices.md # Filter system best practices
│   │   └── testing.md       # Filter system testing
└── package.json             # Project dependencies
```

### Available Scripts 