import React from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import { FaTachometerAlt, FaLayerGroup, FaCogs, FaHistory } from 'react-icons/fa';
import InventoryDashboard from './components/InventoryDashboard.jsx';
import HierarchyTree from './components/HierarchyTree.jsx';
import CollectorConfigurationForm from './components/CollectorConfigurationForm.jsx';
import CollectionHistory from './components/CollectionHistory.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="bg-dark text-white p-3">
        <Container>
          <h1>Real Estate Platform - Inventory Module</h1>
        </Container>
      </header>

      <main className="py-4">
        <Container fluid>
          <Tab.Container id="left-tabs-example" defaultActiveKey="dashboard">
            <Row>
              <Col md={2}>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="dashboard">
                      <FaTachometerAlt className="me-2" />
                      Dashboard
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="hierarchy">
                      <FaLayerGroup className="me-2" />
                      State/County Hierarchy
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="configure">
                      <FaCogs className="me-2" />
                      Configure Collector
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="history">
                      <FaHistory className="me-2" />
                      Collection History
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col md={10}>
                <Tab.Content>
                  <Tab.Pane eventKey="dashboard">
                    <InventoryDashboard />
                  </Tab.Pane>
                  <Tab.Pane eventKey="hierarchy">
                    <HierarchyTree />
                  </Tab.Pane>
                  <Tab.Pane eventKey="configure">
                    <CollectorConfigurationForm />
                  </Tab.Pane>
                  <Tab.Pane eventKey="history">
                    <CollectionHistory />
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Container>
      </main>

      <footer className="bg-light p-3 mt-5 border-top">
        <Container>
          <p className="text-center text-muted mb-0">
            &copy; {new Date().getFullYear()} Real Estate Platform
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
