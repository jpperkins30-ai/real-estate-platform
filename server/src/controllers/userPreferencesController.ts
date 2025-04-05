import { Request, Response } from 'express';
import { UserPreferences } from '../models/UserPreferences';

// Default preferences
const DEFAULT_PREFERENCES = {
  themePreferences: {
    colorMode: 'system',
    mapStyle: 'standard',
    fontSize: 'medium'
  },
  filterPreferences: {
    defaultFilters: {},
    showFilterPanel: true,
    applyFiltersAutomatically: true
  },
  panelPreferences: new Map([
    ['defaultContentTypes', {
      'top-left': 'map',
      'top-right': 'state',
      'bottom-left': 'county',
      'bottom-right': 'property'
    }]
  ])
};

/**
 * Get user preferences
 */
export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    
    let preferences = await UserPreferences.findOne({ userId });
    
    if (!preferences) {
      // Create default preferences if none exist
      preferences = new UserPreferences({
        userId,
        ...DEFAULT_PREFERENCES
      });
      
      await preferences.save();
    }
    
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    
    let preferences = await UserPreferences.findOne({ userId });
    
    if (!preferences) {
      // Create preferences if they don't exist
      preferences = new UserPreferences({
        userId,
        ...DEFAULT_PREFERENCES,
        ...req.body
      });
    } else {
      // Update existing preferences
      Object.entries(req.body).forEach(([key, value]) => {
        // @ts-ignore
        preferences[key] = value;
      });
    }
    
    await preferences.save();
    
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Reset user preferences to defaults
 */
export const resetUserPreferences = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    
    // Delete existing preferences
    await UserPreferences.findOneAndDelete({ userId });
    
    // Create new default preferences
    const preferences = new UserPreferences({
      userId,
      ...DEFAULT_PREFERENCES
    });
    
    await preferences.save();
    
    res.status(200).json(preferences);
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 