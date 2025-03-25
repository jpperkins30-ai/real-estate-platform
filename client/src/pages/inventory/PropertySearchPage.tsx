import React, { useState, useEffect } from 'react';
import { Card, Container, Typography, Box, Divider, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PropertySearchBox } from '../../components/inventory';
import { CountyService } from '../../services';

interface County {
  id: string;
  name: string;
}

const PropertySearchPage: React.FC = () => {
  const [counties, setCounties] = useState<County[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchCounties = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const countiesData = await CountyService.getCounties();
        setCounties(countiesData);
        if (countiesData.length > 0) {
          setSelectedCounty(countiesData[0].id);
        }
      } catch (err) {
        setError('Failed to load counties. Please try again later.');
        console.error('Error fetching counties:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCounties();
  }, []);
  
  const handleCountyChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedCounty(event.target.value as string);
  };
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Property Search
      </Typography>
      <Divider sx={{ mb: 3 }} />
      
      <Card sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Select County
        </Typography>
        
        {isLoading ? (
          <Typography>Loading counties...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <Box sx={{ minWidth: 200, mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel id="county-select-label">County</InputLabel>
              <Select
                labelId="county-select-label"
                id="county-select"
                value={selectedCounty}
                label="County"
                onChange={handleCountyChange}
              >
                {counties.map((county) => (
                  <MenuItem key={county.id} value={county.id}>
                    {county.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
        
        {selectedCounty && (
          <>
            <Typography variant="h6" component="h2" gutterBottom sx={{ mt: 4 }}>
              Search for Property
            </Typography>
            <PropertySearchBox countyId={selectedCounty} />
          </>
        )}
      </Card>
      
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          About Property Search
        </Typography>
        <Typography paragraph>
          Use this tool to quickly find properties in our inventory system. You can search using:
        </Typography>
        <ul>
          <li>
            <Typography>
              <strong>Property ID</strong> - The unique identifier assigned to each property in our system
            </Typography>
          </li>
          <li>
            <Typography>
              <strong>Parcel Number</strong> - The county-assigned parcel identifier
            </Typography>
          </li>
          <li>
            <Typography>
              <strong>Tax Account Number</strong> - The tax account number associated with the property
            </Typography>
          </li>
        </ul>
        <Typography paragraph>
          Our search system will first attempt to find an exact match. If no exact match is found, it will use fuzzy matching
          to help find properties even with slight typographical errors or format differences.
        </Typography>
      </Card>
    </Container>
  );
};

export default PropertySearchPage; 