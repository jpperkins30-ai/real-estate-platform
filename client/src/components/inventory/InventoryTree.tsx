import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHome, FaMapMarkerAlt, FaFolder, FaBars, FaAngleRight, FaAngleDown, FaCity, FaFlag } from 'react-icons/fa';
import { InventoryTreeNode } from './InventoryTreeNode';
import { Tree, TreeNode } from '../common/Tree';
import axios from 'axios';
import './InventoryModule.css';

interface State {
  _id: string;
  id: string;
  name: string;
  abbreviation: string;
  metadata: {
    totalCounties: number;
    totalProperties: number;
  };
}

interface County {
  _id: string;
  id: string;
  name: string;
  parentId: string;
  metadata: {
    totalProperties: number;
  };
}

interface Property {
  _id: string;
  id: string;
  name: string;
  parentId: string;
  location: {
    address: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
}

// Define the tree node structure
interface TreeItem {
  id: string;
  name: string;
  type: 'state' | 'county' | 'property' | 'root';
  childCount: number;
  isOpen?: boolean;
  children?: TreeItem[];
  metadata?: any;
}

export const InventoryTree: React.FC = () => {
  const navigate = useNavigate();
  const [treeData, setTreeData] = useState<TreeItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set([]));

  useEffect(() => {
    // Load initial tree data (states)
    fetchStates();
  }, []);

  const fetchStates = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/states');
      const states = response.data;
      
      // Format the states as tree items
      const stateItems: TreeItem[] = states.map((state: State) => ({
        id: state._id,
        name: state.name,
        type: 'state',
        childCount: state.metadata.totalCounties,
        children: [],
        metadata: {
          abbreviation: state.abbreviation,
          totalProperties: state.metadata.totalProperties
        }
      }));
      
      // Create a root node with states as children
      const rootNode: TreeItem = {
        id: 'root',
        name: 'United States',
        type: 'root',
        childCount: stateItems.length,
        isOpen: true,
        children: stateItems
      };
      
      setTreeData([rootNode]);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to load states');
      setIsLoading(false);
      console.error('Error fetching states:', err);
    }
  };

  const fetchCounties = async (stateId: string) => {
    try {
      const response = await axios.get(`/api/states/${stateId}/counties`);
      const counties = response.data;
      
      // Format the counties as tree items
      return counties.map((county: County) => ({
        id: county._id,
        name: county.name,
        type: 'county',
        childCount: county.metadata.totalProperties,
        children: [],
        metadata: {
          totalProperties: county.metadata.totalProperties,
          parentId: stateId
        }
      }));
    } catch (err) {
      console.error(`Error fetching counties for state ${stateId}:`, err);
      return [];
    }
  };

  const fetchProperties = async (countyId: string) => {
    try {
      const response = await axios.get(`/api/properties/search?countyId=${countyId}&limit=50`);
      const { properties } = response.data;
      
      // Format the properties as tree items
      return properties.map((property: Property) => ({
        id: property._id,
        name: property.name || `${property.location.address.street}, ${property.location.address.city}`,
        type: 'property',
        childCount: 0,
        metadata: {
          address: property.location.address,
          parentId: countyId
        }
      }));
    } catch (err) {
      console.error(`Error fetching properties for county ${countyId}:`, err);
      return [];
    }
  };

  const handleNodeToggle = async (nodeId: string, nodeType: string) => {
    // Toggle node expansion
    const newExpandedNodes = new Set(expandedNodes);
    
    if (expandedNodes.has(nodeId)) {
      newExpandedNodes.delete(nodeId);
    } else {
      newExpandedNodes.add(nodeId);
      
      // Fetch children if needed
      if (nodeType === 'state') {
        // Find the state node in tree
        const newTreeData = [...treeData];
        const rootNode = newTreeData[0];
        const stateIndex = rootNode.children?.findIndex(state => state.id === nodeId) || -1;
        
        if (stateIndex !== -1 && rootNode.children) {
          const stateNode = rootNode.children[stateIndex];
          
          // Only fetch if no children yet
          if (!stateNode.children || stateNode.children.length === 0) {
            const counties = await fetchCounties(nodeId);
            rootNode.children[stateIndex].children = counties;
            setTreeData(newTreeData);
          }
        }
      } else if (nodeType === 'county') {
        // Find the county node in tree
        const newTreeData = [...treeData];
        const rootNode = newTreeData[0];
        
        // Find state that contains this county
        for (let i = 0; i < (rootNode.children?.length || 0); i++) {
          const stateNode = rootNode.children?.[i];
          const countyIndex = stateNode?.children?.findIndex(county => county.id === nodeId) || -1;
          
          if (countyIndex !== -1 && stateNode?.children) {
            const countyNode = stateNode.children[countyIndex];
            
            // Only fetch if no children yet
            if (!countyNode.children || countyNode.children.length === 0) {
              const properties = await fetchProperties(nodeId);
              stateNode.children[countyIndex].children = properties;
              setTreeData(newTreeData);
            }
            break;
          }
        }
      }
    }
    
    setExpandedNodes(newExpandedNodes);
  };

  const handleNodeSelect = (nodeId: string, nodeType: string) => {
    // Navigate to the appropriate detail view
    if (nodeType === 'state') {
      navigate(`/inventory/states/${nodeId}`);
    } else if (nodeType === 'county') {
      navigate(`/inventory/counties/${nodeId}`);
    } else if (nodeType === 'property') {
      navigate(`/inventory/properties/${nodeId}`);
    }
  };

  const renderNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'root':
        return <FaFlag className="node-icon" />;
      case 'state':
        return <FaMapMarkerAlt className="node-icon" />;
      case 'county':
        return <FaCity className="node-icon" />;
      case 'property':
        return <FaHome className="node-icon" />;
      default:
        return <FaFolder className="node-icon" />;
    }
  };

  const renderTreeNode = (node: TreeItem) => {
    const isExpanded = expandedNodes.has(node.id);
    
    return (
      <div className="tree-node" key={node.id}>
        <div className="tree-node-content">
          <span 
            className="tree-node-toggle"
            onClick={() => node.childCount > 0 && handleNodeToggle(node.id, node.type)}
          >
            {node.childCount > 0 && (
              isExpanded ? <FaAngleDown className="toggle-icon" /> : <FaAngleRight className="toggle-icon" />
            )}
          </span>
          
          <span 
            className="tree-node-label"
            onClick={() => handleNodeSelect(node.id, node.type)}
          >
            {renderNodeIcon(node.type)}
            <span className="node-name">{node.name}</span>
            {node.childCount > 0 && (
              <span className="node-count">({node.childCount})</span>
            )}
          </span>
        </div>
        
        {isExpanded && node.children && node.children.length > 0 && (
          <div className="tree-node-children">
            {node.children.map(childNode => renderTreeNode(childNode))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="loading">Loading inventory tree...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="inventory-tree">
      <div className="tree-header">
        <FaBars className="menu-icon" />
        <h3>Inventory</h3>
      </div>
      <div className="tree-container">
        {treeData.map(node => renderTreeNode(node))}
      </div>
    </div>
  );
}; 