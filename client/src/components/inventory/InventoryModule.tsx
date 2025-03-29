import React, { createContext, useContext, useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Grid } from '@mui/material';
import axios from 'axios';
import InventoryDashboard from './InventoryDashboard';
import InventoryHeader from './InventoryHeader';
import InventorySidebar from './InventorySidebar';
import StateDetails from './details/StateDetails';
import CountyDetails from './details/CountyDetails';
import PropertyDetails from './details/PropertyDetails';
import ControllerWizard from './details/ControllerWizard';
import PropertySearchPage from '../../pages/inventory/PropertySearchPage';
import './InventoryModule.css';

// Types for the context
interface InventoryContextType {
  selectedNode: any;
  selectNode: (node: any) => void;
  loading: boolean;
  error: string | null;
  usMap: any;
  states: any[];
  refreshData: () => void;
}

// Create context with default values
const InventoryContext = createContext<InventoryContextType>({
  selectedNode: null,
  selectNode: () => {},
  loading: false,
  error: null,
  usMap: null,
  states: [],
  refreshData: () => {}
});

export const useInventoryContext = () => useContext(InventoryContext);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [usMap, setUSMap] = useState<any>(null);
  const [states, setStates] = useState<any[]>([]);
  
  const selectNode = (node: any) => {
    setSelectedNode(node);
  };
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, fetch data from API
      // const usMapResponse = await axios.get('/api/usmap');
      // const statesResponse = await axios.get('/api/states');
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUSMap({
        id: 'us_map',
        name: 'US Map',
        type: 'us_map',
        metadata: {
          totalStates: 5,
          totalCounties: 25,
          totalProperties: 1000,
          statistics: {
            totalTaxLiens: 150,
            totalValue: 25000000
          }
        }
      });
      
      setStates([
        { id: 'ca', name: 'California', abbreviation: 'CA', totalCounties: 58 },
        { id: 'tx', name: 'Texas', abbreviation: 'TX', totalCounties: 254 },
        { id: 'fl', name: 'Florida', abbreviation: 'FL', totalCounties: 67 },
        { id: 'ny', name: 'New York', abbreviation: 'NY', totalCounties: 62 },
        { id: 'il', name: 'Illinois', abbreviation: 'IL', totalCounties: 102 }
      ]);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      setError('Failed to load inventory data. Please try again later.');
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const refreshData = () => {
    fetchData();
  };
  
  return (
    <InventoryContext.Provider value={{ 
      selectedNode, 
      selectNode, 
      loading, 
      error, 
      usMap, 
      states, 
      refreshData 
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

const InventoryModule: React.FC = () => {
  const { loading, error } = useInventoryContext();
  
  return (
    <Box className="inventory-module" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <InventoryHeader />
      
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        <InventorySidebar />
        
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
          {loading ? (
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography>Loading inventory data...</Typography>
            </Paper>
          ) : error ? (
            <Paper sx={{ p: 3, bgcolor: '#fff4f4' }}>
              <Typography color="error">{error}</Typography>
            </Paper>
          ) : (
            <Routes>
              <Route path="/" element={<InventoryDashboard />} />
              <Route path="/state/:stateId" element={<StateDetails />} />
              <Route path="/county/:countyId" element={<CountyDetails />} />
              <Route path="/property/:propertyId" element={<PropertyDetails />} />
              <Route path="/search" element={<PropertySearchPage />} />
              <Route path="/controllers/wizard" element={<ControllerWizard />} />
              <Route path="/controllers/wizard/:entityType/:entityId" element={<ControllerWizard />} />
            </Routes>
          )}
        </Box>
      </Box>
    </Box>
  );
};

// Wrapper component that provides the context
const InventoryModuleWithContext: React.FC = () => {
  return (
    <InventoryProvider>
      <InventoryModule />
    </InventoryProvider>
  );
};

export default InventoryModuleWithContext; 