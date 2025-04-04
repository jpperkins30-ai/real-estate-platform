import { FilterSet, PropertyFilter, GeographicFilter, FilterConfig } from '../types/filter.types';

// Storage keys
const STORAGE_KEY_ACTIVE_FILTERS = 'activeFilters';
const STORAGE_KEY_FILTER_PRESETS = 'filterPresets';
const STORAGE_VERSION = 'v1'; // For future migration support

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
 * Save filters to local storage with error handling and versioning
 */
export function saveFiltersToStorage(filters: FilterSet): void {
  try {
    const versionedFilters = {
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
      data: filters
    };
    
    localStorage.setItem(STORAGE_KEY_ACTIVE_FILTERS, JSON.stringify(versionedFilters));
  } catch (error) {
    console.error('Error saving filters to storage:', error);
    
    // Fallback to sessionStorage if localStorage fails
    try {
      const versionedFilters = {
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        data: filters
      };
      
      sessionStorage.setItem(STORAGE_KEY_ACTIVE_FILTERS, JSON.stringify(versionedFilters));
    } catch (fallbackError) {
      console.error('Error saving filters to fallback storage:', fallbackError);
    }
  }
}

/**
 * Load filters from storage with error handling and version checking
 */
export function loadFiltersFromStorage(): FilterSet | null {
  try {
    // Try localStorage first
    let storedFilters = localStorage.getItem(STORAGE_KEY_ACTIVE_FILTERS);
    
    // If not in localStorage, try sessionStorage as fallback
    if (!storedFilters) {
      storedFilters = sessionStorage.getItem(STORAGE_KEY_ACTIVE_FILTERS);
    }
    
    if (storedFilters) {
      const parsedData = JSON.parse(storedFilters);
      
      // Check if data is in versioned format
      if (parsedData && parsedData.version && parsedData.data) {
        // Return the data portion of versioned format
        return parsedData.data as FilterSet;
      } else {
        // Handle legacy data format (direct FilterSet)
        return parsedData as FilterSet;
      }
    }
  } catch (error) {
    console.error('Error loading filters from storage:', error);
  }
  
  return null;
}

/**
 * Save filter presets to local storage with error handling and versioning
 */
export function saveFilterPresetsToStorage(presets: FilterConfig[]): void {
  try {
    const versionedPresets = {
      version: STORAGE_VERSION,
      updatedAt: new Date().toISOString(),
      data: presets
    };
    
    localStorage.setItem(STORAGE_KEY_FILTER_PRESETS, JSON.stringify(versionedPresets));
  } catch (error) {
    console.error('Error saving filter presets to storage:', error);
    
    // Fallback to sessionStorage
    try {
      const versionedPresets = {
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString(),
        data: presets
      };
      
      sessionStorage.setItem(STORAGE_KEY_FILTER_PRESETS, JSON.stringify(versionedPresets));
    } catch (fallbackError) {
      console.error('Error saving filter presets to fallback storage:', fallbackError);
    }
  }
}

/**
 * Load filter presets from storage with error handling and version checking
 */
export function loadFilterPresetsFromStorage(): FilterConfig[] {
  try {
    // Try localStorage first
    let storedPresets = localStorage.getItem(STORAGE_KEY_FILTER_PRESETS);
    
    // If not in localStorage, try sessionStorage as fallback
    if (!storedPresets) {
      storedPresets = sessionStorage.getItem(STORAGE_KEY_FILTER_PRESETS);
    }
    
    if (storedPresets) {
      const parsedData = JSON.parse(storedPresets);
      
      // Check if data is in versioned format
      if (parsedData && parsedData.version && parsedData.data) {
        // Return the data portion of versioned format
        return parsedData.data as FilterConfig[];
      } else {
        // Handle legacy data format (direct array)
        return parsedData as FilterConfig[];
      }
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
    sessionStorage.removeItem(STORAGE_KEY_ACTIVE_FILTERS); // Clean up potential fallback
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
  }
  catch (error) {
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
    isDefault: false,
    version: 1 // Initialize with version 1
  };
}

/**
 * Update a filter configuration with version control
 */
export function updateFilterConfig(
  config: FilterConfig,
  updates: Partial<Omit<FilterConfig, 'id' | 'createdAt' | 'version'>>
): FilterConfig {
  return {
    ...config,
    ...updates,
    updatedAt: new Date().toISOString(),
    version: (config.version || 0) + 1 // Increment version number
  };
}

/**
 * Check for filter configuration conflicts
 * @returns true if conflict exists
 */
export function hasFilterConfigConflict(
  localConfig: FilterConfig,
  remoteConfig: FilterConfig
): boolean {
  if (!localConfig || !remoteConfig) {
    return false;
  }
  
  // Check if the remote version is newer
  return (remoteConfig.version || 0) > (localConfig.version || 0);
}

/**
 * Merge filter configurations with conflict resolution
 * Takes the newer version but preserves local customizations
 */
export function mergeFilterConfigs(
  localConfig: FilterConfig,
  remoteConfig: FilterConfig
): FilterConfig {
  // If remote is newer, use it as the base
  const baseConfig = hasFilterConfigConflict(localConfig, remoteConfig) 
    ? remoteConfig 
    : localConfig;
    
  // Create a new config with the highest version number
  return {
    ...baseConfig,
    version: Math.max(
      localConfig.version || 0, 
      remoteConfig.version || 0
    ) + 1,
    updatedAt: new Date().toISOString()
  };
}

/**
 * Backup current filters to separate storage
 */
export function backupFilters(): string {
  try {
    const activeFilters = loadFiltersFromStorage();
    const backupId = `filter-backup-${Date.now()}`;
    
    if (activeFilters) {
      const backup = {
        id: backupId,
        timestamp: new Date().toISOString(),
        filters: activeFilters
      };
      
      localStorage.setItem(`${STORAGE_KEY_ACTIVE_FILTERS}_backup_${backupId}`, JSON.stringify(backup));
      return backupId;
    }
  } catch (error) {
    console.error('Error backing up filters:', error);
  }
  
  return '';
}

/**
 * Restore filters from backup
 */
export function restoreFiltersFromBackup(backupId: string): boolean {
  try {
    const backupKey = `${STORAGE_KEY_ACTIVE_FILTERS}_backup_${backupId}`;
    const backupData = localStorage.getItem(backupKey);
    
    if (backupData) {
      const backup = JSON.parse(backupData);
      
      if (backup && backup.filters) {
        saveFiltersToStorage(backup.filters);
        return true;
      }
    }
  } catch (error) {
    console.error('Error restoring filters from backup:', error);
  }
  
  return false;
}

/**
 * Validate filter configuration to prevent corrupted filters
 */
export function validateFilterConfig(config: FilterConfig): boolean {
  // Basic validation
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  // Check required fields
  if (!config.id || !config.name || !config.filters) {
    return false;
  }
  
  // Check that filters field is an object
  if (typeof config.filters !== 'object') {
    return false;
  }
  
  return true;
} 