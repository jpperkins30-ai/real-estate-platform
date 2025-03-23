import api from './api';
import { DashboardStats, TimeRange, AnalyticsData, RevenueDataPoint, PropertyTypeData, UserActivityData, TopProperty } from './types';

export interface AnalyticsResponse {
  data: AnalyticsData;
}

export const analyticsService = {
  async getDashboardStats(): Promise<{ stats: DashboardStats }> {
    try {
      const response = await fetch('/api/analytics/dashboard-stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  async getAnalytics(timeRange: TimeRange): Promise<AnalyticsData> {
    try {
      const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  },

  async getRevenueData(timeRange: TimeRange): Promise<RevenueDataPoint[]> {
    try {
      const response = await fetch(`/api/analytics/revenue?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch revenue data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      throw error;
    }
  },

  async getPropertyTypes(): Promise<PropertyTypeData[]> {
    try {
      const response = await fetch('/api/analytics/property-types');
      if (!response.ok) {
        throw new Error('Failed to fetch property types');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching property types:', error);
      throw error;
    }
  },

  async getUserActivity(timeRange: TimeRange): Promise<UserActivityData[]> {
    try {
      const response = await fetch(`/api/analytics/user-activity?timeRange=${timeRange}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user activity');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  },

  async getTopProperties(limit: number = 5): Promise<TopProperty[]> {
    try {
      const response = await fetch(`/api/analytics/top-properties?limit=${limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch top properties');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching top properties:', error);
      throw error;
    }
  },
}; 