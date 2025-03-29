import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  ListItemButton,
  Typography,
  Divider,
  Collapse,
  Paper
} from '@mui/material';
import { 
  Map as MapIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  LocationCity as LocationCityIcon,
  Public as PublicIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInventoryContext } from './InventoryModule';

const InventorySidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { states } = useInventoryContext();
  
  const [expandedStates, setExpandedStates] = React.useState<{ [key: string]: boolean }>({});
  
  const toggleState = (stateId: string) => {
    setExpandedStates(prev => ({
      ...prev,
      [stateId]: !prev[stateId]
    }));
  };
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Paper 
      elevation={0} 
      sx={{ 
        width: 280, 
        flexShrink: 0, 
        borderRight: '1px solid #e0e0e0',
        overflow: 'auto',
        height: '100%',
        bgcolor: '#f5f5f5'
      }}
    >
      <List component="nav" aria-label="inventory navigation">
        <ListItemButton 
          onClick={() => navigate('/inventory')} 
          selected={isActive('/inventory')}
        >
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        
        <ListItemButton 
          onClick={() => navigate('/inventory/usmap')} 
          selected={isActive('/inventory/usmap')}
        >
          <ListItemIcon>
            <PublicIcon />
          </ListItemIcon>
          <ListItemText primary="US Map" />
        </ListItemButton>
        
        <Divider sx={{ my: 1 }} />
        
        <ListItem>
          <ListItemText 
            primary={
              <Typography variant="subtitle2" color="text.secondary">
                States
              </Typography>
            } 
          />
        </ListItem>
        
        {/* State list */}
        {states.map(state => (
          <React.Fragment key={state.id}>
            <ListItemButton 
              onClick={() => toggleState(state.id)}
              sx={{ pl: 2 }}
            >
              <ListItemIcon>
                <LocationIcon />
              </ListItemIcon>
              <ListItemText primary={state.name} secondary={state.abbreviation} />
              {expandedStates[state.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            
            <Collapse in={expandedStates[state.id]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItemButton 
                  sx={{ pl: 4 }}
                  onClick={() => navigate(`/inventory/state/${state.id}`)} 
                >
                  <ListItemIcon>
                    <MapIcon />
                  </ListItemIcon>
                  <ListItemText primary="Overview" />
                </ListItemButton>
                
                <ListItemButton 
                  sx={{ pl: 4 }}
                  onClick={() => navigate(`/inventory/state/${state.id}/controllers`)} 
                >
                  <ListItemIcon>
                    <LocationCityIcon />
                  </ListItemIcon>
                  <ListItemText primary="Controllers" />
                </ListItemButton>
              </List>
            </Collapse>
          </React.Fragment>
        ))}
        
        <Divider sx={{ my: 1 }} />
        
        <ListItemButton 
          onClick={() => navigate('/inventory/search')} 
          selected={isActive('/inventory/search')}
        >
          <ListItemText primary="Property Search" inset />
        </ListItemButton>
      </List>
    </Paper>
  );
};

export default InventorySidebar; 