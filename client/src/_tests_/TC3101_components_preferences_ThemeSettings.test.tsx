import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeSettings } from '../components/preferences/ThemeSettings';
import { PreferencesContext, UserPreferences } from '../context/PreferencesContext';

// Mock react-colorful
vi.mock('react-colorful', () => ({
  HexColorPicker: ({ color, onChange }: { color: string, onChange: (color: string) => void }) => (
    <div data-testid="mock-color-picker">
      <span>Mock Color Picker: {color}</span>
      <button onClick={() => onChange('#ff0000')}>Change Color</button>
    </div>
  )
}));

// Mock preferences context
const mockUpdatePreference = vi.fn();
const mockPreferences: UserPreferences = {
  theme: {
    colorMode: 'light' as 'light' | 'dark' | 'system',
    mapStyle: 'standard' as 'standard' | 'satellite' | 'terrain',
    accentColor: '#2196f3',
    fontSize: 'medium' as 'small' | 'medium' | 'large'
  },
  panel: {
    defaultContentTypes: {},
    showPanelHeader: true,
    enablePanelResizing: true,
    enablePanelDragging: true
  },
  layout: {
    defaultLayout: 'quad',
    saveLayoutOnExit: true,
    rememberLastLayout: true
  },
  filter: {
    defaultFilters: {},
    showFilterPanel: true,
    applyFiltersAutomatically: true
  }
};

const mockContextValue = {
  preferences: mockPreferences,
  loading: false,
  error: null,
  updatePreference: mockUpdatePreference,
  resetPreferences: vi.fn()
};

const renderWithContext = (ui: React.ReactElement) => {
  return render(
    <PreferencesContext.Provider value={mockContextValue}>
      {ui}
    </PreferencesContext.Provider>
  );
};

describe('ThemeSettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('TC3101: renders color mode options correctly', () => {
    renderWithContext(<ThemeSettings />);
    
    expect(screen.getByText('Color Mode')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });
  
  it('TC3102: renders map style options correctly', () => {
    renderWithContext(<ThemeSettings />);
    
    expect(screen.getByText('Map Style')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByText('Satellite')).toBeInTheDocument();
    expect(screen.getByText('Terrain')).toBeInTheDocument();
  });
  
  it('TC3103: renders font size options correctly', () => {
    renderWithContext(<ThemeSettings />);
    
    expect(screen.getByText('Font Size')).toBeInTheDocument();
    expect(screen.getByText('Small')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Large')).toBeInTheDocument();
  });
  
  it('TC3104: updates color mode when option is clicked', () => {
    renderWithContext(<ThemeSettings />);
    
    // Click dark mode button
    fireEvent.click(screen.getByText('Dark'));
    
    expect(mockUpdatePreference).toHaveBeenCalledWith('theme', 'colorMode', 'dark');
  });
  
  it('TC3105: updates map style when option is clicked', () => {
    renderWithContext(<ThemeSettings />);
    
    // Click satellite style button
    fireEvent.click(screen.getByText('Satellite'));
    
    expect(mockUpdatePreference).toHaveBeenCalledWith('theme', 'mapStyle', 'satellite');
  });
  
  it('TC3106: updates font size when option is clicked', () => {
    renderWithContext(<ThemeSettings />);
    
    // Click large font size button
    fireEvent.click(screen.getByText('Large'));
    
    expect(mockUpdatePreference).toHaveBeenCalledWith('theme', 'fontSize', 'large');
  });
}); 