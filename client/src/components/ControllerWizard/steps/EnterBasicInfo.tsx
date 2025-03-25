import React from 'react';
import { Box, Typography, TextField, Paper } from '@mui/material';

interface EnterBasicInfoProps {
  formData: {
    name: string;
    description: string;
  };
  updateFormData: (field: string, value: any) => void;
}

const EnterBasicInfo: React.FC<EnterBasicInfoProps> = ({ formData, updateFormData }) => {
  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Enter Basic Information
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            fullWidth
            label="Controller Name"
            variant="outlined"
            margin="normal"
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
            helperText="Enter a descriptive name for the controller"
            required
          />
          
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            margin="normal"
            value={formData.description}
            onChange={(e) => updateFormData('description', e.target.value)}
            helperText="Describe what this controller does and what data it collects"
            multiline
            rows={4}
            required
          />
        </Box>
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        The controller name and description will be used in the inventory management interface
        and documentation. Choose a clear, descriptive name that indicates the purpose
        and scope of the controller.
      </Typography>
    </Box>
  );
};

export default EnterBasicInfo; 