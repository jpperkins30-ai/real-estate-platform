import { Property } from '../types/inventory';

// Property search service with hybrid approach
const propertySearchService = {
  // Direct search by ID
  async searchPropertyById(propertyId: string, countyId: string): Promise<Property | null> {
    try {
      // Get county configuration
      const countyResponse = await fetch(`/api/counties/${countyId}`);
      if (!countyResponse.ok) {
        throw new Error('County not found');
      }
      
      const county = await countyResponse.json();
      const searchConfig = county.metadata.searchConfig;
      
      if (!searchConfig) {
        throw new Error('County search configuration not found');
      }
      
      const searchField = searchConfig.lookupMethod === 'account_number' 
        ? 'taxAccountNumber' 
        : 'parcelId';
      
      // Attempt direct search
      const searchResponse = await fetch(`/api/properties/search?countyId=${countyId}&${searchField}=${propertyId}`);
      if (!searchResponse.ok) {
        throw new Error('Search failed');
      }
      
      const searchResults = await searchResponse.json();
      
      if (searchResults.properties.length > 0) {
        return searchResults.properties[0];
      }
      
      // No direct match found
      return null;
    } catch (error) {
      console.error('Property search error:', error);
      throw error;
    }
  },
  
  // Fuzzy search as fallback
  async fuzzySearchProperty(propertyId: string, countyId: string): Promise<Property | null> {
    try {
      // Get county configuration
      const countyResponse = await fetch(`/api/counties/${countyId}`);
      if (!countyResponse.ok) {
        throw new Error('County not found');
      }
      
      const county = await countyResponse.json();
      const searchConfig = county.metadata.searchConfig;
      
      if (!searchConfig) {
        throw new Error('County search configuration not found');
      }
      
      // Perform fuzzy search
      const fuzzyResponse = await fetch(`/api/properties/fuzzy-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: propertyId,
          countyId,
          lookupMethod: searchConfig.lookupMethod,
          threshold: 0.8
        })
      });
      
      if (!fuzzyResponse.ok) {
        throw new Error('Fuzzy search failed');
      }
      
      const fuzzyResults = await fuzzyResponse.json();
      
      if (fuzzyResults.matches.length > 0) {
        return fuzzyResults.matches[0].property;
      }
      
      // No fuzzy match found
      return null;
    } catch (error) {
      console.error('Fuzzy search error:', error);
      throw error;
    }
  },
  
  // Combined search with fallback
  async searchProperty(propertyId: string, countyId: string): Promise<Property | null> {
    // Try direct search first
    const directResult = await this.searchPropertyById(propertyId, countyId);
    
    if (directResult) {
      return directResult;
    }
    
    // Fall back to fuzzy search
    console.log("No exact match, trying fuzzy search...");
    const fuzzyResult = await this.fuzzySearchProperty(propertyId, countyId);
    
    return fuzzyResult;
  }
};

export default propertySearchService; 