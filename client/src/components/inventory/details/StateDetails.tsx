import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Badge, Nav, Tab } from 'react-bootstrap';
import { StateObject } from '../../../types/inventory';

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
    counties: [],
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

interface StateDetailsProps {
  stateId: string;
}

const StateDetails: React.FC<StateDetailsProps> = ({ stateId }) => {
  const [state, setState] = useState<StateObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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

      <Tab.Container defaultActiveKey="counties">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="counties">Counties</Nav.Link>
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
                        <th>Properties</th>
                        <th>Tax Liens</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.counties.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-3">
                            No counties added yet. 
                            <Button variant="link" size="sm">Add a county</Button>
                          </td>
                        </tr>
                      ) : (
                        state.counties.map(county => (
                          <tr key={county.id}>
                            <td>{county.name}</td>
                            <td>{county.metadata.totalProperties}</td>
                            <td>{county.metadata.statistics.totalTaxLiens}</td>
                            <td>{county.updatedAt.toLocaleDateString()}</td>
                            <td>
                              <Button variant="outline-primary" size="sm">View</Button>
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