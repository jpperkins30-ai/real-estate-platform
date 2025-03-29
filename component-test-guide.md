# Real Estate Platform Component Visual Testing Guide

This guide provides instructions for manually testing the key components of the Real Estate Platform: Inventory Module, US Map, and Collector Wizard.

## Prerequisites

1. Ensure the application is running:
   ```
   .\start-app-direct.ps1
   ```

2. Log in with appropriate admin credentials

## 1. Inventory Module Testing

### Access the Inventory Dashboard

1. Navigate to: `http://localhost:3000/inventory`
2. Verify that the inventory dashboard loads successfully

### Visual Elements to Check

- [ ] Inventory header with title and navigation
- [ ] Property count summary
- [ ] Filtering options panel
- [ ] Property list with pagination
- [ ] Property cards with images, addresses, and status
- [ ] Sidebar with filtering options (property type, status, price range)

### Functional Tests

1. **Filter properties**:
   - Select a property type filter (residential, commercial, land)
   - Verify properties update accordingly

2. **Sort properties**:
   - Sort by price (high to low, low to high)
   - Sort by date added
   - Verify sorting works correctly

3. **Property Details**:
   - Click on a property card
   - Verify detailed view opens
   - Check that all property details are displayed correctly

## 2. US Map Component Testing

### Access the US Map

1. Navigate to: `http://localhost:3000/map`
2. Verify that the map loads successfully

### Visual Elements to Check

- [ ] Full US map renders with state boundaries
- [ ] Color-coded states based on property density
- [ ] Legend showing color scale meaning
- [ ] State hover effects showing state name
- [ ] Zoom and pan controls

### Functional Tests

1. **State Selection**:
   - Click on a state
   - Verify state is highlighted
   - Verify state detail panel appears with property count

2. **County View**:
   - Select a state
   - Verify counties within state are displayed
   - Check county-level data displays correctly

3. **Data Visualization**:
   - Verify color coding reflects the property density
   - Check that the legend matches the visualization

4. **Filters**:
   - Use any available filters (property type, tax status)
   - Verify map updates to reflect filtered data

## 3. Collector Wizard Testing

### Access the Collector Wizard

1. Navigate to: `http://localhost:3000/wizard`
2. Verify that the wizard interface loads successfully

### Visual Elements to Check

- [ ] Wizard header with title and progress indicator
- [ ] Step navigation sidebar/breadcrumbs
- [ ] Current step form with appropriate inputs
- [ ] Next/Previous navigation buttons
- [ ] Summary panel (if applicable)

### Functional Tests

1. **Step Navigation**:
   - Proceed through each step
   - Verify form validation works correctly
   - Test Previous button returns to prior step with data preserved

2. **Data Collection**:
   - Fill out forms at each step with test data
   - Verify data is preserved between steps

3. **Completion**:
   - Complete all steps
   - Verify summary screen shows all collected data
   - Submit the form
   - Verify success confirmation appears

## Error Handling

For each component, test error conditions:

1. **Network Issues**:
   - Temporarily disable network connectivity
   - Verify appropriate error messages are displayed

2. **Invalid Input**:
   - Enter invalid data in forms
   - Verify validation errors appear
   - Verify form cannot be submitted with invalid data

3. **Authorization**:
   - Log out and try to access protected routes
   - Verify redirect to login page or appropriate error message

## Performance Observations

Note any performance issues:

- [ ] Initial load time
- [ ] Responsiveness when filtering/sorting
- [ ] Map rendering performance
- [ ] Form submission response time

## Reporting Issues

If you encounter any issues during testing, note:

1. The component and specific feature affected
2. Steps to reproduce the issue
3. Expected vs. actual behavior
4. Screenshots of the issue (if applicable)
5. Browser and system information

---

Use this guide in conjunction with the automated testing script (`test-components.ps1`) for comprehensive testing of the Real Estate Platform components. 