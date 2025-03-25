import React from 'react';
import { Box, Typography, Paper, Button, Alert, CircularProgress, List, ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { Check as CheckIcon, Error as ErrorIcon, HourglassEmpty as PendingIcon, Api as ApiIcon } from '@mui/icons-material';

interface CreateAPIProps {
  formData: {
    apiStatus: 'success' | 'error' | null;
    controllerType: string;
    name: string;
  };
  status: 'pending' | 'processing' | 'success' | 'error';
  onCreateAPI: () => Promise<boolean>;
}

const CreateAPI: React.FC<CreateAPIProps> = ({ formData, status, onCreateAPI }) => {
  const handleGenerateAPI = async () => {
    await onCreateAPI();
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

  const getApiEndpoints = () => {
    const baseEndpoint = formData.controllerType.toLowerCase();
    const nameSlug = formData.name.toLowerCase().replace(/\s+/g, '-');
    
    return [
      {
        method: 'GET',
        endpoint: `/api/v1/${baseEndpoint}/${nameSlug}/status`,
        description: 'Get controller status'
      },
      {
        method: 'POST',
        endpoint: `/api/v1/${baseEndpoint}/${nameSlug}/execute`,
        description: 'Execute controller'
      },
      {
        method: 'GET',
        endpoint: `/api/v1/${baseEndpoint}/${nameSlug}/history`,
        description: 'Get execution history'
      },
      {
        method: 'GET',
        endpoint: `/api/v1/${baseEndpoint}/${nameSlug}/data`,
        description: 'Get collected data'
      }
    ];
  };

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Create API
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Generate API endpoints for interacting with this controller:
        </Typography>
        
        <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGenerateAPI}
            disabled={status === 'processing'}
            sx={{ minWidth: 200 }}
            startIcon={<ApiIcon />}
          >
            {status === 'processing' ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Generating API...
              </>
            ) : 'Generate API'}
          </Button>
        </Box>
        
        {status === 'success' && (
          <Box mt={3}>
            <Alert severity="success" sx={{ mb: 3 }}>
              API endpoints successfully generated!
            </Alert>
            
            <Typography variant="subtitle1" gutterBottom>
              Available Endpoints:
            </Typography>
            
            <List>
              {getApiEndpoints().map((api, index) => (
                <ListItem key={index} divider={index < getApiEndpoints().length - 1}>
                  <ListItemIcon>
                    <Chip 
                      label={api.method} 
                      color={api.method === 'GET' ? 'info' : api.method === 'POST' ? 'warning' : 'default'}
                      size="small"
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={api.endpoint} 
                    secondary={api.description} 
                    primaryTypographyProps={{ 
                      fontFamily: 'monospace', 
                      fontWeight: 'medium',
                      fontSize: '0.9rem'
                    }}
                  />
                </ListItem>
              ))}
            </List>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              These API endpoints will be available once the controller is created.
              Detailed documentation will be generated in Swagger.
            </Typography>
          </Box>
        )}
        
        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to generate API endpoints. Please check the controller configuration.
          </Alert>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        The API endpoints allow programmatic interaction with the controller.
        They can be used to trigger data collection, check status, and retrieve results.
      </Typography>
    </Box>
  );
};

export default CreateAPI; 