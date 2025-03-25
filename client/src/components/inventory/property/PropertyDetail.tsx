import React, { useState } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Nav, 
  Tab, 
  Table, 
  Badge, 
  Button, 
  Alert,
  ListGroup
} from 'react-bootstrap';
import { usePropertyWithControllers } from '../../../services/inventoryService';
import { useQueryClient } from 'react-query';
import { Property } from '../../../types/inventory';
import AttachedControllers from '../controllers/AttachedControllers';
import PropertyController from '../controllers/PropertyController';
import LoadingSpinner from '../../common/LoadingSpinner';

interface PropertyDetailProps {
  propertyId: string;
}

const PropertyDetail: React.FC<PropertyDetailProps> = ({ propertyId }) => {
  const { data: property, isLoading, error } = usePropertyWithControllers(propertyId);
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();

  // Format currency values
  const formatCurrency = (value?: number) => {
    if (value === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date values
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !property) {
    return <Alert variant="danger">Error loading property details. Please try again.</Alert>;
  }

  return (
    <div className="property-detail">
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3>{property.propertyAddress}</h3>
              <div className="text-muted">{property.city}, {property.stateId} {property.zipCode}</div>
            </div>
            <div>
              <Badge 
                bg={property.metadata.taxStatus === 'Delinquent' ? 'danger' : 
                    property.metadata.taxStatus === 'Paid' ? 'success' : 'secondary'}
                className="me-2"
              >
                {property.metadata.taxStatus}
              </Badge>
              <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
              <Button variant="outline-secondary" size="sm">Export</Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="overview">Overview</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="details">Property Details</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="tax">Tax Status</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="controllers">Controllers</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="overview">
                <Row>
                  <Col md={6}>
                    <Card className="mb-3">
                      <Card.Header>Basic Information</Card.Header>
                      <Card.Body>
                        <ListGroup variant="flush">
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Owner:</span>
                            <span className="fw-bold">{property.ownerName}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Property Type:</span>
                            <span>{property.metadata.propertyType}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Parcel ID:</span>
                            <span>{property.parcelId}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Tax Account:</span>
                            <span>{property.taxAccountNumber}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Year Built:</span>
                            <span>{property.metadata.yearBuilt || 'N/A'}</span>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>

                    <Card>
                      <Card.Header>Size Information</Card.Header>
                      <Card.Body>
                        <ListGroup variant="flush">
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Land Area:</span>
                            <span>
                              {property.metadata.landArea ? 
                                `${property.metadata.landArea.toLocaleString()} ${property.metadata.landAreaUnit || 'sq ft'}` : 
                                'N/A'}
                            </span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Building Area:</span>
                            <span>
                              {property.metadata.buildingArea ? 
                                `${property.metadata.buildingArea.toLocaleString()} ${property.metadata.buildingAreaUnit || 'sq ft'}` : 
                                'N/A'}
                            </span>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                  
                  <Col md={6}>
                    <Card className="mb-3">
                      <Card.Header>Tax Information</Card.Header>
                      <Card.Body>
                        <ListGroup variant="flush">
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Tax Status:</span>
                            <Badge 
                              bg={property.metadata.taxStatus === 'Delinquent' ? 'danger' : 
                                  property.metadata.taxStatus === 'Paid' ? 'success' : 'secondary'}
                            >
                              {property.metadata.taxStatus}
                            </Badge>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Assessed Value:</span>
                            <span>{formatCurrency(property.metadata.assessedValue)}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Market Value:</span>
                            <span>{formatCurrency(property.metadata.marketValue)}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Tax Due:</span>
                            <span>{formatCurrency(property.metadata.taxDue)}</span>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>

                    <Card>
                      <Card.Header>Last Sale Information</Card.Header>
                      <Card.Body>
                        <ListGroup variant="flush">
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Sale Type:</span>
                            <span>{property.metadata.saleType || 'N/A'}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Sale Amount:</span>
                            <span>{formatCurrency(property.metadata.saleAmount)}</span>
                          </ListGroup.Item>
                          <ListGroup.Item className="d-flex justify-content-between align-items-center">
                            <span>Sale Date:</span>
                            <span>{formatDate(property.metadata.saleDate)}</span>
                          </ListGroup.Item>
                        </ListGroup>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="details">
                <Row>
                  <Col md={12}>
                    <Card>
                      <Card.Header>Property Details</Card.Header>
                      <Card.Body>
                        <Table striped bordered>
                          <tbody>
                            <tr>
                              <td>Property Address</td>
                              <td>{property.propertyAddress}</td>
                            </tr>
                            <tr>
                              <td>City</td>
                              <td>{property.city || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td>Zip Code</td>
                              <td>{property.zipCode || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td>Property Type</td>
                              <td>{property.metadata.propertyType}</td>
                            </tr>
                            <tr>
                              <td>Year Built</td>
                              <td>{property.metadata.yearBuilt || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td>Land Area</td>
                              <td>
                                {property.metadata.landArea ? 
                                  `${property.metadata.landArea.toLocaleString()} ${property.metadata.landAreaUnit || 'sq ft'}` : 
                                  'N/A'}
                              </td>
                            </tr>
                            <tr>
                              <td>Building Area</td>
                              <td>
                                {property.metadata.buildingArea ? 
                                  `${property.metadata.buildingArea.toLocaleString()} ${property.metadata.buildingAreaUnit || 'sq ft'}` : 
                                  'N/A'}
                              </td>
                            </tr>
                            <tr>
                              <td>Owner Name</td>
                              <td>{property.ownerName}</td>
                            </tr>
                            <tr>
                              <td>Parcel ID</td>
                              <td>{property.parcelId}</td>
                            </tr>
                            <tr>
                              <td>Tax Account Number</td>
                              <td>{property.taxAccountNumber}</td>
                            </tr>
                            <tr>
                              <td>Data Source</td>
                              <td>{property.metadata.dataSource || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td>Lookup Method</td>
                              <td>{property.metadata.lookupMethod || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td>Last Updated</td>
                              <td>{formatDate(property.metadata.lastUpdated)}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="tax">
                <Row>
                  <Col md={12}>
                    <Card>
                      <Card.Header>Tax Status Information</Card.Header>
                      <Card.Body>
                        <div className="d-flex align-items-center mb-4">
                          <h5 className="me-3 mb-0">Current Tax Status:</h5>
                          <Badge 
                            bg={property.metadata.taxStatus === 'Delinquent' ? 'danger' : 
                                property.metadata.taxStatus === 'Paid' ? 'success' : 'secondary'}
                            style={{ fontSize: '1rem', padding: '0.5rem 0.75rem' }}
                          >
                            {property.metadata.taxStatus}
                          </Badge>
                        </div>

                        <Table striped bordered>
                          <tbody>
                            <tr>
                              <td>Assessed Value</td>
                              <td>{formatCurrency(property.metadata.assessedValue)}</td>
                            </tr>
                            <tr>
                              <td>Market Value</td>
                              <td>{formatCurrency(property.metadata.marketValue)}</td>
                            </tr>
                            <tr>
                              <td>Current Tax Due</td>
                              <td>{formatCurrency(property.metadata.taxDue)}</td>
                            </tr>
                            <tr>
                              <td>Sale Type</td>
                              <td>{property.metadata.saleType || 'N/A'}</td>
                            </tr>
                            <tr>
                              <td>Last Sale Amount</td>
                              <td>{formatCurrency(property.metadata.saleAmount)}</td>
                            </tr>
                            <tr>
                              <td>Last Sale Date</td>
                              <td>{formatDate(property.metadata.saleDate)}</td>
                            </tr>
                          </tbody>
                        </Table>

                        {property.metadata.taxStatus === 'Delinquent' && (
                          <Alert variant="warning" className="mt-3">
                            <h6 className="alert-heading">Delinquent Tax Notice</h6>
                            <p>This property has delinquent taxes. It may be eligible for tax lien investment.</p>
                          </Alert>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Tab.Pane>

              <Tab.Pane eventKey="controllers">
                <PropertyController
                  property={property}
                  onUpdate={() => queryClient.invalidateQueries(['property', propertyId, 'controllers'])}
                />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </div>
  );
};

export default PropertyDetail; 