import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Badge, Nav, Tab, Alert } from 'react-bootstrap';
import { CountyObject } from '../../../types/inventory';

// Mock data for development
const mockCounties: Record<string, CountyObject> = {
  'county-1': {
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
        searchUrl: 'https://assessor.lacounty.gov/search',
        lookupMethod: 'parcel_id',
        selectors: {
          parcelIdInput: '#parcelNumber',
          submitButton: '#searchButton',
          resultsTable: '.propertyTable',
        },
        lienUrl: 'https://ttc.lacounty.gov/property-tax-management-system',
      },
    },
    controllers: [
      {
        controllerId: 'controller-2',
        controllerType: 'Tax Sale',
        enabled: true,
        lastRun: new Date('2023-05-20'),
        nextScheduledRun: new Date('2023-08-20'),
        configuration: {
          url: 'https://ttc.lacounty.gov/property-tax-management-system',
          frequency: 'quarterly',
        },
      },
    ],
    properties: [],
  },
  'county-2': {
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
        searchUrl: 'https://sdttc.sandiegocounty.gov/search',
        lookupMethod: 'parcel_id',
        selectors: {},
      },
    },
    controllers: [],
    properties: [],
  },
  'county-3': {
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
        searchUrl: 'https://www.hctax.net/property/search',
        lookupMethod: 'account_number',
        selectors: {},
      },
    },
    controllers: [],
    properties: [],
  },
};

interface CountyDetailsProps {
  countyId: string;
}

const CountyDetails: React.FC<CountyDetailsProps> = ({ countyId }) => {
  const [county, setCounty] = useState<CountyObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulating API fetch
    setLoading(true);
    
    // In a real implementation, this would be an API call
    setTimeout(() => {
      setCounty(mockCounties[countyId] || null);
      setLoading(false);
    }, 800);
  }, [countyId]);

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading county details...</p>
      </div>
    );
  }

  if (!county) {
    return (
      <Card className="border-danger">
        <Card.Body>
          <Card.Title className="text-danger">County Not Found</Card.Title>
          <p>The county with ID {countyId} could not be found.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="county-details">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="text-muted">
            <small>{county.stateId}</small>
          </span>
          <h3>{county.name}</h3>
        </div>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2">
            <i className="bi bi-pencil me-1"></i>
            Edit
          </Button>
          <Button variant="primary" size="sm">
            <i className="bi bi-plus-lg me-1"></i>
            Add Property
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h1 className="display-4">{county.metadata.totalProperties}</h1>
              <Card.Text>Properties</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h1 className="display-4">{county.metadata.statistics.totalTaxLiens}</h1>
              <Card.Text>Tax Liens</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h1 className="display-4">${(county.metadata.statistics.averagePropertyValue / 1000).toFixed(0)}K</h1>
              <Card.Text>Avg. Property Value</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h1 className="display-4">${(county.metadata.statistics.totalValue / 1000000).toFixed(1)}M</h1>
              <Card.Text>Total Value</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tab.Container defaultActiveKey="properties">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="properties">Properties</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="search">Search Configuration</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="collectors">Data Collectors</Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Tab.Content>
          <Tab.Pane eventKey="properties">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between mb-3">
                  <Card.Title>Properties in {county.name}</Card.Title>
                  <div>
                    <Button variant="outline-secondary" size="sm" className="me-2">
                      <i className="bi bi-funnel me-1"></i>
                      Filter
                    </Button>
                    <Button variant="outline-secondary" size="sm">
                      <i className="bi bi-download me-1"></i>
                      Export
                    </Button>
                  </div>
                </div>
                
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Address</th>
                        <th>Type</th>
                        <th>Tax Status</th>
                        <th>Value</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {county.properties.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-3">
                            No properties added yet. 
                            <Button variant="link" size="sm">Import properties</Button> or 
                            <Button variant="link" size="sm">Add manually</Button>
                          </td>
                        </tr>
                      ) : (
                        county.properties.map(property => (
                          <tr key={property.id}>
                            <td>{property.address.street}</td>
                            <td>{property.metadata.propertyType}</td>
                            <td>
                              <Badge bg={property.metadata.taxStatus === 'Delinquent' ? 'danger' : 'success'}>
                                {property.metadata.taxStatus}
                              </Badge>
                            </td>
                            <td>${property.metadata.marketValue?.toLocaleString()}</td>
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
          
          <Tab.Pane eventKey="search">
            <Card>
              <Card.Body>
                <Card.Title>County Search Configuration</Card.Title>
                
                <Alert variant="info" className="mb-4">
                  <i className="bi bi-info-circle me-2"></i>
                  Configure how the system searches for properties and tax liens in this county's online records.
                </Alert>
                
                <div className="mb-3">
                  <h5>Search URL</h5>
                  <p className="text-muted mb-2">The URL of the county's property search page</p>
                  <div className="d-flex">
                    <code className="py-2 px-3 bg-light flex-grow-1 text-truncate">
                      {county.metadata.searchConfig.searchUrl}
                    </code>
                    <Button variant="outline-secondary" size="sm" className="ms-2">
                      <i className="bi bi-pencil"></i>
                    </Button>
                  </div>
                </div>
                
                <div className="mb-3">
                  <h5>Lookup Method</h5>
                  <p className="text-muted mb-2">The identifier used to search for properties</p>
                  <Badge bg="secondary" className="me-2">
                    {county.metadata.searchConfig.lookupMethod === 'parcel_id' ? 'Parcel ID' : 'Account Number'}
                  </Badge>
                  <Button variant="link" size="sm">Change</Button>
                </div>
                
                {county.metadata.searchConfig.lienUrl && (
                  <div className="mb-3">
                    <h5>Tax Lien URL</h5>
                    <p className="text-muted mb-2">The URL of the county's tax lien search page</p>
                    <div className="d-flex">
                      <code className="py-2 px-3 bg-light flex-grow-1 text-truncate">
                        {county.metadata.searchConfig.lienUrl}
                      </code>
                      <Button variant="outline-secondary" size="sm" className="ms-2">
                        <i className="bi bi-pencil"></i>
                      </Button>
                    </div>
                  </div>
                )}
                
                <hr />
                
                <div className="d-flex justify-content-end">
                  <Button variant="primary">
                    <i className="bi bi-save me-1"></i>
                    Save Configuration
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>
          
          <Tab.Pane eventKey="collectors">
            <Card>
              <Card.Body>
                <Card.Title>Data Collectors</Card.Title>
                {county.controllers.length === 0 ? (
                  <div className="text-center py-4">
                    <p>No data collectors configured for this county.</p>
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
                      {county.controllers.map(controller => (
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
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default CountyDetails; 