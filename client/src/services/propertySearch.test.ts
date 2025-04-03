import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import propertySearchService from './propertySearch';
import { Property } from '../types/inventory';

// Mock the fetch function with proper typing
const mockedFetch = global.fetch as jest.Mock;

// Use a simplified Property that meets the type requirements
const createMockProperty = (id: string): Property => ({
  id,
  parcelId: 'ABC123',
  taxAccountNumber: 'TAX123',
  type: 'property',
  parentId: 'county-123',
  countyId: 'county-123',
  stateId: 'CA',
  ownerName: 'Test Owner',
  propertyAddress: '123 Main St',
  city: 'Test City',
  zipCode: '12345',
  address: {
    street: '123 Main St',
    city: 'Test City',
    state: 'CA',
    zip: '12345'
  },
  metadata: {
    propertyType: 'Residential',
    taxStatus: 'Paid',
    lastUpdated: '2023-01-01'
  },
  createdAt: '2023-01-01',
  updatedAt: '2023-01-01'
});

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

      const mockProperty = createMockProperty('property-123');

      // Mock fetch for county
      mockedFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCounty)
        })
      );

      // Mock fetch for property search
      mockedFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ properties: [mockProperty] })
        })
      );

      const result = await propertySearchService.searchPropertyById('ABC123', 'county-123');
      
      expect(result).toEqual(mockProperty);
      expect(mockedFetch).toHaveBeenCalledTimes(2);
      expect(mockedFetch).toHaveBeenCalledWith('/api/counties/county-123');
      expect(mockedFetch).toHaveBeenCalledWith('/api/properties/search?countyId=county-123&parcelId=ABC123');
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
      mockedFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCounty)
        })
      );

      // Mock fetch for property search with no results
      mockedFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ properties: [] })
        })
      );

      const result = await propertySearchService.searchPropertyById('ABC123', 'county-123');
      
      expect(result).toBeNull();
      expect(mockedFetch).toHaveBeenCalledTimes(2);
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

      const mockProperty = createMockProperty('property-123');

      // Mock fetch for county
      mockedFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCounty)
        })
      );

      // Mock fetch for fuzzy search
      mockedFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ 
            matches: [{ property: mockProperty, similarity: 0.9 }] 
          })
        })
      );

      const result = await propertySearchService.fuzzySearchProperty('ABC-123', 'county-123');
      
      expect(result).toEqual(mockProperty);
      expect(mockedFetch).toHaveBeenCalledTimes(2);
      expect(mockedFetch).toHaveBeenCalledWith('/api/counties/county-123');
      expect(mockedFetch).toHaveBeenCalledWith('/api/properties/fuzzy-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: 'ABC-123',
          countyId: 'county-123',
          lookupMethod: 'parcel_id',
          threshold: 0.8
        })
      });
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
      mockedFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCounty)
        })
      );

      // Mock fetch for fuzzy search with no results
      mockedFetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ matches: [] })
        })
      );

      const result = await propertySearchService.fuzzySearchProperty('XYZ999', 'county-123');
      
      expect(result).toBeNull();
      expect(mockedFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('searchProperty', () => {
    it('should use exact match if available', async () => {
      const mockProperty = createMockProperty('property-123');
      
      // Mock successful direct search
      vi.spyOn(propertySearchService, 'searchPropertyById').mockResolvedValueOnce(mockProperty);
      vi.spyOn(propertySearchService, 'fuzzySearchProperty');
      
      const result = await propertySearchService.searchProperty('ABC123', 'county-123');
      
      expect(result).toEqual(mockProperty);
      expect(propertySearchService.searchPropertyById).toHaveBeenCalledTimes(1);
      expect(propertySearchService.fuzzySearchProperty).not.toHaveBeenCalled();
    });

    it('should fall back to fuzzy search if no exact match', async () => {
      const mockProperty = createMockProperty('property-123');
      
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