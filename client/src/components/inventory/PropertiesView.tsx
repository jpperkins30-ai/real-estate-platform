import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Spinner, 
  Alert, 
  Breadcrumb, 
  Form, 
  Button,
  Pagination,
  Badge
} from 'react-bootstrap';
import { useCounty, useProperties } from '../../services/inventoryService';
import { PropertyFilters } from '../../types/inventory';

const PropertiesView: React.FC = () => {
  const { countyId } = useParams<{ countyId: string }>();
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [filterValues, setFilterValues] = useState({
    propertyType: '',
    minBedrooms: '',
    maxBedrooms: '',
    minBathrooms: '',
    maxBathrooms: '',
    minPrice: '',
    maxPrice: '',
    status: ''
  });
  
  const { 
    data: county, 
    isLoading: countyLoading, 
    error: countyError 
  } = useCounty(countyId);
  
  const { 
    data: propertiesData, 
    isLoading: propertiesLoading, 
    error: propertiesError 
  } = useProperties(countyId, filters, page, limit);

  const isLoading = countyLoading || propertiesLoading;
  const error = countyError || propertiesError;

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilterValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build filters object, omitting empty values
    const newFilters: PropertyFilters = {};
    
    if (filterValues.propertyType) newFilters.propertyType = filterValues.propertyType;
    if (filterValues.minBedrooms) newFilters.minBedrooms = Number(filterValues.minBedrooms);
    if (filterValues.maxBedrooms) newFilters.maxBedrooms = Number(filterValues.maxBedrooms);
    if (filterValues.minBathrooms) newFilters.minBathrooms = Number(filterValues.minBathrooms);
    if (filterValues.maxBathrooms) newFilters.maxBathrooms = Number(filterValues.maxBathrooms);
    if (filterValues.minPrice) newFilters.minPrice = Number(filterValues.minPrice);
    if (filterValues.maxPrice) newFilters.maxPrice = Number(filterValues.maxPrice);
    if (filterValues.status) newFilters.status = filterValues.status;
    
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilterValues({
      propertyType: '',
      minBedrooms: '',
      maxBedrooms: '',
      minBathrooms: '',
      maxBathrooms: '',
      minPrice: '',
      maxPrice: '',
      status: ''
    });
    setFilters({});
  };

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
          Error loading data: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  if (!county) {
    return (
      <Container className="my-4">
        <Alert variant="warning">County not found.</Alert>
      </Container>
    );
  }

  const propertyTypes = [
    'Single Family', 
    'Multi-Family', 
    'Condo', 
    'Townhouse', 
    'Vacant Land', 
    'Commercial', 
    'Industrial'
  ];

  const statuses = ['active', 'inactive', 'pending'];

  return (
    <Container className="my-4">
      <Breadcrumb>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/inventory/states" }}>
          States
        </Breadcrumb.Item>
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: `/inventory/states/${county.stateId}` }}>
          Counties
        </Breadcrumb.Item>
        <Breadcrumb.Item active>{county.name}</Breadcrumb.Item>
      </Breadcrumb>

      <h1 className="mb-4">Properties in {county.name}</h1>
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Header>Filter Properties</Card.Header>
        <Card.Body>
          <Form onSubmit={handleFilterSubmit}>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Property Type</Form.Label>
                  <Form.Select 
                    name="propertyType" 
                    value={filterValues.propertyType}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Types</option>
                    {propertyTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select 
                    name="status" 
                    value={filterValues.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Bedrooms</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control 
                        type="number" 
                        placeholder="Min" 
                        name="minBedrooms"
                        value={filterValues.minBedrooms}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col>
                      <Form.Control 
                        type="number" 
                        placeholder="Max" 
                        name="maxBedrooms"
                        value={filterValues.maxBedrooms}
                        onChange={handleFilterChange}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Bathrooms</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control 
                        type="number" 
                        placeholder="Min" 
                        name="minBathrooms"
                        value={filterValues.minBathrooms}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col>
                      <Form.Control 
                        type="number" 
                        placeholder="Max" 
                        name="maxBathrooms"
                        value={filterValues.maxBathrooms}
                        onChange={handleFilterChange}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price Range</Form.Label>
                  <Row>
                    <Col>
                      <Form.Control 
                        type="number" 
                        placeholder="Min Price" 
                        name="minPrice"
                        value={filterValues.minPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                    <Col>
                      <Form.Control 
                        type="number" 
                        placeholder="Max Price" 
                        name="maxPrice"
                        value={filterValues.maxPrice}
                        onChange={handleFilterChange}
                      />
                    </Col>
                  </Row>
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end mb-3">
                <Button type="submit" variant="primary" className="me-2">Apply Filters</Button>
                <Button type="button" variant="secondary" onClick={clearFilters}>Clear Filters</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
      
      {/* Results */}
      {!propertiesData || propertiesData.data.length === 0 ? (
        <Alert variant="info">No properties found for this county with the current filters.</Alert>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              Showing {propertiesData.data.length} of {propertiesData.total} properties
            </div>
            <div>
              Page {page} of {propertiesData.totalPages}
            </div>
          </div>
          
          <Row xs={1} md={2} lg={3} className="g-4 mb-4">
            {propertiesData.data.map((property) => (
              <Col key={property.id}>
                <Card className="h-100">
                  {property.images && property.images.length > 0 ? (
                    <Card.Img 
                      variant="top" 
                      src={property.images[0]} 
                      alt={`${property.address.street}`} 
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div 
                      className="bg-secondary text-white d-flex align-items-center justify-content-center"
                      style={{ height: '200px' }}
                    >
                      No Image
                    </div>
                  )}
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <Card.Title className="mb-3">{property.address.street}</Card.Title>
                      <Badge bg={
                        property.status === 'active' ? 'success' : 
                        property.status === 'pending' ? 'warning' : 'secondary'
                      }>
                        {property.status}
                      </Badge>
                    </div>
                    <Card.Subtitle className="mb-2 text-muted">
                      {property.address.city}, {property.address.state} {property.address.zip}
                    </Card.Subtitle>
                    <Card.Text>
                      <div className="d-flex justify-content-between mb-2">
                        {property.propertyType && (
                          <span>{property.propertyType}</span>
                        )}
                        {property.lastSalePrice && (
                          <span className="fw-bold">${property.lastSalePrice.toLocaleString()}</span>
                        )}
                      </div>
                      <div className="d-flex gap-3">
                        {property.bedrooms && (
                          <span>{property.bedrooms} BD</span>
                        )}
                        {property.bathrooms && (
                          <span>{property.bathrooms} BA</span>
                        )}
                        {property.buildingSize && (
                          <span>{property.buildingSize.toLocaleString()} sqft</span>
                        )}
                      </div>
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer>
                    <Link to={`/inventory/properties/${property.id}`} className="btn btn-primary w-100">
                      View Details
                    </Link>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
          
          {/* Pagination */}
          {propertiesData.totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.First 
                  onClick={() => setPage(1)} 
                  disabled={page === 1}
                />
                <Pagination.Prev 
                  onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                />
                
                {[...Array(propertiesData.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  // Show limited pagination numbers
                  if (
                    pageNum === 1 || 
                    pageNum === propertiesData.totalPages ||
                    (pageNum >= page - 1 && pageNum <= page + 1)
                  ) {
                    return (
                      <Pagination.Item 
                        key={pageNum} 
                        active={pageNum === page}
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Pagination.Item>
                    );
                  } else if (
                    (pageNum === page - 2 && pageNum > 1) || 
                    (pageNum === page + 2 && pageNum < propertiesData.totalPages)
                  ) {
                    return <Pagination.Ellipsis key={pageNum} />;
                  }
                  return null;
                })}
                
                <Pagination.Next 
                  onClick={() => setPage(prev => Math.min(prev + 1, propertiesData.totalPages))}
                  disabled={page === propertiesData.totalPages}
                />
                <Pagination.Last 
                  onClick={() => setPage(propertiesData.totalPages)}
                  disabled={page === propertiesData.totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default PropertiesView; 