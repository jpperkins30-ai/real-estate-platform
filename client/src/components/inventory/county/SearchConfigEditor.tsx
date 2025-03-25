import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Button, 
  Row, 
  Col, 
  Alert, 
  Spinner,
  Table
} from 'react-bootstrap';
import { useUpdateCounty } from '../../../services/inventoryService';
import { County, SearchConfig, Statistics } from '../../../types/inventory';
import { FaPlus, FaTrash, FaEdit, FaSave } from 'react-icons/fa';

interface SearchConfigEditorProps {
  county: County;
  onUpdate?: () => void;
}

const SearchConfigEditor: React.FC<SearchConfigEditorProps> = ({ county, onUpdate }) => {
  const [searchConfig, setSearchConfig] = useState<SearchConfig>({
    searchUrl: '',
    lookupMethod: 'parcel_id',
    selectors: {},
    lienUrl: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isTestingSearch, setIsTestingSearch] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  const [newSelectorKey, setNewSelectorKey] = useState('');
  const [newSelectorValue, setNewSelectorValue] = useState('');

  const updateCounty = useUpdateCounty();

  // Initialize the form with the county's existing search configuration
  useEffect(() => {
    if (county.metadata?.searchConfig) {
      setSearchConfig(county.metadata.searchConfig);
    }
  }, [county]);

  const handleSave = async () => {
    try {
      // Ensure we preserve the required metadata properties
      const metadata = {
        totalProperties: county.metadata?.totalProperties || 0,
        statistics: county.metadata?.statistics || {
          totalTaxLiens: 0,
          totalValue: 0,
          lastUpdated: new Date().toISOString()
        },
        searchConfig
      };

      await updateCounty.mutateAsync({
        countyId: county.id,
        countyData: {
          metadata
        }
      });

      setIsEditing(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating search configuration:', error);
    }
  };

  const handleTestSearch = async () => {
    if (!testQuery.trim()) {
      setTestError('Please enter a query to test.');
      return;
    }

    setIsTestingSearch(true);
    setTestError(null);
    setTestResult(null);

    try {
      // Simulate a test search - in a real implementation, this would call an API
      // await apiClient.post(`/counties/${county.id}/test-search`, {
      //   query: testQuery,
      //   searchConfig
      // });

      // Simulated response for demonstration
      setTimeout(() => {
        setTestResult({
          success: true,
          data: {
            ownerName: 'John Doe',
            propertyAddress: '123 Main St',
            assessedValue: 350000,
            taxStatus: 'Paid'
          }
        });
        setIsTestingSearch(false);
      }, 2000);
    } catch (error) {
      console.error('Error testing search:', error);
      setTestError('Failed to test search. Please check the configuration and try again.');
      setIsTestingSearch(false);
    }
  };

  const handleAddSelector = () => {
    if (!newSelectorKey.trim() || !newSelectorValue.trim()) {
      return;
    }

    setSearchConfig({
      ...searchConfig,
      selectors: {
        ...searchConfig.selectors,
        [newSelectorKey]: newSelectorValue
      }
    });

    setNewSelectorKey('');
    setNewSelectorValue('');
  };

  const handleRemoveSelector = (key: string) => {
    const updatedSelectors = { ...searchConfig.selectors };
    delete updatedSelectors[key];

    setSearchConfig({
      ...searchConfig,
      selectors: updatedSelectors
    });
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">County Search Configuration</h5>
        {!isEditing ? (
          <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
            <FaEdit className="me-1" /> Edit Configuration
          </Button>
        ) : (
          <Button variant="success" size="sm" onClick={handleSave} disabled={updateCounty.isLoading}>
            <FaSave className="me-1" /> Save Changes
          </Button>
        )}
      </Card.Header>
      <Card.Body>
        {!county.metadata?.searchConfig && !isEditing ? (
          <Alert variant="info">
            No search configuration has been defined for this county. Click 'Edit Configuration' to set one up.
          </Alert>
        ) : (
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Search URL</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="https://county-website.gov/search"
                    value={searchConfig.searchUrl || ''}
                    onChange={(e) => setSearchConfig({ ...searchConfig, searchUrl: e.target.value })}
                    disabled={!isEditing}
                  />
                  <Form.Text className="text-muted">
                    The URL for the county's property search page
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Lookup Method</Form.Label>
                  <Form.Select
                    value={searchConfig.lookupMethod}
                    onChange={(e) => setSearchConfig({ 
                      ...searchConfig, 
                      lookupMethod: e.target.value as 'account_number' | 'parcel_id' 
                    })}
                    disabled={!isEditing}
                  >
                    <option value="parcel_id">Parcel ID</option>
                    <option value="account_number">Account Number</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    The type of identifier used to look up properties
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Tax Lien URL (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="https://county-website.gov/taxliens"
                    value={searchConfig.lienUrl || ''}
                    onChange={(e) => setSearchConfig({ ...searchConfig, lienUrl: e.target.value })}
                    disabled={!isEditing}
                  />
                  <Form.Text className="text-muted">
                    The URL for the county's tax lien search page (if different from the main search)
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <h6 className="mt-4">CSS Selectors</h6>
            <p className="text-muted small">
              These selectors are used to extract data from the county website's search results.
            </p>

            {Object.keys(searchConfig.selectors).length > 0 ? (
              <Table striped bordered hover size="sm" className="mb-3">
                <thead>
                  <tr>
                    <th>Data Field</th>
                    <th>CSS Selector</th>
                    {isEditing && <th style={{ width: '10%' }}>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(searchConfig.selectors).map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value}</td>
                      {isEditing && (
                        <td className="text-center">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveSelector(key)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <Alert variant="warning" className="mb-3">
                No selectors defined. Add selectors to extract data from the county website.
              </Alert>
            )}

            {isEditing && (
              <Row className="mb-4 align-items-end">
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>Data Field</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="ownerName"
                      value={newSelectorKey}
                      onChange={(e) => setNewSelectorKey(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group>
                    <Form.Label>CSS Selector</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="#owner-name"
                      value={newSelectorValue}
                      onChange={(e) => setNewSelectorValue(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Button variant="primary" onClick={handleAddSelector}>
                    <FaPlus /> Add
                  </Button>
                </Col>
              </Row>
            )}

            {searchConfig.searchUrl && (
              <Card className="mt-4 mb-3">
                <Card.Header>Test Search Configuration</Card.Header>
                <Card.Body>
                  <Row className="align-items-end">
                    <Col md={8}>
                      <Form.Group>
                        <Form.Label>Test Query ({searchConfig.lookupMethod})</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter a valid ID to test"
                          value={testQuery}
                          onChange={(e) => setTestQuery(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Button 
                        variant="primary" 
                        onClick={handleTestSearch}
                        disabled={isTestingSearch || !testQuery.trim()}
                      >
                        {isTestingSearch ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-1" />
                            Testing...
                          </>
                        ) : 'Test Search'}
                      </Button>
                    </Col>
                  </Row>

                  {testError && (
                    <Alert variant="danger" className="mt-3">
                      {testError}
                    </Alert>
                  )}

                  {testResult && (
                    <div className="mt-3">
                      <Alert variant={testResult.success ? 'success' : 'danger'}>
                        {testResult.success ? 'Search successful!' : 'Search failed.'}
                      </Alert>
                      {testResult.success && testResult.data && (
                        <div className="mt-2">
                          <h6>Search Results:</h6>
                          <pre className="bg-light p-3 rounded">
                            {JSON.stringify(testResult.data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
          </Form>
        )}
      </Card.Body>
    </Card>
  );
};

export default SearchConfigEditor; 