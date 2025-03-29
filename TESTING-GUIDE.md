# Real Estate Platform Testing Guide

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
The Collector Wizard guides users through a multi-step process to set up data collection.

### Testing Steps

1. **Access the Wizard**
   - Navigate to: `http://localhost:3000/wizard`
   - Verify the wizard interface loads without errors
   - Check that the step navigation or progress indicator is visible

2. **Navigation Through Steps**
   - Proceed through each step using the "Next" button
   - Use the "Previous" button to go back to earlier steps
   - Verify that data entered in previous steps is preserved

3. **Form Validation**
   - Try submitting a step with invalid or missing data
   - Verify that validation errors appear
   - Verify that the wizard prevents advancing with invalid data

4. **Data Collection**
   - Complete all required fields with test data
   - Verify that selections in one step affect options in subsequent steps (if applicable)
   - Test any dynamic form elements that appear based on selections

5. **Completion**
   - Complete all steps in the wizard
   - Verify that a summary or confirmation page appears
   - If applicable, test the final submission and verify success message

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