import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Form, Spinner, Alert } from 'react-bootstrap';
import { FaGlobe, FaMapMarkerAlt, FaCity, FaHome, FaChevronRight, FaChevronDown, FaExclamationTriangle } from 'react-icons/fa';
import axios from 'axios';
import './InventoryTree.css';

// Node types for the inventory tree
export type NodeType = 'usmap' | 'state' | 'county' | 'property';

// Node selection event data
export interface NodeSelection {
  type: NodeType;
  id: string;
  name?: string; // Optional name for display purposes
}

interface InventoryTreeProps {
  onNodeSelect?: (node: NodeSelection) => void;
  initialExpanded?: string[];
  initialSelected?: string;
}

interface StateData {
  _id: string;
  id: string;
  name: string;
  abbreviation: string;
  metadata?: {
    totalCounties?: number;
    totalProperties?: number;
  };
}

interface CountyData {
  _id: string;
  id: string;
  name: string;
  parentId: string;
  metadata?: {
    totalProperties?: number;
  };
}

interface PropertyData {
  _id: string;
  id: string;
  name: string;
  parentId: string;
  status: string;
}

interface StatesResponse {
  states: StateData[];
  total: number;
}

interface CountiesResponse {
  counties: CountyData[];
  total: number;
}

interface PropertiesResponse {
  properties: PropertyData[];
  total: number;
}

// API client for data fetching
const api = {
  getStates: async (): Promise<StatesResponse> => {
    const response = await axios.get('/api/states');
    return response.data;
  },
  getCounties: async (stateId: string): Promise<CountiesResponse> => {
    const response = await axios.get(`/api/states/${stateId}/counties`);
    return response.data;
  },
  getProperties: async (countyId: string): Promise<PropertiesResponse> => {
    const response = await axios.get(`/api/counties/${countyId}/properties`);
    return response.data;
  }
};

// Custom TreeView component using React Bootstrap
interface TreeItemProps {
  nodeId: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  isExpanded?: boolean;
  isSelected?: boolean;
  disabled?: boolean;
  onClick?: (nodeId: string) => void;
  onToggle?: (nodeId: string, expanded: boolean) => void;
  children?: React.ReactNode;
}

const TreeItem: React.FC<TreeItemProps> = ({
  nodeId,
  label,
  icon,
  isExpanded = false,
  isSelected = false,
  disabled = false,
  onClick,
  onToggle,
  children
}) => {
  const hasChildren = React.Children.count(children) > 0;
  
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick(nodeId);
    }
  };
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && onToggle) {
      onToggle(nodeId, !isExpanded);
    }
  };
  
  return (
    <div className="inventory-tree-item">
      <div 
        className={`inventory-tree-item-content ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '4px 8px',
          cursor: disabled ? 'default' : 'pointer',
          backgroundColor: isSelected ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
          borderRadius: '4px',
          marginBottom: '2px'
        }}
      >
        {hasChildren && (
          <span 
            onClick={handleToggle} 
            style={{ marginRight: '4px', width: '18px', textAlign: 'center' }}
          >
            {isExpanded ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
          </span>
        )}
        {!hasChildren && <span style={{ width: '18px' }} />}
        
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        <span>{label}</span>
      </div>
      
      {isExpanded && hasChildren && (
        <div className="inventory-tree-item-children" style={{ paddingLeft: '20px' }}>
          {children}
        </div>
      )}
    </div>
  );
};

const InventoryTree: React.FC<InventoryTreeProps> = ({ 
  onNodeSelect, 
  initialExpanded = ['usmap'],
  initialSelected = '' 
}) => {
  const [expanded, setExpanded] = useState<string[]>(initialExpanded);
  const [selected, setSelected] = useState<string>(initialSelected);
  
  // Fetch states for root node
  const { 
    data: statesData, 
    isLoading: statesLoading, 
    error: statesError
  } = useQuery<StatesResponse>({
    queryKey: ['states'],
    queryFn: api.getStates
  });
  
  // Handle node toggle (expand/collapse)
  const handleToggle = (nodeId: string, isExpanded: boolean) => {
    setExpanded(prev => 
      isExpanded 
        ? [...prev, nodeId]
        : prev.filter(id => id !== nodeId)
    );
  };
  
  // Handle node selection
  const handleSelect = (nodeId: string) => {
    setSelected(nodeId);
    
    // Parse node ID to determine type and ID
    const [type, id] = nodeId.split('-');
    
    if (onNodeSelect) {
      const nodeType = type as NodeType;
      
      // Find the name for the selected node if possible
      let nodeName: string | undefined;
      
      if (nodeType === 'state' && statesData?.states) {
        const state = statesData.states.find((s: StateData) => s._id === id || s.id === id);
        nodeName = state ? state.name : undefined;
      }
      
      onNodeSelect({
        type: nodeType,
        id: nodeType === 'usmap' ? 'usmap' : id,
        name: nodeName
      });
    }
  };
  
  // Render state nodes
  const renderStateNodes = () => {
    if (!statesData?.states) return null;
    
    return statesData.states.map((state: StateData) => {
      const stateNodeId = `state-${state._id || state.id}`;
      const totalCounties = state.metadata?.totalCounties || 0;
      
      return (
        <TreeItem
          key={stateNodeId}
          nodeId={stateNodeId}
          label={
            <span>
              {state.name} ({state.abbreviation})
              {totalCounties > 0 && (
                <span className="badge bg-primary ms-2">{totalCounties}</span>
              )}
            </span>
          }
          icon={<FaMapMarkerAlt color="#007bff" />}
          isExpanded={expanded.includes(stateNodeId)}
          isSelected={selected === stateNodeId}
          onClick={handleSelect}
          onToggle={handleToggle}
        >
          {expanded.includes(stateNodeId) && (
            <CountyNodes 
              stateId={state._id || state.id} 
              expanded={expanded}
              selected={selected}
              onToggle={handleToggle}
              onSelect={handleSelect}
            />
          )}
        </TreeItem>
      );
    });
  };
  
  if (statesError) {
    return <Alert variant="danger">Failed to load states: {(statesError as Error).message}</Alert>;
  }
  
  return (
    <div className="inventory-tree" style={{ height: '100%', overflowY: 'auto' }}>
      <TreeItem
        nodeId="usmap"
        label={<span className="fw-medium">US Inventory</span>}
        icon={<FaGlobe color="#6c757d" />}
        isExpanded={expanded.includes("usmap")}
        isSelected={selected === "usmap"}
        onClick={handleSelect}
        onToggle={handleToggle}
      >
        {statesLoading ? (
          <div className="d-flex align-items-center p-2">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Loading states...</span>
          </div>
        ) : (
          renderStateNodes()
        )}
      </TreeItem>
    </div>
  );
};

// Component to load counties for a state
interface CountyNodesProps {
  stateId: string;
  expanded: string[];
  selected: string;
  onToggle: (nodeId: string, expanded: boolean) => void;
  onSelect: (nodeId: string) => void;
}

const CountyNodes: React.FC<CountyNodesProps> = ({ stateId, expanded, selected, onToggle, onSelect }) => {
  // Fetch counties for a state
  const { 
    data: countiesData, 
    isLoading: countiesLoading,
    error: countiesError
  } = useQuery<CountiesResponse>({
    queryKey: ['counties', stateId],
    queryFn: () => api.getCounties(stateId),
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
  
  if (countiesLoading) {
    return (
      <div className="d-flex align-items-center p-2">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>Loading counties...</span>
      </div>
    );
  }
  
  if (countiesError) {
    return (
      <Alert variant="danger" className="p-2">
        <FaExclamationTriangle className="me-2" />
        Error loading counties
      </Alert>
    );
  }
  
  if (!countiesData?.counties || countiesData.counties.length === 0) {
    return <div className="text-muted p-2">No counties found</div>;
  }
  
  return (
    <>
      {countiesData.counties.map((county: CountyData) => {
        const countyNodeId = `county-${county._id || county.id}`;
        const totalProperties = county.metadata?.totalProperties || 0;
        
        return (
          <TreeItem
            key={countyNodeId}
            nodeId={countyNodeId}
            label={
              <span>
                {county.name}
                {totalProperties > 0 && (
                  <span className="badge bg-secondary ms-2">{totalProperties}</span>
                )}
              </span>
            }
            icon={<FaCity color="#6610f2" />}
            isExpanded={expanded.includes(countyNodeId)}
            isSelected={selected === countyNodeId}
            onClick={onSelect}
            onToggle={onToggle}
          >
            {expanded.includes(countyNodeId) && (
              <PropertyNodes 
                countyId={county._id || county.id} 
                selected={selected}
                onSelect={onSelect}
              />
            )}
          </TreeItem>
        );
      })}
    </>
  );
};

// Component to load properties for a county
interface PropertyNodesProps {
  countyId: string;
  selected: string;
  onSelect: (nodeId: string) => void;
}

const PropertyNodes: React.FC<PropertyNodesProps> = ({ countyId, selected, onSelect }) => {
  // Fetch properties for a county
  const { 
    data: propertiesData, 
    isLoading: propertiesLoading,
    error: propertiesError
  } = useQuery<PropertiesResponse>({
    queryKey: ['properties', countyId],
    queryFn: () => api.getProperties(countyId),
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });
  
  if (propertiesLoading) {
    return (
      <div className="d-flex align-items-center p-2">
        <Spinner animation="border" size="sm" className="me-2" />
        <span>Loading properties...</span>
      </div>
    );
  }
  
  if (propertiesError) {
    return (
      <Alert variant="danger" className="p-2">
        <FaExclamationTriangle className="me-2" />
        Error loading properties
      </Alert>
    );
  }
  
  if (!propertiesData?.properties || propertiesData.properties.length === 0) {
    return <div className="text-muted p-2">No properties found</div>;
  }
  
  // Group properties by status for better organization
  const groupedProperties: Record<string, PropertyData[]> = {};
  propertiesData.properties.forEach((property: PropertyData) => {
    if (!groupedProperties[property.status]) {
      groupedProperties[property.status] = [];
    }
    groupedProperties[property.status].push(property);
  });
  
  return (
    <>
      {Object.entries(groupedProperties).map(([status, properties]) => (
        <div key={`status-${countyId}-${status}`} className="property-group mb-2">
          <div className="property-group-header fw-bold text-info mb-1">
            <FaHome className="me-1" /> {status} ({properties.length})
          </div>
          {properties.map((property: PropertyData) => {
            const propertyNodeId = `property-${property._id || property.id}`;
            return (
              <TreeItem
                key={propertyNodeId}
                nodeId={propertyNodeId}
                label={property.name}
                icon={<FaHome color="#6c757d" />}
                isSelected={selected === propertyNodeId}
                onClick={onSelect}
              />
            );
          })}
        </div>
      ))}
    </>
  );
};

export default InventoryTree; 