import React, { useEffect, useState } from 'react';
import InventoryTreeNode from './InventoryTreeNode';
import PropertyListView from './PropertyListView';
import { StateObject } from '../../types/inventory';
import { useInventoryContext, InventoryNode } from '../../context/InventoryContext';

// Mock data for development purposes
const mockStates: StateObject[] = [
  {
    id: 'state-1',
    name: 'California',
    abbreviation: 'CA',
    type: 'state',
    parentId: 'usmap',
    createdAt: new Date(),
    updatedAt: new Date(),
    geometry: {
      type: 'Polygon',
      coordinates: [],
    },
    metadata: {
      totalCounties: 58,
      totalProperties: 1245,
      statistics: {
        totalTaxLiens: 145,
        totalValue: 3500000,
        averagePropertyValue: 350000,
        totalPropertiesWithLiens: 145,
        lastUpdated: new Date(),
      },
    },
    controllers: [],
    counties: [
      {
        id: 'county-1',
        name: 'Los Angeles County',
        type: 'county',
        parentId: 'state-1',
        stateId: 'state-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        geometry: {
          type: 'Polygon',
          coordinates: [],
        },
        metadata: {
          totalProperties: 450,
          statistics: {
            totalTaxLiens: 56,
            totalValue: 1200000,
            averagePropertyValue: 380000,
            totalPropertiesWithLiens: 56,
            lastUpdated: new Date(),
          },
          searchConfig: {
            searchUrl: 'https://example.com',
            lookupMethod: 'parcel_id',
            selectors: {},
          },
        },
        controllers: [],
        properties: [],
      },
      {
        id: 'county-2',
        name: 'San Diego County',
        type: 'county',
        parentId: 'state-1',
        stateId: 'state-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        geometry: {
          type: 'Polygon',
          coordinates: [],
        },
        metadata: {
          totalProperties: 325,
          statistics: {
            totalTaxLiens: 38,
            totalValue: 950000,
            averagePropertyValue: 420000,
            totalPropertiesWithLiens: 38,
            lastUpdated: new Date(),
          },
          searchConfig: {
            searchUrl: 'https://example.com',
            lookupMethod: 'parcel_id',
            selectors: {},
          },
        },
        controllers: [],
        properties: [],
      },
    ],
  },
  {
    id: 'state-2',
    name: 'Texas',
    abbreviation: 'TX',
    type: 'state',
    parentId: 'usmap',
    createdAt: new Date(),
    updatedAt: new Date(),
    geometry: {
      type: 'Polygon',
      coordinates: [],
    },
    metadata: {
      totalCounties: 254,
      totalProperties: 2100,
      statistics: {
        totalTaxLiens: 230,
        totalValue: 4200000,
        averagePropertyValue: 280000,
        totalPropertiesWithLiens: 230,
        lastUpdated: new Date(),
      },
    },
    controllers: [],
    counties: [
      {
        id: 'county-3',
        name: 'Harris County',
        type: 'county',
        parentId: 'state-2',
        stateId: 'state-2',
        createdAt: new Date(),
        updatedAt: new Date(),
        geometry: {
          type: 'Polygon',
          coordinates: [],
        },
        metadata: {
          totalProperties: 685,
          statistics: {
            totalTaxLiens: 74,
            totalValue: 1850000,
            averagePropertyValue: 310000,
            totalPropertiesWithLiens: 74,
            lastUpdated: new Date(),
          },
          searchConfig: {
            searchUrl: 'https://example.com',
            lookupMethod: 'parcel_id',
            selectors: {},
          },
        },
        controllers: [],
        properties: [],
      },
    ],
  },
];

const InventoryTree: React.FC = () => {
  const { expandedNodes, toggleNode, selectNode } = useInventoryContext();
  const [states, setStates] = useState<StateObject[]>([]);

  useEffect(() => {
    // In a real implementation, this would fetch data from an API
    setStates(mockStates);
  }, []);

  const handleToggle = (nodeId: string) => {
    toggleNode(nodeId);
  };

  const handleSelect = (node: InventoryNode) => {
    selectNode(node);
  };

  return (
    <div className="inventory-tree">
      {/* US Map Root Node */}
      <InventoryTreeNode
        node={{ 
          id: 'usmap', 
          name: 'US Map', 
          type: 'us_map' 
        }}
        expanded={expandedNodes['usmap']}
        onToggle={handleToggle}
        onSelect={handleSelect}
        level={0}
      >
        {/* State Nodes */}
        {states.map(state => (
          <InventoryTreeNode
            key={state.id}
            node={{
              id: state.id,
              name: state.name,
              type: 'state',
              data: state
            }}
            expanded={expandedNodes[state.id]}
            onToggle={handleToggle}
            onSelect={handleSelect}
            level={1}
          >
            {/* County Nodes */}
            {expandedNodes[state.id] && state.counties.map(county => (
              <InventoryTreeNode
                key={county.id}
                node={{
                  id: county.id,
                  name: county.name,
                  type: 'county',
                  data: county
                }}
                expanded={expandedNodes[county.id]}
                onToggle={handleToggle}
                onSelect={handleSelect}
                level={2}
              >
                {/* Property Nodes would be loaded on demand */}
                {expandedNodes[county.id] && (
                  <PropertyListView countyId={county.id} />
                )}
              </InventoryTreeNode>
            ))}
          </InventoryTreeNode>
        ))}
      </InventoryTreeNode>
    </div>
  );
};

export default InventoryTree; 