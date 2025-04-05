import { LayoutConfig } from '../types/layout.types';
import { getLocalPreferences } from './preferencesService';
import layoutApi from '../api/layoutApi';

/**
 * Fetch all available layouts from the server or local storage
 * @param includePublic Whether to include public layouts in the result
 * @returns Promise<LayoutConfig[]> The available layouts
 */
export async function fetchLayouts(includePublic: boolean = false): Promise<LayoutConfig[]> {
  try {
    // Attempt to fetch from server using the API
    const layouts = await layoutApi.getLayouts(includePublic);
    return layouts;
  } catch (error) {
    console.error('Error fetching layouts:', error);
    
    // If server request fails, check local storage
    return getLocalLayouts(includePublic);
  }
}

/**
 * Get a specific layout by ID
 * @param id Layout ID to fetch
 * @returns Promise<LayoutConfig> The layout if found
 */
export async function fetchLayout(id: string): Promise<LayoutConfig | null> {
  try {
    // Attempt to fetch from server using the API
    const layout = await layoutApi.getLayout(id);
    return layout;
  } catch (error) {
    console.error(`Error fetching layout with ID ${id}:`, error);
    
    // If server request fails, check local storage
    const layouts = getLocalLayouts(true);
    return layouts.find(layout => layout.id === id) || null;
  }
}

/**
 * Save a layout to the server or local storage
 * @param layout The layout configuration to save
 * @returns Promise<LayoutConfig> The saved layout with any server-side modifications
 */
export async function saveLayout(layout: LayoutConfig): Promise<LayoutConfig> {
  try {
    // If the layout has an ID, update it. Otherwise create a new one.
    let savedLayout;
    if (layout.id) {
      savedLayout = await layoutApi.updateLayout(layout.id, layout);
    } else {
      savedLayout = await layoutApi.createLayout(layout);
    }
    
    // Save to local storage as well
    saveLocalLayout(savedLayout);
    
    return savedLayout;
  } catch (error) {
    console.error('Error saving layout:', error);
    
    // If server request fails, save to local storage only
    const savedLayout = saveLocalLayout(layout);
    return savedLayout;
  }
}

/**
 * Delete a layout from the server and local storage
 * @param id Layout ID to delete
 * @returns Promise<boolean> Whether the deletion was successful
 */
export async function deleteLayout(id: string): Promise<boolean> {
  try {
    // Attempt to delete from server using the API
    await layoutApi.deleteLayout(id);
    
    // Also remove from local storage
    deleteLocalLayout(id);
    
    return true;
  } catch (error) {
    console.error(`Error deleting layout with ID ${id}:`, error);
    
    // If server request fails, remove from local storage at least
    deleteLocalLayout(id);
    
    return false;
  }
}

/**
 * Clone a layout
 * @param id Layout ID to clone
 * @param name Name for the new layout
 * @returns Promise<LayoutConfig> The cloned layout
 */
export async function cloneLayout(id: string, name: string): Promise<LayoutConfig | null> {
  try {
    // Attempt to clone using the API
    const clonedLayout = await layoutApi.cloneLayout(id, name);
    
    // Save to local storage as well
    saveLocalLayout(clonedLayout);
    
    return clonedLayout;
  } catch (error) {
    console.error(`Error cloning layout with ID ${id}:`, error);
    
    // If API request fails, try to clone locally
    const layout = await fetchLayout(id);
    if (!layout) return null;
    
    const clonedLayout: LayoutConfig = {
      ...layout,
      id: undefined, // Remove ID to create a new one
      name: name,
      isDefault: false, // Clone is never the default
    };
    
    return saveLayout(clonedLayout);
  }
}

/**
 * Get layouts from local storage
 */
function getLocalLayouts(includePublic: boolean = false): LayoutConfig[] {
  try {
    // Get user preferences which includes layouts
    const prefs = getLocalPreferences();
    const storedLayouts = localStorage.getItem('userLayouts');
    
    if (!storedLayouts) {
      return [];
    }
    
    const layouts: LayoutConfig[] = JSON.parse(storedLayouts);
    
    // Filter based on includePublic flag
    if (!includePublic) {
      return layouts.filter(layout => !layout.isPublic);
    }
    
    return layouts;
  } catch (error) {
    console.error('Error retrieving layouts from local storage:', error);
    return [];
  }
}

/**
 * Save a layout to local storage
 */
function saveLocalLayout(layout: LayoutConfig): LayoutConfig {
  try {
    // Create a new layout ID if one doesn't exist
    const layoutToSave = { 
      ...layout,
      id: layout.id || `layout-${Date.now()}`,
      updatedAt: new Date().toISOString()
    };
    
    // Get existing layouts
    const storedLayouts = localStorage.getItem('userLayouts');
    let layouts: LayoutConfig[] = storedLayouts ? JSON.parse(storedLayouts) : [];
    
    // Replace if exists, otherwise add
    const existingIndex = layouts.findIndex(l => l.id === layoutToSave.id);
    if (existingIndex >= 0) {
      layouts[existingIndex] = layoutToSave;
    } else {
      layouts.push({
        ...layoutToSave,
        createdAt: new Date().toISOString()
      });
    }
    
    // Save back to local storage
    localStorage.setItem('userLayouts', JSON.stringify(layouts));
    
    return layoutToSave;
  } catch (error) {
    console.error('Error saving layout to local storage:', error);
    return layout;
  }
}

/**
 * Delete a layout from local storage
 */
function deleteLocalLayout(id: string): void {
  try {
    const storedLayouts = localStorage.getItem('userLayouts');
    if (!storedLayouts) return;
    
    const layouts: LayoutConfig[] = JSON.parse(storedLayouts);
    const filteredLayouts = layouts.filter(layout => layout.id !== id);
    
    localStorage.setItem('userLayouts', JSON.stringify(filteredLayouts));
  } catch (error) {
    console.error(`Error deleting layout ${id} from local storage:`, error);
  }
} 