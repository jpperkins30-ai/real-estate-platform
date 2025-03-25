import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, MenuItem, Select, Paper, CircularProgress, TextField } from '@mui/material';
import { fetchStates } from '../../../services/api';

interface SelectStateProps {
  formData: {
    stateId: string;
    stateName: string;
  };
  updateFormData: (field: string, value: any) => void;
}

interface State {
  id: string;
  name: string;
  abbreviation: string;
}

const SelectState: React.FC<SelectStateProps> = ({ formData, updateFormData }) => {
  const [states, setStates] = useState<State[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadStates = async () => {
      try {
        setLoading(true);
        const statesData = await fetchStates();
        setStates(statesData);
        setError(null);
      } catch (err) {
        setError('Failed to load states');
        console.error('Error loading states:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStates();
  }, []);

  const handleChange = (event: any) => {
    const selectedStateId = event.target.value;
    const selectedState = states.find(state => state.id === selectedStateId);
    
    updateFormData('stateId', selectedStateId);
    
    if (selectedState) {
      updateFormData('stateName', selectedState.name);
    } else {
      updateFormData('stateName', '');
    }
  };

  const filteredStates = states.filter(state => 
    state.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    state.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Mock data if no states are found
  const displayStates = states.length > 0 ? states : [
    { id: 'ca', name: 'California', abbreviation: 'CA' },
    { id: 'tx', name: 'Texas', abbreviation: 'TX' },
    { id: 'fl', name: 'Florida', abbreviation: 'FL' },
    { id: 'ny', name: 'New York', abbreviation: 'NY' },
  ];

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Select State
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Choose the state where the controller will collect data:
        </Typography>
        
        <TextField
          fullWidth
          label="Search States"
          variant="outlined"
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Type to filter states..."
          sx={{ mb: 2 }}
        />
        
        <FormControl fullWidth>
          <InputLabel id="state-select-label">State</InputLabel>
          <Select
            labelId="state-select-label"
            id="state-select"
            value={formData.stateId}
            label="State"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {filteredStates.map((state) => (
              <MenuItem key={state.id} value={state.id}>
                {state.name} ({state.abbreviation})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Select the state where this controller will operate. This will determine which
        geographic entity the controller is associated with in the inventory hierarchy.
      </Typography>
    </Box>
  );
};

export default SelectState; 