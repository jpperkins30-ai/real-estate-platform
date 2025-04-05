import axios from 'axios';
import { LayoutConfig } from '../types/layout.types';

// Use environment variable if available, otherwise default to localhost
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';

// Create Axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for authorization if needed
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Layout API endpoints
 */
export const layoutApi = {
  /**
   * Get all layouts
   * @param includePublic Whether to include public layouts
   * @returns Promise with array of layout configurations
   */
  getLayouts: async (includePublic: boolean = false): Promise<LayoutConfig[]> => {
    const response = await apiClient.get('/layouts', { 
      params: { isPublic: includePublic } 
    });
    return response.data;
  },
  
  /**
   * Get layout by ID
   * @param id Layout ID
   * @returns Promise with the layout configuration
   */
  getLayout: async (id: string): Promise<LayoutConfig> => {
    const response = await apiClient.get(`/layouts/${id}`);
    return response.data;
  },
  
  /**
   * Create new layout
   * @param layout Layout configuration to create
   * @returns Promise with the created layout
   */
  createLayout: async (layout: LayoutConfig): Promise<LayoutConfig> => {
    const response = await apiClient.post('/layouts', layout);
    return response.data;
  },
  
  /**
   * Update existing layout
   * @param id Layout ID
   * @param layout Updated layout configuration
   * @returns Promise with the updated layout
   */
  updateLayout: async (id: string, layout: LayoutConfig): Promise<LayoutConfig> => {
    const response = await apiClient.put(`/layouts/${id}`, layout);
    return response.data;
  },
  
  /**
   * Delete layout
   * @param id Layout ID to delete
   * @returns Promise indicating deletion success
   */
  deleteLayout: async (id: string): Promise<void> => {
    await apiClient.delete(`/layouts/${id}`);
  },
  
  /**
   * Clone an existing layout
   * @param id Layout ID to clone
   * @param name Name for the cloned layout
   * @returns Promise with the cloned layout
   */
  cloneLayout: async (id: string, name: string): Promise<LayoutConfig> => {
    const response = await apiClient.post(`/layouts/${id}/clone`, { name });
    return response.data;
  }
};

export default layoutApi; 