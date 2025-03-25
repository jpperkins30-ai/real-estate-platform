import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, InputLabel, MenuItem, Select, Paper, CircularProgress, TextField, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { fetchDataSources } from '../../../services/api';

interface SelectDataSourceProps {
  formData: {
    dataSourceId: string;
    dataSourceName: string;
  };
  updateFormData: (field: string, value: any) => void;
}

interface DataSource {
  id: string;
  name: string;
  type: string;
  description: string;
}

const SelectDataSource: React.FC<SelectDataSourceProps> = ({ formData, updateFormData }) => {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadDataSources = async () => {
      try {
        setLoading(true);
        const dataSourcesData = await fetchDataSources();
        setDataSources(dataSourcesData);
        setError(null);
      } catch (err) {
        setError('Failed to load data sources');
        console.error('Error loading data sources:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDataSources();
  }, []);

  const handleChange = (event: any) => {
    const selectedDataSourceId = event.target.value;
    const selectedDataSource = dataSources.find(source => source.id === selectedDataSourceId);
    
    updateFormData('dataSourceId', selectedDataSourceId);
    
    if (selectedDataSource) {
      updateFormData('dataSourceName', selectedDataSource.name);
    } else {
      updateFormData('dataSourceName', '');
    }
  };

  const filteredDataSources = dataSources.filter(source => 
    source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    source.description.toLowerCase().includes(searchTerm.toLowerCase())
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

  // Mock data if no data sources are found
  const displayDataSources = dataSources.length > 0 ? dataSources : [
    { id: 'county_website', name: 'County Website', type: 'web', description: 'County public records website' },
    { id: 'state_api', name: 'State API', type: 'api', description: 'State government public API' },
    { id: 'property_records_db', name: 'Property Records Database', type: 'database', description: 'Third-party property records database' },
  ];

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Select Data Source
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Choose the data source that the controller will use:
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            sx={{ flexGrow: 1, mr: 2 }}
            label="Search Data Sources"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to filter data sources..."
          />
          
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => {
              // Navigate to next step to create a new data source
              updateFormData('dataSourceId', 'new');
              updateFormData('dataSourceName', '');
            }}
          >
            New
          </Button>
        </Box>
        
        <FormControl fullWidth>
          <InputLabel id="datasource-select-label">Data Source</InputLabel>
          <Select
            labelId="datasource-select-label"
            id="datasource-select"
            value={formData.dataSourceId}
            label="Data Source"
            onChange={handleChange}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {filteredDataSources.map((source) => (
              <MenuItem key={source.id} value={source.id}>
                <Box>
                  <Typography variant="subtitle1">{source.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {source.type} - {source.description}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        Select an existing data source or create a new one. Data sources represent the 
        external systems or websites where the controller will collect data from.
      </Typography>
    </Box>
  );
};

export default SelectDataSource; 