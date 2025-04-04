import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchControllerStatus } from '../../../services/controllerService';
import './ControllerWizardLauncher.css';

export interface ControllerWizardLauncherProps {
  entityType: 'state' | 'county';
  entityId: string;
  timeout?: number;
}

export const ControllerWizardLauncher: React.FC<ControllerWizardLauncherProps> = ({
  entityType,
  entityId,
  timeout = 5000
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [hasController, setHasController] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    let isMounted = true;

    const checkTimeout = () => {
      if (isMounted) {
        setTimedOut(true);
        setLoading(false);
      }
    };

    const fetchStatus = async () => {
      try {
        const result = await fetchControllerStatus();
        
        if (isMounted) {
          setHasController(result.hasController);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load controller status');
          setLoading(false);
        }
      }
    };

    // Set timeout timer
    timeoutId = window.setTimeout(checkTimeout, timeout);

    fetchStatus();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [entityType, entityId, timeout]);

  const handleLaunchWizard = () => {
    const wizardPath = `/wizard/${entityType}/${entityId}`;
    const state = { entityType, entityId, step: 2 };
    navigate(wizardPath, { state });
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    setTimedOut(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (timedOut) {
    return (
      <div>
        <p>Loading timeout exceeded</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={handleLaunchWizard}>
        Launch Wizard
      </button>
    </div>
  );
}; 