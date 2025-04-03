# Real Estate Platform Components Summary

> **Note**: This document is part of the Real Estate Platform's technical documentation suite. For related guides, see:
> - [Architecture Guide](./docs/architecture.md) - System architecture and component relationships
> - [Development Guide](./docs/development-guide.md) - Development environment setup and workflows
> - [Testing Guide](./TESTING-GUIDE.md) - Testing procedures and guidelines
> - [Component Testing Guide](./docs/component-test-guide.md) - Detailed component testing procedures
> - [Security Guide](./docs/SECURITY.md) - Security considerations and best practices

This document provides a summary of the key components in the Real Estate Platform and our approach to testing them.

## Application Structure

The Real Estate Platform consists of three main components:

1. **Inventory Module**: Displays and manages real estate properties
2. **US Map Component**: Visualizes property data geographically
3. **Collector Wizard**: Multi-step wizard for configuring data collection

## Testing Approach

Due to some challenges with PowerShell on Windows (particularly the `&&` operator limitation), we've created alternative testing strategies:

### 1. Manual Testing Scripts

- `start-app-direct.ps1`: Starts both server and client in separate windows
- `open-component.ps1`: Opens specific component URLs in the browser
- `check-api.ps1`: Tests API endpoints for server components

### 2. Comprehensive Test Documentation

- `TESTING-GUIDE.md`: Detailed instructions for manually testing all components
- `component-test-guide.md`: Visual inspection guide for UI components

## Component Descriptions

### 1. Inventory Module

The Inventory Module is a comprehensive property management dashboard that allows users to:

- View a list of properties with key details
- Filter properties by type, status, and price range
- Sort properties by various attributes
- View detailed information about individual properties
- Manage property listings (add, edit, delete)

Key files:
- Client: `client/src/components/inventory/*`
- Server: `server/src/routes/inventory.ts`
- API Endpoints: `/api/inventory/properties`, `/api/inventory/counties`

### 2. US Map Component

The US Map Component provides a geographic visualization of properties across the United States:

- Interactive map showing all US states
- Color-coded states based on property density
- Drill-down to county level data
- Detailed property statistics by region
- Filtering capabilities by property attributes

Key files:
- Client: `client/src/components/map/*`
- Server: `server/src/routes/usmap.ts`
- API Endpoints: `/api/usmap`, `/api/states`, `/api/counties`

### 3. Collector Wizard

The Collector Wizard guides users through configuring data collection processes:

- Multi-step form with navigation between steps
- Dynamic form fields based on previous selections
- Data validation at each step
- Summary view before final submission
- Configuration saving and management

Key files:
- Client: `client/src/components/wizard/*`
- Server: `server/src/routes/wizard.ts`
- API Endpoints: `/api/wizard/steps`, `/api/collectors/config`

## Role-Based Access Control

All these components utilize the role-based authorization middleware we implemented, with these roles:

- **admin**: Full access to all components and functionality
- **analyst**: Can access export and view data visualizations
- **dataManager**: Can configure data collection processes
- **user**: Basic access with limited functionality

## Testing Instructions

To test the application components:

1. Start the application:
   ```powershell
   .\start-app-direct.ps1
   ```

2. Open specific components for testing:
   ```powershell
   .\open-component.ps1 -Component inventory
   .\open-component.ps1 -Component map
   .\open-component.ps1 -Component wizard
   ```

3. Follow the detailed testing instructions in `TESTING-GUIDE.md`

## Troubleshooting

If you encounter issues during testing:

1. Verify both server and client are running
2. Check server health at `http://localhost:4000/api/health`
3. Ensure MongoDB is running and accessible
4. Check browser console for client-side errors
5. Refer to server logs for API errors

For detailed testing procedures, see the `TESTING-GUIDE.md` document. 