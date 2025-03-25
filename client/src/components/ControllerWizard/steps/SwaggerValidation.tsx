import React from 'react';
import { Box, Typography, Paper, Alert, Link, Button, CircularProgress } from '@mui/material';
import { Description as DocIcon } from '@mui/icons-material';

interface SwaggerValidationProps {
  formData: {
    swaggerStatus: 'success' | 'error' | null;
    controllerType: string;
    name: string;
  };
  status: 'pending' | 'processing' | 'success' | 'error';
}

const SwaggerValidation: React.FC<SwaggerValidationProps> = ({ formData, status }) => {
  const getSwaggerUrl = () => {
    // This is typically the URL to your Swagger documentation
    return `/api-docs/#/Controllers/${formData.controllerType.toLowerCase()}`;
  };

  const openSwaggerDocumentation = () => {
    // Open Swagger documentation in a new tab
    window.open(getSwaggerUrl(), '_blank', 'noopener,noreferrer');
  };

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Swagger Documentation
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Swagger documentation for your controller API has been generated:
        </Typography>
        
        {status === 'processing' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {status === 'success' && (
          <Box mt={3}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Swagger documentation is now available!
            </Alert>
            
            <Box sx={{ 
              p: 2, 
              border: '1px solid #e0e0e0', 
              borderRadius: 1, 
              bgcolor: '#f5f5f5',
              my: 2,
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}>
              <Typography variant="subtitle2" gutterBottom>
                Documentation URL:
              </Typography>
              <Link 
                href={getSwaggerUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ wordBreak: 'break-all' }}
              >
                {getSwaggerUrl()}
              </Link>
            </Box>
            
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<DocIcon />}
                onClick={openSwaggerDocumentation}
              >
                View Swagger Documentation
              </Button>
            </Box>
          </Box>
        )}
        
        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to generate Swagger documentation. Please check the API configuration.
          </Alert>
        )}
        
        {status === 'pending' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Swagger documentation will be generated after API creation.
          </Alert>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Swagger provides interactive documentation for your API. It allows developers
        to understand the endpoints, parameters, and responses without having to read
        through code or separate documentation.
      </Typography>
    </Box>
  );
};

export default SwaggerValidation; 