import axios, { AxiosRequestConfig } from 'axios';
import { logError } from './errorService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    logError(error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log all errors
    logError(error);

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    
    // Handle token expiration (refresh token logic would go here)
    if (error.response?.data?.code === 'AUTH_INVALID_TOKEN') {
      // Clear token and redirect to login
      localStorage.removeItem('adminToken');
      window.location.href = '/login?expired=true';
    }

    return Promise.reject(error);
  }
);

// Helper methods with better error handling
export const apiService = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default api; 