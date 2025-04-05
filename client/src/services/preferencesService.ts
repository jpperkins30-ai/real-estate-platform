import axios from 'axios';
import { UserPreferences, DEFAULT_PREFERENCES } from '../context/PreferencesContext';

/**
 * Fetch user preferences from server
 */
export async function fetchUserPreferences(): Promise<UserPreferences> {
  try {
    const response = await axios.get('/api/user/preferences');
    return response.data;
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    
    // Return default preferences if error occurs
    return getLocalPreferences();
  }
}

/**
 * Save user preferences to server
 */
export async function saveUserPreferences(preferences: UserPreferences): Promise<UserPreferences> {
  try {
    const response = await axios.put('/api/user/preferences', preferences);
    
    // Update local storage
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    return response.data;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    
    // Save to local storage as fallback
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    
    throw error;
  }
}

/**
 * Reset user preferences to defaults
 */
export async function resetUserPreferences(): Promise<UserPreferences> {
  try {
    const response = await axios.post('/api/user/preferences/reset');
    
    // Update local storage
    localStorage.setItem('userPreferences', JSON.stringify(DEFAULT_PREFERENCES));
    
    return response.data;
  } catch (error) {
    console.error('Error resetting user preferences:', error);
    
    // Reset local storage
    localStorage.setItem('userPreferences', JSON.stringify(DEFAULT_PREFERENCES));
    
    throw error;
  }
}

/**
 * Get preferences from local storage
 */
export function getLocalPreferences(): UserPreferences {
  const storedPreferences = localStorage.getItem('userPreferences');
  
  if (storedPreferences) {
    try {
      return JSON.parse(storedPreferences);
    } catch (error) {
      console.error('Error parsing stored preferences:', error);
    }
  }
  
  return DEFAULT_PREFERENCES;
} 