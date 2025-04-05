import React, { createContext, useReducer, useContext } from 'react';
import { LayoutType, PanelConfig } from '../types/layout.types';

// Define the state type
interface LayoutState {
  layoutType: LayoutType;
  panels: Record<string, PanelConfig>;
  panelOrder: string[]; // Maintain panel order
  isInitialized: boolean;
}

// Define action types
type LayoutAction = 
  | { type: 'SET_LAYOUT_TYPE'; payload: LayoutType }
  | { type: 'REGISTER_PANEL'; payload: PanelConfig }
  | { type: 'UNREGISTER_PANEL'; payload: string }
  | { type: 'UPDATE_PANEL_POSITION'; payload: { id: string; position: { row: number; col: number } } }
  | { type: 'UPDATE_PANEL_SIZE'; payload: { id: string; size: { width: number; height: number } } }
  | { type: 'REORDER_PANELS'; payload: string[] }
  | { type: 'LOAD_LAYOUT'; payload: { layoutType: LayoutType; panels: PanelConfig[] } };

// Initial state
const initialState: LayoutState = {
  layoutType: 'single',
  panels: {},
  panelOrder: [],
  isInitialized: false
};

// Create context
interface LayoutContextType {
  state: LayoutState;
  dispatch: React.Dispatch<LayoutAction>;
  setLayoutType: (type: LayoutType) => void;
  registerPanel: (panel: PanelConfig) => void;
  unregisterPanel: (id: string) => void;
  updatePanelPosition: (id: string, position: { row: number; col: number }) => void;
  updatePanelSize: (id: string, size: { width: number; height: number }) => void;
  reorderPanels: (panelOrder: string[]) => void;
  loadLayout: (layoutType: LayoutType, panels: PanelConfig[]) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

// Reducer function
function layoutReducer(state: LayoutState, action: LayoutAction): LayoutState {
  switch (action.type) {
    case 'SET_LAYOUT_TYPE':
      return {
        ...state,
        layoutType: action.payload
      };
    
    case 'REGISTER_PANEL': {
      const panel = action.payload;
      return {
        ...state,
        panels: {
          ...state.panels,
          [panel.id]: panel
        },
        panelOrder: state.panelOrder.includes(panel.id) 
          ? state.panelOrder 
          : [...state.panelOrder, panel.id]
      };
    }
    
    case 'UNREGISTER_PANEL': {
      const id = action.payload;
      const { [id]: removedPanel, ...remainingPanels } = state.panels;
      return {
        ...state,
        panels: remainingPanels,
        panelOrder: state.panelOrder.filter(panelId => panelId !== id)
      };
    }
    
    case 'UPDATE_PANEL_POSITION': {
      const { id, position } = action.payload;
      if (!state.panels[id]) return state;
      
      return {
        ...state,
        panels: {
          ...state.panels,
          [id]: {
            ...state.panels[id],
            position
          }
        }
      };
    }
    
    case 'UPDATE_PANEL_SIZE': {
      const { id, size } = action.payload;
      if (!state.panels[id]) return state;
      
      return {
        ...state,
        panels: {
          ...state.panels,
          [id]: {
            ...state.panels[id],
            size
          }
        }
      };
    }
    
    case 'REORDER_PANELS':
      return {
        ...state,
        panelOrder: action.payload
      };
    
    case 'LOAD_LAYOUT': {
      const { layoutType, panels } = action.payload;
      const panelsRecord: Record<string, PanelConfig> = {};
      const panelOrder: string[] = [];
      
      panels.forEach(panel => {
        panelsRecord[panel.id] = panel;
        panelOrder.push(panel.id);
      });
      
      return {
        ...state,
        layoutType,
        panels: panelsRecord,
        panelOrder,
        isInitialized: true
      };
    }
    
    default:
      return state;
  }
}

// Provider component
export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(layoutReducer, initialState);
  
  // Define action creators
  const setLayoutType = (type: LayoutType) => {
    dispatch({ type: 'SET_LAYOUT_TYPE', payload: type });
  };
  
  const registerPanel = (panel: PanelConfig) => {
    dispatch({ type: 'REGISTER_PANEL', payload: panel });
  };
  
  const unregisterPanel = (id: string) => {
    dispatch({ type: 'UNREGISTER_PANEL', payload: id });
  };
  
  const updatePanelPosition = (id: string, position: { row: number; col: number }) => {
    dispatch({ type: 'UPDATE_PANEL_POSITION', payload: { id, position } });
  };
  
  const updatePanelSize = (id: string, size: { width: number; height: number }) => {
    dispatch({ type: 'UPDATE_PANEL_SIZE', payload: { id, size } });
  };
  
  const reorderPanels = (panelOrder: string[]) => {
    dispatch({ type: 'REORDER_PANELS', payload: panelOrder });
  };
  
  const loadLayout = (layoutType: LayoutType, panels: PanelConfig[]) => {
    dispatch({ type: 'LOAD_LAYOUT', payload: { layoutType, panels } });
  };
  
  return (
    <LayoutContext.Provider value={{
      state,
      dispatch,
      setLayoutType,
      registerPanel,
      unregisterPanel,
      updatePanelPosition,
      updatePanelSize,
      reorderPanels,
      loadLayout
    }}>
      {children}
    </LayoutContext.Provider>
  );
};

// Custom hook to use the context
export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}; 