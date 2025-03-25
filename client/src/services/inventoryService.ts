import { useQuery } from 'react-query';
import axios from 'axios';
import { State, County, Property, PropertyFilters, PaginatedResponse } from '../types/inventory';

// API client setup
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Query hooks for Inventory Module
export const useStates = () => {
  return useQuery<State[]>('states', async () => {
    const { data } = await apiClient.get('/states');
    return data;
  });
};

export const useState = (stateId: string | undefined) => {
  return useQuery<State>(['state', stateId], async () => {
    const { data } = await apiClient.get(`/states/${stateId}`);
    return data;
  }, {
    enabled: !!stateId
  });
};

export const useCounties = (stateId: string | undefined) => {
  return useQuery<County[]>(['counties', stateId], async () => {
    const { data } = await apiClient.get(`/states/${stateId}/counties`);
    return data;
  }, {
    enabled: !!stateId
  });
};

export const useCounty = (countyId: string | undefined) => {
  return useQuery<County>(['county', countyId], async () => {
    const { data } = await apiClient.get(`/counties/${countyId}`);
    return data;
  }, {
    enabled: !!countyId
  });
};

export const useProperties = (
  countyId: string | undefined, 
  filters: PropertyFilters = {}, 
  page: number = 1, 
  limit: number = 20
) => {
  return useQuery<PaginatedResponse<Property>>(['properties', countyId, filters, page, limit], async () => {
    const { data } = await apiClient.get(`/counties/${countyId}/properties`, {
      params: {
        ...filters,
        page,
        limit
      }
    });
    return data;
  }, {
    enabled: !!countyId,
    keepPreviousData: true
  });
};

export const useProperty = (propertyId: string | undefined) => {
  return useQuery<Property>(['property', propertyId], async () => {
    const { data } = await apiClient.get(`/properties/${propertyId}`);
    return data;
  }, {
    enabled: !!propertyId
  });
};

// Mutation functions for creating, updating, and deleting inventory items
export const createState = async (stateData: Omit<State, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data } = await apiClient.post('/states', stateData);
  return data;
};

export const updateState = async (stateId: string, stateData: Partial<State>) => {
  const { data } = await apiClient.put(`/states/${stateId}`, stateData);
  return data;
};

export const deleteState = async (stateId: string) => {
  const { data } = await apiClient.delete(`/states/${stateId}`);
  return data;
};

export const createCounty = async (countyData: Omit<County, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data } = await apiClient.post('/counties', countyData);
  return data;
};

export const updateCounty = async (countyId: string, countyData: Partial<County>) => {
  const { data } = await apiClient.put(`/counties/${countyId}`, countyData);
  return data;
};

export const deleteCounty = async (countyId: string) => {
  const { data } = await apiClient.delete(`/counties/${countyId}`);
  return data;
};

export const createProperty = async (propertyData: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data } = await apiClient.post('/properties', propertyData);
  return data;
};

export const updateProperty = async (propertyId: string, propertyData: Partial<Property>) => {
  const { data } = await apiClient.put(`/properties/${propertyId}`, propertyData);
  return data;
};

export const deleteProperty = async (propertyId: string) => {
  const { data } = await apiClient.delete(`/properties/${propertyId}`);
  return data;
}; 