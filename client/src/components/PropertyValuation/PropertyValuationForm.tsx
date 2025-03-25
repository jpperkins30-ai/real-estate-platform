import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from '@mui/material';
import { PropertyFeatures } from '../../types/property';

interface PropertyValuationFormProps {
  onSubmit: (propertyData: PropertyFeatures) => void;
  loading?: boolean;
}

const propertyTypes = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'land', label: 'Land/Vacant Lot' },
];

const conditions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const states = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const PropertyValuationForm: React.FC<PropertyValuationFormProps> = ({
  onSubmit,
  loading = false,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [propertyData, setPropertyData] = useState<PropertyFeatures>({
    address: '',
    propertyType: 'residential',
    squareFeet: 0,
    bedrooms: undefined,
    bathrooms: undefined,
    yearBuilt: undefined,
    lotSize: undefined,
    condition: undefined,
    stories: undefined,
    amenities: [],
    location: {
      latitude: 0,
      longitude: 0,
      city: '',
      county: '',
      state: '',
      zipCode: '',
    },
  });
  
  const steps = [
    'Basic Property Information',
    'Property Details',
    'Location Details',
  ];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    
    if (!name) return;
    
    if (name.includes('.')) {
      // Handle nested properties (e.g., location.city)
      const [parent, child] = name.split('.');
      setPropertyData({
        ...propertyData,
        [parent]: {
          ...propertyData[parent as keyof PropertyFeatures],
          [child]: value,
        },
      });
    } else {
      // Handle regular properties
      setPropertyData({
        ...propertyData,
        [name]: value,
      });
    }
    
    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: '',
      });
    }
  };
  
  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 0) {
      // Validate basic info
      if (!propertyData.address) {
        errors.address = 'Address is required';
      }
      if (!propertyData.propertyType) {
        errors.propertyType = 'Property type is required';
      }
      if (!propertyData.squareFeet || propertyData.squareFeet <= 0) {
        errors.squareFeet = 'Valid square footage is required';
      }
    } else if (step === 1) {
      // Validate property details
      if (propertyData.yearBuilt && 
          (propertyData.yearBuilt < 1800 || propertyData.yearBuilt > new Date().getFullYear())) {
        errors.yearBuilt = 'Please enter a valid year';
      }
      if (propertyData.lotSize && propertyData.lotSize <= 0) {
        errors.lotSize = 'Lot size must be greater than 0';
      }
    } else if (step === 2) {
      // Validate location
      if (propertyData.location) {
        if (!propertyData.location.city) {
          errors['location.city'] = 'City is required';
        }
        if (!propertyData.location.state) {
          errors['location.state'] = 'State is required';
        }
        if (!propertyData.location.zipCode) {
          errors['location.zipCode'] = 'ZIP code is required';
        } else if (!/^\d{5}(-\d{4})?$/.test(propertyData.location.zipCode)) {
          errors['location.zipCode'] = 'Enter a valid ZIP code';
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      if (activeStep === steps.length - 1) {
        // Submit form on last step
        handleSubmit();
      } else {
        setActiveStep(activeStep + 1);
      }
    }
  };
  
  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };
  
  const handleSubmit = () => {
    // Validate all steps before submitting
    if (validateStep(0) && validateStep(1) && validateStep(2)) {
      onSubmit(propertyData);
    }
  };
  
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Property Address"
                name="address"
                value={propertyData.address}
                onChange={handleInputChange}
                error={!!formErrors.address}
                helperText={formErrors.address}
                placeholder="123 Main St, Anytown, USA"
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors.propertyType}>
                <InputLabel>Property Type</InputLabel>
                <Select
                  name="propertyType"
                  value={propertyData.propertyType}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  {propertyTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formErrors.propertyType}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Square Feet"
                name="squareFeet"
                type="number"
                InputProps={{ inputProps: { min: 1 } }}
                value={propertyData.squareFeet || ''}
                onChange={handleInputChange}
                error={!!formErrors.squareFeet}
                helperText={formErrors.squareFeet}
                disabled={loading}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bedrooms"
                name="bedrooms"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={propertyData.bedrooms || ''}
                onChange={handleInputChange}
                error={!!formErrors.bedrooms}
                helperText={formErrors.bedrooms}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bathrooms"
                name="bathrooms"
                type="number"
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
                value={propertyData.bathrooms || ''}
                onChange={handleInputChange}
                error={!!formErrors.bathrooms}
                helperText={formErrors.bathrooms}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year Built"
                name="yearBuilt"
                type="number"
                InputProps={{ inputProps: { min: 1800, max: new Date().getFullYear() } }}
                value={propertyData.yearBuilt || ''}
                onChange={handleInputChange}
                error={!!formErrors.yearBuilt}
                helperText={formErrors.yearBuilt}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Lot Size (sq ft)"
                name="lotSize"
                type="number"
                InputProps={{ inputProps: { min: 0 } }}
                value={propertyData.lotSize || ''}
                onChange={handleInputChange}
                error={!!formErrors.lotSize}
                helperText={formErrors.lotSize}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stories"
                name="stories"
                type="number"
                InputProps={{ inputProps: { min: 1, step: 0.5 } }}
                value={propertyData.stories || ''}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Property Condition</InputLabel>
                <Select
                  name="condition"
                  value={propertyData.condition || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  {conditions.map((condition) => (
                    <MenuItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="location.city"
                value={propertyData.location?.city || ''}
                onChange={handleInputChange}
                error={!!formErrors['location.city']}
                helperText={formErrors['location.city']}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!formErrors['location.state']}>
                <InputLabel>State</InputLabel>
                <Select
                  name="location.state"
                  value={propertyData.location?.state || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                >
                  {states.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{formErrors['location.state']}</FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                name="location.zipCode"
                value={propertyData.location?.zipCode || ''}
                onChange={handleInputChange}
                error={!!formErrors['location.zipCode']}
                helperText={formErrors['location.zipCode']}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="County"
                name="location.county"
                value={propertyData.location?.county || ''}
                onChange={handleInputChange}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Alert severity="info">
                Precise coordinates will be determined automatically from your address. 
                If you know the exact coordinates, you can enter them manually.
              </Alert>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Property Valuation Request
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Fill in the details below to get an estimated value for your property.
      </Typography>
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <form>
        {renderStepContent(activeStep)}
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={loading}
          >
            {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
          </Button>
        </Box>
      </form>
    </Paper>
  );
};

export default PropertyValuationForm; 