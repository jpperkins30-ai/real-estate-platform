import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  savePanelState, 
  loadPanelState, 
  deletePanelState 
} from 'src/services/panelStateService';
import { PanelContentType } from '../../types/layout.types';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

// Mock sessionStorage
const mockSessionStorage = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    length: 0,
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

describe('panelStateService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockLocalStorage.clear();
    mockSessionStorage.clear();
    
    // Replace global storage with mocks
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
    Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
  });
  
  describe('savePanelState', () => {
    it('saves panel state to localStorage', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      const result = savePanelState(panelId, contentType, state);
      
      // Check storage key format
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        `panelState_${panelId}`,
        expect.any(String)
      );
      
      // Check result
      expect(result).toHaveProperty('id', panelId);
      expect(result).toHaveProperty('contentType', contentType);
      expect(result).toHaveProperty('state', state);
      expect(result).toHaveProperty('lastUpdated');
      expect(result).toHaveProperty('version', 1);
    });
    
    it('saves panel state to sessionStorage when requested', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      const result = savePanelState(panelId, contentType, state, 1, true);
      
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        `panelState_${panelId}`,
        expect.any(String)
      );
      
      expect(result).toHaveProperty('id', panelId);
    });
    
    it('handles version conflicts by incrementing version', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      // Mock an existing state with higher version
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(JSON.stringify({
        id: panelId,
        contentType,
        state,
        lastUpdated: new Date().toISOString(),
        version: 5
      }));
      
      const result = savePanelState(panelId, contentType, state, 1);
      
      // Version should be incremented to 6
      expect(result).toHaveProperty('version', 6);
    });
    
    it('falls back to sessionStorage if localStorage fails', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      // Make localStorage.setItem throw an error
      vi.mocked(mockLocalStorage.setItem).mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      savePanelState(panelId, contentType, state);
      
      // Should fall back to sessionStorage
      expect(mockSessionStorage.setItem).toHaveBeenCalled();
    });
  });
  
  describe('loadPanelState', () => {
    it('loads panel state from localStorage', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      const savedState = {
        id: panelId,
        contentType,
        state,
        lastUpdated: new Date().toISOString(),
        version: 1
      };
      
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(JSON.stringify(savedState));
      
      const result = loadPanelState(panelId);
      
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(`panelState_${panelId}`);
      expect(result).toEqual(savedState);
    });
    
    it('loads panel state from sessionStorage if specified', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      const savedState = {
        id: panelId,
        contentType,
        state,
        lastUpdated: new Date().toISOString(),
        version: 1
      };
      
      vi.mocked(mockSessionStorage.getItem).mockReturnValue(JSON.stringify(savedState));
      
      const result = loadPanelState(panelId, true);
      
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith(`panelState_${panelId}`);
      expect(result).toEqual(savedState);
    });
    
    it('returns null when state is not found', () => {
      const panelId = 'test-panel';
      
      vi.mocked(mockLocalStorage.getItem).mockReturnValue(null);
      vi.mocked(mockSessionStorage.getItem).mockReturnValue(null);
      
      const result = loadPanelState(panelId);
      
      expect(result).toBeNull();
    });
    
    it('handles JSON parse errors', () => {
      const panelId = 'test-panel';
      
      vi.mocked(mockLocalStorage.getItem).mockReturnValue('invalid json');
      
      const result = loadPanelState(panelId);
      
      expect(result).toBeNull();
    });
    
    it('checks sessionStorage if localStorage fails', () => {
      const panelId = 'test-panel';
      const contentType = 'map' as PanelContentType;
      const state = { position: { x: 100, y: 200 } };
      
      // Make localStorage.getItem throw an error
      vi.mocked(mockLocalStorage.getItem).mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      const savedState = {
        id: panelId,
        contentType,
        state,
        lastUpdated: new Date().toISOString(),
        version: 1
      };
      
      vi.mocked(mockSessionStorage.getItem).mockReturnValue(JSON.stringify(savedState));
      
      const result = loadPanelState(panelId);
      
      // Should check sessionStorage
      expect(mockSessionStorage.getItem).toHaveBeenCalled();
      expect(result).toEqual(savedState);
    });
  });
  
  describe('deletePanelState', () => {
    it('deletes panel state from localStorage', () => {
      const panelId = 'test-panel';
      
      deletePanelState(panelId);
      
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith(`panelState_${panelId}`);
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(`panelState_${panelId}`);
    });
    
    it('deletes panel state from sessionStorage only when specified', () => {
      const panelId = 'test-panel';
      
      deletePanelState(panelId, true);
      
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(`panelState_${panelId}`);
    });
    
    it('handles errors during deletion', () => {
      const panelId = 'test-panel';
      
      // Make localStorage.removeItem throw an error
      vi.mocked(mockLocalStorage.removeItem).mockImplementation(() => {
        throw new Error('localStorage error');
      });
      
      // Should not throw
      expect(() => {
        deletePanelState(panelId);
      }).not.toThrow();
    });
  });
}); 

