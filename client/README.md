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
