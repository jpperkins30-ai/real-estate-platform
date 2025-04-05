import { useContext, useCallback, useEffect, useState } from 'react';
import { LayoutContext } from '../contexts/LayoutContext';
import { PanelConfig, StandardPanelConfig, PanelContentType } from '../types/layout.types';

// Enhanced version of the context type with optional getPanelById
interface EnhancedLayoutContext {
  registerPanel: (id: string, config: PanelConfig) => void;
  unregisterPanel: (id: string) => void;
  updatePanelConfig: (id: string, config: Partial<PanelConfig>) => void;
  getPanelById?: (id: string) => PanelConfig | null;
}

// Enhanced hook with panel tracking
export function useLayoutContext(options?: {
  panelId?: string;
  autoRegister?: boolean;
  panelConfig?: Partial<StandardPanelConfig>;
  debug?: boolean;
}) {
  const context = useContext(LayoutContext) as EnhancedLayoutContext | null;
  const { panelId, autoRegister = false, panelConfig = {}, debug = false } = options || {};
  
  // Track if this panel is registered
  const [isRegistered, setIsRegistered] = useState(false);
  
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutContextProvider');
  }
  
  // Auto-register panel if requested
  useEffect(() => {
    if (autoRegister && panelId && !isRegistered) {
      // Ensure required fields are present
      if (!panelConfig.contentType) {
        console.error('[useLayoutContext] Cannot auto-register without contentType');
        return;
      }
      
      if (!panelConfig.title) {
        console.warn('[useLayoutContext] Auto-registering panel without title');
      }
      
      // Register the panel as StandardPanelConfig
      const config: StandardPanelConfig = {
        id: panelId,
        contentType: panelConfig.contentType as PanelContentType,
        title: panelConfig.title || panelId,
        ...panelConfig
      };
      
      context.registerPanel(panelId, config);
      setIsRegistered(true);
      
      if (debug) {
        console.log(`[useLayoutContext] Auto-registered panel: ${panelId}`);
      }
      
      // Unregister on unmount
      return () => {
        context.unregisterPanel(panelId);
        setIsRegistered(false);
        
        if (debug) {
          console.log(`[useLayoutContext] Auto-unregistered panel: ${panelId}`);
        }
      };
    }
  }, [
    autoRegister, 
    context, 
    debug, 
    isRegistered, 
    panelId, 
    panelConfig
  ]);
  
  // Enhanced panel update with validation
  const updatePanel = useCallback((updates: Partial<PanelConfig>) => {
    if (!panelId) {
      console.error('[useLayoutContext] Cannot update panel without panelId');
      return;
    }
    
    context.updatePanelConfig(panelId, updates);
    
    if (debug) {
      console.log(`[useLayoutContext] Updated panel: ${panelId}`, updates);
    }
  }, [context, panelId, debug]);
  
  // Get current panel config
  const getPanelConfig = useCallback(() => {
    if (!panelId) return null;
    return context.getPanelById?.(panelId) || null;
  }, [context, panelId]);
  
  // Return enhanced context
  return {
    ...context,
    updatePanel,
    getPanelConfig,
    isRegistered
  };
} 