import { useState, useCallback, useEffect } from 'react';
import { PanelConfig, PanelState, PanelAction, AdvancedLayoutOptions } from '../types/layout.types';

/**
 * Custom hook for managing advanced layout state with draggable, resizable panels
 */
export function useAdvancedLayout({
  initialPanels,
  storageKey = 'advanced-layout-state',
  shouldPersist = true,
}: AdvancedLayoutOptions) {
  // Initialize panel states from localStorage or defaults
  const initializePanelStates = useCallback(() => {
    if (shouldPersist) {
      try {
        const savedState = localStorage.getItem(storageKey);
        if (savedState) {
          const parsed = JSON.parse(savedState) as PanelState[];
          // Validate the saved state
          if (Array.isArray(parsed) && parsed.length > 0 && 'id' in parsed[0]) {
            return parsed;
          }
        }
      } catch (error) {
        console.error('Failed to load layout state from localStorage:', error);
      }
    }
    
    // Initialize with default state if no saved state
    return initialPanels.map(panel => ({
      ...panel,
      isMaximized: false,
      isVisible: panel.isVisible !== false, // Default to true if not specified
    }));
  }, [initialPanels, storageKey, shouldPersist]);

  // State for panels
  const [panelStates, setPanelStates] = useState<PanelState[]>(initializePanelStates);
  const [maximizedPanelId, setMaximizedPanelId] = useState<string | null>(null);

  // Persist panel states to localStorage when they change
  useEffect(() => {
    if (shouldPersist) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(panelStates));
      } catch (error) {
        console.error('Failed to save layout state to localStorage:', error);
      }
    }
  }, [panelStates, storageKey, shouldPersist]);

  // Handles all panel actions (maximize, restore, close, move, resize)
  const handlePanelAction = useCallback((action: PanelAction) => {
    const { type, panelId, payload } = action;
    
    setPanelStates(currentPanels => {
      const updatedPanels = [...currentPanels];
      const panelIndex = updatedPanels.findIndex(panel => panel.id === panelId);
      
      if (panelIndex === -1) return currentPanels;
      
      switch (type) {
        case 'maximize':
          setMaximizedPanelId(panelId);
          updatedPanels[panelIndex] = {
            ...updatedPanels[panelIndex],
            isMaximized: true,
          };
          break;
          
        case 'restore':
          if (maximizedPanelId === panelId) {
            setMaximizedPanelId(null);
          }
          updatedPanels[panelIndex] = {
            ...updatedPanels[panelIndex],
            isMaximized: false,
          };
          break;
          
        case 'close':
          updatedPanels[panelIndex] = {
            ...updatedPanels[panelIndex],
            isVisible: false,
          };
          // If the closed panel was maximized, clear the maximized state
          if (maximizedPanelId === panelId) {
            setMaximizedPanelId(null);
          }
          break;
          
        case 'move':
        case 'resize':
          if (payload) {
            updatedPanels[panelIndex] = {
              ...updatedPanels[panelIndex],
              position: {
                ...updatedPanels[panelIndex].position,
                ...payload,
              },
            };
          }
          break;
          
        default:
          return currentPanels;
      }
      
      return updatedPanels;
    });
  }, [maximizedPanelId]);

  // Add a new panel to the layout
  const addPanel = useCallback((panel: PanelConfig) => {
    const newPanel: PanelState = {
      ...panel,
      isMaximized: false,
      isVisible: panel.isVisible !== false,
    };
    
    setPanelStates(currentPanels => [...currentPanels, newPanel]);
    return newPanel.id;
  }, []);

  // Reset layout to initial state
  const resetLayout = useCallback(() => {
    setMaximizedPanelId(null);
    setPanelStates(initializePanelStates());
  }, [initializePanelStates]);

  // Get the state of a specific panel by ID
  const getPanelState = useCallback((panelId: string) => {
    return panelStates.find(panel => panel.id === panelId);
  }, [panelStates]);

  // Check if any panel is currently maximized
  const isAnyPanelMaximized = maximizedPanelId !== null;

  // Return the necessary state and functions
  return {
    panelStates,
    maximizedPanelId,
    isAnyPanelMaximized,
    handlePanelAction,
    addPanel,
    resetLayout,
    getPanelState,
  };
} 