import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';

const InventorySearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all'); // all, state, county, property

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log(`Searching for "${searchQuery}" in ${searchType}`);
  };

  return (
    <div className="inventory-search mb-3">
      <Form onSubmit={handleSearch}>
        <Form.Group className="mb-2">
          <Form.Select 
            size="sm"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="state">States</option>
            <option value="county">Counties</option>
            <option value="property">Properties</option>
          </Form.Select>
        </Form.Group>
        <InputGroup size="sm">
          <Form.Control
            placeholder="Search inventory..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="outline-secondary" type="submit">
            <i className="bi bi-search"></i>
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
};

export default InventorySearch; 