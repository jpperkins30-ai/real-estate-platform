import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MultiFrameContainer } from './MultiFrameContainer';
import { 
  LayoutType, 
  LayoutConfig,
  PanelConfig,
  PanelContentType
} from '../../types/layout.types';
import './EnhancedMultiFrameContainer.css';

export interface EnhancedMultiFrameContainerProps {
  initialLayout?: LayoutType;
  savedLayouts?: LayoutConfig[];
  defaultPanelContent?: Record<string, string>;
  onLayoutSave?: (layout: LayoutConfig) => void;
  onLayoutDelete?: (layoutId: string) => void;
  persistLayoutChanges?: boolean;
  className?: string;
  storageKey?: string;
}

export const EnhancedMultiFrameContainer: React.FC<EnhancedMultiFrameContainerProps> = ({
  initialLayout = 'single',
  savedLayouts = [],
  defaultPanelContent = {},
  onLayoutSave,
  onLayoutDelete,
  persistLayoutChanges = true,
  className = '',
  storageKey = 'enhanced-multi-frame-layout'
}) => {
  // State
  const [currentLayout, setCurrentLayout] = useState<LayoutType>(initialLayout);
  const [layouts, setLayouts] = useState<LayoutConfig[]>(savedLayouts);
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);
  const [panels, setPanels] = useState<PanelConfig[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [layoutName, setLayoutName] = useState('');
  const [layoutDescription, setLayoutDescription] = useState('');
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load layout from localStorage if persistLayoutChanges is enabled
  useEffect(() => {
    if (persistLayoutChanges) {
      try {
        const savedLayout = localStorage.getItem(storageKey);
        if (savedLayout) {
          const parsedLayout = JSON.parse(savedLayout) as LayoutConfig;
          setCurrentLayout(parsedLayout.type);
          setPanels(parsedLayout.panels);
          setActiveLayoutId(parsedLayout.id || null);
        }
      } catch (e) {
        console.error('Failed to load layout from localStorage:', e);
      }
    }
  }, [persistLayoutChanges, storageKey]);
  
  // Handle layout change from selector
  const handleLayoutChange = useCallback((layout: LayoutConfig) => {
    setCurrentLayout(layout.type);
    setPanels(layout.panels);
    
    if (persistLayoutChanges) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(layout));
      } catch (e) {
        console.error('Failed to save layout to localStorage:', e);
      }
    }
  }, [persistLayoutChanges, storageKey]);
  
  // Save current layout
  const saveCurrentLayout = useCallback(() => {
    if (!layoutName.trim()) {
      return;
    }
    
    const layoutId = activeLayoutId || `layout-${Date.now()}`;
    
    const newLayout: LayoutConfig = {
      id: layoutId,
      name: layoutName,
      description: layoutDescription,
      type: currentLayout,
      panels,
      updatedAt: new Date().toISOString()
    };
    
    // Update layouts list
    if (activeLayoutId) {
      setLayouts(layouts.map(l => l.id === activeLayoutId ? newLayout : l));
    } else {
      newLayout.createdAt = new Date().toISOString();
      setLayouts([...layouts, newLayout]);
    }
    
    setActiveLayoutId(layoutId);
    setShowSaveDialog(false);
    
    // Call parent callback if provided
    if (onLayoutSave) {
      onLayoutSave(newLayout);
    }
  }, [
    activeLayoutId, 
    currentLayout, 
    layoutDescription, 
    layoutName, 
    layouts, 
    onLayoutSave, 
    panels
  ]);
  
  // Delete a layout
  const deleteLayout = useCallback((layoutId: string) => {
    setLayouts(layouts.filter(l => l.id !== layoutId));
    
    if (activeLayoutId === layoutId) {
      setActiveLayoutId(null);
    }
    
    // Call parent callback if provided
    if (onLayoutDelete) {
      onLayoutDelete(layoutId);
    }
  }, [activeLayoutId, layouts, onLayoutDelete]);
  
  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    setIsEditing(!isEditing);
  }, [isEditing]);
  
  // Load a saved layout
  const loadLayout = useCallback((layoutId: string) => {
    const layout = layouts.find(l => l.id === layoutId);
    if (layout) {
      setCurrentLayout(layout.type);
      setPanels(layout.panels);
      setActiveLayoutId(layoutId);
      
      if (persistLayoutChanges) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(layout));
        } catch (e) {
          console.error('Failed to save layout to localStorage:', e);
        }
      }
    }
  }, [layouts, persistLayoutChanges, storageKey]);
  
  // Prepare to save layout
  const prepareToSaveLayout = useCallback(() => {
    // If editing an existing layout, pre-fill form values
    if (activeLayoutId) {
      const activeLayout = layouts.find(l => l.id === activeLayoutId);
      if (activeLayout) {
        setLayoutName(activeLayout.name);
        setLayoutDescription(activeLayout.description || '');
      }
    } else {
      setLayoutName(`${currentLayout.charAt(0).toUpperCase() + currentLayout.slice(1)} Layout`);
      setLayoutDescription('');
    }
    
    setShowSaveDialog(true);
  }, [activeLayoutId, currentLayout, layouts]);
  
  // Handle layout selector change
  const handleLayoutSelect = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const layoutId = event.target.value;
    if (layoutId) {
      loadLayout(layoutId);
    } else {
      setActiveLayoutId(null);
    }
  }, [loadLayout]);
  
  return (
    <div 
      className={`enhanced-multi-frame-container ${className} ${isEditing ? 'editing-mode' : ''}`} 
      ref={containerRef}
      data-testid="enhanced-multi-frame-container"
    >
      <div className="enhanced-controls">
        <div className="layout-actions">
          <button 
            className="save-layout-button" 
            onClick={prepareToSaveLayout}
            data-testid="save-layout-button"
          >
            Save Layout
          </button>
          <button 
            className="edit-mode-button" 
            onClick={toggleEditMode}
            data-testid="edit-mode-button"
          >
            {isEditing ? 'Exit Edit Mode' : 'Edit Layout'}
          </button>
        </div>
        
        {layouts.length > 0 && (
          <div className="saved-layouts">
            <label>Saved Layouts:</label>
            <select 
              value={activeLayoutId || ''} 
              onChange={handleLayoutSelect}
              data-testid="layout-selector"
            >
              <option value="">-- Select Layout --</option>
              {layouts.map(layout => (
                <option key={layout.id} value={layout.id}>
                  {layout.name}
                </option>
              ))}
            </select>
            {activeLayoutId && (
              <button 
                className="delete-layout-button" 
                onClick={() => deleteLayout(activeLayoutId)}
                data-testid="delete-layout-button"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
      
      <MultiFrameContainer
        initialLayout={currentLayout}
        panels={panels}
        defaultPanelContent={defaultPanelContent}
        onLayoutChange={handleLayoutChange}
        className={isEditing ? 'editing' : ''}
        enableAdvancedLayout={true}
      />
      
      {showSaveDialog && (
        <div className="save-layout-dialog" data-testid="save-layout-dialog">
          <div className="dialog-content">
            <h3>{activeLayoutId ? 'Update Layout' : 'Save Layout'}</h3>
            <div className="form-group">
              <label htmlFor="layout-name">Layout Name:</label>
              <input
                id="layout-name"
                type="text"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="Enter layout name"
                data-testid="layout-name-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="layout-description">Description (optional):</label>
              <textarea
                id="layout-description"
                value={layoutDescription}
                onChange={(e) => setLayoutDescription(e.target.value)}
                placeholder="Enter layout description"
                data-testid="layout-description-input"
              />
            </div>
            <div className="dialog-buttons">
              <button 
                onClick={() => setShowSaveDialog(false)}
                data-testid="cancel-save-button"
              >
                Cancel
              </button>
              <button 
                onClick={saveCurrentLayout}
                disabled={!layoutName.trim()}
                data-testid="confirm-save-button"
              >
                {activeLayoutId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 