import React, { useState } from 'react';
import { Button, Dropdown, Modal, Form, Spinner } from 'react-bootstrap';
import exportService from '../../services/export';

interface DataExportButtonProps {
  dataType: string; // 'properties', 'counties', 'states'
  filters?: Record<string, any>;
  buttonVariant?: string;
  buttonSize?: 'sm' | 'lg';
  buttonText?: string;
  className?: string;
  showFilters?: boolean;
  preferDirectExport?: boolean; // New prop to prefer direct export for improved performance
}

const DataExportButton: React.FC<DataExportButtonProps> = ({
  dataType,
  filters = {},
  buttonVariant = 'outline-primary',
  buttonSize,
  buttonText = 'Export',
  className = '',
  showFilters = false,
  preferDirectExport = true
}) => {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);
  const [exportFilters, setExportFilters] = useState<Record<string, any>>(filters);
  const [error, setError] = useState<string | null>(null);
  
  const handleExport = async (format: string) => {
    if (showFilters) {
      setExportFormat(format);
      setShowModal(true);
    } else {
      executeExport(format, filters);
    }
  };
  
  const executeExport = async (format: string, exportFilters: Record<string, any>) => {
    setIsExporting(true);
    setError(null);
    
    try {
      switch (format) {
        case 'csv':
          // Use direct export if preferred and available for this data type
          if (preferDirectExport && (dataType === 'properties' || dataType === 'counties')) {
            await exportService.directExportToCSV(dataType, exportFilters);
          } else {
            await exportService.exportToCSV(dataType, exportFilters);
          }
          break;
        case 'excel':
          await exportService.exportToExcel(dataType, exportFilters);
          break;
        case 'json':
          await exportService.exportToJSON(dataType, exportFilters);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
      
      setShowModal(false);
    } catch (err) {
      console.error(`Error exporting to ${format}:`, err);
      setError(err instanceof Error ? err.message : 'An error occurred during export');
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleFilterChange = (key: string, value: any) => {
    setExportFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const renderFilterFields = () => {
    // Dynamic filter fields based on data type
    switch (dataType) {
      case 'properties':
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Property Type</Form.Label>
              <Form.Select
                value={exportFilters.propertyType || ''}
                onChange={e => handleFilterChange('propertyType', e.target.value)}
              >
                <option value="">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Agricultural">Agricultural</option>
                <option value="Vacant Land">Vacant Land</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Tax Status</Form.Label>
              <Form.Select
                value={exportFilters.taxStatus || ''}
                onChange={e => handleFilterChange('taxStatus', e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Current">Current</option>
                <option value="Delinquent">Delinquent</option>
                <option value="Exempt">Exempt</option>
              </Form.Select>
            </Form.Group>
          </>
        );
      
      case 'counties':
        return (
          <Form.Group className="mb-3">
            <Form.Label>State</Form.Label>
            <Form.Select
              value={exportFilters.stateId || ''}
              onChange={e => handleFilterChange('stateId', e.target.value)}
            >
              <option value="">All States</option>
              {/* This would be populated from the API in a real implementation */}
              <option value="CA">California</option>
              <option value="TX">Texas</option>
              <option value="FL">Florida</option>
            </Form.Select>
          </Form.Group>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <>
      <Dropdown className={className}>
        <Dropdown.Toggle
          variant={buttonVariant}
          size={buttonSize}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Spinner animation="border" size="sm" className="me-1" />
              Exporting...
            </>
          ) : (
            <>
              <i className="bi bi-download me-1"></i>
              {buttonText}
            </>
          )}
        </Dropdown.Toggle>
        
        <Dropdown.Menu>
          <Dropdown.Item onClick={() => handleExport('csv')}>
            <i className="bi bi-filetype-csv me-2"></i>
            Export to CSV
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleExport('excel')}>
            <i className="bi bi-file-earmark-excel me-2"></i>
            Export to Excel
          </Dropdown.Item>
          <Dropdown.Item onClick={() => handleExport('json')}>
            <i className="bi bi-filetype-json me-2"></i>
            Export to JSON
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
      
      {/* Export Filters Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Export {dataType.charAt(0).toUpperCase() + dataType.slice(1)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger mb-3">
              {error}
            </div>
          )}
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Export Format</Form.Label>
              <Form.Control type="text" value={`${exportFormat.toUpperCase()}`} disabled />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Date Range</Form.Label>
              <Form.Control
                type="date"
                placeholder="Filter items updated after this date"
                value={exportFilters.updatedAfter || ''}
                onChange={e => handleFilterChange('updatedAfter', e.target.value)}
              />
              <Form.Text className="text-muted">
                Only export items updated after this date
              </Form.Text>
            </Form.Group>
            
            {renderFilterFields()}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => executeExport(exportFormat, exportFilters)}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Spinner animation="border" size="sm" className="me-1" />
                Exporting...
              </>
            ) : (
              'Export'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DataExportButton; 