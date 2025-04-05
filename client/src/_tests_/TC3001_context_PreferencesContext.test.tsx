import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PreferencesProvider, PreferencesContext } from '../context/PreferencesContext';
import * as preferencesService from '../services/preferencesService';

// Mock preferences service
vi.mock('../services/preferencesService', () => ({
  fetchUserPreferences: vi.fn(),
  saveUserPreferences: vi.fn(),
  resetUserPreferences: vi.fn()
}));

// Test component to consume context
const TestConsumer = () => {
  const context = React.useContext(PreferencesContext);
  
  if (!context) {
    return <div>No context available</div>;
  }
  
  const { preferences, loading, error, updatePreference } = context;
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && !error && (
        <>
          <div data-testid="color-mode">{preferences.theme.colorMode}</div>
          <button 
            onClick={() => updatePreference('theme', 'colorMode', 'dark')}
            data-testid="update-button"
          >
            Update Theme
          </button>
        </>
      )}
    </div>
  );
};

describe('PreferencesContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('TC3001: loads preferences on mount', async () => {
    // Mock fetch response
    (preferencesService.fetchUserPreferences as any).mockResolvedValue({
      theme: { colorMode: 'light', mapStyle: 'standard' },
      panel: { showPanelHeader: true },
      layout: { defaultLayout: 'quad' },
      filter: { showFilterPanel: true }
    });
    
    render(
      <PreferencesProvider>
        <TestConsumer />
      </PreferencesProvider>
    );
    
    // Should show loading first
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Wait for preferences to load
    await waitFor(() => {
      expect(screen.getByTestId('color-mode')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');
    expect(preferencesService.fetchUserPreferences).toHaveBeenCalledTimes(1);
  });
  
  it('TC3002: updates preference when called', async () => {
    // Mock fetch and save responses
    (preferencesService.fetchUserPreferences as any).mockResolvedValue({
      theme: { colorMode: 'light', mapStyle: 'standard' },
      panel: { showPanelHeader: true },
      layout: { defaultLayout: 'quad' },
      filter: { showFilterPanel: true }
    });
    
    (preferencesService.saveUserPreferences as any).mockResolvedValue({
      theme: { colorMode: 'dark', mapStyle: 'standard' },
      panel: { showPanelHeader: true },
      layout: { defaultLayout: 'quad' },
      filter: { showFilterPanel: true }
    });
    
    render(
      <PreferencesProvider>
        <TestConsumer />
      </PreferencesProvider>
    );
    
    // Wait for preferences to load
    await waitFor(() => {
      expect(screen.getByTestId('color-mode')).toBeInTheDocument();
    });
    
    // Verify initial value
    expect(screen.getByTestId('color-mode')).toHaveTextContent('light');
    
    // Update preference
    act(() => {
      screen.getByTestId('update-button').click();
    });
    
    // Wait for update to complete
    await waitFor(() => {
      expect(screen.getByTestId('color-mode')).toHaveTextContent('dark');
    });
    
    expect(preferencesService.saveUserPreferences).toHaveBeenCalledTimes(1);
  });
}); 