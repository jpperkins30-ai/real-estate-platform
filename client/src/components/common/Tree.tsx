import React, { ReactNode } from 'react';

export interface TreeNode {
  id: string;
  label: string;
  children?: TreeNode[];
  isSelected?: boolean;
  isExpanded?: boolean;
  metadata?: any;
}

export interface TreeProps {
  nodes: TreeNode[];
  onNodeSelect?: (nodeId: string) => void;
  onNodeToggle?: (nodeId: string, isExpanded: boolean) => void;
  className?: string;
}

export const Tree: React.FC<TreeProps> = ({
  nodes,
  onNodeSelect,
  onNodeToggle,
  className = ''
}) => {
  const renderNode = (node: TreeNode, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className={`tree-node ${node.isSelected ? 'selected' : ''}`}>
        <div 
          className="tree-node-content"
          style={{ paddingLeft: `${level * 16}px` }}
        >
          {hasChildren && (
            <span 
              className="tree-node-toggle"
              onClick={() => onNodeToggle && onNodeToggle(node.id, !node.isExpanded)}
            >
              {node.isExpanded ? '▾' : '▸'}
            </span>
          )}
          <span 
            className="tree-node-label"
            onClick={() => onNodeSelect && onNodeSelect(node.id)}
          >
            {node.label}
          </span>
        </div>
        
        {hasChildren && node.isExpanded && (
          <div className="tree-node-children">
            {node.children!.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={`tree ${className}`}>
      {nodes.map(node => renderNode(node))}
    </div>
  );
};

export default Tree; 