import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Badge, Nav, Tab, Form } from 'react-bootstrap';
import { StateObject } from '../../../types/inventory';
import MapComponent from '../../maps/MapComponent';
import { useInventoryContext } from '../../../context/InventoryContext';

// Mock data for development
const mockStates: Record<string, StateObject> = {
  'state-1': {
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
    controllers: [
      {
        controllerId: 'controller-1',
        controllerType: 'Tax Sale',
        enabled: true,
        lastRun: new Date('2023-03-15'),
        nextScheduledRun: new Date('2023-06-15'),
        configuration: {
          url: 'https://example.com/api/ca',
          frequency: 'quarterly',
        },
      },
    ],
    counties: [
      {
        id: 'county-1',
        name: 'Los Angeles County',
        type: 'county',
        parentId: 'state-1',
        stateId: 'state-1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-05-15'),
        metadata: {
          totalProperties: 450,
          statistics: {
            totalTaxLiens: 56,
            totalValue: 1200000,
            averagePropertyValue: 380000,
            totalPropertiesWithLiens: 56,
            lastUpdated: new Date('2023-05-15'),
          }
        },
        geometry: { 
          type: 'Polygon',
          coordinates: []
        },
        properties: [],
        controllers: []
      },
      {
        id: 'county-2',
        name: 'San Diego County',
        type: 'county',
        parentId: 'state-1',
        stateId: 'state-1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-06-10'),
        metadata: {
          totalProperties: 325,
          statistics: {
            totalTaxLiens: 38,
            totalValue: 950000,
            averagePropertyValue: 420000,
            totalPropertiesWithLiens: 38,
            lastUpdated: new Date('2023-06-10'),
          }
        },
        geometry: { 
          type: 'Polygon',
          coordinates: []
        },
        properties: [],
        controllers: []
      },
    ],
  },
  'state-2': {
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
    counties: [],
  },
};

// Add mock status and last updated data to the counties
mockStates['state-1'].counties[0].metadata.status = 'hot';
mockStates['state-1'].counties[0].metadata.lastUpdated = new Date('2023-07-02'); // 7 days ago
mockStates['state-1'].counties[1].metadata.status = 'new';
mockStates['state-1'].counties[1].metadata.lastUpdated = new Date('2023-07-07'); // 2 days ago

// Add some properties to mock enhanced data visualization
mockStates['state-1'].counties.forEach(county => {
  // Enhance geometry for visualization
  county.geometry = {
    type: 'Feature',
    properties: {
      id: county.id,
      name: county.name,
      status: county.metadata.status || 'verified',
      lastUpdated: county.metadata.lastUpdated || county.updatedAt,
      value: county.metadata.statistics?.totalValue || 0
    },
    geometry: county.geometry
  };
});

// Enhance state geometries with properties needed for visualization
mockStates['state-1'].geometry = {
  type: 'Feature',
  properties: {
    id: mockStates['state-1'].id,
    name: mockStates['state-1'].name,
    status: 'verified',
    lastUpdated: mockStates['state-1'].updatedAt,
    value: mockStates['state-1'].metadata.statistics?.totalValue || 0
  },
  geometry: mockStates['state-1'].geometry
};

mockStates['state-2'].geometry = {
  type: 'Feature',
  properties: {
    id: mockStates['state-2'].id,
    name: mockStates['state-2'].name,
    status: 'dormant',
    lastUpdated: mockStates['state-2'].updatedAt,
    value: mockStates['state-2'].metadata.statistics?.totalValue || 0
  },
  geometry: mockStates['state-2'].geometry
};

interface StateDetailsProps {
  stateId: string;
}

const StateDetails: React.FC<StateDetailsProps> = ({ stateId }) => {
  const { selectNode } = useInventoryContext();
  const [state, setState] = useState<StateObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    // Simulating API fetch
    setLoading(true);
    
    // In a real implementation, this would be an API call
    setTimeout(() => {
      setState(mockStates[stateId] || null);
      setLoading(false);
    }, 800);
  }, [stateId]);

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading state details...</p>
      </div>
    );
  }

  if (!state) {
    return (
      <Card className="border-danger">
        <Card.Body>
          <Card.Title className="text-danger">State Not Found</Card.Title>
          <p>The state with ID {stateId} could not be found.</p>
        </Card.Body>
      </Card>
    );
  }

  const handleCountySelect = (countyId: string) => {
    const county = state?.counties.find(c => c.id === countyId);
    if (county) {
      selectNode({
        id: county.id,
        name: county.name,
        type: 'county',
        data: county
      });
    }
  };

  return (
    <div className="state-details">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>
          {state.name} <Badge bg="secondary">{state.abbreviation}</Badge>
        </h3>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2">
            <i className="bi bi-pencil me-1"></i>
            Edit
          </Button>
          <Button variant="primary" size="sm">
            <i className="bi bi-plus-lg me-1"></i>
            Add County
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h1 className="display-4">{state.metadata.totalCounties}</h1>
              <Card.Text>Counties</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h1 className="display-4">{state.metadata.totalProperties}</h1>
              <Card.Text>Properties</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h1 className="display-4">{state.metadata.statistics.totalTaxLiens}</h1>
              <Card.Text>Tax Liens</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h1 className="display-4">${(state.metadata.statistics.totalValue / 1000000).toFixed(1)}M</h1>
              <Card.Text>Total Value</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tab.Container defaultActiveKey="map">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="counties">Counties</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="map">Map View</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="collectors">Data Collectors</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="history">Collection History</Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Tab.Content>
          <Tab.Pane eventKey="counties">
            <Card>
              <Card.Body>
                <Card.Title>Counties in {state.name}</Card.Title>
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>County Name</th>
                        <th>Status</th>
                        <th>Properties</th>
                        <th>Tax Liens</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.counties.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-3">
                            No counties added yet. 
                            <Button variant="link" size="sm">Add a county</Button>
                          </td>
                        </tr>
                      ) : (
                        state.counties.map(county => (
                          <tr key={county.id}>
                            <td>{county.name}</td>
                            <td>
                              {county.metadata.status && (
                                <Badge bg={
                                  county.metadata.status === 'new' ? 'warning' :
                                  county.metadata.status === 'hot' ? 'danger' :
                                  county.metadata.status === 'verified' ? 'primary' :
                                  'secondary'
                                }>
                                  {county.metadata.status.charAt(0).toUpperCase() + county.metadata.status.slice(1)}
                                </Badge>
                              )}
                            </td>
                            <td>{county.metadata.totalProperties}</td>
                            <td>{county.metadata.statistics?.totalTaxLiens}</td>
                            <td>{county.updatedAt.toLocaleDateString()}</td>
                            <td>
                              <Button variant="outline-primary" size="sm" onClick={() => handleCountySelect(county.id)}>View</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>
          
          <Tab.Pane eventKey="map">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <Card.Title>Interactive Map of {state?.name}</Card.Title>
                  <div className="d-flex align-items-center">
                    <Form.Check 
                      type="switch"
                      id="dark-mode-switch"
                      label="Dark Mode"
                      checked={darkMode}
                      onChange={(e) => setDarkMode(e.target.checked)}
                      className="me-3"
                    />
                    <Button variant="outline-secondary" size="sm">
                      <i className="bi bi-arrows-fullscreen me-1"></i>
                      Full Screen
                    </Button>
                  </div>
                </div>
                
                <MapComponent 
                  type="state"
                  data={{
                    geometry: state?.geometry,
                    counties: state?.counties || []
                  }}
                  onSelect={handleCountySelect}
                  darkMode={darkMode}
                />
                
                <div className="mt-3">
                  <p className="text-muted">
                    <i className="bi bi-info-circle me-2"></i>
                    Click on counties to view detailed information. Orange counties indicate new tax sales (0-7 days),
                    yellow for recent sales (8-14 days), red for hot zones, and blue for verified active counties.
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>
          
          <Tab.Pane eventKey="collectors">
            <Card>
              <Card.Body>
                <Card.Title>Data Collectors</Card.Title>
                {state.controllers.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No data collectors configured for this state.</p>
                    <Button variant="outline-primary" size="sm">
                      <i className="bi bi-plus-lg me-1"></i>
                      Add Data Collector
                    </Button>
                  </div>
                ) : (
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Collector Type</th>
                        <th>Status</th>
                        <th>Last Run</th>
                        <th>Next Run</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.controllers.map(controller => (
                        <tr key={controller.controllerId}>
                          <td>{controller.controllerType}</td>
                          <td>
                            <Badge bg={controller.enabled ? 'success' : 'secondary'}>
                              {controller.enabled ? 'Active' : 'Disabled'}
                            </Badge>
                          </td>
                          <td>{controller.lastRun?.toLocaleDateString() || 'Never'}</td>
                          <td>{controller.nextScheduledRun?.toLocaleDateString() || 'Not scheduled'}</td>
                          <td>
                            <Button variant="outline-primary" size="sm" className="me-1">
                              Configure
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                              Run Now
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>
          
          <Tab.Pane eventKey="history">
            <Card>
              <Card.Body>
                <Card.Title>Collection History</Card.Title>
                <p className="text-muted">
                  Recent data collection activity for this state will appear here.
                </p>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default StateDetails; 