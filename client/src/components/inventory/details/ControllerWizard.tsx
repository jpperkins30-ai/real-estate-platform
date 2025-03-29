import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid
} from '@mui/material';

// Step content components
const SelectControllerType: React.FC<any> = ({ formData, updateFormData }) => {
  const controllerTypes = [
    { id: 'tax_sale', name: 'Tax Sale', description: 'Collect tax sale data for properties' },
    { id: 'property', name: 'Property', description: 'Collect property data' },
    { id: 'demographic', name: 'Demographics', description: 'Collect demographic data' }
  ];
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Select Controller Type</Typography>
      <Grid container spacing={2}>
        {controllerTypes.map(type => (
          <Grid item xs={12} md={4} key={type.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                border: formData.controllerType === type.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                height: '100%'
              }}
              onClick={() => updateFormData('controllerType', type.id)}
            >
              <CardContent>
                <Typography variant="h6">{type.name}</Typography>
                <Typography variant="body2" color="text.secondary">{type.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

const BasicInfo: React.FC<any> = ({ formData, updateFormData }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Basic Information</Typography>
      <TextField
        fullWidth
        label="Controller Name"
        value={formData.name}
        onChange={(e) => updateFormData('name', e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Description"
        value={formData.description}
        onChange={(e) => updateFormData('description', e.target.value)}
        margin="normal"
        multiline
        rows={3}
      />
    </Box>
  );
};

const ConfigureSchedule: React.FC<any> = ({ formData, updateFormData }) => {
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Configure Schedule</Typography>
      <FormControl fullWidth margin="normal">
        <InputLabel>Collection Frequency</InputLabel>
        <Select
          value={formData.frequency}
          onChange={(e) => updateFormData('frequency', e.target.value)}
        >
          <MenuItem value="hourly">Hourly</MenuItem>
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
          <MenuItem value="manual">Manual</MenuItem>
        </Select>
      </FormControl>
      
      {formData.frequency === 'weekly' && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Day of Week</InputLabel>
          <Select
            value={formData.dayOfWeek}
            onChange={(e) => updateFormData('dayOfWeek', e.target.value)}
          >
            <MenuItem value={1}>Monday</MenuItem>
            <MenuItem value={2}>Tuesday</MenuItem>
            <MenuItem value={3}>Wednesday</MenuItem>
            <MenuItem value={4}>Thursday</MenuItem>
            <MenuItem value={5}>Friday</MenuItem>
            <MenuItem value={6}>Saturday</MenuItem>
            <MenuItem value={7}>Sunday</MenuItem>
          </Select>
        </FormControl>
      )}
      
      {formData.frequency === 'monthly' && (
        <FormControl fullWidth margin="normal">
          <InputLabel>Day of Month</InputLabel>
          <Select
            value={formData.dayOfMonth}
            onChange={(e) => updateFormData('dayOfMonth', e.target.value)}
          >
            {[...Array(28)].map((_, i) => (
              <MenuItem key={i+1} value={i+1}>{i+1}</MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

const Review: React.FC<any> = ({ formData }) => {
  const getControllerTypeName = () => {
    const types = {
      tax_sale: 'Tax Sale',
      property: 'Property',
      demographic: 'Demographics'
    };
    return types[formData.controllerType as keyof typeof types] || formData.controllerType;
  };
  
  const getFrequencyText = () => {
    if (formData.frequency === 'weekly') {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return `${formData.frequency} (${days[formData.dayOfWeek - 1]})`;
    } else if (formData.frequency === 'monthly') {
      return `${formData.frequency} (Day ${formData.dayOfMonth})`;
    }
    return formData.frequency;
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>Review Controller Details</Typography>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Controller Type</Typography>
            <Typography variant="body1">{getControllerTypeName()}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Name</Typography>
            <Typography variant="body1">{formData.name}</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1">Description</Typography>
            <Typography variant="body1">{formData.description || 'No description provided'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1">Collection Frequency</Typography>
            <Typography variant="body1">{getFrequencyText()}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

// Main Wizard Component
const ControllerWizard: React.FC = () => {
  const navigate = useNavigate();
  const { entityId, entityType } = useParams<{ entityId: string, entityType: string }>();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    controllerType: '',
    name: '',
    description: '',
    frequency: 'daily',
    dayOfWeek: 1,
    dayOfMonth: 1,
    entityId: entityId || '',
    entityType: entityType || ''
  });
  
  const steps = ['Select Controller Type', 'Basic Information', 'Configure Schedule', 'Review'];
  
  const updateFormData = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleCreateController = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would send data to the server
      // await axios.post('/api/controllers', formData);
      
      // Mock success for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/inventory');
      }, 2000);
    } catch (err) {
      console.error('Error creating controller:', err);
      setError('Failed to create controller. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <SelectControllerType formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <BasicInfo formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <ConfigureSchedule formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <Review formData={formData} />;
      default:
        return 'Unknown step';
    }
  };
  
  const isStepValid = (step: number) => {
    switch (step) {
      case 0:
        return !!formData.controllerType;
      case 1:
        return !!formData.name;
      case 2:
        return true; // Always valid with defaults
      case 3:
        return true; // Review is always valid
      default:
        return false;
    }
  };
  
  if (success) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', my: 4, p: 2 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Controller created successfully!
        </Alert>
        <Button component={Link} to="/inventory" variant="contained">
          Return to Inventory
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h5" gutterBottom>
        Controller Wizard
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Create a new data collection controller for your inventory.
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        {getStepContent(activeStep)}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0 || loading}
          onClick={handleBack}
        >
          Back
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          onClick={activeStep === steps.length - 1 ? handleCreateController : handleNext}
          disabled={!isStepValid(activeStep) || loading}
        >
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Processing...
            </>
          ) : activeStep === steps.length - 1 ? (
            'Create Controller'
          ) : (
            'Next'
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default ControllerWizard; 