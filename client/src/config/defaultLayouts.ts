import { LayoutConfig } from '../types/layout.types';

export const defaultLayouts: LayoutConfig[] = [
  {
    id: 'default-single',
    name: 'Single Panel View',
    description: 'Simple view with a full map',
    type: 'single',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 100, height: 100 }
      }
    ],
    isDefault: true,
    isPublic: true
  },
  {
    id: 'default-dual-map-property',
    name: 'Map & Property View',
    description: 'Dual panel layout with map and property details',
    type: 'dual',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 60, height: 100 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Property Details',
        position: { row: 0, col: 1 },
        size: { width: 40, height: 100 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-tri-analysis',
    name: 'Analysis View',
    description: 'Three panel layout for data analysis',
    type: 'tri',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 60 }
      },
      {
        id: 'filter',
        contentType: 'filter',
        title: 'Filters',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 60 }
      },
      {
        id: 'stats',
        contentType: 'stats',
        title: 'Statistics',
        position: { row: 1, col: 0 },
        size: { width: 100, height: 40 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-quad-full',
    name: 'Complete Analysis View',
    description: 'Full analysis dashboard with all panel types',
    type: 'quad',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'US Map',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'state',
        contentType: 'state',
        title: 'State Information',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'county',
        contentType: 'county',
        title: 'County Details',
        position: { row: 1, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Properties',
        position: { row: 1, col: 1 },
        size: { width: 50, height: 50 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-property-scout',
    name: 'Property Scout View',
    description: 'Optimized for property browsing and evaluation',
    type: 'quad',
    panels: [
      {
        id: 'map',
        contentType: 'map',
        title: 'Property Map',
        position: { row: 0, col: 0 },
        size: { width: 70, height: 70 }
      },
      {
        id: 'filter',
        contentType: 'filter',
        title: 'Search Filters',
        position: { row: 0, col: 1 },
        size: { width: 30, height: 70 }
      },
      {
        id: 'property',
        contentType: 'property',
        title: 'Property Details',
        position: { row: 1, col: 0 },
        size: { width: 70, height: 30 }
      },
      {
        id: 'stats',
        contentType: 'stats',
        title: 'Market Stats',
        position: { row: 1, col: 1 },
        size: { width: 30, height: 30 }
      }
    ],
    isPublic: true
  },
  {
    id: 'default-market-analyst',
    name: 'Market Analyst View',
    description: 'Advanced view for market analysis and trends',
    type: 'quad',
    panels: [
      {
        id: 'chart',
        contentType: 'chart',
        title: 'Market Trends',
        position: { row: 0, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'stats',
        contentType: 'stats',
        title: 'Statistics',
        position: { row: 0, col: 1 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'map',
        contentType: 'map',
        title: 'Geographic View',
        position: { row: 1, col: 0 },
        size: { width: 50, height: 50 }
      },
      {
        id: 'filter',
        contentType: 'filter',
        title: 'Analysis Filters',
        position: { row: 1, col: 1 },
        size: { width: 50, height: 50 }
      }
    ],
    isPublic: true
  }
];

// Function to initialize default layouts in the system
export async function initializeDefaultLayouts(layoutService: any): Promise<void> {
  try {
    // Fetch existing layouts first to avoid duplicates
    const existingLayouts = await layoutService.fetchLayouts(true);
    
    // Check for each default layout
    for (const defaultLayout of defaultLayouts) {
      // Check if this default layout already exists
      const exists = existingLayouts.some((layout: LayoutConfig) => layout.id === defaultLayout.id);
      
      if (!exists) {
        // Create the default layout
        await layoutService.saveLayout(defaultLayout);
      }
    }
    
    console.log('Default layouts initialized successfully');
  } catch (error) {
    console.error('Error initializing default layouts:', error);
  }
} 