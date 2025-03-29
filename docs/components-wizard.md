# Controller Wizard Documentation

## Overview

The Controller Wizard is a step-by-step guided interface for creating and configuring data collection controllers within the Real Estate Platform. It allows users to define how data should be collected for different geographic entities (states, counties) and configure scheduling, validation, and notification settings.

## Purpose

The Controller Wizard addresses several key needs:

1. **Simplified Configuration**: Guides users through the complex process of setting up data collection
2. **Standardized Setup**: Ensures that all controllers follow a consistent configuration pattern
3. **Validation**: Tests configurations before deployment to prevent runtime errors
4. **Documentation**: Automatically generates technical documentation for created controllers

## Technical Implementation

### Component Structure

The Controller Wizard is implemented as a React component with the following structure:

```
ControllerWizard/
├── index.tsx                 # Main wizard component
├── steps/                    # Individual wizard steps
│   ├── SelectWizard.tsx      # Choose wizard type
│   ├── SelectControllerType.tsx
│   ├── EnterBasicInfo.tsx
│   ├── SelectState.tsx
│   ├── SelectCounty.tsx
│   ├── SelectDataSource.tsx
│   ├── EnterDataSourceName.tsx
│   ├── SelectCollectorType.tsx
│   ├── SelectFrequency.tsx
│   ├── AdditionalOptions.tsx
│   ├── TestValidate.tsx
│   ├── CreateAPI.tsx
│   ├── SwaggerValidation.tsx
│   ├── PostmanValidation.tsx
│   ├── CreateController.tsx
│   └── UpdateDocumentation.tsx
└── services/
    └── controllerService.ts  # Backend integration
```

### Step-by-Step Flow

The wizard implements a 16-step flow:

1. **Select Wizard**: Choose the type of wizard to use (Controller, Data Source, or Property)
2. **Select Controller Type**: Choose from Tax Sale, Map, Property, or Demographics controllers
3. **Enter Basic Info**: Provide name and description for the controller
4. **Select State**: Choose which state the controller will operate on
5. **Select County**: Select specific counties or all counties in the selected state
6. **Select Data Source**: Choose an existing data source or create a new one
7. **Enter Data Source Name**: Define custom name for a new data source
8. **Select Collector Type**: Choose the data collection method (Web Scraper, API, File Import)
9. **Collection Frequency**: Configure scheduling (daily, weekly, monthly)
10. **Additional Options**: Set up notifications, error handling, and custom settings
11. **Test & Validate**: Test the configuration against sample data
12. **Create API**: Generate API endpoints for interacting with the controller
13. **Swagger Validation**: Validate and document the API with Swagger/OpenAPI
14. **Postman Collection**: Generate Postman collection for API testing
15. **Create Controller**: Finalize and create the controller in the system
16. **Documentation Update**: Update system documentation with the new controller

## Code Example

Here's a simplified example of the main wizard component:

```tsx
const ControllerWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    wizardType: 'controller',
    controllerType: '',
    name: '',
    description: '',
    stateId: '',
    countyId: '',
    // Additional fields...
  });
  
  const updateFormData = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  const handleNext = () => setActiveStep(prev => prev + 1);
  const handleBack = () => setActiveStep(prev => prev - 1);
  
  return (
    <Box>
      <Stepper activeStep={activeStep}>
        {steps.map(label => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Box>
        {/* Render current step content */}
        {getStepContent(activeStep)}
        
        <Box>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Button variant="contained" onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
```

## Validation Process

The Controller Wizard implements a comprehensive validation process:

### 1. Configuration Validation

Verifies that the controller configuration is valid:
- All required fields have values
- The configuration is consistent with selected objects
- Permissions are sufficient for the operation

```javascript
// Validation example
const handleValidation = async () => {
  setStepStatus(prev => ({ ...prev, validation: 'processing' }));
  
  try {
    // Call validation API
    const result = await validateControllerConfiguration(formData);
    
    if (result.success) {
      setStepStatus(prev => ({ ...prev, validation: 'success' }));
      updateFormData('validationStatus', 'success');
    } else {
      setStepStatus(prev => ({ ...prev, validation: 'error' }));
      updateFormData('validationStatus', 'error');
    }
    
    return result.success;
  } catch (error) {
    console.error('Validation error:', error);
    setStepStatus(prev => ({ ...prev, validation: 'error' }));
    updateFormData('validationStatus', 'error');
    return false;
  }
};
```

### 2. Test Collection

Performs a sample data collection to validate the controller's functionality:
- Connects to the data source
- Authenticates using provided credentials
- Retrieves a small sample of data
- Validates data format and structure

### 3. API Documentation Generation

Automatically generates documentation for the controller's API:
- Documents available endpoints
- Describes parameters and responses
- Provides example requests
- Generates OpenAPI-compatible schemas

## Integration with Inventory Module

The Controller Wizard integrates with the Inventory Module in the following ways:

1. **Entity Selection**: Allows selection of States and Counties from the inventory hierarchy
2. **Controller Attachment**: Attaches created controllers to the selected entities
3. **Data Flow**: Configures how collected data flows into the inventory objects
4. **Monitoring**: Provides monitoring capabilities for data collection

## User Interface

The Controller Wizard provides a consistent user interface with:

1. **Step Indicator**: Shows current progress in the wizard
2. **Navigation Controls**: Back and Next buttons for moving between steps
3. **Form Validation**: Immediate feedback on input errors
4. **Progress Indicators**: Visual feedback during async operations
5. **Success/Error Messages**: Clear status messages for each operation

## API Endpoints

The wizard interacts with the following API endpoints:

- `GET /api/controller-types`: Get available controller types
- `GET /api/states`: Get states for selection
- `GET /api/states/:stateId/counties`: Get counties for selection
- `GET /api/data-sources`: Get available data sources
- `POST /api/data-sources`: Create a new data source
- `POST /api/controllers/validate`: Validate controller configuration
- `POST /api/controllers/test`: Test controller data collection
- `POST /api/controllers`: Create a new controller
- `POST /api/controllers/:id/documentation`: Generate controller documentation

## Future Enhancements

1. **Template Support**: Save and load controller configuration templates
2. **Advanced Scheduling**: More granular scheduling options
3. **Batch Processing**: Configure multiple controllers at once
4. **Visual Data Mapping**: Graphical interface for data mapping configuration
5. **Integration Testing**: End-to-end testing of controller pipelines 