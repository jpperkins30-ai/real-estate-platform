import React from 'react';
import { Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio, Paper } from '@mui/material';

interface SelectWizardProps {
  formData: {
    wizardType: string;
  };
  updateFormData: (field: string, value: any) => void;
}

const SelectWizard: React.FC<SelectWizardProps> = ({ formData, updateFormData }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('wizardType', event.target.value);
  };

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Select Wizard Type
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Choose the type of configuration wizard you want to use:
        </Typography>
        
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="wizard-type"
            name="wizard-type"
            value={formData.wizardType}
            onChange={handleChange}
          >
            <FormControlLabel 
              value="controller" 
              control={<Radio />} 
              label="Controller Wizard - Create data collection controllers for States and Counties" 
            />
            <FormControlLabel 
              value="datasource" 
              control={<Radio />} 
              label="Data Source Wizard - Configure external data sources" 
              disabled
            />
            <FormControlLabel 
              value="property" 
              control={<Radio />} 
              label="Property Wizard - Create property import tools" 
              disabled
            />
          </RadioGroup>
        </FormControl>
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        The Controller Wizard helps you create and configure data collection controllers
        for different geographic entities in the inventory hierarchy.
      </Typography>
    </Box>
  );
};

export default SelectWizard; 