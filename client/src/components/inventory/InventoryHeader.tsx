import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';

interface InventoryHeaderProps {
  title?: string;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({ title = 'Inventory Module' }) => {
  const navigate = useNavigate();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: 2, 
      borderBottom: '1px solid #e0e0e0' 
    }}>
      <Typography variant="h5" component="h1">
        {title}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button 
          variant="outlined"
          color="primary"
          startIcon={<SearchIcon />}
          onClick={() => navigate('/inventory/search')}
        >
          Property Search
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/inventory/controllers/wizard')}
        >
          Create Controller
        </Button>
      </Box>
    </Box>
  );
};

export default InventoryHeader; 