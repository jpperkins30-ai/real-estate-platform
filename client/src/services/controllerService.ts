/**
 * Controller Service
 * 
 * This service manages the hierarchical data flow between different panel types
 * in the Multi-Frame system. It handles the relationships between State, County, 
 * and Property data, allowing for synchronized navigation and data loading.
 */

import { EventEmitter } from 'events';
import axios, { AxiosError } from 'axios';
import {
  ControllerStatus,
  ControllerConfig,
  ControllerHistoryItem,
  ControllerError,
  ControllerResponse,
  ControllerExecutionParams,
  ControllerTemplate
} from '../types/controller.types';

// Define the events that can be triggered
export enum ControllerEvent {
  STATE_SELECTED = 'state-selected',
  COUNTY_SELECTED = 'county-selected',
  PROPERTY_SELECTED = 'property-selected',
  FILTER_CHANGED = 'filter-changed',
  DATA_LOADED = 'data-loaded',
  RESET = 'reset',
}

// Define the data types for each level
export interface StateData {
  id: string;
  name: string;
  code: string;
  countiesCount?: number;
  propertiesCount?: number;
}

export interface CountyData {
  id: string;
  name: string;
  stateId: string;
  stateName?: string;
  propertiesCount?: number;
}

export interface PropertyData {
  id: string;
  address: string;
  countyId: string;
  countyName?: string;
  stateId: string;
  stateName?: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  type: string;
  status: string;
  yearBuilt: number;
}

// Filter interface for applying filters to data
export interface DataFilter {
  priceRange?: [number, number];
  bedroomsRange?: [number, number];
  bathroomsRange?: [number, number];
  squareFeetRange?: [number, number];
  propertyTypes?: string[];
  propertyStatus?: string[];
  yearBuiltRange?: [number, number];
}

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Error handler for API calls
const handleApiError = (error: AxiosError): ControllerError => {
  if (error.response) {
    const errorData = error.response.data as { 
      message?: string; 
      code?: string; 
      details?: Record<string, any> 
    };
    return {
      message: errorData.message || 'An error occurred',
      code: errorData.code,
      details: errorData.details
    };
  }
  
  if (error.request) {
    return {
      message: 'No response received from server',
      code: 'NETWORK_ERROR'
    };
  }
  
  return {
    message: error.message || 'An error occurred',
    code: 'UNKNOWN_ERROR'
  };
};

// Response wrapper
const wrapResponse = <T>(data: T, error?: ControllerError): ControllerResponse<T> => ({
  data,
  error
});

class ControllerService {
  private emitter: EventEmitter;
  private currentState: StateData | null = null;
  private currentCounty: CountyData | null = null;
  private currentProperty: PropertyData | null = null;
  private currentFilter: DataFilter = {};

  constructor() {
    this.emitter = new EventEmitter();
    // Increase the max listener limit to avoid warnings
    this.emitter.setMaxListeners(20);
  }

  // Event subscription methods
  public on(event: ControllerEvent, listener: (...args: any[]) => void): () => void {
    this.emitter.on(event, listener);
    return () => this.emitter.off(event, listener);
  }

  public off(event: ControllerEvent, listener: (...args: any[]) => void): void {
    this.emitter.off(event, listener);
  }

  // Selection methods
  public selectState(state: StateData): void {
    this.currentState = state;
    this.currentCounty = null;
    this.currentProperty = null;
    
    this.emitter.emit(ControllerEvent.STATE_SELECTED, state);
  }

  public selectCounty(county: CountyData): void {
    // Ensure the county belongs to the current state if one is selected
    if (this.currentState && county.stateId !== this.currentState.id) {
      console.warn('Selected county does not belong to the current state');
      return;
    }
    
    this.currentCounty = county;
    this.currentProperty = null;
    
    this.emitter.emit(ControllerEvent.COUNTY_SELECTED, county);
  }

  public selectProperty(property: PropertyData): void {
    // Ensure the property belongs to the current hierarchy
    if (this.currentState && property.stateId !== this.currentState.id) {
      console.warn('Selected property does not belong to the current state');
      return;
    }
    
    if (this.currentCounty && property.countyId !== this.currentCounty.id) {
      console.warn('Selected property does not belong to the current county');
      return;
    }
    
    this.currentProperty = property;
    
    this.emitter.emit(ControllerEvent.PROPERTY_SELECTED, property);
  }

  // Filter methods
  public applyFilter(filter: DataFilter): void {
    this.currentFilter = { ...this.currentFilter, ...filter };
    this.emitter.emit(ControllerEvent.FILTER_CHANGED, this.currentFilter);
  }

  public resetFilter(): void {
    this.currentFilter = {};
    this.emitter.emit(ControllerEvent.FILTER_CHANGED, this.currentFilter);
  }

  // Data notification methods
  public notifyDataLoaded(data: any, type: 'states' | 'counties' | 'properties'): void {
    this.emitter.emit(ControllerEvent.DATA_LOADED, { data, type });
  }

  // Reset the entire controller state
  public reset(): void {
    this.currentState = null;
    this.currentCounty = null;
    this.currentProperty = null;
    this.currentFilter = {};
    
    this.emitter.emit(ControllerEvent.RESET);
  }

  // Get current state
  public getCurrentState(): StateData | null {
    return this.currentState;
  }

  // Get current county
  public getCurrentCounty(): CountyData | null {
    return this.currentCounty;
  }

  // Get current property
  public getCurrentProperty(): PropertyData | null {
    return this.currentProperty;
  }

  // Get current filter
  public getCurrentFilter(): DataFilter {
    return this.currentFilter;
  }
}

// Export as a singleton to be used throughout the application
export const controllerService = new ControllerService();

// API Functions
export async function fetchControllerStatus(
  entityType: 'state' | 'county',
  entityId: string
): Promise<ControllerResponse<ControllerStatus>> {
  try {
    // This would be replaced with an actual API call
    const response = await fetch(`/api/controllers/${entityType}/${entityId}/status`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch controller status: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Error fetching controller status:', error);
    return {
      data: {
        hasController: false,
        status: null,
        lastRun: null
      },
      error: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

export async function createController(
  entityType: 'state' | 'county',
  entityId: string,
  config: any
): Promise<ControllerResponse<ControllerStatus>> {
  try {
    const response = await fetch(`/api/controllers/${entityType}/${entityId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create controller: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Error creating controller:', error);
    return {
      data: {
        hasController: false,
        status: null,
        lastRun: null
      },
      error: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

export async function updateController(
  entityType: 'state' | 'county',
  entityId: string,
  config: any
): Promise<ControllerResponse<ControllerStatus>> {
  try {
    const response = await fetch(`/api/controllers/${entityType}/${entityId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update controller: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Error updating controller:', error);
    return {
      data: {
        hasController: false,
        status: null,
        lastRun: null
      },
      error: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

export async function executeController(
  entityType: 'state' | 'county',
  entityId: string,
  params?: any
): Promise<ControllerResponse<ControllerStatus>> {
  try {
    const response = await fetch(`/api/controllers/${entityType}/${entityId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: params ? JSON.stringify(params) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`Failed to execute controller: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Error executing controller:', error);
    return {
      data: {
        hasController: false,
        status: null,
        lastRun: null
      },
      error: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

export async function getControllerHistory(
  entityType: 'state' | 'county',
  entityId: string,
  limit: number = 10
): Promise<ControllerResponse<any[]>> {
  try {
    const response = await fetch(
      `/api/controllers/${entityType}/${entityId}/history?limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch controller history: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Error fetching controller history:', error);
    return {
      data: [],
      error: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

export async function getControllerTemplates(): Promise<ControllerResponse<any[]>> {
  try {
    const response = await fetch('/api/controllers/templates');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch controller templates: ${response.statusText}`);
    }
    
    const data = await response.json();
    return { data };
  } catch (error) {
    console.error('Error fetching controller templates:', error);
    return {
      data: [],
      error: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Delete a controller
 */
export async function deleteController(
  controllerId: string
): Promise<ControllerResponse<void>> {
  try {
    await api.delete(`/controllers/${controllerId}`);
    return wrapResponse(undefined);
  } catch (error) {
    console.error(`Error deleting controller:`, error);
    return wrapResponse(
      undefined,
      handleApiError(error as AxiosError)
    );
  }
}

/**
 * Get a single controller by ID
 */
export async function getController(
  controllerId: string
): Promise<ControllerResponse<ControllerConfig>> {
  try {
    const response = await api.get(`/controllers/${controllerId}`);
    return wrapResponse(response.data);
  } catch (error) {
    console.error(`Error fetching controller:`, error);
    return wrapResponse(
      {} as ControllerConfig,
      handleApiError(error as AxiosError)
    );
  }
}

/**
 * Get all controllers for an entity
 */
export async function getEntityControllers(
  entityType: 'state' | 'county',
  entityId: string
): Promise<ControllerResponse<ControllerConfig[]>> {
  try {
    const response = await api.get(`/${entityType}s/${entityId}/controllers`);
    return wrapResponse(response.data);
  } catch (error) {
    console.error(`Error fetching entity controllers:`, error);
    return wrapResponse(
      [],
      handleApiError(error as AxiosError)
    );
  }
}
