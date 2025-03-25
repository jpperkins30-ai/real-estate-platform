import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper
} from '@mui/material';
import SelectWizard from './steps/SelectWizard';
import SelectControllerType from './steps/SelectControllerType';
import EnterBasicInfo from './steps/EnterBasicInfo';
import SelectState from './steps/SelectState';
import SelectCounty from './steps/SelectCounty';
import SelectDataSource from './steps/SelectDataSource';
import EnterDataSourceName from './steps/EnterDataSourceName';
import SelectCollectorType from './steps/SelectCollectorType';
import SelectFrequency from './steps/SelectFrequency';
import AdditionalOptions from './steps/AdditionalOptions';
import TestValidate from './steps/TestValidate';
import CreateAPI from './steps/CreateAPI';
import SwaggerValidation from './steps/SwaggerValidation';
import PostmanValidation from './steps/PostmanValidation';
import CreateController from './steps/CreateController';
import UpdateDocumentation from './steps/UpdateDocumentation';
import { validateControllerConfiguration, testController, generateAPI, createController, attachController } from '../../services/controllerService';

const steps = [
  'Select Wizard',
  'Select Controller Type',
  'Enter Basic Info',
  'Select State',
  'Select County',
  'Select Data Source',
  'Enter Data Source Name',
  'Select Collector Type',
  'Collection Frequency',
  'Additional Options',
  'Test & Validate',
  'Create API',
  'Swagger Validation',
  'Postman Collection',
  'Create Controller',
  'Documentation Update'
];

const ControllerWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    wizardType: 'controller',
    controllerType: '',
    name: '',
    description: '',
    stateId: '',
    stateName: '',
    countyId: '',
    countyName: '',
    dataSourceId: '',
    dataSourceName: '',
    collectorType: '',
    frequency: 'daily',
    dayOfWeek: 1,
    dayOfMonth: 1,
    additionalOptions: {},
    validationStatus: null,
    apiStatus: null,
    swaggerStatus: null,
    postmanStatus: null,
    documentationStatus: null,
    controllerId: null
  });
  
  const [stepStatus, setStepStatus] = useState({
    validation: 'pending',
    api: 'pending',
    swagger: 'pending',
    postman: 'pending',
    documentation: 'pending'
  });
  
  const updateFormData = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    
    // Auto-start some steps when we navigate to them
    if (activeStep === 11) { // After Create API step
      setStepStatus(prev => ({ ...prev, swagger: 'processing' }));
      setTimeout(() => {
        setStepStatus(prev => ({ ...prev, swagger: 'success' }));
        updateFormData('swaggerStatus', 'success');
      }, 1500);
    }
    
    if (activeStep === 12) { // After Swagger step
      setStepStatus(prev => ({ ...prev, postman: 'processing' }));
      setTimeout(() => {
        setStepStatus(prev => ({ ...prev, postman: 'success' }));
        updateFormData('postmanStatus', 'success');
      }, 1500);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      wizardType: 'controller',
      controllerType: '',
      name: '',
      description: '',
      stateId: '',
      stateName: '',
      countyId: '',
      countyName: '',
      dataSourceId: '',
      dataSourceName: '',
      collectorType: '',
      frequency: 'daily',
      dayOfWeek: 1,
      dayOfMonth: 1,
      additionalOptions: {},
      validationStatus: null,
      apiStatus: null,
      swaggerStatus: null,
      postmanStatus: null,
      documentationStatus: null,
      controllerId: null
    });
    setStepStatus({
      validation: 'pending',
      api: 'pending',
      swagger: 'pending',
      postman: 'pending',
      documentation: 'pending'
    });
  };
  
  // Handle testing and validation
  const handleValidation = async () => {
    try {
      setStepStatus(prev => ({ ...prev, validation: 'processing' }));
      
      // Prepare validation data
      const validationData = {
        controllerType: formData.controllerType,
        name: formData.name,
        description: formData.description,
        stateId: formData.stateId,
        countyId: formData.countyId,
        dataSourceId: formData.dataSourceId,
        collectorType: formData.collectorType,
        configuration: {
          frequency: formData.frequency,
          ...(formData.frequency === 'weekly' && { dayOfWeek: formData.dayOfWeek }),
          ...(formData.frequency === 'monthly' && { dayOfMonth: formData.dayOfMonth }),
          ...formData.additionalOptions
        }
      };
      
      // In a real implementation, this would call the API
      // For the demo, we'll simulate a successful validation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate validation with 90% success rate
      const isSuccess = Math.random() < 0.9;
      
      if (isSuccess) {
        updateFormData('validationStatus', 'success');
        setStepStatus(prev => ({ ...prev, validation: 'success' }));
      } else {
        updateFormData('validationStatus', 'error');
        setStepStatus(prev => ({ ...prev, validation: 'error' }));
      }
      
      return isSuccess;
    } catch (error) {
      console.error('Validation error:', error);
      updateFormData('validationStatus', 'error');
      setStepStatus(prev => ({ ...prev, validation: 'error' }));
      return false;
    }
  };
  
  // Handle API creation
  const handleCreateAPI = async () => {
    try {
      setStepStatus(prev => ({ ...prev, api: 'processing' }));
      
      // In a real implementation, this would call the API
      // For the demo, we'll simulate a successful API generation
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      // Simulate API generation with 95% success rate
      const isSuccess = Math.random() < 0.95;
      
      if (isSuccess) {
        updateFormData('apiStatus', 'success');
        setStepStatus(prev => ({ ...prev, api: 'success' }));
      } else {
        updateFormData('apiStatus', 'error');
        setStepStatus(prev => ({ ...prev, api: 'error' }));
      }
      
      return isSuccess;
    } catch (error) {
      console.error('API creation error:', error);
      updateFormData('apiStatus', 'error');
      setStepStatus(prev => ({ ...prev, api: 'error' }));
      return false;
    }
  };
  
  // Handle controller creation
  const handleCreateController = async () => {
    try {
      // In a real implementation, this would call the API
      // For the demo, we'll simulate a successful controller creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set a random controller ID
      const controllerId = `ctrl_${Math.random().toString(36).substring(2, 10)}`;
      updateFormData('controllerId', controllerId);
      
      // Simulate 95% success rate
      return Math.random() < 0.95;
    } catch (error) {
      console.error('Controller creation error:', error);
      return false;
    }
  };
  
  // Render step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <SelectWizard formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <SelectControllerType formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <EnterBasicInfo formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <SelectState formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <SelectCounty formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <SelectDataSource formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <EnterDataSourceName formData={formData} updateFormData={updateFormData} />;
      case 7:
        return <SelectCollectorType formData={formData} updateFormData={updateFormData} />;
      case 8:
        return <SelectFrequency formData={formData} updateFormData={updateFormData} />;
      case 9:
        return <AdditionalOptions formData={formData} updateFormData={updateFormData} />;
      case 10:
        return <TestValidate 
          formData={formData} 
          status={stepStatus.validation as any} 
          onTest={handleValidation} 
        />;
      case 11:
        return <CreateAPI 
          formData={formData} 
          status={stepStatus.api as any} 
          onCreateAPI={handleCreateAPI} 
        />;
      case 12:
        return <SwaggerValidation 
          formData={formData} 
          status={stepStatus.swagger as any} 
        />;
      case 13:
        return <PostmanValidation 
          formData={formData} 
          status={stepStatus.postman as any} 
        />;
      case 14:
        return <CreateController 
          formData={formData} 
          onCreateController={handleCreateController} 
        />;
      case 15:
        return <UpdateDocumentation 
          formData={formData} 
          status={stepStatus.documentation as any} 
        />;
      default:
        return 'Unknown step';
    }
  };
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Box mt={4}>
          {activeStep === steps.length ? (
            <Box>
              <Typography variant="h5" gutterBottom>
                Controller created successfully!
              </Typography>
              <Typography>
                Your new controller has been created and added to the system.
                You can now manage it from the Inventory Module.
              </Typography>
              <Button onClick={handleReset} sx={{ mt: 2 }}>
                Create Another Controller
              </Button>
            </Box>
          ) : (
            <Box>
              <Box mb={4}>
                {getStepContent(activeStep)}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ControllerWizard; 