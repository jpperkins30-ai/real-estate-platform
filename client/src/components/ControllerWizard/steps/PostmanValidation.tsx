import React from 'react';
import { Box, Typography, Paper, Alert, Link, Button, CircularProgress } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

interface PostmanValidationProps {
  formData: {
    postmanStatus: 'success' | 'error' | null;
    controllerType: string;
    name: string;
  };
  status: 'pending' | 'processing' | 'success' | 'error';
}

const PostmanValidation: React.FC<PostmanValidationProps> = ({ formData, status }) => {
  const handleDownloadPostmanCollection = () => {
    // In a real implementation, this would trigger a download of the Postman collection
    // For demo purposes, we'll just log to console
    console.log('Downloading Postman collection for', formData.name);
    
    // Example of how you might create a download in a real implementation:
    /*
    const postmanCollection = {
      info: {
        name: `${formData.name} API Collection`,
        schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
      },
      item: [
        // API endpoints would go here
      ]
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(postmanCollection));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${formData.name.toLowerCase().replace(/\s+/g, '-')}-collection.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    */
  };

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Postman Collection
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          A Postman collection has been generated for testing your controller API:
        </Typography>
        
        {status === 'processing' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}
        
        {status === 'success' && (
          <Box mt={3}>
            <Alert severity="success" sx={{ mb: 3 }}>
              Postman collection is ready for download!
            </Alert>
            
            <Box sx={{ 
              p: 3, 
              border: '1px dashed #aaa', 
              borderRadius: 1, 
              bgcolor: '#f8f8f8',
              my: 2,
              textAlign: 'center'
            }}>
              <Typography variant="subtitle1" gutterBottom>
                {formData.name} API Collection
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                This collection contains all API endpoints for interacting with your controller.
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadPostmanCollection}
                sx={{ mt: 2 }}
              >
                Download Collection
              </Button>
            </Box>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
              To use this collection, import it into Postman and set up your environment variables.
            </Typography>
          </Box>
        )}
        
        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Failed to generate Postman collection. Please try again after the controller is created.
          </Alert>
        )}
        
        {status === 'pending' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Postman collection will be generated after API creation.
          </Alert>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Postman collections make it easy to test and interact with your API during development.
        Share this collection with your team to ensure consistent API usage.
      </Typography>
    </Box>
  );
};

export default PostmanValidation; 