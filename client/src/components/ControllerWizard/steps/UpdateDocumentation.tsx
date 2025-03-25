import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress, Button, Stepper, Step, StepLabel } from '@mui/material';
import { Book as BookIcon } from '@mui/icons-material';
import { updateControllerDocumentation } from '../../../services/controllerService';

interface UpdateDocumentationProps {
  formData: {
    controllerId?: string;
    name: string;
    controllerType: string;
    documentationStatus: 'success' | 'error' | null;
  };
  status: 'pending' | 'processing' | 'success' | 'error';
}

const UpdateDocumentation: React.FC<UpdateDocumentationProps> = ({ formData, status }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [docStatus, setDocStatus] = useState<'pending' | 'processing' | 'success' | 'error'>(status || 'pending');
  
  const documentationSteps = [
    'Update API Documentation',
    'Update User Guide',
    'Update Changelog',
    'Update README',
  ];

  useEffect(() => {
    if (formData.controllerId && docStatus === 'pending') {
      updateDocumentation();
    }
  }, [formData.controllerId]);

  const updateDocumentation = async () => {
    if (!formData.controllerId) {
      return;
    }

    setDocStatus('processing');
    
    try {
      // Simulate documentation update - in a real app, this would make API calls
      for (let i = 0; i < documentationSteps.length; i++) {
        setActiveStep(i);
        
        // Simulate API call for each documentation step
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (i === documentationSteps.length - 1) {
          // Last step - update overall status
          const response = await updateControllerDocumentation(formData.controllerId, {
            controller: formData.name,
            type: formData.controllerType,
            // Add other documentation metadata here
          });
          
          if (response.success) {
            setDocStatus('success');
          } else {
            setDocStatus('error');
          }
        }
      }
    } catch (error) {
      console.error('Documentation update error:', error);
      setDocStatus('error');
    }
  };

  const handleRetry = () => {
    setActiveStep(0);
    updateDocumentation();
  };

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Update Documentation
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Updating documentation for the newly created controller:
        </Typography>
        
        <Box sx={{ mt: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {documentationSteps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        
        {docStatus === 'processing' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={30} sx={{ mr: 2 }} />
            <Typography>
              Updating {documentationSteps[activeStep]}...
            </Typography>
          </Box>
        )}
        
        {docStatus === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Documentation successfully updated! All systems are ready.
          </Alert>
        )}
        
        {docStatus === 'error' && (
          <>
            <Alert severity="warning" sx={{ mt: 2 }}>
              Some documentation updates failed. You can continue, but you may need to manually update documentation later.
            </Alert>
            
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleRetry}
                startIcon={<BookIcon />}
              >
                Retry Documentation Update
              </Button>
            </Box>
          </>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Documentation is a critical part of maintaining a sustainable system.
        These updates ensure that all team members can understand and use the new controller.
      </Typography>
    </Box>
  );
};

export default UpdateDocumentation; 