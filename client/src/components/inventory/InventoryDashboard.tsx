import React from 'react';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Divider
} from '@mui/material';
import { 
  Map as MapIcon,
  Home as HomeIcon,
  LocationCity as CityIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useInventoryContext } from './InventoryModule';

const StatCard = ({ title, value, icon, color }: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  color?: string;
}) => (
  <Paper elevation={2} sx={{ height: '100%' }}>
    <Box 
      sx={{ 
        display: 'flex', 
        p: 2,
        bgcolor: color || 'primary.main',
        color: 'white'
      }}
    >
      <Box sx={{ mr: 2 }}>{icon}</Box>
      <Typography variant="h6">{title}</Typography>
    </Box>
    <Box sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h3">{value}</Typography>
    </Box>
  </Paper>
);

const InventoryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { usMap, states } = useInventoryContext();
  
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>Inventory Dashboard</Typography>
      
      {/* Stats overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="States" 
            value={usMap?.metadata?.totalStates || 0} 
            icon={<MapIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Counties" 
            value={formatNumber(usMap?.metadata?.totalCounties || 0)} 
            icon={<CityIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Properties" 
            value={formatNumber(usMap?.metadata?.totalProperties || 0)} 
            icon={<HomeIcon />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Value" 
            value={formatCurrency(usMap?.metadata?.statistics?.totalValue || 0)} 
            icon={<TrendingUpIcon />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>
      
      {/* Quick actions */}
      <Typography variant="h5" sx={{ mb: 2 }}>Quick Actions</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Create Controller
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Set up new data collectors for inventory objects.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                startIcon={<AddIcon />}
                onClick={() => navigate('/inventory/controllers/wizard')}
              >
                New Controller
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Search Properties
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Find specific properties in the inventory.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small"
                onClick={() => navigate('/inventory/search')}
              >
                Search
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                View US Map
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Explore states and counties visually.
              </Typography>
            </CardContent>
            <CardActions>
              <Button 
                size="small"
                onClick={() => navigate('/inventory/usmap')}
              >
                Open Map
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent States */}
      <Typography variant="h5" sx={{ mb: 2 }}>States</Typography>
      <Grid container spacing={2}>
        {states.slice(0, 6).map(state => (
          <Grid item xs={12} sm={6} md={4} key={state.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{state.name}</Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {state.abbreviation}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">
                  Counties: {state.totalCounties}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small"
                  onClick={() => navigate(`/inventory/state/${state.id}`)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default InventoryDashboard; 