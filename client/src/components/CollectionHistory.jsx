import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button } from 'react-bootstrap';

const CollectionHistory = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/collections?limit=50');
      const data = await response.json();
      setCollections(data.collections || data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching collections:', error);
      setLoading(false);
    }
  };

  return (
    <Card>
      <Card.Header>
        <h3>Collection History</h3>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <p>Loading collection history...</p>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Source</th>
                <th>Region</th>
                <th>Status</th>
                <th>Properties</th>
                <th>Duration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map(collection => (
                <tr key={collection._id}>
                  <td>{new Date(collection.timestamp).toLocaleString()}</td>
                  <td>{collection.sourceId?.name || collection.sourceId}</td>
                  <td>
                    {collection.sourceId?.region ? 
                      `${collection.sourceId.region.state} - ${collection.sourceId.region.county || 'All Counties'}` : 
                      'N/A'}
                  </td>
                  <td>
                    <Badge bg={
                      collection.status === 'SUCCESS' ? 'success' :
                      collection.status === 'PARTIAL' ? 'warning' : 'danger'
                    }>
                      {collection.status}
                    </Badge>
                  </td>
                  <td>{collection.itemCount || collection.stats?.itemCount || 0}</td>
                  <td>
                    {collection.duration || collection.stats?.duration ? 
                      `${((collection.duration || collection.stats?.duration) / 1000).toFixed(2)}s` : 
                      'N/A'}
                  </td>
                  <td>
                    <Button size="sm" variant="info" className="me-1" 
                      onClick={() => window.location.href = `/api/collections/${collection._id}`}>
                      Details
                    </Button>
                    <Button size="sm" variant="success" 
                      onClick={() => window.location.href = `/api/properties?sourceId=${collection.sourceId._id || collection.sourceId}`}>
                      View Properties
                    </Button>
                  </td>
                </tr>
              ))}
              {collections.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center">No collection history found.</td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Card.Body>
    </Card>
  );
};

export default CollectionHistory; 