import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PropertySearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Mock search functionality
    setTimeout(() => {
      if (searchTerm.trim() !== '') {
        setSearchResults([
          { id: '1', address: '123 Main St', city: 'San Francisco', state: 'CA', type: 'Residential' },
          { id: '2', address: '456 Oak Ave', city: 'Los Angeles', state: 'CA', type: 'Commercial' },
          { id: '3', address: '789 Pine Rd', city: 'New York', state: 'NY', type: 'Residential' }
        ].filter(p => 
          p.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.state.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      } else {
        setSearchResults([]);
      }
      setIsSearching(false);
    }, 500);
  };

  return (
    <div className="property-search">
      <h2>Property Search</h2>
      <p>Search for properties by address, city, or state.</p>

      <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Enter address, city, or state..."
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
          />
          <button 
            type="submit"
            style={{
              padding: '10px 20px',
              backgroundColor: '#4a86e8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Search
          </button>
        </div>
      </form>

      {isSearching ? (
        <div>Searching...</div>
      ) : (
        <div>
          {searchResults.length > 0 ? (
            <div>
              <h3>Search Results ({searchResults.length})</h3>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '15px'
              }}>
                {searchResults.map(property => (
                  <div 
                    key={property.id}
                    style={{
                      padding: '15px',
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <h4 style={{ margin: '0 0 10px 0' }}>{property.address}</h4>
                    <div>{property.city}, {property.state}</div>
                    <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
                      {property.type}
                    </div>
                    <Link 
                      to={`/inventory/property/${property.id}`}
                      style={{
                        display: 'block',
                        marginTop: '15px',
                        padding: '8px',
                        textAlign: 'center',
                        backgroundColor: '#f0f0f0',
                        textDecoration: 'none',
                        color: '#333',
                        borderRadius: '4px'
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : searchTerm ? (
            <div>No properties found matching "{searchTerm}".</div>
          ) : null}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <Link 
          to="/inventory"
          style={{
            display: 'inline-block',
            padding: '8px 16px',
            backgroundColor: '#f0f0f0',
            textDecoration: 'none',
            color: '#333',
            borderRadius: '4px'
          }}
        >
          Back to Inventory
        </Link>
      </div>
    </div>
  );
};

export default PropertySearchPage; 