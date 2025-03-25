import React from 'react';
import { Box, Typography, Paper, Button, Alert, CircularProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Check as CheckIcon, Error as ErrorIcon, HourglassEmpty as PendingIcon } from '@mui/icons-material';

interface TestValidateProps {
  formData: {
    validationStatus: 'success' | 'error' | null;
  };
  status: 'pending' | 'processing' | 'success' | 'error';
  onTest: () => Promise<boolean>;
}

const TestValidate: React.FC<TestValidateProps> = ({ formData, status, onTest }) => {
  const handleRunTest = async () => {
    await onTest();
  };

  const renderStatusIcon = (itemStatus: 'pending' | 'processing' | 'success' | 'error') => {
    switch (itemStatus) {
      case 'success':
        return <CheckIcon color="success" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'processing':
        return <CircularProgress size={24} />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Test & Validate
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Before creating the controller, let's test the configuration to ensure it will work correctly:
        </Typography>
        
        <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleRunTest}
            disabled={status === 'processing'}
            sx={{ minWidth: 200 }}
          >
            {status === 'processing' ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Testing...
              </>
            ) : 'Run Test'}
          </Button>
        </Box>
        
        {status !== 'pending' && (
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Test Results:
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  {renderStatusIcon(status)}
                </ListItemIcon>
                <ListItemText 
                  primary="Configuration Validation" 
                  secondary={
                    status === 'processing' ? 'Validating configuration...' :
                    status === 'success' ? 'Configuration is valid!' :
                    status === 'error' ? 'Configuration has errors' : 'Waiting to start'
                  } 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {status === 'success' ? renderStatusIcon('success') : renderStatusIcon('pending')}
                </ListItemIcon>
                <ListItemText 
                  primary="Connection Test" 
                  secondary={
                    status === 'processing' ? 'Testing connection...' :
                    status === 'success' ? 'Connection successful!' :
                    status === 'error' ? 'Could not establish connection' : 'Waiting to start'
                  } 
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  {status === 'success' ? renderStatusIcon('success') : renderStatusIcon('pending')}
                </ListItemIcon>
                <ListItemText 
                  primary="Data Collection Test" 
                  secondary={
                    status === 'processing' ? 'Testing data collection...' :
                    status === 'success' ? 'Successfully collected sample data!' :
                    status === 'error' ? 'Could not collect data' : 'Waiting to start'
                  } 
                />
              </ListItem>
            </List>
            
            {status === 'success' && (
              <Alert severity="success" sx={{ mt: 2 }}>
                All tests passed! You can proceed to create the controller.
              </Alert>
            )}
            
            {status === 'error' && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Some tests failed. Please review your configuration and try again.
              </Alert>
            )}
          </Box>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Testing the controller helps identify configuration issues before deploying it to production.
        This ensures the controller will work correctly when scheduled to run.
      </Typography>
    </Box>
  );
};

export default TestValidate; 