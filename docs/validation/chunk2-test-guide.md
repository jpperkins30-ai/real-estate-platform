# Panel Communication System Testing Guide

This guide outlines the procedure for validating the Panel Communication System implementation from Chunk 2. It includes automated and manual testing steps to ensure all components work correctly together.

## Prerequisites

- Node.js 16+ installed
- Project dependencies installed (`npm install`)
- All component tests implemented (see missing tests report below)

## Running Automated Tests

### 1. Run the Validation Script

The validation script will run all automated tests for the panel communication components:

```bash
node docs/validation/chunk2-test.js
```

This script will:
- Run tests for all context providers
- Run tests for all hooks
- Run integration tests for the component communication
- Generate a validation report

### 2. Check Test Results

After running the script, review the output summary:
- ✅ Passed: Tests that ran successfully
- ❌ Failed: Tests that failed (these need to be fixed)
- ⚠️ Skipped: Test files that couldn't be found (these need to be implemented)

If any tests are missing or failing, address them before proceeding with manual validation.

### 3. Implementing Missing Tests

If the script reports missing tests, you'll need to implement them:

| Component | Test File Path |
|-----------|---------------|
| PanelSyncContext | client/src/__tests__/context/PanelSyncContext.test.tsx |
| LayoutContext | client/src/__tests__/context/LayoutContext.test.tsx |
| PanelRegistry | client/src/__tests__/services/PanelRegistry.test.ts |
| usePanelSync | client/src/__tests__/hooks/usePanelSync.test.tsx |
| useEntityData | client/src/__tests__/hooks/useEntityData.test.tsx |
| useLayoutContext | client/src/__tests__/hooks/useLayoutContext.test.tsx |
| Integration | client/src/__tests__/integration/panelCommunication.test.tsx |

## Manual Validation Checklist

After automated tests pass, perform these manual validations:

### Panel Communication

1. **Panel Event Broadcasting**
   - Launch the application
   - Open at least two panels
   - Verify that selecting an entity in one panel updates the other panel
   - Verify that filtering in one panel affects the related panels

2. **Entity Data Synchronization**
   - Open a county panel and a property panel
   - Select a county in the county panel
   - Verify the property panel updates to show properties in that county
   - Update information in one panel
   - Verify the changes are reflected in other panels

3. **Panel Registry**
   - Verify that all panel types load correctly
   - Check that lazy-loaded panels appear after a brief loading indicator
   - Verify that panels retain their state when layout changes
   - Test panel discovery through the registry API

4. **Layout Persistence**
   - Create a custom panel arrangement
   - Save the layout
   - Change to a different layout
   - Restore the saved layout
   - Verify panels return to the correct positions with the correct content

5. **Error Handling**
   - Force an error in a panel (e.g., disconnect from API while loading)
   - Verify error is contained within the panel
   - Verify other panels continue to function
   - Check that error UI is appropriate and informative

## Performance Testing

1. **Event Broadcasting Performance**
   - Open the performance panel (if available)
   - Generate a high volume of events (50+ per second)
   - Verify the UI remains responsive
   - Check that events are processed in the correct order

2. **Resource Usage**
   - Monitor memory usage with multiple panels open
   - Verify there are no memory leaks after extended use
   - Check CPU usage during heavy event broadcasting

## Updating the Validation Checklist

After completing testing, update the validation checklist:

1. Open `docs/validation/chunk2-validation-checklist.md`
2. Check off items that have been validated
3. Add notes for any issues discovered
4. Document any missing or incomplete features

## Submitting Validation Results

Once validation is complete:

1. Commit the updated validation checklist
2. Include the JSON validation results file
3. Create a pull request with validation results
4. Provide a summary of findings in the PR description

## Troubleshooting Common Issues

### Event Broadcasting Issues
- Check that panel IDs are unique
- Verify that event types match between publisher and subscriber
- Check for correct event payload structure

### Panel Registration Issues
- Verify panels are properly registered with the layout context
- Check if panel configuration is correct
- Ensure panel registry has all required components registered

### Layout Persistence Issues
- Check browser local storage for saved layouts
- Verify localStorage permissions
- Check for serialization errors in saved layouts 