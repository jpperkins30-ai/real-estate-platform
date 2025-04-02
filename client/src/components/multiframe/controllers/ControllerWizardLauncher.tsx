import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchControllerStatus } from '../../../services/controllerService';
import './ControllerWizardLauncher.css';

interface ControllerWizardLauncherProps {
  entityType: 'state' | 'county';
  entityId: string;
  buttonLabel?: string;
  showStatus?: boolean;
  className?: string;
}

/**
 * Component that provides a button to launch the Controller Wizard for a specific entity
 */
export function ControllerWizardLauncher({
  entityType,
  entityId,
  buttonLabel,
  showStatus = true,
  className = ''
}: ControllerWizardLauncherProps) {
  const navigate = useNavigate();
  const [status, setStatus] = useState<{ 
    hasController: boolean;
    status: 'active' | 'paused' | 'error' | null;
  }>({ hasController: false, status: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch controller status
  useEffect(() => {
    const fetchStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchControllerStatus(entityType, entityId);
        setStatus({
          hasController: result.data.hasController,
          status: result.data.status
        });
      } catch (error) {
        console.error('Error fetching controller status:', error);
        setError('Error loading controller status');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatus();
  }, [entityType, entityId]);
  
  // Determine button label based on status
  const label = buttonLabel || (status.hasController 
    ? 'Edit Controller' 
    : 'Create Controller');
  
  const handleLaunchWizard = useCallback(() => {
    navigate('/controller-wizard', {
      state: {
        entityType,
        entityId,
        step: status.hasController ? 'EditController' : 'SelectControllerType'
      }
    });
  }, [navigate, entityType, entityId, status.hasController]);
  
  return (
    <div 
      className={`controller-launcher ${className}`}
      data-testid="controller-wizard-launcher"
    >
      {showStatus && (
        <div className={`controller-status status-${status.status || 'none'}`}>
          {loading ? (
            <span className="status-loading">Loading...</span>
          ) : error ? (
            <span className="status-error">{error}</span>
          ) : status.hasController ? (
            <span className="status-indicator">{status.status}</span>
          ) : (
            <span className="status-none">No controller</span>
          )}
        </div>
      )}
      
      <button 
        className="launcher-button"
        onClick={handleLaunchWizard}
        aria-label={`Configure controller for ${entityType} ${entityId}`}
        disabled={loading}
      >
        <span className="button-icon"></span>
        <span className="button-text">{label}</span>
      </button>
    </div>
  );
}
