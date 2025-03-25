import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card,
  Spinner, 
  Alert, 
  Breadcrumb, 
  Badge,
  Table,
  Carousel,
  ListGroup,
  Tab,
  Nav
} from 'react-bootstrap';
import { usePropertyWithControllers, useCounty } from '../../services/inventoryService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import AttachedControllers from './controllers/AttachedControllers';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for Leaflet marker icon issue in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'
});

const PropertyDetail: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  
  const { 
    data: property, 
    isLoading: propertyLoading, 
    error: propertyError,
    refetch: refetchProperty 
  } = usePropertyWithControllers(propertyId);
  
  const { 
    data: county,
    isLoading: countyLoading,
    error: countyError
  } = useCounty(property?.countyId);

  const isLoading = propertyLoading || (property && countyLoading);
  const error = propertyError || countyError;

  if (isLoading) {
    return (
      <Container className="my-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="my-4">
        <Alert variant="danger">
          Error loading property: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container className="my-4">
        <Alert variant="warning">Property not found.</Alert>
      </Container>
    );
  }

  // Format currency
  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'N/A';
    return `$${value.toLocaleString()}`;
  };

  return (
    <Container className="my-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/inventory/states" }}>
          States
        </Breadcrumb.Item>
        {county && (
          <>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/inventory/states/${county.stateId}` }}>
              Counties
            </Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/inventory/counties/${county.id}/properties` }}>
              {county.name}
            </Breadcrumb.Item>
          </>
        )}
        <Breadcrumb.Item active>Property Details</Breadcrumb.Item>
      </Breadcrumb>

      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>{property.address.street}</h1>
            <Badge bg={
              property.status === 'active' ? 'success' : 
              property.status === 'pending' ? 'warning' : 'secondary'
            } className="fs-6">
              {property.status}
            </Badge>
          </div>
          <h5 className="text-muted">
            {property.address.city}, {property.address.state} {property.address.zip}
          </h5>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={8}>
          {/* Property Images */}
          {property.images && property.images.length > 0 ? (
            <Card className="mb-4">
              <Carousel>
                {property.images.map((image, index) => (
                  <Carousel.Item key={index}>
                    <img
                      className="d-block w-100"
                      src={image}
                      alt={`Property Image ${index + 1}`}
                      style={{ height: '400px', objectFit: 'cover' }}
                    />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Card>
          ) : (
            <Card className="mb-4">
              <div 
                className="bg-secondary text-white d-flex align-items-center justify-content-center"
                style={{ height: '400px' }}
              >
                No Images Available
              </div>
            </Card>
          )}

          {/* Tabs for Property Details */}
          <Tab.Container defaultActiveKey="overview">
            <Card>
              <Card.Header>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="overview">Overview</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="details">Details</Nav.Link>
                  </Nav.Item>
                  {property.location && (
                    <Nav.Item>
                      <Nav.Link eventKey="location">Location</Nav.Link>
                    </Nav.Item>
                  )}
                  {property.taxStatus && (
                    <Nav.Item>
                      <Nav.Link eventKey="taxStatus">Tax Status</Nav.Link>
                    </Nav.Item>
                  )}
                  {property.controllers && property.controllers.length > 0 && (
                    <Nav.Item>
                      <Nav.Link eventKey="controllers">Controllers</Nav.Link>
                    </Nav.Item>
                  )}
                  {property.tags && property.tags.length > 0 && (
                    <Nav.Item>
                      <Nav.Link eventKey="tags">Tags</Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
              </Card.Header>
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="overview">
                    <Row>
                      <Col md={6}>
                        <h5>Property Information</h5>
                        <Table striped bordered>
                          <tbody>
                            <tr>
                              <th>Property Type</th>
                              <td>{property.propertyType || 'N/A'}</td>
                            </tr>
                            <tr>
                              <th>Bedrooms</th>
                              <td>{property.bedrooms || 'N/A'}</td>
                            </tr>
                            <tr>
                              <th>Bathrooms</th>
                              <td>{property.bathrooms || 'N/A'}</td>
                            </tr>
                            <tr>
                              <th>Building Size</th>
                              <td>{property.buildingSize ? `${property.buildingSize.toLocaleString()} sqft` : 'N/A'}</td>
                            </tr>
                            <tr>
                              <th>Lot Size</th>
                              <td>{property.lotSize ? `${property.lotSize.toLocaleString()} sqft` : 'N/A'}</td>
                            </tr>
                            <tr>
                              <th>Year Built</th>
                              <td>{property.yearBuilt || 'N/A'}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                      <Col md={6}>
                        <h5>Financial Information</h5>
                        <Table striped bordered>
                          <tbody>
                            <tr>
                              <th>Last Sale Price</th>
                              <td>{formatCurrency(property.lastSalePrice)}</td>
                            </tr>
                            <tr>
                              <th>Last Sale Date</th>
                              <td>{property.lastSaleDate ? new Date(property.lastSaleDate).toLocaleDateString() : 'N/A'}</td>
                            </tr>
                            <tr>
                              <th>Tax Assessed Value</th>
                              <td>{formatCurrency(property.taxAssessedValue)}</td>
                            </tr>
                            <tr>
                              <th>Tax Year</th>
                              <td>{property.taxYear || 'N/A'}</td>
                            </tr>
                            {property.taxStatus?.taxLienAmount && (
                              <tr>
                                <th>Tax Lien Amount</th>
                                <td className="text-danger">
                                  {formatCurrency(property.taxStatus.taxLienAmount)}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  </Tab.Pane>
                  <Tab.Pane eventKey="details">
                    <Row>
                      <Col>
                        <h5>Property Details</h5>
                        <Table striped bordered>
                          <tbody>
                            <tr>
                              <th>Property ID</th>
                              <td>{property.id}</td>
                            </tr>
                            {property.parcelId && (
                              <tr>
                                <th>Parcel ID</th>
                                <td>{property.parcelId}</td>
                              </tr>
                            )}
                            <tr>
                              <th>Property Type</th>
                              <td>{property.propertyType}</td>
                            </tr>
                            {property.zoning && (
                              <tr>
                                <th>Zoning</th>
                                <td>{property.zoning}</td>
                              </tr>
                            )}
                            <tr>
                              <th>Status</th>
                              <td>{property.status}</td>
                            </tr>
                            <tr>
                              <th>Created</th>
                              <td>{new Date(property.createdAt).toLocaleString()}</td>
                            </tr>
                            <tr>
                              <th>Last Updated</th>
                              <td>{new Date(property.updatedAt).toLocaleString()}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                    </Row>
                  </Tab.Pane>
                  {property.location && (
                    <Tab.Pane eventKey="location">
                      <h5>Property Location</h5>
                      <div style={{ height: '400px', width: '100%' }}>
                        <MapContainer 
                          center={[property.location.lat, property.location.lng]} 
                          zoom={15} 
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[property.location.lat, property.location.lng]}>
                            <Popup>
                              {property.address.street}<br />
                              {property.address.city}, {property.address.state} {property.address.zip}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    </Tab.Pane>
                  )}
                  {property.taxStatus && (
                    <Tab.Pane eventKey="taxStatus">
                      <h5>Tax Information</h5>
                      <Table striped bordered>
                        <tbody>
                          <tr>
                            <th>Assessed Value</th>
                            <td>{formatCurrency(property.taxStatus.assessedValue)}</td>
                          </tr>
                          <tr>
                            <th>Market Value</th>
                            <td>{formatCurrency(property.taxStatus.marketValue)}</td>
                          </tr>
                          <tr>
                            <th>Last Assessment Date</th>
                            <td>{property.taxStatus.lastAssessmentDate ? new Date(property.taxStatus.lastAssessmentDate).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                          <tr>
                            <th>Tax Rate</th>
                            <td>{property.taxStatus.taxRate}%</td>
                          </tr>
                          <tr>
                            <th>Annual Tax Amount</th>
                            <td>{formatCurrency(property.taxStatus.annualTaxAmount)}</td>
                          </tr>
                          {property.taxStatus.taxLienAmount && (
                            <>
                              <tr>
                                <th>Tax Lien Amount</th>
                                <td className="text-danger">{formatCurrency(property.taxStatus.taxLienAmount)}</td>
                              </tr>
                              <tr>
                                <th>Tax Lien Date</th>
                                <td>{property.taxStatus.taxLienDate ? new Date(property.taxStatus.taxLienDate).toLocaleDateString() : 'N/A'}</td>
                              </tr>
                              <tr>
                                <th>Tax Lien Status</th>
                                <td>
                                  <Badge bg={
                                    property.taxStatus.taxLienStatus === 'Active' ? 'danger' : 
                                    property.taxStatus.taxLienStatus === 'Paid' ? 'success' : 
                                    'warning'
                                  }>
                                    {property.taxStatus.taxLienStatus || 'Unknown'}
                                  </Badge>
                                </td>
                              </tr>
                            </>
                          )}
                          <tr>
                            <th>Last Payment Date</th>
                            <td>{property.taxStatus.lastPaymentDate ? new Date(property.taxStatus.lastPaymentDate).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                          <tr>
                            <th>Next Payment Due</th>
                            <td>{property.taxStatus.nextPaymentDue ? new Date(property.taxStatus.nextPaymentDue).toLocaleDateString() : 'N/A'}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Tab.Pane>
                  )}
                  {property.controllers && (
                    <Tab.Pane eventKey="controllers">
                      <AttachedControllers 
                        objectType="property"
                        objectId={property.id}
                        controllers={property.controllers}
                        onControllerUpdate={() => refetchProperty()}
                      />
                    </Tab.Pane>
                  )}
                  {property.tags && property.tags.length > 0 && (
                    <Tab.Pane eventKey="tags">
                      <h5>Property Tags</h5>
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        {property.tags.map((tag, index) => (
                          <Badge key={index} bg="info" className="p-2">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </Tab.Pane>
                  )}
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>
        <Col lg={4}>
          {/* Sidebar Cards */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Summary</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Status:</span>
                <Badge bg={
                  property.status === 'active' ? 'success' : 
                  property.status === 'pending' ? 'warning' : 'secondary'
                }>
                  {property.status}
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between">
                <span>Property Type:</span>
                <span>{property.propertyType}</span>
              </ListGroup.Item>
              {property.bedrooms && (
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Bedrooms:</span>
                  <span>{property.bedrooms}</span>
                </ListGroup.Item>
              )}
              {property.bathrooms && (
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Bathrooms:</span>
                  <span>{property.bathrooms}</span>
                </ListGroup.Item>
              )}
              {property.buildingSize && (
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Building Size:</span>
                  <span>{property.buildingSize.toLocaleString()} sqft</span>
                </ListGroup.Item>
              )}
              {property.lastSalePrice && (
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Last Sale Price:</span>
                  <span className="fw-bold">{formatCurrency(property.lastSalePrice)}</span>
                </ListGroup.Item>
              )}
              {property.taxStatus?.taxLienAmount && (
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Tax Lien:</span>
                  <span className="text-danger fw-bold">{formatCurrency(property.taxStatus.taxLienAmount)}</span>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>

          {/* Location Summary */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Location</h5>
            </Card.Header>
            <Card.Body>
              <address>
                {property.address.street}<br />
                {property.address.city}, {property.address.state} {property.address.zip}<br />
                {county && <>{county.name} County</>}
              </address>
              {property.location && (
                <div className="mt-3">
                  <small>
                    <strong>Coordinates:</strong><br />
                    Latitude: {property.location.lat}<br />
                    Longitude: {property.location.lng}
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Additional Cards */}
          {property.parcelId && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Parcel Information</h5>
              </Card.Header>
              <Card.Body>
                <p>Parcel ID: {property.parcelId}</p>
                {property.taxAssessedValue && (
                  <p>Tax Assessed Value: {formatCurrency(property.taxAssessedValue)}</p>
                )}
                {property.taxYear && (
                  <p>Tax Year: {property.taxYear}</p>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Attached Controllers Summary */}
          {property.controllers && property.controllers.length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Attached Controllers</h5>
              </Card.Header>
              <ListGroup variant="flush">
                {property.controllers.map((controller) => (
                  <ListGroup.Item key={controller.controllerId} className="d-flex justify-content-between align-items-center">
                    <div>
                      <div>{controller.controllerType}</div>
                      <small className="text-muted">
                        {controller.enabled ? 'Enabled' : 'Disabled'}
                      </small>
                    </div>
                    <Badge bg={controller.enabled ? 'success' : 'secondary'}>
                      {controller.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Card.Footer>
                <Link to="#" onClick={(e) => {
                  e.preventDefault();
                  const tabEl = document.querySelector('a[data-rr-ui-event-key="controllers"]');
                  if (tabEl) (tabEl as HTMLElement).click();
                }}>
                  Manage Controllers
                </Link>
              </Card.Footer>
            </Card>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default PropertyDetail; 