import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, Row, Col, Card, Badge, Table, Spinner, Alert, Tabs, Tab, Button, Modal 
} from 'react-bootstrap';
import { FaMapMarkerAlt, FaCity, FaChartBar, FaEdit, FaTrash, FaDownload, FaSync } from 'react-icons/fa';
import axios from 'axios';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface StateDetail {
  _id: string;
  id: string;
  name: string;
  abbreviation: string;
  type: string;
  parentId: string;
  createdAt: string;
  updatedAt: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  metadata: {
    totalCounties: number;
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
  counties: {
    _id: string;
    name: string;
    metadata: {
      totalProperties: number;
      statistics: {
        totalTaxLiens: number;
        totalValue: number;
      }
    }
  }[];
}

interface County {
  _id: string;
  name: string;
  metadata: {
    totalProperties: number;
    statistics: {
      totalTaxLiens: number;
      totalValue: number;
    }
  }
}

const StateDetailView: React.FC = () => {
  const { stateId } = useParams<{ stateId: string }>();
  const navigate = useNavigate();
  const [state, setState] = useState<StateDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [counties, setCounties] = useState<County[]>([]);
  const [countyLoading, setCountyLoading] = useState<boolean>(false);
  const [recalculateLoading, setRecalculateLoading] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  useEffect(() => {
    if (stateId) {
      fetchStateDetails(stateId);
    }
  }, [stateId]);

  const fetchStateDetails = async (id: string) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/states/${id}`);
      setState(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching state details:', err);
      setError('Failed to load state details. Please try again later.');
      setLoading(false);
    }
  };

  const fetchCounties = async () => {
    if (!stateId || counties.length > 0) return;
    
    setCountyLoading(true);
    try {
      const response = await axios.get(`/api/states/${stateId}/counties`);
      setCounties(response.data);
      setCountyLoading(false);
    } catch (err) {
      console.error('Error fetching counties:', err);
      setCountyLoading(false);
    }
  };

  const handleRecalculateStatistics = async () => {
    if (!stateId) return;
    
    setRecalculateLoading(true);
    try {
      await axios.post(`/api/states/${stateId}/recalculate`);
      fetchStateDetails(stateId);
      setRecalculateLoading(false);
    } catch (err) {
      console.error('Error recalculating statistics:', err);
      setRecalculateLoading(false);
    }
  };

  const handleDeleteState = async () => {
    if (!stateId) return;
    
    try {
      await axios.delete(`/api/states/${stateId}`);
      setShowDeleteModal(false);
      navigate('/inventory');
    } catch (err: any) {
      console.error('Error deleting state:', err);
      setError(err.response?.data?.message || 'Failed to delete state. Please try again later.');
      setShowDeleteModal(false);
    }
  };

  const handleExportData = async (format: 'csv' | 'excel') => {
    if (!stateId) return;
    
    try {
      const response = await axios.get(`/api/export/state/${stateId}?format=${format}`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${state?.name || 'state'}-data.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error(`Error exporting ${format} data:`, err);
      setError(`Failed to export ${format} data. Please try again later.`);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'counties') {
      fetchCounties();
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
        <p>Loading state details...</p>
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

  if (!state) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">State not found.</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>
              <FaMapMarkerAlt className="me-2" />
              {state.name} ({state.abbreviation})
            </h2>
            <div>
              <Button 
                variant="outline-primary" 
                className="me-2"
                onClick={() => navigate(`/inventory/states/${stateId}/edit`)}
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
                <Badge bg="primary" className="me-2">
                  {state.metadata.totalCounties} Counties
                </Badge>
                <Badge bg="info">
                  {state.metadata.totalProperties} Properties
                </Badge>
              </div>
              <Table size="sm">
                <tbody>
                  <tr>
                    <td>Tax Liens:</td>
                    <td>{state.metadata.statistics.totalTaxLiens}</td>
                  </tr>
                  <tr>
                    <td>Total Value:</td>
                    <td>{formatCurrency(state.metadata.statistics.totalValue)}</td>
                  </tr>
                  <tr>
                    <td>Avg Property Value:</td>
                    <td>{formatCurrency(state.metadata.statistics.averagePropertyValue)}</td>
                  </tr>
                  <tr>
                    <td>Last Updated:</td>
                    <td>{formatDate(state.metadata.statistics.lastUpdated)}</td>
                  </tr>
                </tbody>
              </Table>
              <div className="d-grid gap-2 mt-3">
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={handleRecalculateStatistics}
                  disabled={recalculateLoading}
                >
                  {recalculateLoading ? (
                    <>
                      <Spinner animation="border" size="sm" /> Recalculating...
                    </>
                  ) : (
                    <>
                      <FaSync /> Recalculate Statistics
                    </>
                  )}
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
                      <h4>State Information</h4>
                      <Table bordered hover>
                        <tbody>
                          <tr>
                            <td>ID:</td>
                            <td>{state.id}</td>
                          </tr>
                          <tr>
                            <td>Name:</td>
                            <td>{state.name}</td>
                          </tr>
                          <tr>
                            <td>Abbreviation:</td>
                            <td>{state.abbreviation}</td>
                          </tr>
                          <tr>
                            <td>Created:</td>
                            <td>{formatDate(state.createdAt)}</td>
                          </tr>
                          <tr>
                            <td>Updated:</td>
                            <td>{formatDate(state.updatedAt)}</td>
                          </tr>
                          <tr>
                            <td>Type:</td>
                            <td>{state.type}</td>
                          </tr>
                        </tbody>
                      </Table>
                    </Col>
                    <Col md={6}>
                      {state.geometry && state.geometry.coordinates.length > 0 && (
                        <div style={{ height: '300px' }}>
                          <MapContainer 
                            center={[39.8283, -98.5795]} 
                            zoom={4} 
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
                                geometry: state.geometry
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
            
            <Tab eventKey="counties" title="Counties">
              <Card>
                <Card.Body>
                  {countyLoading ? (
                    <div className="text-center p-4">
                      <Spinner animation="border" />
                      <p>Loading counties...</p>
                    </div>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between mb-3">
                        <h4>Counties in {state.name}</h4>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/inventory/states/${stateId}/counties/new`)}
                        >
                          Add County
                        </Button>
                      </div>
                      
                      {counties.length === 0 ? (
                        <Alert variant="info">
                          No counties found for this state. Add a county to get started.
                        </Alert>
                      ) : (
                        <Table striped bordered hover responsive>
                          <thead>
                            <tr>
                              <th>Name</th>
                              <th>Properties</th>
                              <th>Tax Liens</th>
                              <th>Total Value</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {counties.map(county => (
                              <tr key={county._id}>
                                <td>{county.name}</td>
                                <td>{county.metadata.totalProperties}</td>
                                <td>{county.metadata.statistics.totalTaxLiens}</td>
                                <td>{formatCurrency(county.metadata.statistics.totalValue)}</td>
                                <td>
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => navigate(`/inventory/counties/${county._id}`)}
                                  >
                                    View
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      )}
                    </>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="controllers" title="Controllers">
              <Card>
                <Card.Body>
                  <div className="d-flex justify-content-between mb-3">
                    <h4>Controllers</h4>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/inventory/states/${stateId}/controllers/new`)}
                    >
                      Add Controller
                    </Button>
                  </div>
                  
                  {state.controllers.length === 0 ? (
                    <Alert variant="info">
                      No controllers configured for this state. Add a controller to automate data collection.
                    </Alert>
                  ) : (
                    <Table striped bordered hover responsive>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Last Run</th>
                          <th>Next Run</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.controllers.map(controller => (
                          <tr key={controller.controllerId}>
                            <td>{controller.controllerId}</td>
                            <td>{controller.controllerType}</td>
                            <td>
                              <Badge bg={controller.enabled ? 'success' : 'danger'}>
                                {controller.enabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </td>
                            <td>
                              {controller.lastRun ? formatDate(controller.lastRun) : 'Never'}
                            </td>
                            <td>
                              {controller.nextScheduledRun ? formatDate(controller.nextScheduledRun) : 'Not scheduled'}
                            </td>
                            <td>
                              <Button
                                variant="link"
                                size="sm"
                                onClick={() => navigate(`/inventory/controllers/${controller.controllerId}`)}
                              >
                                Configure
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
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
          <p>Are you sure you want to delete <strong>{state.name}</strong>?</p>
          <Alert variant="warning">
            This action cannot be undone. All associated counties and properties will be orphaned.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteState}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default StateDetailView; 