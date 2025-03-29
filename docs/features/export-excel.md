# Export to Excel Feature

## Overview

The Export to Excel feature provides comprehensive functionality for exporting real estate data from the inventory module into Excel format. It supports various data types including properties, counties, and states with robust filtering options, data formatting, and role-based access control.

## Purpose

The Export to Excel feature addresses several key needs:

1. **Data Export**: Enables users to export inventory data in Excel format
2. **Customization**: Provides options for filtering and selecting specific data records
3. **Batch Processing**: Efficiently handles large datasets with optimized data processing
4. **Security**: Implements role-based access control to restrict export capabilities
5. **Integration**: Connects with the inventory module and data management systems

## Technical Implementation

### Architecture

The Export to Excel feature is implemented across multiple layers:

```
ExportExcel/
├── frontend/                # Frontend implementation
│   ├── components/         # UI components
│   │   └── DataExportButton.tsx  # Main export dropdown component
│   └── services/           # Frontend services
│       └── export.ts       # Export service for API communication
└── backend/               # Backend services
    ├── routes/            # API routes
    │   └── export.routes.ts  # Export endpoints with role authorization
    ├── services/          # Business logic
    │   └── export.service.ts # ExportService implementation
    ├── middleware/        # Security middleware
    │   └── roleAuth.ts    # Role-based authorization
    └── models/            # Data models
        ├── property.model.ts
        ├── county.model.ts
        └── state.model.ts
```

### Core Features

1. **Role-Based Access Control**
   - Export functionality restricted to approved roles (admin, analyst, dataManager)
   - Authorization middleware integration
   - Secure API endpoints

2. **Multiple Export Formats**
   - Excel (XLSX)
   - CSV
   - JSON

3. **Data Filtering**
   - By state/county
   - By property type
   - By tax status
   - By date range
   - By value range

4. **Rich Excel Formatting**
   - Styled headers with background colors
   - Proper data type formatting (dates, numbers, currency)
   - Column width optimization
   - Sheet naming and organization

## Frontend Implementation

### Export Component

The system implements a reusable `DataExportButton` component that provides a consistent export interface across the application:

```tsx
<DataExportButton
  dataType="properties"
  filters={{ countyId: selectedCountyId, propertyType: 'Residential' }}
  buttonVariant="outline-primary"
  buttonSize="sm"
  buttonText="Export Data"
  showFilters={true}
/>
```

This component provides:
- Dropdown menu for export format selection (Excel, CSV, JSON)
- Filter modal for additional export customization
- Loading state indicators during export process
- Error handling and user feedback

### Export Service

The frontend service (`client/src/services/export.ts`) handles API communication:

```typescript
export const exportToExcel = async (dataType: string, filters: Record<string, any> = {}) => {
  try {
    const response = await axios.post(
      `${API_URL}/export/${dataType}/excel`, 
      { ...filters }, 
      { responseType: 'blob' }
    );
    
    // Download handling
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${dataType}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return { success: true, message: 'Data exported to Excel successfully' };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, message: 'Failed to export data to Excel' };
  }
};
```

## Backend Implementation

### Export Service (`ExportService` class)

The backend service provides specialized export methods for different data types:

#### Properties Export
```typescript
async exportPropertiesToExcel(properties: any[], filters: any = {}): Promise<any> {
  // Fetch properties if not provided
  if (!properties || properties.length === 0) {
    properties = await this.getPropertiesWithFilters(filters);
  }
  
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Properties');

  // Define columns with headers and widths
  worksheet.columns = [
    { header: 'ID', key: 'id', width: 28 },
    { header: 'Parcel ID', key: 'parcelId', width: 15 },
    { header: 'Tax Account Number', key: 'taxAccountNumber', width: 20 },
    // ...additional columns
  ];

  // Style headers
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' }
  };

  // Add property data
  properties.forEach(property => {
    worksheet.addRow({
      id: property._id?.toString() || property.id,
      parcelId: property.parcelId || '',
      // ...mapped property fields
    });
  });

  // Apply number and date formatting
  const numberColumns = ['assessedValue', 'marketValue', 'taxDue'];
  numberColumns.forEach(col => worksheet.getColumn(col).numFmt = '#,##0.00');
  
  const dateColumns = ['saleDate', 'createdAt', 'updatedAt'];
  dateColumns.forEach(col => worksheet.getColumn(col).numFmt = 'yyyy-mm-dd');

  return await workbook.xlsx.writeBuffer();
}
```

#### Counties and States Export
Similar specialized methods exist for `exportCountiesToExcel` and `exportStatesToExcel`, each with appropriate column definitions and data mappings.

### API Routes

The system exposes several API endpoints for Excel export:

```typescript
// GET endpoints with query parameter filtering
router.get('/properties/excel', authorize(EXPORT_ROLES), exportPropertiesToExcel);
router.get('/counties/excel', authorize(EXPORT_ROLES), exportCountiesToExcel);

// POST endpoints with JSON body filtering (for more complex filters)
router.post('/:dataType/excel', authorize(EXPORT_ROLES), async (req, res) => {
  try {
    const { dataType } = req.params;
    const filters = req.body;
    const excelBuffer = await exportService.exportToExcel(dataType, filters);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${dataType}_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.send(excelBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to export data to Excel' });
  }
});

// Enhanced export endpoints with additional fields
router.post('/properties/enhanced/excel', authorize(EXPORT_ROLES), async (req, res) => {
  // Enhanced property export implementation
});

router.post('/counties/enhanced/excel', authorize(EXPORT_ROLES), async (req, res) => {
  // Enhanced county export implementation
});
```

### Role-Based Authorization

Access to export functionality is restricted to users with specific roles:

```typescript
// Role definition
const EXPORT_ROLES = ['admin', 'analyst', 'dataManager'];

// Authorization middleware
router.get('/properties/excel', authorize(EXPORT_ROLES), async (req, res) => {
  // Route implementation
});
```

The `authorize` middleware validates the user's role against the allowed roles list:

```typescript
export const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get user from request (set by auth middleware)
    const user = req.user;

    // Check if user exists and has required role
    if (!user) {
      return res.status(401).json({ 
        message: 'Unauthorized: Authentication required',
        success: false
      });
    }

    if (roles.length && !roles.includes(user.role || '')) {
      return res.status(403).json({ 
        message: 'Forbidden: Insufficient permissions',
        success: false,
        requiredRoles: roles
      });
    }

    next();
  };
};
```

## Integration Points

The Export to Excel feature integrates with several other system components:

1. **Authentication System**
   - JWT-based authentication
   - Role validation
   - Session management

2. **Data Access Layer**
   - MongoDB models and queries
   - Data filtering and aggregation
   - Relationship handling (e.g., county-state relationships)

3. **UI Components**
   - Integration with data tables and list views
   - Contextual export options
   - Status indicators

## Best Practices Implemented

1. **Error Handling**
   - Comprehensive try/catch blocks
   - Client-friendly error messages
   - Detailed error logging

2. **Performance Optimization**
   - Efficient MongoDB queries with projection
   - Streaming response for large datasets
   - Proper memory management

3. **Security**
   - Role-based access control
   - Input validation
   - Safe file handling

## Future Enhancements

1. **Advanced Export Options**
   - Custom templates
   - Multiple sheet support
   - Formula support
   - Pivot table generation

2. **Data Processing**
   - Advanced filtering
   - Data aggregation
   - Custom calculations
   - Data validation

3. **Integration Features**
   - Cloud storage support
   - Email integration
   - Scheduled exports
   - Export history 