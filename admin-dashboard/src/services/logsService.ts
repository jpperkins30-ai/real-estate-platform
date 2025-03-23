/**
 * Logs Service
 * Provides methods for interacting with the logs API
 */

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Get log statistics with filtering options
 */
export const getLogStats = async (filters: LogFilters) => {
  try {
    // Construct query params
    const params = new URLSearchParams();
    if (filters.level && filters.level !== 'All Levels') params.append('level', filters.level);
    if (filters.collection && filters.collection !== 'All Collections') params.append('collection', filters.collection);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.message) params.append('message', filters.message);
    if (filters.dateRange.start) params.append('startDate', filters.dateRange.start);
    if (filters.dateRange.end) params.append('endDate', filters.dateRange.end);
    
    const response = await axios.get(`${API_URL}/logs/stats`, { 
      params,
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching log statistics:', error);
    throw error;
  }
};

/**
 * Search logs with filtering options
 */
export const searchLogs = async (filters: LogFilters, limit = 100) => {
  try {
    // Construct query params
    const params = new URLSearchParams();
    if (filters.level && filters.level !== 'All Levels') params.append('level', filters.level);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.message) params.append('message', filters.message);
    if (filters.dateRange.start) params.append('date', filters.dateRange.start);
    params.append('limit', limit.toString());
    
    const response = await axios.get(`${API_URL}/logs/search`, { 
      params,
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error searching logs:', error);
    throw error;
  }
};

/**
 * Get list of available log files
 */
export const getLogFiles = async () => {
  try {
    const response = await axios.get(`${API_URL}/logs/files`, {
      headers: {
        'Authorization': `Bearer ${getToken()}`
      }
    });
    
    return response.data.files;
  } catch (error) {
    console.error('Error fetching log files:', error);
    throw error;
  }
};

/**
 * Download a specific log file
 */
export const downloadLogFile = (filename: string) => {
  const token = getToken();
  window.open(`${API_URL}/logs/download/${filename}?token=${token}`, '_blank');
};

/**
 * Helper to get authentication token from local storage
 */
const getToken = (): string => {
  return localStorage.getItem('authToken') || '';
};

/**
 * Types
 */
export interface LogFilters {
  level: string;
  collection: string;
  userId: string;
  message: string;
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

export interface LogStats {
  dailyData: DailyLogData[];
  levelDistribution: { name: string; value: number }[];
  topErrors: { message: string; count: number }[];
  totalEntries: number;
  collectionMetrics: { name: string; operations: number }[];
}

export interface DailyLogData {
  date: string;
  total: number;
}

export interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
  meta?: any;
  userId?: string;
  source?: string;
} 