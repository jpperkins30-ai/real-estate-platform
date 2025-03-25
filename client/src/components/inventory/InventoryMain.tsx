import React, { useState } from 'react';
import { Card, Tab, Nav, Button, Row, Col } from 'react-bootstrap';
import StateDetails from './details/StateDetails';
import CountyDetails from './details/CountyDetails';
import PropertyDetails from './details/PropertyDetails';

// Event bus or state management would be used in real implementation
const InventoryMain: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    type: 'us_map' | 'state' | 'county' | 'property';
    name?: string;
  } | null>(null);

  // Mock function to handle selection from the tree view
  // In a real implementation, this would use a context or state management
  React.useEffect(() => {
    const handleItemSelected = (event: CustomEvent) => {
      setSelectedItem(event.detail);
    };

    // Simulate event listening
    window.addEventListener('inventory:item-selected' as any, handleItemSelected as any);

    return () => {
      window.removeEventListener('inventory:item-selected' as any, handleItemSelected as any);
    };
  }, []);

  const renderContent = () => {
    if (!selectedItem) {
      return (
        <div className="text-center p-5">
          <div className="mb-4">
            <i className="bi bi-arrow-left-circle" style={{ fontSize: '48px', color: '#6c757d' }}></i>
          </div>
          <h3>Select an item from the inventory tree</h3>
          <p className="text-muted">
            Choose a state, county, or property to view its details
          </p>
        </div>
      );
    }

    switch (selectedItem.type) {
      case 'state':
        return <StateDetails stateId={selectedItem.id} />;
      case 'county':
        return <CountyDetails countyId={selectedItem.id} />;
      case 'property':
        return <PropertyDetails propertyId={selectedItem.id} />;
      case 'us_map':
      default:
        return (
          <Card>
            <Card.Header>
              <h4>US Map Overview</h4>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <div className="mb-4">
                    <h5>US Map Statistics</h5>
                    <div className="d-flex flex-wrap">
                      <Card className="me-3 mb-3 text-center" style={{ width: '180px' }}>
                        <Card.Body>
                          <h2>51</h2>
                          <p className="mb-0 text-muted">States & Territories</p>
                        </Card.Body>
                      </Card>
                      <Card className="me-3 mb-3 text-center" style={{ width: '180px' }}>
                        <Card.Body>
                          <h2>3,143</h2>
                          <p className="mb-0 text-muted">Counties</p>
                        </Card.Body>
                      </Card>
                      <Card className="me-3 mb-3 text-center" style={{ width: '180px' }}>
                        <Card.Body>
                          <h2>32,564</h2>
                          <p className="mb-0 text-muted">Properties</p>
                        </Card.Body>
                      </Card>
                      <Card className="me-3 mb-3 text-center" style={{ width: '180px' }}>
                        <Card.Body>
                          <h2>5,482</h2>
                          <p className="mb-0 text-muted">Tax Liens</p>
                        </Card.Body>
                      </Card>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <Card>
                    <Card.Header>
                      <h5>Quick Actions</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-grid gap-2">
                        <Button variant="outline-primary" size="sm">
                          <i className="bi bi-plus-circle me-2"></i>
                          Add New State
                        </Button>
                        <Button variant="outline-primary" size="sm">
                          <i className="bi bi-upload me-2"></i>
                          Import Data
                        </Button>
                        <Button variant="outline-primary" size="sm">
                          <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                          Export Report
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              <Tab.Container defaultActiveKey="recent">
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="recent">Recently Added</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="activity">Recent Activity</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="collections">Pending Collections</Nav.Link>
                  </Nav.Item>
                </Nav>
                
                <Tab.Content>
                  <Tab.Pane eventKey="recent">
                    <p>Recently added properties will appear here...</p>
                  </Tab.Pane>
                  <Tab.Pane eventKey="activity">
                    <p>Recent activity log will appear here...</p>
                  </Tab.Pane>
                  <Tab.Pane eventKey="collections">
                    <p>Pending data collections will appear here...</p>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
          </Card>
        );
    }
  };

  return (
    <div className="inventory-main">
      {renderContent()}
    </div>
  );
};

export default InventoryMain; 