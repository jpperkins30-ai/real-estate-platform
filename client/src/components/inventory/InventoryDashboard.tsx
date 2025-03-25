import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button,
  ListGroup
} from 'react-bootstrap';
import { 
  FaGlobe, 
  FaMapMarkedAlt, 
  FaHome, 
  FaChartBar, 
  FaSearch, 
  FaPlus 
} from 'react-icons/fa';
import { useStates } from '../../services/inventoryService';

const InventoryDashboard: React.FC = () => {
  const { data: states, isLoading } = useStates();

  return (
    <Container className="my-4">
      <h1 className="mb-4">Inventory Management Dashboard</h1>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Header className="bg-primary text-white">
              <div className="d-flex align-items-center">
                <FaGlobe className="me-2" size={20} />
                <h5 className="mb-0">States</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                Browse and manage states in the inventory system.
              </Card.Text>
              <div className="d-flex justify-content-between mt-3">
                <div>
                  {isLoading ? (
                    <p>Loading...</p>
                  ) : (
                    <h4>{states?.length || 0} States</h4>
                  )}
                </div>
                <Link to="/inventory/states" className="btn btn-outline-primary">
                  View States
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Header className="bg-success text-white">
              <div className="d-flex align-items-center">
                <FaMapMarkedAlt className="me-2" size={20} />
                <h5 className="mb-0">Counties</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                Browse and manage counties within states.
              </Card.Text>
              <div className="mt-4">
                <Link to="/inventory/states" className="btn btn-outline-success w-100">
                  Select a State to View Counties
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100">
            <Card.Header className="bg-info text-white">
              <div className="d-flex align-items-center">
                <FaHome className="me-2" size={20} />
                <h5 className="mb-0">Properties</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                Browse and manage properties within counties.
              </Card.Text>
              <div className="mt-4">
                <Link to="/inventory/states" className="btn btn-outline-info w-100">
                  Navigate to Properties
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header className="bg-dark text-white">
              <div className="d-flex align-items-center">
                <FaChartBar className="me-2" size={20} />
                <h5 className="mb-0">Quick Actions</h5>
              </div>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item action as={Link} to="/inventory/states">
                <div className="d-flex align-items-center">
                  <FaSearch className="me-3" />
                  Browse States
                </div>
              </ListGroup.Item>
              <ListGroup.Item action as="button">
                <div className="d-flex align-items-center">
                  <FaPlus className="me-3" />
                  Add New Property
                </div>
              </ListGroup.Item>
              <ListGroup.Item action as="button">
                <div className="d-flex align-items-center">
                  <FaSearch className="me-3" />
                  Advanced Property Search
                </div>
              </ListGroup.Item>
              <ListGroup.Item action as="button">
                <div className="d-flex align-items-center">
                  <FaChartBar className="me-3" />
                  View Analytics
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card>
            <Card.Header>Recent Updates</Card.Header>
            <Card.Body>
              <p className="text-muted">No recent updates found.</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>System Status</Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span>API Status:</span>
                <span className="badge bg-success">Online</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Data Collection:</span>
                <span className="badge bg-success">Active</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Last Update:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default InventoryDashboard; 