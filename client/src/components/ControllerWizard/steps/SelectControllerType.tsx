import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio, Paper, CircularProgress } from '@mui/material';
import { fetchControllerTypes } from '../../../services/api';

interface SelectControllerTypeProps {
  formData: {
    controllerType: string;
  };
  updateFormData: (field: string, value: any) => void;
}

interface ControllerType {
  id: string;
  name: string;
  description: string;
}

const SelectControllerType: React.FC<SelectControllerTypeProps> = ({ formData, updateFormData }) => {
  const [controllerTypes, setControllerTypes] = useState<ControllerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadControllerTypes = async () => {
      try {
        setLoading(true);
        const types = await fetchControllerTypes();
        setControllerTypes(types);
        setError(null);
      } catch (err) {
        setError('Failed to load controller types');
        console.error('Error loading controller types:', err);
      } finally {
        setLoading(false);
      }
    };

    loadControllerTypes();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('controllerType', event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  // Mock data if no controller types are found
  const displayControllerTypes = controllerTypes.length > 0 ? controllerTypes : [
    { id: 'taxlien', name: 'Tax Lien Controller', description: 'Collects tax lien data from county websites' },
    { id: 'property', name: 'Property Controller', description: 'Collects property record data from state and county sources' },
    { id: 'assessment', name: 'Assessment Controller', description: 'Collects property assessment data' }
  ];

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Select Controller Type
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Choose the type of controller you want to create:
        </Typography>
        
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="controller-type"
            name="controller-type"
            value={formData.controllerType}
            onChange={handleChange}
          >
            {displayControllerTypes.map((type) => (
              <FormControlLabel
                key={type.id}
                value={type.id}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1">{type.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {type.description}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Select the type of controller that best matches the data you want to collect.
        Different controller types are optimized for specific types of real estate data.
      </Typography>
    </Box>
  );
};

export default SelectControllerType; 