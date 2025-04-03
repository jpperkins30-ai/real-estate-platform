import React, { useState, useEffect } from 'react';
import { useController } from '../../../hooks/useController';
import { ControllerEvent, StateData, CountyData, PropertyData } from '../../../services/controllerService';
import './ControllerWizard.css';

interface ControllerWizardProps {
  className?: string;
}

/**
 * Controller Wizard component that manages the hierarchical data flow
 * between State, County, and Property panels
 */
export const ControllerWizard: React.FC<ControllerWizardProps> = ({
  className = '',
}) => {
  const {
    currentState,
    currentCounty,
    currentProperty,
    selectState,
    selectCounty,
    selectProperty,
    subscribe,
    events,
  } = useController();

  // Local state for wizard steps
  const [currentStep, setCurrentStep] = useState<'state' | 'county' | 'property'>('state');
  const [isComplete, setIsComplete] = useState(false);

  // Subscribe to controller events to update wizard state
  useEffect(() => {
    const unsubscribeState = subscribe(events.STATE_SELECTED, () => {
      setCurrentStep('county');
      setIsComplete(false);
    });

    const unsubscribeCounty = subscribe(events.COUNTY_SELECTED, () => {
      setCurrentStep('property');
      setIsComplete(false);
    });

    const unsubscribeProperty = subscribe(events.PROPERTY_SELECTED, () => {
      setIsComplete(true);
    });

    return () => {
      unsubscribeState();
      unsubscribeCounty();
      unsubscribeProperty();
    };
  }, [subscribe, events]);

  // Handle step navigation
  const handleStepClick = (step: 'state' | 'county' | 'property') => {
    setCurrentStep(step);
    setIsComplete(false);
  };

  // Render step indicator
  const renderStepIndicator = () => (
    <div className="wizard-steps">
      <div
        className={`step ${currentStep === 'state' ? 'active' : ''} ${
          currentState ? 'completed' : ''
        }`}
        onClick={() => handleStepClick('state')}
      >
        <div className="step-number">1</div>
        <div className="step-label">State</div>
      </div>
      
      <div className={`step-connector ${currentState ? 'completed' : ''}`} />
      
      <div
        className={`step ${currentStep === 'county' ? 'active' : ''} ${
          currentCounty ? 'completed' : ''
        }`}
        onClick={() => handleStepClick('county')}
      >
        <div className="step-number">2</div>
        <div className="step-label">County</div>
      </div>
      
      <div className={`step-connector ${currentCounty ? 'completed' : ''}`} />
      
      <div
        className={`step ${currentStep === 'property' ? 'active' : ''} ${
          currentProperty ? 'completed' : ''
        }`}
        onClick={() => handleStepClick('property')}
      >
        <div className="step-number">3</div>
        <div className="step-label">Property</div>
      </div>
    </div>
  );

  // Render current selection info
  const renderSelectionInfo = () => (
    <div className="selection-info">
      {currentState && (
        <div className="selection-item">
          <span className="label">State:</span>
          <span className="value">{currentState.name}</span>
        </div>
      )}
      
      {currentCounty && (
        <div className="selection-item">
          <span className="label">County:</span>
          <span className="value">{currentCounty.name}</span>
        </div>
      )}
      
      {currentProperty && (
        <div className="selection-item">
          <span className="label">Property:</span>
          <span className="value">{currentProperty.address}</span>
        </div>
      )}
    </div>
  );

  // Render navigation buttons
  const renderNavigation = () => (
    <div className="wizard-navigation">
      <button
        className="nav-button reset"
        onClick={() => {
          setCurrentStep('state');
          setIsComplete(false);
        }}
        disabled={!currentState && !currentCounty && !currentProperty}
      >
        Reset
      </button>
      
      <div className="step-buttons">
        <button
          className="nav-button back"
          onClick={() => {
            if (currentStep === 'property') {
              setCurrentStep('county');
            } else if (currentStep === 'county') {
              setCurrentStep('state');
            }
            setIsComplete(false);
          }}
          disabled={currentStep === 'state'}
        >
          Back
        </button>
        
        <button
          className="nav-button next"
          onClick={() => {
            if (currentStep === 'state') {
              setCurrentStep('county');
            } else if (currentStep === 'county') {
              setCurrentStep('property');
            }
            setIsComplete(false);
          }}
          disabled={
            (currentStep === 'state' && !currentState) ||
            (currentStep === 'county' && !currentCounty) ||
            (currentStep === 'property' && !currentProperty)
          }
        >
          Next
        </button>
      </div>
    </div>
  );

  return (
    <div className={`controller-wizard ${className}`}>
      <div className="wizard-header">
        <h2>Data Navigation Wizard</h2>
        {isComplete && (
          <div className="completion-badge">
            Complete
          </div>
        )}
      </div>
      
      {renderStepIndicator()}
      {renderSelectionInfo()}
      {renderNavigation()}
    </div>
  );
};

