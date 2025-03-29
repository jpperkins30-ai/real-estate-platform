import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Box, 
  TextField, 
  InputAdornment 
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useInventoryContext } from './InventoryModule';

const InventoryHeader: React.FC = () => {
  const navigate = useNavigate();
  const { refreshData } = useInventoryContext();
  
  const handleRefresh = () => {
    refreshData();
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/inventory/search');
  };
  
  const handleAddNew = () => {
    navigate('/inventory/controllers/wizard');
  };
  
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 0, display: 'block', mr: 2 }}>
          Inventory
        </Typography>
        
        <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, display: 'flex', maxWidth: 500 }}>
          <TextField
            placeholder="Search properties, counties or states..."
            size="small"
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        
        <Box sx={{ flexGrow: 0, display: 'flex', ml: 2 }}>
          <IconButton color="inherit" onClick={handleRefresh}>
            <RefreshIcon />
          </IconButton>
          
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{ ml: 2 }}
          >
            Add Controller
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default InventoryHeader; 