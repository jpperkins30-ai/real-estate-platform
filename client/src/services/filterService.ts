import { FilterSet, PropertyFilter, GeographicFilter, FilterConfig } from '../types/filter.types';

// Storage keys
const STORAGE_KEY_ACTIVE_FILTERS = 'activeFilters';
const STORAGE_KEY_FILTER_PRESETS = 'filterPresets';

/**
 * Apply filters to data with improved type safety and error handling
 */
export function applyFiltersToData<T extends Record<string, any>>(data: T[], filters: FilterSet): T[] {
  if (!filters || Object.keys(filters).length === 0) {
    return data;
  }
  
  try {
    return data.filter(item => {
      // Apply property filters
      if (filters.property && Object.keys(filters.property).length > 0) {
        if (!isItemMatchingPropertyFilters(item, filters.property)) {
          return false;
        }
      }
      
      // Apply geographic filters
      if (filters.geographic && Object.keys(filters.geographic).length > 0) {
        if (!isItemMatchingGeographicFilters(item, filters.geographic)) {
          return false;
        }
      }
      
      // Item passed all filters
      return true;
    });
  } catch (error) {
    console.error('Error applying filters to data:', error);
    return data; // Return original data on error
  }
}

/**
 * Check if an item matches property filters
 */
function isItemMatchingPropertyFilters<T extends Record<string, any>>(
  item: T, 
  propertyFilters: PropertyFilter
): boolean {
  // Property type filter
  if (propertyFilters.propertyType && 'propertyType' in item) {
    const itemType = item.propertyType;
    
    if (Array.isArray(propertyFilters.propertyType)) {
      if (!propertyFilters.propertyType.includes(itemType)) {
        return false;
      }
    } else if (propertyFilters.propertyType !== 'all' && propertyFilters.propertyType !== itemType) {
      return false;
    }
  }
  
  // Price range filter
  if (propertyFilters.priceRange && 'price' in item) {
    const [min, max] = propertyFilters.priceRange;
    const itemPrice = Number(item.price);
    
    if (isNaN(itemPrice) || itemPrice < min || itemPrice > max) {
      return false;
    }
  }
  
  // Bedrooms filter
  if (propertyFilters.bedrooms && 'bedrooms' in item) {
    const itemBedrooms = Number(item.bedrooms);
    
    if (isNaN(itemBedrooms) || (propertyFilters.bedrooms !== 'any' && itemBedrooms < Number(propertyFilters.bedrooms))) {
      return false;
    }
  }
  
  // Bathrooms filter
  if (propertyFilters.bathrooms && 'bathrooms' in item) {
    const itemBathrooms = Number(item.bathrooms);
    
    if (isNaN(itemBathrooms) || (propertyFilters.bathrooms !== 'any' && itemBathrooms < Number(propertyFilters.bathrooms))) {
      return false;
    }
  }
  
  // Square feet filter
  if (propertyFilters.squareFeet && 'squareFeet' in item) {
    const [min, max] = propertyFilters.squareFeet;
    const itemSquareFeet = Number(item.squareFeet);
    
    if (isNaN(itemSquareFeet) || itemSquareFeet < min || itemSquareFeet > max) {
      return false;
    }
  }
  
  // Zoning filter
  if (propertyFilters.zoning && 'zoning' in item) {
    const itemZoning = item.zoning;
    
    if (propertyFilters.zoning !== 'all' && propertyFilters.zoning !== itemZoning) {
      return false;
    }
  }
  
  // Sale type filter
  if (propertyFilters.saleType && 'saleType' in item) {
    const itemSaleType = item.saleType;
    
    if (propertyFilters.saleType !== 'all' && propertyFilters.saleType !== itemSaleType) {
      return false;
    }
  }
  
  // Item passed all property filters
  return true;
}

/**
 * Check if an item matches geographic filters
 */
function isItemMatchingGeographicFilters<T extends Record<string, any>>(
  item: T, 
  geoFilters: GeographicFilter
): boolean {
  // State filter
  if (geoFilters.state && 'state' in item) {
    const itemState = item.state;
    
    if (geoFilters.state !== itemState) {
      return false;
    }
  }
  
  // County filter
  if (geoFilters.county && 'county' in item) {
    const itemCounty = item.county;
    
    if (geoFilters.county !== itemCounty) {
      return false;
    }
  }
  
  // City filter
  if (geoFilters.city && 'city' in item) {
    const itemCity = item.city;
    
    if (geoFilters.city !== itemCity) {
      return false;
    }
  }
  
  // Zip code filter
  if (geoFilters.zipCode && 'zipCode' in item) {
    const itemZipCode = item.zipCode;
    
    if (geoFilters.zipCode !== itemZipCode) {
      return false;
    }
  }
  
  // Item passed all geographic filters
  return true;
}

/**
 * Save filters to local storage with error handling
 */
export function saveFiltersToStorage(filters: FilterSet): void {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE_FILTERS, JSON.stringify(filters));
  } catch (error) {
    console.error('Error saving filters to storage:', error);
  }
}

/**
 * Load filters from local storage with error handling
 */
export function loadFiltersFromStorage(): FilterSet | null {
  try {
    const storedFilters = localStorage.getItem(STORAGE_KEY_ACTIVE_FILTERS);
    
    if (storedFilters) {
      return JSON.parse(storedFilters) as FilterSet;
    }
  } catch (error) {
    console.error('Error loading filters from storage:', error);
  }
  
  return null;
}

/**
 * Save filter presets to local storage with error handling
 */
export function saveFilterPresetsToStorage(presets: FilterConfig[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FILTER_PRESETS, JSON.stringify(presets));
  } catch (error) {
    console.error('Error saving filter presets to storage:', error);
  }
}

/**
 * Load filter presets from local storage with error handling
 */
export function loadFilterPresetsFromStorage(): FilterConfig[] {
  try {
    const storedPresets = localStorage.getItem(STORAGE_KEY_FILTER_PRESETS);
    
    if (storedPresets) {
      return JSON.parse(storedPresets) as FilterConfig[];
    }
  } catch (error) {
    console.error('Error loading filter presets from storage:', error);
  }
  
  return [];
}

/**
 * Clear all filters from storage
 */
export function clearAllFiltersFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_FILTERS);
  } catch (error) {
    console.error('Error clearing filters from storage:', error);
  }
}

/**
 * Get unique values for a field from a dataset
 * Useful for populating filter dropdown options
 */
export function getUniqueFieldValues<T extends Record<string, any>>(
  data: T[], 
  field: keyof T
): Array<T[keyof T]> {
  try {
    const values = new Set<T[keyof T]>();
    
    data.forEach(item => {
      if (item[field] !== undefined && item[field] !== null) {
        values.add(item[field]);
      }
    });
    
    return Array.from(values);
  } catch (error) {
    console.error(`Error getting unique values for field ${String(field)}:`, error);
    return [];
  }
}

/**
 * Create a filter configuration from the current filters
 */
export function createFilterConfig(
  name: string,
  filters: FilterSet,
  description?: string
): Omit<FilterConfig, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name,
    description: description || `Filter created on ${new Date().toLocaleDateString()}`,
    filters,
    isDefault: false
  };
} 