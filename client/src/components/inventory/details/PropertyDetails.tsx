import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Badge, Nav, Tab } from 'react-bootstrap';
import { PropertyObject } from '../../../types/inventory';

// Mock data for development
const mockProperties: Record<string, PropertyObject> = {
  'property-1': {
    id: 'property-1',
    address: {
      street: '123 Main St',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
    },
    type: 'property',
    parentId: 'county-1',
    countyId: 'county-1',
    stateId: 'state-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    geometry: {
      type: 'Point',
      coordinates: [-118.2437, 34.0522],
    },
    metadata: {
      propertyType: 'Residential',
      yearBuilt: 1985,
      landArea: 5500,
      landAreaUnit: 'sqft',
      buildingArea: 2200,
      buildingAreaUnit: 'sqft',
      taxStatus: 'Delinquent',
      assessedValue: 450000,
      marketValue: 520000,
      saleAmount: 410000,
      saleDate: new Date('2018-05-15'),
      taxAmount: 5200,
      taxYear: 2023,
      taxDueDate: new Date('2023-12-10'),
      liens: [
        {
          id: 'lien-1',
          amount: 8500,
          interestRate: 0.18,
          startDate: new Date('2023-01-15'),
          redemptionDeadline: new Date('2024-01-15'),
        },
      ],
    },
    controllers: [],
  },
  'property-2': {
    id: 'property-2',
    address: {
      street: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90002',
    },
    type: 'property',
    parentId: 'county-1',
    countyId: 'county-1',
    stateId: 'state-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    geometry: {
      type: 'Point',
      coordinates: [-118.3125, 34.0668],
    },
    metadata: {
      propertyType: 'Commercial',
      yearBuilt: 1978,
      landArea: 12000,
      landAreaUnit: 'sqft',
      buildingArea: 8500,
      buildingAreaUnit: 'sqft',
      taxStatus: 'Delinquent',
      assessedValue: 780000,
      marketValue: 850000,
      saleAmount: 720000,
      saleDate: new Date('2015-11-20'),
      taxAmount: 9600,
      taxYear: 2023,
      taxDueDate: new Date('2023-12-10'),
      liens: [
        {
          id: 'lien-2',
          amount: 15800,
          interestRate: 0.18,
          startDate: new Date('2022-06-15'),
          redemptionDeadline: new Date('2023-06-15'),
        },
      ],
    },
    controllers: [],
  },
};

interface PropertyDetailsProps {
  propertyId: string;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ propertyId }) => {
  const [property, setProperty] = useState<PropertyObject | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulating API fetch
    setLoading(true);
    
    // In a real implementation, this would be an API call
    setTimeout(() => {
      setProperty(mockProperties[propertyId] || null);
      setLoading(false);
    }, 800);
  }, [propertyId]);

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <Card className="border-danger">
        <Card.Body>
          <Card.Title className="text-danger">Property Not Found</Card.Title>
          <p>The property with ID {propertyId} could not be found.</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <div className="property-details">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <span className="text-muted">
            <small>{property.stateId} | {property.countyId}</small>
          </span>
          <h3>{property.address.street}</h3>
          <p className="text-muted mb-0">
            {property.address.city}, {property.address.state} {property.address.zipCode}
          </p>
        </div>
        <div>
          <Button variant="outline-secondary" size="sm" className="me-2">
            <i className="bi bi-pencil me-1"></i>
            Edit
          </Button>
          <Button variant="primary" size="sm">
            <i className="bi bi-arrow-up-right-square me-1"></i>
            View on Map
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted">Property Type</h6>
              <div className="d-flex align-items-center">
                <i className="bi bi-building me-2" style={{ fontSize: '1.5rem' }}></i>
                <span className="h4 mb-0">{property.metadata.propertyType}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted">Market Value</h6>
              <div className="d-flex align-items-center">
                <i className="bi bi-cash-stack me-2" style={{ fontSize: '1.5rem' }}></i>
                <span className="h4 mb-0">${property.metadata.marketValue?.toLocaleString()}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted">Tax Status</h6>
              <div className="d-flex align-items-center">
                <i className="bi bi-exclamation-triangle me-2" style={{ fontSize: '1.5rem', color: property.metadata.taxStatus === 'Delinquent' ? '#dc3545' : '#198754' }}></i>
                <Badge 
                  bg={property.metadata.taxStatus === 'Delinquent' ? 'danger' : 'success'}
                  className="fs-6 py-2"
                >
                  {property.metadata.taxStatus}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <h6 className="text-muted">Lien Total</h6>
              <div className="d-flex align-items-center">
                <i className="bi bi-file-earmark-text me-2" style={{ fontSize: '1.5rem' }}></i>
                <span className="h4 mb-0">
                  ${property.metadata.liens?.reduce((total, lien) => total + lien.amount, 0).toLocaleString() || '0'}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tab.Container defaultActiveKey="details">
        <Nav variant="tabs" className="mb-3">
          <Nav.Item>
            <Nav.Link eventKey="details">Property Details</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="liens">Tax Liens</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="history">Collection History</Nav.Link>
          </Nav.Item>
        </Nav>
        
        <Tab.Content>
          <Tab.Pane eventKey="details">
            <Card>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h5 className="mb-4">Property Information</h5>
                    
                    <Table className="table-borderless">
                      <tbody>
                        <tr>
                          <td className="text-muted">Year Built</td>
                          <td>{property.metadata.yearBuilt || 'Unknown'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Land Area</td>
                          <td>
                            {property.metadata.landArea?.toLocaleString()} {property.metadata.landAreaUnit}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted">Building Area</td>
                          <td>
                            {property.metadata.buildingArea?.toLocaleString()} {property.metadata.buildingAreaUnit}
                          </td>
                        </tr>
                        <tr>
                          <td className="text-muted">Last Sale</td>
                          <td>
                            ${property.metadata.saleAmount?.toLocaleString()} 
                            {property.metadata.saleDate && 
                              <span className="text-muted ms-2">
                                ({property.metadata.saleDate.toLocaleDateString()})
                              </span>
                            }
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                  
                  <Col md={6}>
                    <h5 className="mb-4">Tax Information</h5>
                    
                    <Table className="table-borderless">
                      <tbody>
                        <tr>
                          <td className="text-muted">Assessed Value</td>
                          <td>${property.metadata.assessedValue?.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Tax Amount</td>
                          <td>${property.metadata.taxAmount?.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Tax Year</td>
                          <td>{property.metadata.taxYear}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Due Date</td>
                          <td>
                            {property.metadata.taxDueDate?.toLocaleDateString()}
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </Col>
                </Row>
                
                <hr />
                
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Location</h5>
                  <Button variant="outline-secondary" size="sm">
                    <i className="bi bi-map me-1"></i> View on Map
                  </Button>
                </div>
                
                <div className="mt-3 bg-light" style={{ height: '300px' }}>
                  <div className="w-100 h-100 d-flex justify-content-center align-items-center text-muted">
                    <div className="text-center">
                      <i className="bi bi-map" style={{ fontSize: '48px' }}></i>
                      <p>Map Preview Placeholder</p>
                      <p>Coordinates: {property.geometry.coordinates.join(', ')}</p>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>
          
          <Tab.Pane eventKey="liens">
            <Card>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">Tax Liens</h5>
                  <Button variant="outline-primary" size="sm">
                    <i className="bi bi-plus-lg me-1"></i>
                    Add Lien
                  </Button>
                </div>
                
                {property.metadata.liens && property.metadata.liens.length > 0 ? (
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Amount</th>
                        <th>Interest Rate</th>
                        <th>Start Date</th>
                        <th>Redemption Deadline</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {property.metadata.liens.map(lien => (
                        <tr key={lien.id}>
                          <td>{lien.id}</td>
                          <td>${lien.amount.toLocaleString()}</td>
                          <td>{(lien.interestRate * 100).toFixed(2)}%</td>
                          <td>{lien.startDate.toLocaleDateString()}</td>
                          <td>{lien.redemptionDeadline.toLocaleDateString()}</td>
                          <td>
                            <Badge bg={new Date() > lien.redemptionDeadline ? 'danger' : 'warning'}>
                              {new Date() > lien.redemptionDeadline ? 'Expired' : 'Active'}
                            </Badge>
                          </td>
                          <td>
                            <Button variant="outline-secondary" size="sm">
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <div className="text-center py-4 bg-light">
                    <p className="mb-2">No tax liens recorded for this property</p>
                    <Button variant="outline-primary" size="sm">
                      <i className="bi bi-plus-lg me-1"></i>
                      Add Lien
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>
          
          <Tab.Pane eventKey="history">
            <Card>
              <Card.Body>
                <h5>Data Collection History</h5>
                <p className="text-muted">
                  Recent data collection activities for this property will appear here.
                </p>
                
                <div className="text-center py-4 bg-light">
                  <p>No collection history available</p>
                </div>
              </Card.Body>
            </Card>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </div>
  );
};

export default PropertyDetails; 