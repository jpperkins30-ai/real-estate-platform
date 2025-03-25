import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner, Breadcrumb
} from 'react-bootstrap';
import axios from 'axios';

// Controller types and their capabilities
const CONTROLLER_TYPES = [
  { 
    id: 'tax-lien', 
    name: 'Tax Lien Collector', 
    description: 'Collects tax lien data from county websites or APIs',
    applicableTo: ['county'],
    configFields: ['sourceUrl', 'dataFormat', 'schedule', 'credentials']
  },
  { 
    id: 'property-data', 
    name: 'Property Information Collector', 
    description: 'Collects property details such as sales history, features, and images',
    applicableTo: ['county'],
    configFields: ['sourceUrl', 'dataFormat', 'schedule', 'credentials', 'propertyTypes']
  },
  { 
    id: 'geo-data', 
    name: 'Geographic Data Collector', 
    description: 'Collects or updates geographic boundaries and locations',
    applicableTo: ['state', 'county'],
    configFields: ['sourceUrl', 'dataFormat', 'schedule']
  },
  { 
    id: 'demographics', 
    name: 'Demographics Collector', 
    description: 'Collects demographic and statistical data for regions',
    applicableTo: ['state', 'county'],
    configFields: ['sourceUrl', 'dataFormat', 'schedule']
  }
];

interface ControllerWizardProps {
  targetType: 'state' | 'county';
  targetId: string;
}

const ControllerWizard: React.FC<ControllerWizardProps> = ({ targetType, targetId }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  
  // Form state
  const [selectedControllerType, setSelectedControllerType] = useState<string>('');
  const [controllerName, setControllerName] = useState<string>('');
  const [configuration, setConfiguration] = useState<Record<string, any>>({
    sourceUrl: '',
    dataFormat: 'json',
    schedule: 'weekly',
    credentials: {
      username: '',
      password: '',
      apiKey: ''
    },
    propertyTypes: []
  });
  
  // Parent entity info (state or county)
  const [parentEntity, setParentEntity] = useState<any>(null);
  
  useEffect(() => {
    fetchParentEntity();
  }, [targetType, targetId]);
  
  const fetchParentEntity = async () => {
    setLoading(true);
    try {
      const endpoint = targetType === 'state' 
        ? `/api/states/${targetId}`
        : `/api/counties/${targetId}`;
        
      const response = await axios.get(endpoint);
      setParentEntity(response.data);
      setLoading(false);
    } catch (err) {
      console.error(`Error fetching ${targetType} details:`, err);
      setError(`Failed to load ${targetType} details. Please try again later.`);
      setLoading(false);
    }
  };
  
  const handleControllerTypeSelect = (type: string) => {
    setSelectedControllerType(type);
    // Generate a default name based on type and parent entity
    const controllerType = CONTROLLER_TYPES.find(ct => ct.id === type);
    if (controllerType && parentEntity) {
      setControllerName(`${controllerType.name} - ${parentEntity.name}`);
    }
  };
  
  const handleConfigChange = (field: string, value: any) => {
    setConfiguration(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleCredentialChange = (field: string, value: string) => {
    setConfiguration(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [field]: value
      }
    }));
  };
  
  const handlePropertyTypeToggle = (type: string) => {
    setConfiguration(prev => {
      const types = [...(prev.propertyTypes || [])];
      if (types.includes(type)) {
        return {
          ...prev,
          propertyTypes: types.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          propertyTypes: [...types, type]
        };
      }
    });
  };
  
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const controllerData = {
        name: controllerName,
        controllerType: selectedControllerType,
        targetType,
        targetId,
        enabled: true,
        configuration
      };
      
      await axios.post('/api/controllers', controllerData);
      setSuccess(true);
      setLoading(false);
      
      // Redirect after success
      setTimeout(() => {
        const redirectPath = targetType === 'state' 
          ? `/inventory/states/${targetId}`
          : `/inventory/counties/${targetId}`;
        navigate(redirectPath);
      }, 2000);
    } catch (err: any) {
      console.error('Error creating controller:', err);
      setError(err.response?.data?.message || 'Failed to create controller. Please try again.');
      setLoading(false);
    }
  };
  
  const renderControllerTypeSelection = () => {
    const applicableControllers = CONTROLLER_TYPES.filter(
      ct => ct.applicableTo.includes(targetType)
    );
    
    return (
      <div>
        <h4 className="mb-4">Select Controller Type</h4>
        
        {applicableControllers.map(controller => (
          <Card 
            key={controller.id}
            className={`mb-3 ${selectedControllerType === controller.id ? 'border-primary' : ''}`}
            onClick={() => handleControllerTypeSelect(controller.id)}
            style={{ cursor: 'pointer' }}
          >
            <Card.Body>
              <div className="d-flex align-items-center">
                <Form.Check
                  type="radio"
                  id={`controller-${controller.id}`}
                  checked={selectedControllerType === controller.id}
                  onChange={() => handleControllerTypeSelect(controller.id)}
                  className="me-3"
                />
                <div>
                  <h5 className="mb-1">{controller.name}</h5>
                  <p className="text-muted mb-0">{controller.description}</p>
                </div>
              </div>
            </Card.Body>
          </Card>
        ))}
        
        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="outline-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => setStep(2)}
            disabled={!selectedControllerType}
          >
            Continue
          </Button>
        </div>
      </div>
    );
  };
  
  const renderConfigurationForm = () => {
    const controller = CONTROLLER_TYPES.find(ct => ct.id === selectedControllerType);
    
    if (!controller) {
      return <Alert variant="danger">Invalid controller type selected</Alert>;
    }
    
    return (
      <div>
        <h4 className="mb-4">Configure Controller</h4>
        
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Controller Name</Form.Label>
            <Form.Control
              type="text"
              value={controllerName}
              onChange={(e) => setControllerName(e.target.value)}
              placeholder="Enter a descriptive name"
              required
            />
          </Form.Group>
          
          {controller.configFields.includes('sourceUrl') && (
            <Form.Group className="mb-3">
              <Form.Label>Data Source URL</Form.Label>
              <Form.Control
                type="url"
                value={configuration.sourceUrl}
                onChange={(e) => handleConfigChange('sourceUrl', e.target.value)}
                placeholder="https://data-source-url.com"
              />
              <Form.Text className="text-muted">
                The URL where the data will be collected from
              </Form.Text>
            </Form.Group>
          )}
          
          {controller.configFields.includes('dataFormat') && (
            <Form.Group className="mb-3">
              <Form.Label>Data Format</Form.Label>
              <Form.Select
                value={configuration.dataFormat}
                onChange={(e) => handleConfigChange('dataFormat', e.target.value)}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="html">HTML (Web Scraping)</option>
              </Form.Select>
            </Form.Group>
          )}
          
          {controller.configFields.includes('schedule') && (
            <Form.Group className="mb-3">
              <Form.Label>Collection Schedule</Form.Label>
              <Form.Select
                value={configuration.schedule}
                onChange={(e) => handleConfigChange('schedule', e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="manual">Manual Only</option>
              </Form.Select>
            </Form.Group>
          )}
          
          {controller.configFields.includes('credentials') && (
            <>
              <h5 className="mb-3 mt-4">Credentials</h5>
              
              <Form.Group className="mb-3">
                <Form.Label>Username (if required)</Form.Label>
                <Form.Control
                  type="text"
                  value={configuration.credentials.username}
                  onChange={(e) => handleCredentialChange('username', e.target.value)}
                  placeholder="Username for data source"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Password (if required)</Form.Label>
                <Form.Control
                  type="password"
                  value={configuration.credentials.password}
                  onChange={(e) => handleCredentialChange('password', e.target.value)}
                  placeholder="Password for data source"
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>API Key (if required)</Form.Label>
                <Form.Control
                  type="text"
                  value={configuration.credentials.apiKey}
                  onChange={(e) => handleCredentialChange('apiKey', e.target.value)}
                  placeholder="API key for data source"
                />
              </Form.Group>
            </>
          )}
          
          {controller.configFields.includes('propertyTypes') && selectedControllerType === 'property-data' && (
            <>
              <h5 className="mb-3 mt-4">Property Types to Collect</h5>
              
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  id="property-type-single"
                  label="Single Family"
                  checked={configuration.propertyTypes.includes('Single Family')}
                  onChange={() => handlePropertyTypeToggle('Single Family')}
                />
                <Form.Check
                  type="checkbox"
                  id="property-type-multi"
                  label="Multi Family"
                  checked={configuration.propertyTypes.includes('Multi Family')}
                  onChange={() => handlePropertyTypeToggle('Multi Family')}
                />
                <Form.Check
                  type="checkbox"
                  id="property-type-commercial"
                  label="Commercial"
                  checked={configuration.propertyTypes.includes('Commercial')}
                  onChange={() => handlePropertyTypeToggle('Commercial')}
                />
                <Form.Check
                  type="checkbox"
                  id="property-type-land"
                  label="Land"
                  checked={configuration.propertyTypes.includes('Land')}
                  onChange={() => handlePropertyTypeToggle('Land')}
                />
              </Form.Group>
            </>
          )}
        </Form>
        
        <div className="d-flex justify-content-between mt-4">
          <Button
            variant="outline-secondary"
            onClick={() => setStep(1)}
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={loading || !controllerName}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : 'Create Controller'}
          </Button>
        </div>
      </div>
    );
  };
  
  if (loading && !parentEntity) {
    return (
      <Container className="mt-4 text-center">
        <Spinner animation="border" />
        <p>Loading...</p>
      </Container>
    );
  }
  
  if (error && !parentEntity) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  
  return (
    <Container className="mt-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item onClick={() => navigate('/inventory')}>Inventory</Breadcrumb.Item>
        {parentEntity && (
          <Breadcrumb.Item 
            onClick={() => navigate(`/inventory/${targetType}s/${targetId}`)}
          >
            {parentEntity.name}
          </Breadcrumb.Item>
        )}
        <Breadcrumb.Item active>Add Controller</Breadcrumb.Item>
      </Breadcrumb>
      
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              {success ? (
                <Alert variant="success">
                  <h4>Controller Created Successfully!</h4>
                  <p>Redirecting you back to the {targetType} page...</p>
                </Alert>
              ) : (
                <>
                  <h3 className="mb-4">
                    Add Data Collection Controller
                    {parentEntity && <span> for {parentEntity.name}</span>}
                  </h3>
                  
                  {error && <Alert variant="danger">{error}</Alert>}
                  
                  <div className="wizard-progress mb-4">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                      1. Select Type
                    </div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                      2. Configure
                    </div>
                  </div>
                  
                  {step === 1 && renderControllerTypeSelection()}
                  {step === 2 && renderConfigurationForm()}
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ControllerWizard; 