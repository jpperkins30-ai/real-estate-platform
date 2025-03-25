import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, RadioGroup, FormControlLabel, Radio, Paper, CircularProgress } from '@mui/material';
import { fetchCollectorTypes } from '../../../services/api';
import { CollectorType as ImportedCollectorType } from '../../../types/inventory';

interface SelectCollectorTypeProps {
  formData: {
    collectorType: string;
  };
  updateFormData: (field: string, value: any) => void;
}

interface ExtendedCollectorType extends ImportedCollectorType {
  capabilities: string[];
}

const SelectCollectorType: React.FC<SelectCollectorTypeProps> = ({ formData, updateFormData }) => {
  const [collectorTypes, setCollectorTypes] = useState<ExtendedCollectorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCollectorTypes = async () => {
      try {
        setLoading(true);
        const types = await fetchCollectorTypes();
        
        // Add capabilities field to the imported collector types
        const extendedTypes: ExtendedCollectorType[] = types.map(type => ({
          ...type,
          capabilities: type.supportedSourceTypes || []
        }));
        
        setCollectorTypes(extendedTypes);
        setError(null);
      } catch (err) {
        setError('Failed to load collector types');
        console.error('Error loading collector types:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCollectorTypes();
  }, []);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData('collectorType', event.target.value);
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

  // Mock data if no collector types are found
  const displayCollectorTypes = collectorTypes.length > 0 ? collectorTypes : [
    { 
      id: 'web_scraper', 
      name: 'Web Scraper', 
      description: 'Collects data by scraping web pages', 
      capabilities: ['HTML parsing', 'JavaScript rendering', 'Login support']
    },
    { 
      id: 'api_collector', 
      name: 'API Collector', 
      description: 'Collects data from REST APIs', 
      capabilities: ['JSON/XML support', 'OAuth', 'Rate limiting']
    },
    { 
      id: 'file_processor', 
      name: 'File Processor', 
      description: 'Processes CSV, Excel, PDF files', 
      capabilities: ['Tabular data extraction', 'PDF text extraction', 'OCR capability']
    },
    { 
      id: 'database_connector', 
      name: 'Database Connector', 
      description: 'Connects to external databases', 
      capabilities: ['SQL/NoSQL support', 'Connection pooling', 'Query optimization']
    }
  ];

  return (
    <Box sx={{ minWidth: 300, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        Select Collector Type
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" gutterBottom>
          Choose the type of collector that best matches your data source:
        </Typography>
        
        <FormControl component="fieldset">
          <RadioGroup
            aria-label="collector-type"
            name="collector-type"
            value={formData.collectorType}
            onChange={handleChange}
          >
            {displayCollectorTypes.map((type) => (
              <FormControlLabel
                key={type.id}
                value={type.id}
                control={<Radio />}
                label={
                  <Box>
                    <Typography variant="subtitle1">{type.name}</Typography>
                    <Typography variant="body2">{type.description}</Typography>
                    <Box mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        Capabilities: {type.capabilities.join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ mb: 2 }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </Paper>
      
      <Typography variant="body2" color="text.secondary">
        The collector type determines how data is extracted from the source.
        Choose the option that matches the technical characteristics of your data source.
      </Typography>
    </Box>
  );
};

export default SelectCollectorType; 