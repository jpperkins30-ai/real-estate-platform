import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { FaDatabase, FaServer, FaMap } from 'react-icons/fa';

const InventoryDashboard = () => {
  const [collectors, setCollectors] = useState([]);
  const [dataSources, setDataSources] = useState([]);
  const [stats, setStats] = useState({
    totalStates: 0,
    totalCounties: 0,
    totalProperties: 0
  });

  useEffect(() => {
    // Fetch collectors, data sources, and stats
    fetchCollectors();
    fetchDataSources();
    fetchStats();
  }, []);

  const fetchCollectors = async () => {
    try {
      const response = await fetch('/api/collections/collectors');
      const data = await response.json();
      setCollectors(data);
    } catch (error) {
      console.error('Error fetching collectors:', error);
    }
  };

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources');
      const data = await response.json();
      setDataSources(data);
    } catch (error) {
      console.error('Error fetching data sources:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/properties/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="dashboard">
      <h1>Inventory Dashboard</h1>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FaMap size={32} className="mb-2" />
              <Card.Title>{stats.totalStates}</Card.Title>
              <Card.Text>States</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FaMap size={32} className="mb-2" />
              <Card.Title>{stats.totalCounties}</Card.Title>
              <Card.Text>Counties</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center">
            <Card.Body>
              <FaDatabase size={32} className="mb-2" />
              <Card.Title>{stats.totalProperties}</Card.Title>
              <Card.Text>Properties</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Available Collectors */}
      <h2>Available Collectors</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Type</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {collectors.map(collector => (
            <tr key={collector.id}>
              <td>{collector.name}</td>
              <td>{collector.id}</td>
              <td>{collector.supportedSourceTypes.join(', ')}</td>
              <td>{collector.description}</td>
              <td>
                <Button size="sm" variant="primary">Configure</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Configured Data Sources */}
      <h2>Configured Data Sources</h2>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Region</th>
            <th>Collector</th>
            <th>Status</th>
            <th>Last Collected</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dataSources.map(source => (
            <tr key={source._id}>
              <td>{source.name}</td>
              <td>{source.region.state} - {source.region.county || 'All Counties'}</td>
              <td>{source.collectorType}</td>
              <td>
                <Badge bg={source.status === 'active' ? 'success' : 
                          source.status === 'error' ? 'danger' : 'secondary'}>
                  {source.status}
                </Badge>
              </td>
              <td>{source.lastCollection ? new Date(source.lastCollection).toLocaleString() : 'Never'}</td>
              <td>
                <Button size="sm" variant="success" className="me-1">Run</Button>
                <Button size="sm" variant="info" className="me-1">Edit</Button>
                <Button size="sm" variant="danger">Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <div className="text-end mt-3">
        <Button variant="primary">Add New Data Source</Button>
      </div>
    </div>
  );
};

export default InventoryDashboard; 