import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, MenuItem, Select, Paper, CircularProgress, TextField } from '@mui/material';
import { fetchCountiesByState } from '../../../services/api';

interface SelectCountyProps {
  formData: {
    stateId: string;
    countyId: string;
    countyName: string;
  };
  updateFormData: (field: string, value: any) => void;
}

interface County {
  id: string;
  name: string;
}

const SelectCounty: React.FC<SelectCountyProps> = ({ formData, updateFormData }) => {
  const [counties, setCounties] = useState<County[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCounties = async () => {
      if (!formData.stateId) {
        setCounties([]);
        return;
      }

      try {
        setLoading(true);
        const countiesData = await fetchCountiesByState(formData.stateId);
        setCounties(countiesData);
        setError(null);
      } catch (err) {
        setError('Failed to load counties');
        console.error('Error loading counties:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCounties();
  }, [formData.stateId]);

  const handleChange = (event: any) => {
    const selectedCountyId = event.target.value;
    const selectedCounty = counties.find(county => county.id === selectedCountyId);
    
    updateFormData('countyId', selectedCountyId);
    
    if (selectedCounty) {
      updateFormData('countyName', selectedCounty.name);
    } else {
      updateFormData('countyName', '');
    }
  };

  const filteredCounties = counties.filter(county => 
    county.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!formData.stateId) {
    return (
      <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Select County
        </Typography>
        
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography color="text.secondary">
            Please select a state first to view its counties.
          </Typography>
        </Paper>
      </Box>
    );
  }

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

  // Mock data if no counties are found
  const displayCounties = counties.length > 0 ? counties : [
    { id: 'la', name: 'Los Angeles County' },
    { id: 'orange', name: 'Orange County' },
    { id: 'san_diego', name: 'San Diego County' },
    { id: 'san_francisco', name: 'San Francisco County' },
  ];

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Select County
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Choose the county where the controller will collect data:
        </Typography>
        
        <TextField
          fullWidth
          label="Search Counties"
          variant="outlined"
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type to filter counties..."
          sx={{ mb: 2 }}
        />
        
        <FormControl fullWidth>
          <InputLabel id="county-select-label">County</InputLabel>
          <Select
            labelId="county-select-label"
            id="county-select"
            value={formData.countyId}
            label="County"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {filteredCounties.map((county) => (
              <MenuItem key={county.id} value={county.id}>
                {county.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Select the county where this controller will operate. This will determine which
        geographic entity the controller is associated with in the inventory hierarchy.
      </Typography>
    </Box>
  );
};

export default SelectCounty; 