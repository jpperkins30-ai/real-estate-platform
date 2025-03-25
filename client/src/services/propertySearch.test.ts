import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import propertySearchService from './propertySearch';

// Mock the fetch function
global.fetch = vi.fn();

describe('Property Search Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('searchPropertyById', () => {
    it('should return a property when exact match is found', async () => {
      const mockCounty = {
        id: 'county-123',
        name: 'Test County',
        metadata: {
          searchConfig: {
            lookupMethod: 'parcel_id'
          }
        }
      };

      const mockProperty = {
        id: 'property-123',
        name: 'Test Property',
        location: {
          parcelId: 'ABC123'
        }
      };

      // Mock fetch for county
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCounty)
        })
      );

      // Mock fetch for property search
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ properties: [mockProperty] })
        })
      );

      const result = await propertySearchService.searchPropertyById('ABC123', 'county-123');
      
      expect(result).toEqual(mockProperty);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith('/api/counties/county-123');
      expect(global.fetch).toHaveBeenCalledWith('/api/properties/search?countyId=county-123&parcelId=ABC123');
    });

    it('should return null when no exact match is found', async () => {
      const mockCounty = {
        id: 'county-123',
        name: 'Test County',
        metadata: {
          searchConfig: {
            lookupMethod: 'parcel_id'
          }
        }
      };

      // Mock fetch for county
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCounty)
        })
      );

      // Mock fetch for property search with no results
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ properties: [] })
        })
      );

      const result = await propertySearchService.searchPropertyById('ABC123', 'county-123');
      
      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('fuzzySearchProperty', () => {
    it('should return a property when fuzzy match is found', async () => {
      const mockCounty = {
        id: 'county-123',
        name: 'Test County',
        metadata: {
          searchConfig: {
            lookupMethod: 'parcel_id'
          }
        }
      };

      const mockProperty = {
        id: 'property-123',
        name: 'Test Property',
        location: {
          parcelId: 'ABC123'
        }
      };

      // Mock fetch for county
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCounty)
        })
      );

      // Mock fetch for fuzzy search
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            matches: [{ property: mockProperty, similarity: 0.9 }] 
          })
        })
      );

      const result = await propertySearchService.fuzzySearchProperty('ABC-123', 'county-123');
      
      expect(result).toEqual(mockProperty);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith('/api/counties/county-123');
      expect(global.fetch).toHaveBeenCalledWith('/api/properties/fuzzy-search');
    });

    it('should return null when no fuzzy match is found', async () => {
      const mockCounty = {
        id: 'county-123',
        name: 'Test County',
        metadata: {
          searchConfig: {
            lookupMethod: 'parcel_id'
          }
        }
      };

      // Mock fetch for county
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCounty)
        })
      );

      // Mock fetch for fuzzy search with no results
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ matches: [] })
        })
      );

      const result = await propertySearchService.fuzzySearchProperty('XYZ999', 'county-123');
      
      expect(result).toBeNull();
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('searchProperty', () => {
    it('should use exact match if available', async () => {
      const mockProperty = { id: 'property-123', name: 'Test Property' };
      
      // Mock successful direct search
      vi.spyOn(propertySearchService, 'searchPropertyById').mockResolvedValueOnce(mockProperty);
      vi.spyOn(propertySearchService, 'fuzzySearchProperty');
      
      const result = await propertySearchService.searchProperty('ABC123', 'county-123');
      
      expect(result).toEqual(mockProperty);
      expect(propertySearchService.searchPropertyById).toHaveBeenCalledTimes(1);
      expect(propertySearchService.fuzzySearchProperty).not.toHaveBeenCalled();
    });

    it('should fall back to fuzzy search if no exact match', async () => {
      const mockProperty = { id: 'property-123', name: 'Test Property' };
      
      // Mock direct search with no results
      vi.spyOn(propertySearchService, 'searchPropertyById').mockResolvedValueOnce(null);
      // Mock successful fuzzy search
      vi.spyOn(propertySearchService, 'fuzzySearchProperty').mockResolvedValueOnce(mockProperty);
      
      const result = await propertySearchService.searchProperty('ABC-123', 'county-123');
      
      expect(result).toEqual(mockProperty);
      expect(propertySearchService.searchPropertyById).toHaveBeenCalledTimes(1);
      expect(propertySearchService.fuzzySearchProperty).toHaveBeenCalledTimes(1);
    });

    it('should return null if both searches fail', async () => {
      // Mock both searches with no results
      vi.spyOn(propertySearchService, 'searchPropertyById').mockResolvedValueOnce(null);
      vi.spyOn(propertySearchService, 'fuzzySearchProperty').mockResolvedValueOnce(null);
      
      const result = await propertySearchService.searchProperty('UNKNOWN', 'county-123');
      
      expect(result).toBeNull();
      expect(propertySearchService.searchPropertyById).toHaveBeenCalledTimes(1);
      expect(propertySearchService.fuzzySearchProperty).toHaveBeenCalledTimes(1);
    });
  });
}); 