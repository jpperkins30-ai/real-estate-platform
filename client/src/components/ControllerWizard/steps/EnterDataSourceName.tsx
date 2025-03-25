import React, { useState } from 'react';
import { Box, Typography, TextField, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface EnterDataSourceNameProps {
  formData: {
    dataSourceId: string;
    dataSourceName: string;
  };
  updateFormData: (field: string, value: any) => void;
}

const DATA_SOURCE_TYPES = [
  { value: 'website', label: 'Website' },
  { value: 'api', label: 'API' },
  { value: 'database', label: 'Database' },
  { value: 'file', label: 'File' },
  { value: 'service', label: 'Service' }
];

const EnterDataSourceName: React.FC<EnterDataSourceNameProps> = ({ formData, updateFormData }) => {
  const [dataSourceType, setDataSourceType] = useState('website');
  const [dataSourceUrl, setDataSourceUrl] = useState('');
  const [dataSourceDescription, setDataSourceDescription] = useState('');

  // Skip this step if user selected an existing data source
  if (formData.dataSourceId && formData.dataSourceId !== 'new') {
    return (
      <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
        <Typography variant="h6" gutterBottom>
          Data Source Selected
        </Typography>
        
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="body1" gutterBottom>
            You've selected an existing data source: <strong>{formData.dataSourceName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can proceed to the next step.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Enter Data Source Information
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            fullWidth
            label="Data Source Name"
            variant="outlined"
            margin="normal"
            value={formData.dataSourceName}
            onChange={(e) => updateFormData('dataSourceName', e.target.value)}
            helperText="Enter a descriptive name for the data source"
            required
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="datasource-type-label">Data Source Type</InputLabel>
            <Select
              labelId="datasource-type-label"
              id="datasource-type"
              value={dataSourceType}
              label="Data Source Type"
              onChange={(e) => setDataSourceType(e.target.value)}
            >
              {DATA_SOURCE_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="URL or Connection String"
            variant="outlined"
            margin="normal"
            value={dataSourceUrl}
            onChange={(e) => setDataSourceUrl(e.target.value)}
            helperText="Enter the URL or connection information for this data source"
          />
          
          <TextField
            fullWidth
            label="Description"
            variant="outlined"
            margin="normal"
            value={dataSourceDescription}
            onChange={(e) => setDataSourceDescription(e.target.value)}
            helperText="Describe this data source and what kind of data it provides"
            multiline
            rows={3}
          />
        </Box>
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        The data source information will be used to configure the controller's data collection.
        Provide as much detail as possible to help with troubleshooting and maintenance.
      </Typography>
    </Box>
  );
};

export default EnterDataSourceName; 