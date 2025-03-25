import React from 'react';
import InventoryHeader from './InventoryHeader';
import InventorySidebar from './InventorySidebar';
import InventoryMain from './InventoryMain';
import './InventoryModule.css';

const InventoryModule: React.FC = () => {
  return (
    <div className="inventory-module">
      <InventoryHeader />
      <div className="inventory-content">
        <InventorySidebar />
        <InventoryMain />
      </div>
    </div>
  );
};

export default InventoryModule; 