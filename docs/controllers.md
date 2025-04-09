# Controller System Documentation

## Overview
The controller system provides a framework for managing and executing automated operations within the real estate platform. It includes configuration, monitoring, and execution capabilities.

## Components

### ControllerWizardLauncher
Entry point component for controller configuration and management.

```typescript
interface ControllerWizardLauncherProps {
  entityType: string;
  entityId: string;
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'text';
}
```

#### Features
- Status display with badges
- Create/Edit controller options
- Real-time status updates
- Error handling and recovery

## Services

### Controller Service
Handles all controller-related API operations.

```typescript
interface ControllerService {
  fetchControllerStatus(entityType: string, entityId: string): Promise<ControllerResponse<ControllerStatus>>;
  createController(config: ControllerConfig): Promise<ControllerResponse<void>>;
  updateController(config: ControllerConfig): Promise<ControllerResponse<void>>;
  executeController(entityType: string, entityId: string): Promise<ControllerResponse<void>>;
  getControllerHistory(entityType: string, entityId: string): Promise<ControllerResponse<ControllerHistoryItem[]>>;
  getControllerTemplates(entityType: string): Promise<ControllerResponse<ControllerTemplate[]>>;
}
```

## Types and Interfaces

### Controller Status
```typescript
interface ControllerStatus {
  hasController: boolean;
  status: 'active' | 'paused' | 'error';
  lastRunTime?: string;
  error?: ControllerError;
}
```

### Controller Configuration
```typescript
interface ControllerConfig {
  entityType: string;
  entityId: string;
  isActive: boolean;
  schedule?: string;
  parameters: Record<string, unknown>;
}
```

### Controller History
```typescript
interface ControllerHistoryItem {
  id: string;
  timestamp: string;
  status: 'success' | 'error';
  duration: number;
  error?: ControllerError;
  result?: unknown;
}
```

### Controller Template
```typescript
interface ControllerTemplate {
  id: string;
  name: string;
  description: string;
  supportedEntityTypes: string[];
  defaultParameters: Record<string, unknown>;
  version: string;
}
```

## Custom Hooks

### useController
Manages controller state and operations.

```typescript
interface UseControllerOptions {
  entityType: string;
  entityId: string;
  refreshInterval?: number;
}

interface UseControllerResult {
  status: ControllerStatus | null;
  isLoading: boolean;
  error: ControllerError | null;
  refresh: () => Promise<void>;
  execute: () => Promise<void>;
}
```

#### Usage
```typescript
const { status, isLoading, error, refresh, execute } = useController({
  entityType: 'property',
  entityId: '123',
  refreshInterval: 5000
});
```

## Error Handling

### Controller Error
```typescript
interface ControllerError {
  message: string;
  code?: string;
  details?: unknown;
}
```

### Error Recovery
1. Automatic retries for transient failures
2. Manual refresh capability
3. Error state display with recovery options

## State Management

### Controller State Flow
1. Initial loading state
2. Status fetching
3. Regular status updates
4. Error handling
5. State persistence

## Best Practices

### Controller Configuration
1. **Parameter Validation**
   - Validate all required parameters
   - Provide default values where appropriate
   - Handle type conversions

2. **Error Handling**
   - Implement proper error boundaries
   - Provide user feedback
   - Log errors for debugging

3. **Performance**
   - Optimize refresh intervals
   - Implement request debouncing
   - Cache responses where appropriate

## Examples

### Basic Controller Setup
```typescript
<ControllerWizardLauncher
  entityType="property"
  entityId="123"
  label="Configure Property Controller"
/>
```

### Custom Controller Integration
```typescript
const { status, execute } = useController({
  entityType: 'property',
  entityId: '123'
});

// Custom execution logic
const handleExecute = async () => {
  try {
    await execute();
    // Handle success
  } catch (error) {
    // Handle error
  }
};
```

## Entity-Specific Controllers

### County Controllers

County controllers provide automated data management for county-level information. They work with the standardized County model that includes nested statistics.

#### County Model Structure

```typescript
interface ICounty {
  stateId: mongoose.Types.ObjectId;  // Reference to State
  name: string;                      // County name
  fips: string;                      // FIPS code
  boundaries: any;                   // GeoJSON representation
  population: number;                // Population count
  propertyCount: number;             // Number of properties
  
  // Nested statistics structure
  stats: {
    medianHomeValue: number;         // Median home value
    medianIncome: number;            // Median household income
    unemploymentRate: number;        // Unemployment rate %
    avgDaysOnMarket: number;         // Average days on market
    listingCount: number;            // Number of listings
    priceChangeYoY: number;          // Year-over-year price change %
    lastUpdated: Date;               // Last update timestamp
  };
}
```

#### County Controller Operations

```typescript
// Update county statistics
const updateCountyStats = async (countyId: string, statsUpdate: Partial<ICounty['stats']>) => {
  try {
    const county = await County.findById(countyId);
    
    if (!county) {
      throw new Error('County not found');
    }
    
    // Create update object for nested stats fields
    const updateData: any = {};
    
    // Update only valid stats fields
    Object.keys(statsUpdate).forEach(key => {
      if (key in county.stats) {
        updateData[`stats.${key}`] = statsUpdate[key];
      }
    });
    
    // Update last updated timestamp
    updateData['stats.lastUpdated'] = new Date();

    // Apply updates
    const updatedCounty = await County.findByIdAndUpdate(
      countyId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    return updatedCounty.stats;
  } catch (error) {
    console.error(`Error updating county stats: ${error}`);
    throw error;
  }
};

// Get county statistics
const getCountyStats = async (countyId: string) => {
  try {
    const county = await County.findById(countyId)
      .select('stats population propertyCount');
    
    if (!county) {
      throw new Error('County not found');
    }
    
    // Create a plain object with the stats properties
    const statsResponse = {
      medianHomeValue: county.stats.medianHomeValue,
      medianIncome: county.stats.medianIncome,
      unemploymentRate: county.stats.unemploymentRate,
      avgDaysOnMarket: county.stats.avgDaysOnMarket,
      listingCount: county.stats.listingCount,
      priceChangeYoY: county.stats.priceChangeYoY,
      lastUpdated: county.stats.lastUpdated,
      population: county.population,
      propertyCount: county.propertyCount
    };
    
    return statsResponse;
  } catch (error) {
    console.error(`Error fetching county stats: ${error}`);
    throw error;
  }
};

#### County Controller Configuration

County controllers support various types of automation:

1. **Statistical Data Collection**
   - Periodic updates of economic statistics
   - Population and property count verification
   - Real estate market metrics calculation

2. **Boundary Management**
   - GeoJSON boundaries verification and optimization
   - Coordinates system standardization

3. **Property Aggregation**
   - Automatic property counting and categorization
   - Tax data compilation

#### County Controller API

```typescript
const COUNTY_CONTROLLER_ENDPOINTS = {
  stats: '/api/counties/:countyId/stats',
  updateStats: '/api/counties/:countyId/stats',
  boundaries: '/api/counties/:countyId/boundaries',
  search: '/api/counties/search',
};
```

## API Integration

### Endpoints
```typescript
const CONTROLLER_ENDPOINTS = {
  status: '/api/controllers/:entityType/:entityId/status',
  create: '/api/controllers',
  update: '/api/controllers/:entityType/:entityId',
  execute: '/api/controllers/:entityType/:entityId/execute',
  history: '/api/controllers/:entityType/:entityId/history',
  templates: '/api/controllers/:entityType/templates'
};
```

### Response Handling
- Status codes and meanings
- Error response format
- Success response format

## Related Documentation
- [Architecture Overview](./architecture.md)
- [Panel System](./panels.md)
- [Testing Guide](./testing.md)