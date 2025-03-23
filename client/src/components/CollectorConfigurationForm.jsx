import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';

const CollectorConfigurationForm = () => {
  const [collectors, setCollectors] = useState([]);
  const [states, setStates] = useState([]);
  const [counties, setCounties] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: 'county-website',
    url: '',
    region: {
      state: '',
      county: ''
    },
    collectorType: '',
    schedule: {
      frequency: 'manual',
      dayOfWeek: 1,
      dayOfMonth: 1
    },
    metadata: {
      basePath: 'data',
      year: new Date().getFullYear().toString(),
      version: '1.0',
      enrichWithSDAT: true
    }
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    // Fetch available collectors and states
    fetchCollectors();
    fetchStates();
  }, []);

  const fetchCollectors = async () => {
    try {
      const response = await fetch('/api/collections/collectors');
      const data = await response.json();
      setCollectors(data);
      
      // Set default collector if available
      if (data.length > 0) {
        setFormData(prev => ({
          ...prev,
          collectorType: data[0].id
        }));
      }
    } catch (error) {
      console.error('Error fetching collectors:', error);
    }
  };

  const fetchStates = async () => {
    try {
      const response = await fetch('/api/properties/stats/state');
      const data = await response.json();
      setStates(data.map(item => item.state));
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  const fetchCounties = async (state) => {
    try {
      const response = await fetch(`/api/properties/stats/county?state=${state}`);
      const data = await response.json();
      setCounties(data.map(item => item.county));
    } catch (error) {
      console.error(`Error fetching counties for state ${state}`, error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Special handling for state selection
    if (name === 'region.state') {
      fetchCounties(value);
      setFormData(prev => ({
        ...prev,
        region: {
          ...prev.region,
          state: value,
          county: '' // Reset county when state changes
        }
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    
    if (name.includes('.')) {
      const path = name.split('.');
      if (path.length === 2) {
        const [parent, child] = path;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: checked
          }
        }));
      } else if (path.length === 3) {
        const [parent, middle, child] = path;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [middle]: {
              ...prev[parent][middle],
              [child]: checked
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    try {
      const response = await fetch('/api/data-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage({
          type: 'success',
          text: `Data source "${result.name}" created successfully!`
        });
        
        // Reset form
        setFormData({
          name: '',
          type: 'county-website',
          url: '',
          region: {
            state: '',
            county: ''
          },
          collectorType: collectors[0]?.id || '',
          schedule: {
            frequency: 'manual',
            dayOfWeek: 1,
            dayOfMonth: 1
          },
          metadata: {
            basePath: 'data',
            year: new Date().getFullYear().toString(),
            version: '1.0',
            enrichWithSDAT: true
          }
        });
        setValidated(false);
      } else {
        const error = await response.json();
        setMessage({
          type: 'danger',
          text: `Error creating data source: ${error.message || error.error}`
        });
      }
    } catch (error) {
      setMessage({
        type: 'danger',
        text: `Error submitting form: ${error.message}`
      });
    }
  };

  return (
    <Card>
      <Card.Header>
        <h3>Configure New Collector</h3>
      </Card.Header>
      <Card.Body>
        {message.text && (
          <Alert variant={message.type} dismissible onClose={() => setMessage({ type: '', text: '' })}>
            {message.text}
          </Alert>
        )}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Data Source Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Los Angeles County Tax Sale Properties"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide a name for the data source.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Source Type</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="county-website">County Website</option>
                  <option value="state-records">State Records</option>
                  <option value="tax-database">Tax Database</option>
                  <option value="api">API</option>
                  <option value="pdf">PDF</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Source URL</Form.Label>
            <Form.Control
              type="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              placeholder="https://www.county-website.gov/tax-sales"
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid URL.
            </Form.Control.Feedback>
          </Form.Group>
          
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>State</Form.Label>
                <Form.Select
                  name="region.state"
                  value={formData.region.state}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select State...</option>
                  {states.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a state.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>County</Form.Label>
                <Form.Select
                  name="region.county"
                  value={formData.region.county}
                  onChange={handleInputChange}
                  required
                  disabled={!formData.region.state}
                >
                  <option value="">Select County...</option>
                  {counties.map(county => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a county.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Collector Type</Form.Label>
            <Form.Select
              name="collectorType"
              value={formData.collectorType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Collector...</option>
              {collectors.map(collector => (
                <option key={collector.id} value={collector.id}>
                  {collector.name} ({collector.id})
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              The collector determines how data will be extracted from the source.
            </Form.Text>
          </Form.Group>
          
          <Card className="mb-3">
            <Card.Header>Collection Schedule</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Frequency</Form.Label>
                <Form.Select
                  name="schedule.frequency"
                  value={formData.schedule.frequency}
                  onChange={handleInputChange}
                >
                  <option value="manual">Manual</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </Form.Select>
              </Form.Group>
              
              {formData.schedule.frequency === 'weekly' && (
                <Form.Group className="mb-3">
                  <Form.Label>Day of Week</Form.Label>
                  <Form.Select
                    name="schedule.dayOfWeek"
                    value={formData.schedule.dayOfWeek}
                    onChange={handleInputChange}
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </Form.Select>
                </Form.Group>
              )}
              
              {formData.schedule.frequency === 'monthly' && (
                <Form.Group className="mb-3">
                  <Form.Label>Day of Month</Form.Label>
                  <Form.Select
                    name="schedule.dayOfMonth"
                    value={formData.schedule.dayOfMonth}
                    onChange={handleInputChange}
                  >
                    {[...Array(31)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
            </Card.Body>
          </Card>
          
          <Card className="mb-3">
            <Card.Header>Additional Options</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Check
                  type="checkbox"
                  label="Enrich with SDAT data (for Maryland properties)"
                  name="metadata.enrichWithSDAT"
                  checked={formData.metadata.enrichWithSDAT}
                  onChange={handleCheckboxChange}
                />
              </Form.Group>
              
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Data Storage Path</Form.Label>
                    <Form.Control
                      type="text"
                      name="metadata.basePath"
                      value={formData.metadata.basePath}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Year</Form.Label>
                    <Form.Control
                      type="text"
                      name="metadata.year"
                      value={formData.metadata.year}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Version</Form.Label>
                    <Form.Control
                      type="text"
                      name="metadata.version"
                      value={formData.metadata.version}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
          
          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2">Cancel</Button>
            <Button type="submit" variant="primary">Create Data Source</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CollectorConfigurationForm; 