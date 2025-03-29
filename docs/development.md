# Development Guide

## Overview

This guide provides instructions for developers working on the Real Estate Platform. It covers setup, development workflow, and best practices for working with the hierarchical inventory structure, implementing new functionality, and testing procedures.

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (v5+)
- Git

### Setup

1. Clone the repository:
```bash
   git clone https://github.com/your-organization/real-estate-platform.git
cd real-estate-platform
```

2. Install dependencies:
```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env` in both the server and client directories
   - Update the environment variables as needed

4. Start the development servers:
```bash
   # Start server
   cd server
   npm run dev

   # In a new terminal, start client
   cd client
npm run dev
```

## Architecture Overview

The Real Estate Platform follows a hierarchical structure for inventory management:

1. **US Map** - Top-level container
2. **States** - Belong to US Map
3. **Counties** - Belong to States
4. **Properties** - Belong to Counties

This hierarchy is reflected in both the database schema and the API endpoints. Each level of the hierarchy provides statistical aggregations of its child entities.

## Working with the Hierarchical Structure

### Accessing Parent/Child Relationships

When working with the hierarchical structure, you'll commonly need to:

1. **Navigate down the hierarchy**:
   ```typescript
   // Get counties for a state
   const counties = await County.find({ stateId: stateId });

   // Get properties for a county
   const properties = await Property.find({ countyId: countyId });

   // Get properties for a state
   const properties = await Property.find({ stateId: stateId });
   ```

2. **Navigate up the hierarchy**:
   ```typescript
   // Get a property's county
   const property = await Property.findById(propertyId);
   const county = await County.findById(property.countyId);

   // Get a property's state
   const state = await State.findById(property.stateId);

   // Get a county's state
   const county = await County.findById(countyId);
   const state = await State.findById(county.stateId);
   ```

3. **Populate related entities**:
```typescript
   // Get a property with county and state populated
   const property = await Property.findById(propertyId)
     .populate('countyId')
     .populate('stateId');

   // Get counties with state populated
   const counties = await County.find({})
     .populate('stateId');
   ```

### Data Initialization Scripts

The platform includes scripts for initializing hierarchical data:

1. **Creating Initial States**:
   ```bash
   # Run from the server directory
   npm run ts-node src/scripts/createInitialStates.ts
   ```

2. **Creating Initial Counties**:
   ```bash
   # Run from the server directory
   npm run ts-node src/scripts/createInitialCounties.ts
   ```

These scripts populate the database with basic geographic data and metadata. The county initialization script creates sample counties with:
- Geographic boundaries (GeoJSON)
- County metadata including search configuration
- Property search endpoints for county tax assessor websites
- Statistics tracking

To add new counties, edit the `initialCounties` array in `server/src/scripts/createInitialCounties.ts`:

```typescript
const initialCounties = [
  {
    name: "Your County Name",
    state: 'CA',  // State abbreviation
    metadata: {
      searchConfig: {
        lookupMethod: 'account_number',
        searchUrl: 'https://county-assessor-url.gov/',
        selectors: {
          // Selectors for scraping property data
          ownerName: '.selector-for-owner-name',
          propertyAddress: '.selector-for-property-address',
          marketValue: '.selector-for-market-value',
          taxStatus: '.selector-for-tax-status'
        },
        lienUrl: 'https://tax-lien-url.gov/' // Optional
      }
    }
  }
];
```

For more comprehensive geographic data initialization, use:

```bash
# Run from the server directory
npm run ts-node src/scripts/initGeoData.ts
```

This script initializes the complete hierarchy including the US Map, all states, and selected counties.

### Updating Statistics

When properties are created, updated, or deleted, you need to update statistics in the parent entities:

```typescript
async function updateCountyStatistics(countyId) {
  const properties = await Property.find({ countyId });
  
  const totalProperties = properties.length;
  const totalTaxLiens = properties.filter(p => p.taxStatus?.taxLienAmount > 0).length;
  const totalValue = properties.reduce((sum, p) => sum + (p.taxStatus?.marketValue || 0), 0);
  
  await County.findByIdAndUpdate(countyId, {
    'metadata.totalProperties': totalProperties,
    'metadata.statistics.totalTaxLiens': totalTaxLiens,
    'metadata.statistics.totalValue': totalValue
  });
  
  // Get county to update state statistics
  const county = await County.findById(countyId);
  await updateStateStatistics(county.stateId);
}

async function updateStateStatistics(stateId) {
  const counties = await County.find({ stateId });
  
  const totalCounties = counties.length;
  const totalProperties = counties.reduce((sum, c) => sum + (c.metadata?.totalProperties || 0), 0);
  const totalTaxLiens = counties.reduce((sum, c) => sum + (c.metadata?.statistics?.totalTaxLiens || 0), 0);
  const totalValue = counties.reduce((sum, c) => sum + (c.metadata?.statistics?.totalValue || 0), 0);
  
  await State.findByIdAndUpdate(stateId, {
    'metadata.totalCounties': totalCounties,
    'metadata.totalProperties': totalProperties,
    'metadata.statistics.totalTaxLiens': totalTaxLiens,
    'metadata.statistics.totalValue': totalValue
  });
  
  // Update US Map statistics
  await updateUSMapStatistics();
}
```

## Export Services

### Overview

The platform includes export services that allow data to be exported to CSV and Excel formats. These services follow the hierarchical structure and support filtering based on various criteria.

### Working with Export Services

#### Adding a New Export Format

To add a new export format (e.g., JSON, PDF), follow these steps:

1. Extend the `ExportService` class in `server/src/services/export.service.ts`:

```typescript
async exportPropertiesToJson(properties: any[], filters: any = {}): Promise<string> {
  // If properties not provided, fetch them using filters
  if (!properties || properties.length === 0) {
    properties = await this.getPropertiesWithFilters(filters);
    
    if (properties.length === 0) {
      throw new Error('No properties found matching the specified filters');
    }
  }
  
  // Transform properties for export
  const formattedProperties = properties.map(property => {
    return {
      id: property._id?.toString() || property.id,
      parcelId: property.parcelId || '',
      // Add other fields as needed
    };
  });
  
  // Return JSON string
  return JSON.stringify(formattedProperties, null, 2);
}
```

2. Add new route in `server/src/routes/export.routes.ts`:

```typescript
/**
 * @swagger
 * /api/export/properties/json:
 *   post:
 *     summary: Export properties to JSON format
 *     tags: [Exports]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stateId:
 *                 type: string
 *                 description: Filter by state ID
 *               // Add other filters
 *     responses:
 *       200:
 *         description: JSON file of properties
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *       500:
 *         description: Server error
 */
router.post('/properties/json', async (req, res) => {
  try {
    const filters = req.body;
    
    const jsonData = await exportService.exportPropertiesToJson([], filters);
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=properties_export_${new Date().toISOString().split('T')[0]}.json`);
    res.send(jsonData);
  } catch (error: any) {
    console.error('JSON export error:', error);
    res.status(500).json({ message: error.message || 'Failed to export properties to JSON' });
  }
});
```

#### Adding New Fields to Exports

To add new fields to exports:

1. Update the appropriate export method in `ExportService`:

```typescript
// In exportPropertiesToCsv method
const headers = [
  // Existing headers
  { id: 'newField', title: 'New Field Title' }
];

// In the mapping function
return {
  // Existing fields
  newField: property.someObject?.newField || ''
};
```

2. Follow the same pattern for Excel exports, adding the new column definition.

#### Adding New Filters

To add new filters to exports:

1. Update the `buildPropertyFilterQuery` method in `ExportService`:

```typescript
private buildPropertyFilterQuery(filters: any): any {
  const query: any = {};
  
  // Existing filters
  
  // Add new filter
  if (filters.ownerName) {
    query.ownerName = { $regex: filters.ownerName, $options: 'i' };
  }
  
  return query;
}
```

2. Update the Swagger documentation in the routes file to document the new filter.

### Best Practices for Export Services

1. **Performance Optimization**:
   - Use projection to fetch only needed fields
   - Consider streaming for large exports
   - Add pagination for very large datasets

2. **Error Handling**:
   - Provide clear error messages
   - Log detailed errors on the server
   - Return appropriate HTTP status codes

3. **Security**:
   - Validate user permissions before export
   - Ensure sensitive data is properly filtered
   - Rate limit export requests to prevent abuse

## Testing

### Unit Testing

Unit tests should be written for all services, including export services. Example test for the export service:

```typescript
describe('ExportService', () => {
  describe('exportPropertiesToCsv', () => {
    it('should export properties to CSV format', async () => {
      // Arrange
      const mockProperties = [
        {
          _id: 'property-id-1',
          parcelId: '12345',
          propertyAddress: '123 Main St'
          // Add other required fields
        }
      ];
      
      // Act
      const result = await exportService.exportPropertiesToCsv(mockProperties);
      
      // Assert
      expect(result).toContain('ID,Parcel ID,Property Address');
      expect(result).toContain('property-id-1,12345,123 Main St');
    });
    
    it('should handle empty properties array', async () => {
      // Arrange
      const mockFind = jest.spyOn(Property, 'find').mockResolvedValue([]);
      
      // Act
      const result = await exportService.exportPropertiesToCsv([], { stateId: 'state-id' });
      
      // Assert
      expect(result).toBe('No properties found matching the specified filters');
      expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ stateId: 'state-id' }));
    });
  });
});
```

### Integration Testing

Integration tests should verify that the export endpoints work correctly:

```typescript
describe('Export API', () => {
  describe('POST /export/properties/enhanced/csv', () => {
    it('should return CSV data', async () => {
      // Arrange
      const mockProperties = [/* Sample data */];
      jest.spyOn(Property, 'find').mockImplementation(() => ({
        populate: jest.fn().mockImplementation(() => ({
          populate: jest.fn().mockResolvedValue(mockProperties)
        }))
      }));
      
      // Act
    const response = await request(app)
        .post('/api/export/properties/enhanced/csv')
        .send({ stateId: 'state-id' });
      
      // Assert
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toBe('text/csv');
      expect(response.text).toContain('ID,Parcel ID');
    });
  });
});
```

### End-to-End Testing

End-to-end tests should verify the complete export process from UI request to file download:

```typescript
describe('Export Functionality', () => {
  it('should export properties to CSV', async () => {
    // Navigate to properties page
    await page.goto('http://localhost:3000/properties');
    
    // Click export button
    await page.click('[data-testid="export-csv-button"]');
    
    // Verify file download
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toMatch(/properties_export_.*\.csv/);
  });
});
```

## Git Workflow

### Feature Branches

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/export-service
   ```

2. Make changes and commit regularly with descriptive messages:
   ```bash
   git add .
   git commit -m "Add CSV export functionality for properties"
   ```

3. Push the branch to remote:
```bash
   git push -u origin feature/export-service
   ```

4. Create a pull request to merge into `main`

### Commit Message Format

Follow this format for commit messages:
```
type(scope): Short description

Longer description if needed
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or updating tests
- `chore`: Changes to build process, dependencies, etc.

Example:
```
feat(export): Add Excel export functionality for properties

- Implement Excel export service
- Add routes for Excel export
- Update documentation
```

## Documentation

### API Documentation

The API is documented using Swagger. To update the documentation when adding new export endpoints:

1. Add JSDoc comments to the routes as shown in the examples above
2. Restart the server to regenerate the Swagger documentation
3. Access the documentation at `http://localhost:4000/api-docs`

### Code Documentation

Follow these guidelines for code documentation:

1. Use JSDoc for all functions/methods:
```typescript
   /**
    * Export properties to CSV format
    * @param properties - Array of property objects
    * @param filters - Query filters to apply if properties not provided
    * @returns CSV formatted string
    */
   ```

2. Add inline comments for complex logic
3. Update README and other documentation files when making significant changes

## Troubleshooting

### Common Export Issues

1. **Empty Export Files**:
   - Check if filters are too restrictive
   - Verify data exists in the database
   - Check for permission issues

2. **Performance Issues**:
   - Use proper indexing for filter fields
   - Implement pagination for large exports
   - Add projection to fetch only needed fields

3. **Format Issues**:
   - Ensure date formatting is consistent
   - Check for null/undefined handling
   - Verify character encoding (especially for CSV)

## Security Considerations

### Data Access Control

1. Implement middleware to verify user permissions before allowing exports
2. Add field-level permissions to filter sensitive data from exports
3. Implement rate limiting for export endpoints

### Input Validation

1. Validate all filter parameters
2. Sanitize inputs to prevent injection attacks
3. Set reasonable limits on export size

## Performance Optimization

1. **Database Queries**:
   - Ensure all filtered fields are indexed
   - Use projection to fetch only needed fields
   - Consider using aggregation pipelines for complex filters

2. **Export Processing**:
   - Stream large exports instead of loading all in memory
   - Implement pagination for very large datasets
   - Consider background processing for extensive exports 