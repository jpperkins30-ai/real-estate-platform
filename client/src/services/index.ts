export * from './api';
export * from './propertySearch';
export * from './taxLien';
export * from './export';
export * from './inventoryService';
export * as controllerService from './controllerService';

// Implementation of CountyService with API calls
import api from './api';
import { County } from '../types/inventory';

export const CountyService = {
  getCountiesByState: async (stateId: string): Promise<County[]> => {
    try {
      const response = await api.getCounties(stateId);
      return response || [];
    } catch (error) {
      console.error('Error fetching counties:', error);
      return [];
    }
  },
  
  getCountyById: async (countyId: string): Promise<County | null> => {
    try {
      const response = await api.getCounty(countyId);
      return response;
    } catch (error) {
      console.error('Error fetching county details:', error);
      return null;
    }
  },

  // Add a method to get all counties
  getCounties: async (): Promise<County[]> => {
    try {
      // If 'all' is passed to getCountiesByState, it should return all counties
      const response = await api.getCounties('all');
      return response || [];
    } catch (error) {
      console.error('Error fetching all counties:', error);
      return [];
    }
  }
}; 