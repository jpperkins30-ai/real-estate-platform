export type TimeRange = 'week' | 'month' | 'quarter' | 'year';

export interface DashboardStats {
  totalProperties: number;
  activeListings: number;
  totalUsers: number;
  monthlyRevenue: number;
  recentTransactions: Transaction[];
  activeUsers: number;
  growthRate: number;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'sale' | 'rental';
  propertyId: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface ChartData {
  name: string;
  value: number;
}

export interface PropertyStats {
  totalViews: number;
  favorited: number;
  inquiries: number;
}

export interface UserActivity {
  timestamp: string;
  action: string;
  details: string;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface PropertyTypeData {
  name: string;
  value: number;
}

export interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
  propertyViews: number;
}

export interface TopProperty {
  id: string;
  title: string;
  views: number;
  inquiries: number;
  price: number;
}

export interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  totalProperties: number;
  propertyGrowth: number;
  activeUsers: number;
  userGrowth: number;
  averagePrice: number;
  priceGrowth: number;
  revenueData: RevenueDataPoint[];
  propertyTypes: PropertyTypeData[];
  userActivity: UserActivityData[];
  topProperties: TopProperty[];
} 