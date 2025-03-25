import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Button,
} from '@mui/material';
import { Home, Assessment, Insights, Download } from '@mui/icons-material';
import { ComparableProperty, ValuationResult } from '../../types/property';
import { formatCurrency } from '../../utils/formatters';

interface PropertyValuationCardProps {
  valuation: ValuationResult;
  onGenerateReport?: () => void;
  loading?: boolean;
}

const PropertyValuationCard: React.FC<PropertyValuationCardProps> = ({
  valuation,
  onGenerateReport,
  loading = false,
}) => {
  const confidencePercentage = Math.round(valuation.confidenceScore * 100);
  
  // Format date
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Show loading state
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Property Valuation
          </Typography>
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
            <LinearProgress sx={{ width: '80%', mb: 2 }} />
            <Typography>Calculating property value...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card elevation={3}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Assessment fontSize="large" color="primary" sx={{ mr: 1 }} />
          <Typography variant="h5" component="div">
            Property Valuation
          </Typography>
        </Box>
        
        <Box textAlign="center" py={2}>
          <Typography variant="h4" color="primary" gutterBottom>
            {formatCurrency(valuation.estimatedValue)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Valuation Range: {formatCurrency(valuation.valuationRange.low)} - {formatCurrency(valuation.valuationRange.high)}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Valued on {formatDate(valuation.valuationDate)}
          </Typography>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Confidence Score
          </Typography>
          <Box display="flex" alignItems="center">
            <Box width="100%" mr={1}>
              <LinearProgress 
                variant="determinate" 
                value={confidencePercentage} 
                color={confidencePercentage > 80 ? "success" : confidencePercentage > 60 ? "primary" : "warning"}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Box minWidth={35}>
              <Typography variant="body2" color="textSecondary">{confidencePercentage}%</Typography>
            </Box>
          </Box>
        </Box>
        
        <Typography variant="subtitle1" gutterBottom>
          Valuation Method
        </Typography>
        <Chip 
          icon={<Insights />} 
          label={valuation.methodology} 
          color="primary" 
          size="small" 
          sx={{ mb: 2 }}
        />
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Value Adjustments
        </Typography>
        <List dense sx={{ mb: 2 }}>
          {valuation.adjustments.map((adjustment: { type: string; amount: number; description: string }, index: number) => (
            <ListItem key={index} sx={{ py: 0 }}>
              <ListItemText
                primary={
                  <Typography variant="body2">
                    {adjustment.description}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color={adjustment.amount >= 0 ? "success.main" : "error.main"}>
                    {adjustment.amount >= 0 ? '+' : ''}{(adjustment.amount * 100).toFixed(1)}%
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1" gutterBottom>
          Comparable Properties
        </Typography>
        <Grid container spacing={1}>
          {valuation.comparables.map((comp: ComparableProperty, index: number) => (
            <Grid item xs={12} key={index}>
              <Box 
                sx={{ 
                  p: 1, 
                  border: '1px solid', 
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <Typography variant="body2" fontWeight="medium">
                  <Home fontSize="small" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                  {comp.address}
                </Typography>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                  <Typography variant="body2" color="textSecondary">
                    {comp.squareFeet} sq ft • {formatDate(comp.saleDate)}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(comp.salePrice)}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
        
        {onGenerateReport && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Button 
              variant="outlined" 
              startIcon={<Download />} 
              onClick={onGenerateReport}
            >
              Generate Valuation Report
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PropertyValuationCard; 