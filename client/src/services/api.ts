import axios from 'axios';
import { 
  ControllerTypeInfo, 
  State, 
  County, 
  DataSource, 
  CollectorType,
  Controller
} from '../types/inventory';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Controller Types
export const fetchControllerTypes = async (): Promise<ControllerTypeInfo[]> => {
  const response = await axios.get(`${API_URL}/controller-types`);
  return response.data;
};

// States
export const fetchStates = async (): Promise<State[]> => {
  const response = await axios.get(`${API_URL}/states`);
  return response.data;
};

// Counties
export const fetchCountiesByState = async (stateId: string): Promise<County[]> => {
  if (!stateId) return [];
  const response = await axios.get(`${API_URL}/states/${stateId}/counties`);
  return response.data;
};

// Data Sources
export const fetchDataSources = async (): Promise<DataSource[]> => {
  const response = await axios.get(`${API_URL}/data-sources`);
  return response.data;
};

// Collector Types
export const fetchCollectorTypes = async (): Promise<CollectorType[]> => {
  const response = await axios.get(`${API_URL}/collector-types`);
  return response.data;
};

// Create new controller
export const createController = async (controllerData: Partial<Controller>): Promise<Controller> => {
  const response = await axios.post(`${API_URL}/controllers`, controllerData);
  return response.data;
};

// Create new data source
export const createDataSource = async (dataSourceData: Partial<DataSource>): Promise<DataSource> => {
  const response = await axios.post(`${API_URL}/data-sources`, dataSourceData);
  return response.data;
};

// Attach controller to object
export const attachController = async (
  controllerId: string, 
  objectType: string, 
  objectId: string
): Promise<void> => {
  await axios.post(`${API_URL}/controllers/${controllerId}/attach`, {
    objectId,
    objectType
  });
};

// Validate controller
export const validateController = async (controllerId: string): Promise<any> => {
  try {
    // 1. Validate controller configuration
    const validationResponse = await fetch(`${API_URL}/controllers/${controllerId}/validate`, {
      method: 'POST'
    });
    
    if (!validationResponse.ok) {
      throw new Error('Controller validation failed');
    }
    
    const validationResult = await validationResponse.json();
    
    // 2. Test collection
    const testResponse = await fetch(`${API_URL}/controllers/${controllerId}/test`, {
      method: 'POST'
    });
    
    if (!testResponse.ok) {
      throw new Error('Controller test failed');
    }
    
    const testResult = await testResponse.json();
    
    // 3. Generate API documentation
    const apiDocResponse = await fetch(`${API_URL}/controllers/${controllerId}/docs`, {
      method: 'POST'
    });
    
    if (!apiDocResponse.ok) {
      throw new Error('API documentation generation failed');
    }
    
    // All validations passed
    return {
      validationResult,
      testResult,
      apiDocGenerated: true
    };
  } catch (error) {
    console.error('Controller validation error:', error);
    throw error;
  }
};

// Execute controller
export const executeController = async (
  controllerId: string, 
  options?: { dryRun?: boolean }
): Promise<any> => {
  const response = await axios.post(`${API_URL}/controllers/${controllerId}/execute`, options);
  return response.data;
};

// Get controller status
export const getControllerStatus = async (controllerId: string): Promise<any> => {
  const response = await axios.get(`${API_URL}/controllers/${controllerId}/status`);
  return response.data;
};

// Get controller execution history
export const getControllerExecutionHistory = async (controllerId: string): Promise<any> => {
  const response = await axios.get(`${API_URL}/controllers/${controllerId}/execution-history`);
  return response.data;
}; 