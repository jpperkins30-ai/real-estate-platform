import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Badge, Table, Spinner, Alert, Tabs, Tab, Button, Modal 
} from 'react-bootstrap';
import { FaCity, FaHome, FaEdit, FaTrash, FaDownload, FaSync, FaSearch } from 'react-icons/fa';
import axios from 'axios';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface CountyDetail {
  _id: string;
  id: string;
  name: string;
  type: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  metadata: {
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
      averagePropertyValue: number;
      totalPropertiesWithLiens: number;
      lastUpdated: string;
    };
  };
  controllers: {
    controllerId: string;
    controllerType: string;
    enabled: boolean;
    lastRun?: string;
    nextScheduledRun?: string;
    configuration: any;
  }[];
  searchConfig: {
    enabled: boolean;
    lastRun?: string;
    nextScheduledRun?: string;
    searchCriteria: {
      propertyTypes?: string[];
      minValue?: number;
      maxValue?: number;
      minSquareFeet?: number;
      maxSquareFeet?: number;
      minBedrooms?: number;
      maxBedrooms?: number;
      minBathrooms?: number;
      maxBathrooms?: number;
      minYearBuilt?: number;
      maxYearBuilt?: number;
      minLotSize?: number;
      maxLotSize?: number;
      propertyConditions?: string[];
      additionalFilters?: any;
    };
    notificationSettings?: {
      email?: string[];
      slack?: string[];
      webhook?: string[];
    };
  };
}

interface Property {
  _id: string;
  id: string;
  name: string;
  status: string;
  location: {
    address: {
      street: string;
      city: string;
      zipCode: string;
    };
  };
  taxStatus: {
    assessedValue: number;
    taxLienStatus?: string;
  };
}

interface State {
  _id: string;
  name: string;
  abbreviation: string;
}

const CountyDetailView: React.FC = () => {
  const { countyId } = useParams<{ countyId: string }>();
  const navigate = useNavigate();
  const [county, setCounty] = useState<CountyDetail | null>(null);
  const [parentState, setParentState] = useState<State | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [properties, setProperties] = useState<Property[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [searchActive, setSearchActive] = useState<boolean>(false);

  useEffect(() => {
    if (countyId) {
      fetchCountyDetails(countyId);
    }
  }, [countyId]);

  const fetchCountyDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/counties/${id}`);
      setCounty(response.data);
      
      // Fetch parent state info
      const stateResponse = await axios.get(`/api/states/${response.data.parentId}`);
      setParentState(stateResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching county details:', err);
      setError('Failed to load county details. Please try again later.');
      setLoading(false);
    }
  };

  const fetchProperties = async (pageNum: number = 1) => {
    if (!countyId) return;
    
    setPropertiesLoading(true);
    try {
      const response = await axios.get(`/api/properties/search?countyId=${countyId}&page=${pageNum}&limit=10`);
      setProperties(response.data.properties);
      setTotalProperties(response.data.pagination.totalItems);
      setPage(pageNum);
      setPropertiesLoading(false);
    } catch (err) {
      console.error('Error fetching properties:', err);
      setPropertiesLoading(false);
    }
  };

  const handleDeleteCounty = async () => {
    if (!countyId) return;
    
    try {
      await axios.delete(`/api/counties/${countyId}`);
      setShowDeleteModal(false);
      
      // Navigate back to the parent state
      if (county && county.parentId) {
        navigate(`/inventory/states/${county.parentId}`);
      } else {
        navigate('/inventory');
      }
    } catch (err: any) {
      console.error('Error deleting county:', err);
      setError(err.response?.data?.message || 'Failed to delete county. Please try again later.');
      setShowDeleteModal(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'properties' && properties.length === 0) {
      fetchProperties();
    }
  };

  const handleSearchToggle = async () => {
    if (!countyId || !county) return;
    
    try {
      await axios.patch(`/api/counties/${countyId}/search-config`, {
        enabled: !county.searchConfig.enabled
      });
      
      // Update local state
      setCounty({
        ...county,
        searchConfig: {
          ...county.searchConfig,
          enabled: !county.searchConfig.enabled
        }
      });
      
      setSearchActive(!county.searchConfig.enabled);
    } catch (err) {
      console.error('Error toggling search:', err);
    }
  };

  const handleExportData = async (format: 'csv' | 'excel') => {
    if (!countyId) return;
    
    try {
      const response = await axios.get(`/api/export/county/${countyId}?format=${format}`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${county?.name || 'county'}-data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Error exporting ${format} data:`, err);
      setError(`Failed to export ${format} data. Please try again later.`);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p>Loading county details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!county) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">County not found.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2>
                <FaCity className="me-2" />
                {county.name}
              </h2>
              {parentState && (
                <div className="text-muted">
                  Located in{' '}
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => navigate(`/inventory/states/${county.parentId}`)}
                  >
                    {parentState.name}, {parentState.abbreviation}
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Button 
                variant="outline-primary" 
                className="me-2"
                onClick={() => navigate(`/inventory/counties/${countyId}/edit`)}
              >
                <FaEdit /> Edit
              </Button>
              <Button 
                variant="outline-danger" 
                onClick={() => setShowDeleteModal(true)}
              >
                <FaTrash /> Delete
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <Card.Title>Overview</Card.Title>
              <div className="my-3">
                <Badge bg="primary">
                  {county.metadata.totalProperties} Properties
                </Badge>
              </div>
              <Table size="sm">
                <tbody>
                  <tr>
                    <td>Tax Liens:</td>
                    <td>{county.metadata.statistics.totalTaxLiens}</td>
                  </tr>
                  <tr>
                    <td>Total Value:</td>
                    <td>{formatCurrency(county.metadata.statistics.totalValue)}</td>
                  </tr>
                  <tr>
                    <td>Avg Property Value:</td>
                    <td>
                      {county.metadata.statistics.averagePropertyValue
                        ? formatCurrency(county.metadata.statistics.averagePropertyValue)
                        : 'N/A'}
                    </td>
                  </tr>
                  <tr>
                    <td>Last Updated:</td>
                    <td>{formatDate(county.metadata.statistics.lastUpdated)}</td>
                  </tr>
                </tbody>
              </Table>
              <div className="d-grid gap-2 mt-3">
                <Button 
                  variant={county.searchConfig.enabled ? "success" : "outline-secondary"}
                  size="sm"
                  onClick={handleSearchToggle}
                >
                  <FaSearch /> {county.searchConfig.enabled ? 'Auto Search: ON' : 'Auto Search: OFF'}
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => handleExportData('csv')}
                >
                  <FaDownload /> Export CSV
                </Button>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => handleExportData('excel')}
                >
                  <FaDownload /> Export Excel
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={9}>
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => handleTabChange(k || 'overview')}
            className="mb-3"
          >
            <Tab eventKey="overview" title="Overview">
              <Card>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h4>County Information</h4>
                      <Table bordered hover>
                        <tbody>
                          <tr>
                            <td>ID:</td>
                            <td>{county.id}</td>
                          </tr>
                          <tr>
                            <td>Name:</td>
                            <td>{county.name}</td>
                          </tr>
                          <tr>
                            <td>State:</td>
                            <td>{parentState?.name || county.parentId}</td>
                          </tr>
                          <tr>
                            <td>Created:</td>
                            <td>{formatDate(county.createdAt)}</td>
                          </tr>
                          <tr>
                            <td>Updated:</td>
                            <td>{formatDate(county.updatedAt)}</td>
                          </tr>
                          <tr>
                            <td>Type:</td>
                            <td>{county.type}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col md={6}>
                      {county.geometry && county.geometry.coordinates.length > 0 && (
                        <div style={{ height: '300px' }}>
                          <MapContainer 
                            center={[39.8283, -98.5795]} 
                            zoom={5} 
                            style={{ height: '100%', width: '100%' }}
                          >
                            <TileLayer
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            <GeoJSON 
                              data={{
                                type: 'Feature',
                                properties: {},
                                geometry: county.geometry
                              } as any}
                            />
                          </MapContainer>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="properties" title="Properties">
              <Card>
                <Card.Body>
                  {propertiesLoading ? (
                    <div className="text-center p-4">
                      <Spinner animation="border" />
                      <p>Loading properties...</p>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between mb-3">
                        <h4>Properties in {county.name}</h4>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/inventory/counties/${countyId}/properties/new`)}
                        >
                          Add Property
                        </Button>
                      </div>
                      
                      {properties.length === 0 ? (
                        <Alert variant="info">
                          No properties found in this county. Add a property to get started.
                        </Alert>
                      ) : (
                        <>
                          <Table striped bordered hover responsive>
                            <thead>
                              <tr>
                                <th>Name</th>
                                <th>Address</th>
                                <th>Status</th>
                                <th>Value</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {properties.map(property => (
                                <tr key={property._id}>
                                  <td>{property.name}</td>
                                  <td>{property.location.address.street}, {property.location.address.city}</td>
                                  <td>
                                    <Badge bg={property.status === 'Tax Lien' ? 'warning' : 
                                          property.status === 'Active' ? 'success' : 'secondary'}>
                                      {property.status}
                                    </Badge>
                                  </td>
                                  <td>{formatCurrency(property.taxStatus.assessedValue)}</td>
                                  <td>
                                    <Button
                                      variant="link"
                                      size="sm"
                                      onClick={() => navigate(`/inventory/properties/${property._id}`)}
                                    >
                                      View
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                          
                          {/* Simple pagination */}
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              Showing {properties.length} of {totalProperties} properties
                            </div>
                            <div>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="me-2"
                                disabled={page === 1}
                                onClick={() => fetchProperties(page - 1)}
                              >
                                Previous
                              </Button>
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                disabled={page * 10 >= totalProperties}
                                onClick={() => fetchProperties(page + 1)}
                              >
                                Next
                              </Button>
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="search-config" title="Search Config">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-3">
                    <h4>Property Search Configuration</h4>
                    <div>
                      <Button
                        variant={county.searchConfig.enabled ? "success" : "outline-secondary"}
                        size="sm"
                        onClick={handleSearchToggle}
                      >
                        {county.searchConfig.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>
                  
                  <Alert variant="info">
                    Configure automated property searches for {county.name}. When enabled, the system will periodically
                    search for new properties based on your criteria and notify you when matching properties are found.
                  </Alert>
                  
                  <Row>
                    <Col md={6}>
                      <h5>Search Criteria</h5>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mb-3"
                        onClick={() => navigate(`/inventory/counties/${countyId}/search-config/edit`)}
                      >
                        Edit Search Criteria
                      </Button>
                      
                      <Table bordered>
                        <tbody>
                          {county.searchConfig.searchCriteria.propertyTypes?.length > 0 && (
                            <tr>
                              <td>Property Types:</td>
                              <td>
                                {county.searchConfig.searchCriteria.propertyTypes.join(', ')}
                              </td>
                            </tr>
                          )}
                          {(county.searchConfig.searchCriteria.minValue !== undefined || 
                            county.searchConfig.searchCriteria.maxValue !== undefined) && (
                            <tr>
                              <td>Value Range:</td>
                              <td>
                                {county.searchConfig.searchCriteria.minValue !== undefined ? 
                                  formatCurrency(county.searchConfig.searchCriteria.minValue) : '$0'} 
                                {' - '}
                                {county.searchConfig.searchCriteria.maxValue !== undefined ? 
                                  formatCurrency(county.searchConfig.searchCriteria.maxValue) : 'No Max'}
                              </td>
                            </tr>
                          )}
                          {/* Add more search criteria display here */}
                        </tbody>
                      </Table>
                    </Col>
                    
                    <Col md={6}>
                      <h5>Notification Settings</h5>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mb-3"
                        onClick={() => navigate(`/inventory/counties/${countyId}/notifications/edit`)}
                      >
                        Edit Notifications
                      </Button>
                      
                      <Table bordered>
                        <tbody>
                          {county.searchConfig.notificationSettings?.email?.length > 0 && (
                            <tr>
                              <td>Email Notifications:</td>
                              <td>
                                {county.searchConfig.notificationSettings.email.join(', ')}
                              </td>
                            </tr>
                          )}
                          {county.searchConfig.notificationSettings?.slack?.length > 0 && (
                            <tr>
                              <td>Slack Notifications:</td>
                              <td>
                                {county.searchConfig.notificationSettings.slack.join(', ')}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete <strong>{county.name}</strong>?</p>
          <Alert variant="warning">
            This action cannot be undone. All associated properties will be orphaned.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteCounty}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CountyDetailView; 