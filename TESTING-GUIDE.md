# Real Estate Platform Testing Guide

> **Note**: This document is part of the Real Estate Platform's technical documentation suite. For related guides, see:
> - [Architecture Guide](./docs/architecture.md) - System architecture and component relationships
> - [Development Guide](./docs/development-guide.md) - Development environment setup and workflows
> - [Security Guide](./docs/SECURITY.md) - Security testing and compliance requirements
> - [Component Testing Guide](./docs/component-test-guide.md) - Detailed component testing procedures

This guide provides manual testing instructions for the three key components of the Real Estate Platform: Inventory Module, US Map, and Collector Wizard.

## Setup Instructions

1. Start the application using PowerShell:
   ```powershell
   .\start-app-direct.ps1
   ```

   This will start both the server and client in separate windows.

2. Verify the server is running by accessing:
   ```
   http://localhost:4000/api/health
   ```

3. Verify the client is running by accessing:
   ```
   http://localhost:3000
   ```

## 1. Inventory Module Testing

### Overview
The Inventory Module displays real estate properties with filtering and sorting options.

### Testing Steps

1. **Access the Inventory Dashboard**
   - Navigate to: `http://localhost:3000/inventory`
   - Verify the page loads without errors
   - Check that the inventory title and property count are displayed

2. **Property Filtering**
   - Use the sidebar filters to filter properties by:
     - Property type (residential, commercial, land)
     - Tax status
     - Price range
   - Verify that the property list updates accordingly

3. **Property Sorting**
   - Use sorting options to sort properties by:
     - Price (high to low / low to high)
     - Date added
     - Location
   - Verify that properties are correctly sorted

4. **Property Details**
   - Click on a property card
   - Verify that the detail view opens
   - Check that property images, details, tax information, and location are displayed

5. **Pagination**
   - If there are multiple pages of properties, test the pagination controls
   - Verify that navigating between pages works correctly

## 2. US Map Component Testing

### Overview
The US Map component displays a map of the United States with property data visualized geographically.

### Testing Steps

1. **Access the US Map View**
   - Navigate to: `http://localhost:3000/map`
   - Verify the map loads without errors
   - Check that state boundaries are clearly visible

2. **State Interaction**
   - Hover over different states
   - Verify that state names and property counts appear on hover
   - Click on a state and verify it zooms or highlights the state

3. **County View**
   - After selecting a state, verify if county-level data is displayed
   - Check that county boundaries are visible
   - Verify county-specific information is displayed

4. **Data Visualization**
   - Verify color coding reflects property density or other metrics
   - Check that the legend properly explains the color coding
   - If available, test switching between different visualization metrics

5. **Map Controls**
   - Test zoom in/out functionality
   - Test map panning (dragging to see different areas)
   - If available, test any layer toggle controls

## 3. Collector Wizard Testing

### Overview
The Collector Wizard guides users through a multi-step process to set up and manage data collection. The wizard integrates with the inventory management system to collect and process property data from various sources.

### Testing Steps

1. **Access the Collection Management**
   - Navigate to: `http://localhost:3000/collection`
   - Verify the collection history page loads
   - Check that previous collection runs are displayed (if any)
   - Verify the "Configure New Collector" button is visible

2. **Configure New Collector**
   - Click "Configure New Collector"
   - Verify the configuration form loads
   - Test configuration options:
     - Source selection (e.g., county data sources)
     - Data format specification
     - Collection frequency settings
     - Target property types
     - Geographic region filters

3. **Collection History**
   - Review collection history entries
   - Verify each entry shows:
     - Collection date and time
     - Source information
     - Status (success/failure)
     - Number of records processed
   - Test filtering and sorting options
   - Verify detailed view of collection runs

4. **Data Collection Process**
   - Start a new collection run
   - Monitor the collection progress
   - Verify real-time status updates
   - Check error handling:
     - Network timeouts
     - Invalid data formats
     - Authentication failures
   - Verify completion notification

5. **Data Validation**
   - Review collected data in the inventory
   - Verify property details are correctly imported
   - Check data transformation accuracy:
     - Address formatting
     - Price normalization
     - Geographic coordinates
     - Property classifications

6. **Error Recovery**
   - Test pause/resume functionality
   - Verify retry mechanisms for failed items
   - Check error logs and notifications
   - Test manual intervention options

7. **Integration Testing**
   - Verify collected data appears in:
     - Inventory dashboard
     - Map visualization
     - Export functionality
   - Check data consistency across views
   - Test search and filter with new data

### Performance Considerations

When testing the collector framework, pay attention to:

1. **Resource Usage**
   - Monitor server load during collection
   - Check memory usage with large datasets
   - Verify database performance

2. **Scalability**
   - Test with varying data volumes
   - Check concurrent collection runs
   - Verify rate limiting functionality

3. **Recovery Mechanisms**
   - Test automatic retry logic
   - Verify checkpoint/resume functionality
   - Check data consistency after interruptions

## Error Testing

For each component, test error scenarios:

1. **Network Errors**
   - Temporarily disable network connection
   - Verify appropriate error messages are displayed
   - Check that the application recovers when connection is restored

2. **Invalid Inputs**
   - Enter invalid data in form fields
   - Verify validation errors appear
   - Test boundary conditions (e.g., minimum/maximum values)

3. **Authentication Issues**
   - If applicable, test accessing protected routes without authentication
   - Verify redirect to login or appropriate error message

## Performance Testing

Note any performance issues during testing:

1. **Load Time**
   - Record initial load time for each component
   - Note any delays when changing views or loading data

2. **Responsiveness**
   - Test interaction responsiveness (clicks, form inputs)
   - Verify smooth animations and transitions

3. **Resource Usage**
   - Monitor browser memory and CPU usage during testing
   - Note any unusual resource consumption

## Reporting Issues

When reporting issues, include:

1. Component name and specific feature affected
2. Steps to reproduce the issue
3. Expected behavior vs. actual behavior
4. Screenshots if applicable
5. Browser and system information

---

**Note:** Due to PowerShell command execution limitations on Windows, programmatic testing scripts may not work as expected. This manual testing guide serves as an alternative approach to ensure the application components are functioning correctly. 