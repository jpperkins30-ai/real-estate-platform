import { useContext } from 'react';
import { PanelSyncContext, PanelSyncEvent } from '../context/PanelSyncContext';

export function usePanelSync() {
  const context = useContext(PanelSyncContext);
  
  if (!context) {
    throw new Error('usePanelSync must be used within a PanelSyncProvider');
  }
  
  return context;
} 