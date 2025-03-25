import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import StatesView from './StatesView';
import CountiesView from './CountiesView';
import PropertiesView from './PropertiesView';
import PropertyDetail from './PropertyDetail';
import InventoryDashboard from './InventoryDashboard';

export const InventoryModule: React.FC = () => {
  return (
    <Container fluid>
      <Routes>
        <Route path="/" element={<InventoryDashboard />} />
        <Route path="/states" element={<StatesView />} />
        <Route path="/states/:stateId" element={<CountiesView />} />
        <Route path="/counties/:countyId/properties" element={<PropertiesView />} />
        <Route path="/properties/:propertyId" element={<PropertyDetail />} />
      </Routes>
    </Container>
  );
};

export default InventoryModule; 