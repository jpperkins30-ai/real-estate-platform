/**
 * API Service for communication with the backend
 */

const API_URL = 'http://localhost:4000/api';

/**
 * Helper function to make API requests
 */
async function apiRequest<T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  console.log(`Making ${method} request to: ${url}`);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    // Don't include credentials for now
    credentials: 'omit', 
  };

  // Add body for POST/PUT requests
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    console.log(`Fetching from ${url} with options:`, options);
    const response = await fetch(url, options);
    console.log(`Response status: ${response.status}`);
    
    // Handle non-2xx responses
    if (!response.ok) {
      // Try to parse error response
      const errorData = await response.json().catch(() => null);
      console.error('API error response:', errorData);
      throw new ApiError(
        response.statusText,
        response.status,
        errorData
      );
    }
    
    // For successful responses, parse JSON
    const result = await response.json();
    console.log('API success response:', result);
    return result as T;
  } catch (error) {
    console.error('API request error:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    // Handle network errors
    throw new ApiError(
      'Network error',
      0,
      { message: (error as Error).message }
    );
  }
}

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * API Service with methods for different endpoints
 */
export const api = {
  // Health check
  health: () => apiRequest<{ status: string }>('/health'),
  
  // States
  getStates: () => apiRequest<any[]>('/states'),
  getState: (id: string) => apiRequest<any>(`/states/${id}`),
  
  // Counties
  getCounties: (stateId: string) => apiRequest<any[]>(`/states/${stateId}/counties`),
  getCounty: (id: string) => apiRequest<any>(`/counties/${id}`),
  
  // Properties
  getProperties: (countyId: string, filters?: Record<string, any>) => {
    const queryParams = filters
      ? `?${new URLSearchParams(filters as Record<string, string>).toString()}`
      : '';
    return apiRequest<any[]>(`/counties/${countyId}/properties${queryParams}`);
  },
  getProperty: (id: string) => apiRequest<any>(`/properties/${id}`),
  
  // Generic CRUD operations
  create: <T>(endpoint: string, data: any) => apiRequest<T>(endpoint, 'POST', data),
  update: <T>(endpoint: string, id: string, data: any) => apiRequest<T>(`${endpoint}/${id}`, 'PUT', data),
  delete: <T>(endpoint: string, id: string) => apiRequest<T>(`${endpoint}/${id}`, 'DELETE'),
};

export default api; 