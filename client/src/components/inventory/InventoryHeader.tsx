import React from 'react';
import { Button } from 'react-bootstrap';

const InventoryHeader: React.FC = () => {
  return (
    <div className="inventory-header">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h4 mb-0">Inventory Management</h1>
          <p className="text-muted small mb-0">Manage States, Counties, and Properties</p>
        </div>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2">
            <i className="bi bi-arrow-repeat me-1"></i>
            Refresh
          </Button>
          <Button variant="primary" size="sm">
            <i className="bi bi-plus-lg me-1"></i>
            Add New
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InventoryHeader; 