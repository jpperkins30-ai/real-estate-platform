import { PanelContentType } from './layout.types';

export interface PropertyFilter {
  propertyType?: string | string[];
  priceRange?: [number, number];
  bedrooms?: string | number;
  bathrooms?: string | number;
  squareFeet?: [number, number];
  zoning?: string;
  saleType?: string;
  [key: string]: any;
}

export interface GeographicFilter {
  state?: string;
  county?: string;
  city?: string;
  zipCode?: string;
  [key: string]: any;
}

export interface FilterSet {
  property?: PropertyFilter;
  geographic?: GeographicFilter;
  [key: string]: any;
}

export interface FilterConfig {
  id: string;
  name: string;
  description?: string;
  filters: FilterSet;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
  version?: number;
}

// Keep existing types for backward compatibility and internal use
export type FilterOperator = 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'in' | 'notIn';

export interface FilterValue {
  value: any;
  operator: FilterOperator;
}

export interface Filter {
  id: string;
  field: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'range';
  value: FilterValue;
  options?: Array<{ label: string; value: any }>;
  isActive: boolean;
  panelId: string;
  contentType: PanelContentType;
}

export interface FilterState {
  filters: Filter[];
  activeFilters: Filter[];
  selectedCounties: string[];
  selectedStates: string[];
  filterConfigs: FilterConfig[];
  currentFilterConfig?: FilterConfig;
}

export interface FilterContextType {
  filterState: FilterState;
  addFilter: (filter: Filter) => void;
  removeFilter: (filterId: string) => void;
  updateFilter: (filterId: string, updates: Partial<Filter>) => void;
  toggleFilter: (filterId: string) => void;
  setSelectedCounties: (counties: string[]) => void;
  setSelectedStates: (states: string[]) => void;
  clearFilters: () => void;
  clearCountyFilters: () => void;
  clearStateFilters: () => void;
  // New methods for filter configs
  saveFilterConfig: (config: FilterConfig) => void;
  loadFilterConfig: (configId: string) => void;
  deleteFilterConfig: (configId: string) => void;
  setDefaultFilterConfig: (configId: string) => void;
} 