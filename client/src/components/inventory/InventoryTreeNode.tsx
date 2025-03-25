import React from 'react';
import { useInventoryContext, InventoryNode } from '../../context/InventoryContext';

interface InventoryTreeNodeProps {
  node: InventoryNode;
  expanded: boolean;
  onToggle: (id: string) => void;
  onSelect: (node: InventoryNode) => void;
  level: number;
  children?: React.ReactNode;
}

const InventoryTreeNode: React.FC<InventoryTreeNodeProps> = ({
  node,
  expanded,
  onToggle,
  onSelect,
  level,
  children,
}) => {
  const { selectedNode } = useInventoryContext();
  const hasChildren = React.Children.count(children) > 0;
  const isSelected = selectedNode?.id === node.id;
  
  const getNodeIcon = () => {
    switch (node.type) {
      case 'us_map':
        return <i className="bi bi-globe-americas"></i>;
      case 'state':
        return <i className="bi bi-map"></i>;
      case 'county':
        return <i className="bi bi-geo-alt"></i>;
      case 'property':
        return <i className="bi bi-house-door"></i>;
      case 'controller':
        return <i className="bi bi-gear"></i>;
      default:
        return <i className="bi bi-folder"></i>;
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(node.id);
  };

  const handleSelect = () => {
    onSelect(node);
  };

  // Calculate padding based on level for indentation
  const paddingLeft = `${level * 16}px`;

  return (
    <div className="inventory-tree-node-container">
      <div 
        className={`inventory-tree-node ${isSelected ? 'selected' : ''}`}
        onClick={handleSelect}
        style={{ paddingLeft }}
      >
        <div className="inventory-tree-node-content">
          <span 
            className="inventory-tree-node-toggle"
            onClick={handleToggle}
          >
            {hasChildren && (
              expanded ? 
                <i className="bi bi-chevron-down"></i> : 
                <i className="bi bi-chevron-right"></i>
            )}
          </span>
          <span className="inventory-tree-node-icon">
            {getNodeIcon()}
          </span>
          <span className="inventory-tree-node-label">
            {node.name}
          </span>
        </div>
      </div>
      
      {expanded && hasChildren && (
        <div className="inventory-tree-node-children">
          {children}
        </div>
      )}
    </div>
  );
};

export default InventoryTreeNode; 