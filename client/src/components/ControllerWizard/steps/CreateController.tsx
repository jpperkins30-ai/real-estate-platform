import React, { useState } from 'react';
import { Box, Typography, Paper, Button, Alert, CircularProgress, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Check as CheckIcon, Build as BuildIcon } from '@mui/icons-material';

interface CreateControllerProps {
  formData: {
    name: string;
    description: string;
    controllerType: string;
    collectorType: string;
    stateId: string;
    stateName: string;
    countyId: string;
    countyName: string;
    frequency: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
    controllerId?: string;
  };
  onCreateController: () => Promise<boolean>;
}

const CreateController: React.FC<CreateControllerProps> = ({ formData, onCreateController }) => {
  const [status, setStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);

  const handleCreateController = async () => {
    try {
      setStatus('processing');
      const success = await onCreateController();
      
      if (success) {
        setStatus('success');
      } else {
        setStatus('error');
        setError('Failed to create the controller. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setError('An unexpected error occurred. Please try again.');
      console.error('Error creating controller:', err);
    }
  };

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Create Controller
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Review the controller details and click Create to finalize:
        </Typography>
        
        <List>
          <ListItem divider>
            <ListItemText 
              primary="Name" 
              secondary={formData.name} 
            />
          </ListItem>
          
          <ListItem divider>
            <ListItemText 
              primary="Description" 
              secondary={formData.description} 
            />
          </ListItem>
          
          <ListItem divider>
            <ListItemText 
              primary="Controller Type" 
              secondary={formData.controllerType} 
            />
          </ListItem>
          
          <ListItem divider>
            <ListItemText 
              primary="Collector Type" 
              secondary={formData.collectorType} 
            />
          </ListItem>
          
          {formData.stateId && (
            <ListItem divider>
              <ListItemText 
                primary="State" 
                secondary={formData.stateName} 
              />
            </ListItem>
          )}
          
          {formData.countyId && (
            <ListItem divider>
              <ListItemText 
                primary="County" 
                secondary={formData.countyName} 
              />
            </ListItem>
          )}
          
          <ListItem divider>
            <ListItemText 
              primary="Collection Frequency" 
              secondary={
                formData.frequency === 'weekly'
                  ? `Weekly (${getDayOfWeekName(formData.dayOfWeek)})`
                  : formData.frequency === 'monthly'
                  ? `Monthly (Day ${formData.dayOfMonth})`
                  : formData.frequency.charAt(0).toUpperCase() + formData.frequency.slice(1)
              } 
            />
          </ListItem>
        </List>
        
        <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateController}
            disabled={status === 'processing' || status === 'success'}
            sx={{ minWidth: 200 }}
            startIcon={status === 'success' ? <CheckIcon /> : <BuildIcon />}
          >
            {status === 'processing' ? (
              <>
                <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
                Creating...
              </>
            ) : status === 'success' ? 'Created!' : 'Create Controller'}
          </Button>
        </Box>
        
        {status === 'success' && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Controller successfully created! Controller ID: {formData.controllerId}
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Creating the controller will register it in the system and make it available for scheduling.
        You can edit the controller configuration later if needed.
      </Typography>
    </Box>
  );
};

// Helper function to get day name
function getDayOfWeekName(dayOfWeek?: number): string {
  if (dayOfWeek === undefined) return '';
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayOfWeek] || '';
}

export default CreateController; 