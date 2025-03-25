# Inventory Module

The Inventory Module provides a comprehensive solution for managing real estate inventory in a hierarchical structure: State → County → Property.

## Table of Contents

- [Architecture](#architecture)
- [Components](#components)
- [Data Models](#data-models)
- [Usage](#usage)
- [Development](#development)
- [API Integration](#api-integration)
- [Controller Wizard](#controller-wizard)

## Architecture

The Inventory Module follows a hierarchical structure:

```
US Map
├── State 1
│   ├── County 1
│   │   ├── Property 1
│   │   ├── Property 2
│   │   └── ...
│   ├── County 2
│   │   └── ...
│   └── ...
├── State 2
│   └── ...
└── ...
```

Each level in the hierarchy has:
- Specific metadata and statistics
- Data collection controllers
- Associated UI components for viewing and management

## Components

The module is composed of the following main components:

- **InventoryModule**: The main container component
- **InventoryHeader**: Header with title and global actions
- **InventorySidebar**: 
  - **InventorySearch**: Search functionality
  - **InventoryTree**: Tree view of the hierarchy
  - **InventoryTreeNode**: Individual node in the tree
- **InventoryMain**: Main content area
  - **StateDetails**: State information and county list
  - **CountyDetails**: County information and property list
  - **PropertyDetails**: Property information and tax lien details

## Data Models

The data models are defined in `src/types/inventory.ts` and include:

- **USMapObject**: Root object representing the entire US map
- **StateObject**: Represents a US state
- **CountyObject**: Represents a county within a state
- **PropertyObject**: Represents a property within a county
- **ControllerReference**: Reference to a data collection controller

## Usage

To use the Inventory Module in your application:

```tsx
import { InventoryModule } from './components/inventory';

function App() {
  return (
    <div className="app">
      <InventoryModule />
    </div>
  );
}
```

## Development

### Adding a New Feature

1. Create a feature branch from `develop`:
   ```
   git checkout -b feature/inventory-<feature-name>
   ```

2. Implement your changes
3. Test thoroughly
4. Create a pull request

### Styling

The module uses a combination of:
- React Bootstrap components
- Custom CSS in `InventoryModule.css`
- Bootstrap Icons for iconography

## API Integration

Currently, the module uses mock data for development purposes. In a production environment, you should integrate with backend APIs:

- GET `/api/v1/states` - List all states
- GET `/api/v1/states/:stateId` - Get state details
- GET `/api/v1/counties?stateId=:stateId` - List counties in a state
- GET `/api/v1/counties/:countyId` - Get county details
- GET `/api/v1/properties?countyId=:countyId` - List properties in a county
- GET `/api/v1/properties/:propertyId` - Get property details

## Controller Wizard

The Controller Wizard guides users through creating and configuring controllers for the inventory hierarchy. It follows a step-by-step process:

1. **Controller Type Selection**: Choose the type of controller to create (Tax Sale, Map, Property, Demographics)
2. **Basic Information**: Provide name and description for the controller
3. **Region Selection**: Specify which state and/or county the controller will operate on
4. **Data Source Configuration**: Select or create a data source for collection
5. **Schedule Configuration**: Set up when the controller should run
6. **Notifications & Validation Settings**: Configure alerts and validation rules
7. **Review & Create**: Review all settings and create the controller

### Controller Validation Process

The wizard implements a comprehensive 3-step validation process:

#### 1. Configuration Validation

Verifies that the controller configuration is valid:
- All required fields have values
- The configuration is consistent and compatible with selected objects
- Permissions are sufficient for the operation

#### 2. Test Collection

Performs a sample data collection to validate the controller's functionality:
- Connects to the data source
- Authenticates using provided credentials
- Retrieves a small sample of data
- Validates data format and structure

#### 3. API Documentation Generation

Automatically generates documentation for the controller's API:
- Documents available endpoints
- Describes parameters and responses
- Provides example requests
- Generates OpenAPI-compatible schemas

This validation process ensures that controllers are properly configured and functional before being fully deployed in the system.

## Changelog

### Version 1.0.0 (Upcoming)
- Initial implementation of the inventory module
- Support for State → County → Property hierarchy
- Data collection framework
- Basic search functionality
- Map integration (placeholder) 