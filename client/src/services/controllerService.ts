import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

/**
 * Validates a controller configuration
 * @param data Controller configuration data
 * @returns Success status and validation information
 */
export const validateControllerConfiguration = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/controllers/validate`, data);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Error validating controller configuration:', error);
    return {
      success: false,
      message: 'Failed to validate controller configuration'
    };
  }
};

/**
 * Tests a controller with the given configuration
 * @param data Controller configuration for testing
 * @returns Test results
 */
export const testController = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/controllers/test`, data);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Error testing controller:', error);
    return {
      success: false,
      message: 'Failed to test controller'
    };
  }
};

/**
 * Generates API endpoints for a controller
 * @param data Controller API generation data
 * @returns Success status and API information
 */
export const generateAPI = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/controllers/generate-api`, data);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Error generating API:', error);
    return {
      success: false,
      message: 'Failed to generate API endpoints'
    };
  }
};

/**
 * Creates a new controller
 * @param data Controller creation data
 * @returns Success status and controller information
 */
export const createController = async (data: any) => {
  try {
    const response = await axios.post(`${API_URL}/controllers`, data);
    return {
      success: true,
      controllerId: response.data.id,
      ...response.data
    };
  } catch (error) {
    console.error('Error creating controller:', error);
    return {
      success: false,
      message: 'Failed to create controller'
    };
  }
};

/**
 * Attaches a controller to a state or county
 * @param controllerId ID of the controller to attach
 * @param entityType Type of entity (state or county)
 * @param entityId ID of the entity
 * @param configuration Controller configuration specific to this entity
 * @returns Success status
 */
export const attachController = async (controllerId: string, entityType: 'state' | 'county', entityId: string, configuration: any) => {
  try {
    const response = await axios.post(`${API_URL}/${entityType}s/${entityId}/controllers`, {
      controllerId,
      configuration
    });
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error(`Error attaching controller to ${entityType}:`, error);
    return {
      success: false,
      message: `Failed to attach controller to ${entityType}`
    };
  }
};

/**
 * Updates controller documentation
 * @param controllerId ID of the controller
 * @param documentationData Documentation update data
 * @returns Success status
 */
export const updateControllerDocumentation = async (controllerId: string, documentationData: any) => {
  try {
    const response = await axios.patch(`${API_URL}/controllers/${controllerId}/documentation`, documentationData);
    return {
      success: true,
      ...response.data
    };
  } catch (error) {
    console.error('Error updating controller documentation:', error);
    return {
      success: false,
      message: 'Failed to update controller documentation'
    };
  }
}; 