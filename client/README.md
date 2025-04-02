# Real Estate Platform - Client

This is the frontend application for the Real Estate Platform inventory module. It provides an interface to showcase the collector framework, manage data sources, and visualize the state/county hierarchy of properties.

## Features

- **Inventory Dashboard**: View statistics and manage collectors and data sources
- **State/County Hierarchy**: Navigate through states and counties in a hierarchical tree
- **Collector Configuration**: Configure and set up new data collectors
- **Collection History**: Monitor and review property collection runs

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- The backend server running on port 4000

### Installation

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm start
```

This will start the application on [http://localhost:3000](http://localhost:3000).

## Project Structure

```
client/
├── public/              # Static files
├── src/                 # Source code
│   ├── components/      # React components
│   │   ├── InventoryDashboard.js      # Main dashboard component
│   │   ├── HierarchyTree.js           # State/county hierarchy component
│   │   ├── CollectorConfigurationForm.js # Form for configuring collectors
│   │   └── CollectionHistory.js       # Collection history component
│   ├── App.js           # Main application component
│   ├── App.css          # Application styles
│   └── index.js         # Application entry point
└── package.json         # Project dependencies and scripts
```

## API Integration

The application connects to the following backend endpoints:

- `/api/collections/collectors` - Get available collectors
- `/api/data-sources` - Manage data sources
- `/api/properties/stats` - Get property statistics
- `/api/properties/stats/state` - Get state-level statistics
- `/api/properties/stats/county` - Get county-level statistics
- `/api/collections` - View collection history

## Deployment

To build the application for production:

```bash
npm run build
```

This will create an optimized production build in the `build` folder.

## Additional Notes

- The application uses React Bootstrap for UI components
- Proxy configuration is set up in package.json to forward API requests to the backend server
- React Router is used for client-side routing
- React Icons are used for visual elements in the interface

## Testing

### Recent Test Fixes

We've made several improvements to the test suite:

1. Fixed duplicate `useResizable` function export in `hooks/useResizable.ts`
2. Added null check in `useDraggable` hook to properly handle parent elements that might be null
3. Updated React Router mocking in controller tests to use Vitest syntax instead of Jest
4. Fixed `CountyPanel` test with proper `entityId` property in `useEntityData` mock
5. Removed empty `PanelResizer.test.tsx` file that was causing test failures
6. Updated EnhancedPanelContainer test with improved mock setup
7. Fixed `useDraggable` tests by properly mocking DOM events and event listeners

### Known Test Issues

There are still some test issues to resolve:

1. `useDraggable` test failing on drag position updates and callback tests ✅ FIXED
   - Likely due to event handling in JSDOM environment
   - May need to update test to use more specific event mocking

2. `PropertySearchBox` test failures
   - Error messages need to be checked and updated

3. `PanelHeader` style expectations
   - Style tests may need to be updated to match the current component implementation

### Test Debugging Tips for Fixing Remaining Issues

#### For PropertySearchBox Tests:
- Check error message expectations in the test
- Make sure the mock data structure matches what the component expects
- Verify that error handlers are properly implemented

#### For PanelHeader Style Tests:
- Update style expectations to match current implementation
- Use more flexible matchers for style tests (e.g., `expect.objectContaining()`)
- Consider updating tests to focus on functionality rather than exact style values

### Running Tests

Run all tests:
```
npm test
```

Run specific tests:
```
npm test -- [test file pattern]
```

Example:
```
npm test -- useResizable
```

### Test Debugging Tips

1. When tests fail with "Cannot find module" errors:
   - Check that mock setup is correct and imported modules exist
   - Make sure the module paths are correct

2. For component render issues:
   - Check that required providers (Router, Context, etc.) are included
   - Use test-utils for consistent test setup

3. For hook tests:
   - Mock browser APIs that hooks depend on
   - Use `act()` for all state updates
