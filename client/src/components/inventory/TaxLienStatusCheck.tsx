import React, { useState, useEffect } from 'react';
import taxLienService from '../../services/taxLien';

interface TaxLienStatusCheckProps {
  property: any;
  onStatusChange?: (status: string) => void;
}

const TaxLienStatusCheck: React.FC<TaxLienStatusCheckProps> = ({ property, onStatusChange }) => {
  const [status, setStatus] = useState<string>('loading');
  const [message, setMessage] = useState<string>('Checking tax lien status...');
  const [details, setDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await taxLienService.checkTaxLienStatus(property);
        
        setStatus(result.status);
        setMessage(result.message);
        
        if (result.details) {
          setDetails(result.details);
        }
        
        if (onStatusChange) {
          onStatusChange(result.status);
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        console.error('Error checking tax lien status:', err);
      }
    };
    
    checkStatus();
  }, [property, onStatusChange]);
  
  const getStatusColor = () => {
    switch (status) {
      case 'clear':
        return 'success';
      case 'lien':
        return 'danger';
      case 'unknown':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'secondary';
    }
  };
  
  const getStatusIcon = () => {
    switch (status) {
      case 'clear':
        return '✓';
      case 'lien':
        return '⚠';
      case 'unknown':
        return '?';
      case 'error':
        return '✗';
      default:
        return '⟳';
    }
  };
  
  if (status === 'loading') {
    return (
      <div className="tax-lien-status loading">
        <div className="spinner-border spinner-border-sm me-2" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span>{message}</span>
      </div>
    );
  }
  
  return (
    <div className={`tax-lien-status ${status}`}>
      <div className={`alert alert-${getStatusColor()}`}>
        <div className="d-flex align-items-center">
          <span className="status-icon me-2">{getStatusIcon()}</span>
          <div>
            <strong>Tax Lien Status: {status.charAt(0).toUpperCase() + status.slice(1)}</strong>
            <p className="mb-0">{message}</p>
            
            {status === 'lien' && details && details.amount && (
              <div className="lien-details mt-2">
                <p className="mb-1"><strong>Lien Amount:</strong> ${details.amount.toLocaleString()}</p>
                {details.date && (
                  <p className="mb-1"><strong>Date Filed:</strong> {new Date(details.date).toLocaleDateString()}</p>
                )}
              </div>
            )}
            
            {status === 'error' && error && (
              <p className="text-danger mt-2">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaxLienStatusCheck; 