import React from 'react';
import InventorySearch from './InventorySearch';
import InventoryTree from './InventoryTree';

const InventorySidebar: React.FC = () => {
  return (
    <div className="inventory-sidebar">
      <InventorySearch />
      <InventoryTree />
    </div>
  );
};

export default InventorySidebar; 