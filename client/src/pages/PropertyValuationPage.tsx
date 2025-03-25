import React, { useState } from 'react';
import { Container, Grid, Typography, Box, Paper, Tabs, Tab, CircularProgress } from '@mui/material';
import PropertyValuationForm from '../components/PropertyValuation/PropertyValuationForm';
import PropertyValuationCard from '../components/PropertyValuation/PropertyValuationCard';
import { PropertyFeatures, ValuationResult } from '../types/property';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`valuation-tabpanel-${index}`}
      aria-labelledby={`valuation-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const PropertyValuationPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState<ValuationResult | null>(null);
  const [property, setProperty] = useState<PropertyFeatures | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmitPropertyData = async (propertyData: PropertyFeatures) => {
    setLoading(true);
    setProperty(propertyData);
    
    try {
      // In a real application, this would make an API call to the backend
      // Mock the API call with a delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock valuation result
      const mockValuation: ValuationResult = {
        estimatedValue: Math.round(propertyData.squareFeet * 250 + Math.random() * 50000),
        valuationRange: {
          low: 0, // Will be calculated below
          high: 0, // Will be calculated below
        },
        confidenceScore: 0.85,
        comparables: [
          {
            address: '123 Nearby St',
            propertyType: propertyData.propertyType,
            squareFeet: propertyData.squareFeet - 200,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms,
            yearBuilt: propertyData.yearBuilt ? propertyData.yearBuilt - 2 : undefined,
            saleDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            salePrice: Math.round(propertyData.squareFeet * 240),
            pricePerSquareFoot: 240,
            distance: 0.3,
          },
          {
            address: '456 Similar Ave',
            propertyType: propertyData.propertyType,
            squareFeet: propertyData.squareFeet + 150,
            bedrooms: propertyData.bedrooms ? propertyData.bedrooms + 1 : undefined,
            bathrooms: propertyData.bathrooms,
            yearBuilt: propertyData.yearBuilt ? propertyData.yearBuilt - 5 : undefined,
            saleDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
            salePrice: Math.round(propertyData.squareFeet * 260),
            pricePerSquareFoot: 260,
            distance: 0.5,
          },
          {
            address: '789 Comp Blvd',
            propertyType: propertyData.propertyType,
            squareFeet: propertyData.squareFeet + 50,
            bedrooms: propertyData.bedrooms,
            bathrooms: propertyData.bathrooms ? propertyData.bathrooms + 0.5 : undefined,
            yearBuilt: propertyData.yearBuilt ? propertyData.yearBuilt - 1 : undefined,
            saleDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
            salePrice: Math.round(propertyData.squareFeet * 255),
            pricePerSquareFoot: 255,
            distance: 0.7,
          },
        ],
        adjustments: [
          {
            type: 'condition',
            amount: propertyData.condition === 'excellent' ? 0.05 : 
                   propertyData.condition === 'good' ? 0.02 : 
                   propertyData.condition === 'fair' ? -0.03 : -0.1,
            description: `Property condition adjustment (${propertyData.condition || 'unknown'})`,
          },
          {
            type: 'age',
            amount: propertyData.yearBuilt ? 
                   (new Date().getFullYear() - propertyData.yearBuilt) < 5 ? 0.06 :
                   (new Date().getFullYear() - propertyData.yearBuilt) < 20 ? 0.02 :
                   (new Date().getFullYear() - propertyData.yearBuilt) < 40 ? -0.02 : -0.08 : 0,
            description: propertyData.yearBuilt ? 
                        `Property age adjustment (${new Date().getFullYear() - propertyData.yearBuilt} years)` :
                        'Property age unknown',
          },
          {
            type: 'location',
            amount: 0.03,
            description: `Location adjustment (${propertyData.location?.city || ''}, ${propertyData.location?.state || ''})`,
          },
        ],
        methodology: 'Comparable Sales Approach',
        valuationDate: new Date(),
      };
      
      // Calculate valuation range
      mockValuation.valuationRange.low = Math.round(mockValuation.estimatedValue * 0.9);
      mockValuation.valuationRange.high = Math.round(mockValuation.estimatedValue * 1.1);
      
      setValuation(mockValuation);
      
      // Switch to results tab
      setTabValue(1);
    } catch (error) {
      console.error('Error calculating property valuation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    alert('In a real application, this would generate a detailed valuation report for download.');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Property Valuation Tool
      </Typography>
      <Typography variant="subtitle1" paragraph align="center" color="textSecondary">
        Get an accurate estimate of your property's market value based on comparable sales and market trends
      </Typography>

      <Paper sx={{ mt: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="property valuation tabs"
          variant="fullWidth"
        >
          <Tab label="Property Details" />
          <Tab label="Valuation Results" disabled={!valuation} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <PropertyValuationForm 
            onSubmit={handleSubmitPropertyData}
            loading={loading}
          />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {loading ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : valuation ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <PropertyValuationCard 
                  valuation={valuation}
                  onGenerateReport={handleGenerateReport}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Property Summary
                  </Typography>
                  <Box my={2}>
                    <Typography variant="body2" color="textSecondary">Address</Typography>
                    <Typography variant="body1">{property?.address}</Typography>
                  </Box>
                  <Box my={2}>
                    <Typography variant="body2" color="textSecondary">Property Type</Typography>
                    <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                      {property?.propertyType}
                    </Typography>
                  </Box>
                  <Box my={2}>
                    <Typography variant="body2" color="textSecondary">Square Feet</Typography>
                    <Typography variant="body1">{property?.squareFeet}</Typography>
                  </Box>
                  {property?.bedrooms && (
                    <Box my={2}>
                      <Typography variant="body2" color="textSecondary">Bedrooms</Typography>
                      <Typography variant="body1">{property.bedrooms}</Typography>
                    </Box>
                  )}
                  {property?.bathrooms && (
                    <Box my={2}>
                      <Typography variant="body2" color="textSecondary">Bathrooms</Typography>
                      <Typography variant="body1">{property.bathrooms}</Typography>
                    </Box>
                  )}
                  {property?.yearBuilt && (
                    <Box my={2}>
                      <Typography variant="body2" color="textSecondary">Year Built</Typography>
                      <Typography variant="body1">{property.yearBuilt}</Typography>
                    </Box>
                  )}
                  {property?.condition && (
                    <Box my={2}>
                      <Typography variant="body2" color="textSecondary">Condition</Typography>
                      <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                        {property.condition}
                      </Typography>
                    </Box>
                  )}
                  {property?.location && (
                    <Box my={2}>
                      <Typography variant="body2" color="textSecondary">Location</Typography>
                      <Typography variant="body1">
                        {`${property.location.city}, ${property.location.state} ${property.location.zipCode}`}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <Typography variant="body1" align="center" p={4}>
              Please enter property details to see valuation results.
            </Typography>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default PropertyValuationPage; 