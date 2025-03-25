import React from 'react';
import { Routes, Route } from 'react-router-dom';
import InventoryHeader from './InventoryHeader';
import InventorySidebar from './InventorySidebar';
import InventoryMain from './InventoryMain';
import StateDetails from './details/StateDetails';
import CountyDetails from './details/CountyDetails';
import PropertyDetails from './details/PropertyDetails';
import ControllerWizard from './details/ControllerWizard';
import PropertySearchPage from '../../pages/inventory/PropertySearchPage';
import './InventoryModule.css';
import { InventoryProvider } from '../../context/InventoryContext';

const InventoryModule: React.FC = () => {
  return (
    <InventoryProvider>
      <div className="inventory-module">
        <InventoryHeader />
        <div className="inventory-content">
          <InventorySidebar />
          <div className="inventory-main-container">
            <Routes>
              <Route path="/" element={<InventoryMain />} />
              <Route path="/state/:stateId" element={<StateDetails />} />
              <Route path="/county/:countyId" element={<CountyDetails />} />
              <Route path="/property/:propertyId" element={<PropertyDetails />} />
              <Route path="/controllers/wizard" element={<ControllerWizard />} />
              <Route path="/search" element={<PropertySearchPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </InventoryProvider>
  );
};

export default InventoryModule; 