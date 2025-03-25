import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import propertySearchService from '../../services/propertySearch';

interface PropertySearchBoxProps {
  countyId: string;
  onSearchComplete?: (property: any | null) => void;
}

const PropertySearchBox: React.FC<PropertySearchBoxProps> = ({ countyId, onSearchComplete }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setError('Please enter a property identifier');
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      // Call the hybrid search method
      const property = await propertySearchService.searchProperty(searchQuery, countyId);
      
      if (property) {
        if (onSearchComplete) {
          onSearchComplete(property);
        } else {
          // Navigate to property details page if no callback is provided
          navigate(`/inventory/property/${property.id}`);
        }
      } else {
        setError('No property found matching the search criteria');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred during search');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="property-search-box">
      <form onSubmit={handleSearch}>
        <div className="input-group">
          <input
            type="text"
            className="form-control"
            placeholder="Enter property ID, parcel number, or tax account number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={isSearching}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSearching}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {error && (
          <div className="alert alert-danger mt-2">
            {error}
          </div>
        )}
        
        <div className="form-text mt-1">
          Search by parcel ID or tax account number. The system will try to find an exact match first,
          then fall back to fuzzy matching if no exact match is found.
        </div>
      </form>
    </div>
  );
};

export default PropertySearchBox; 