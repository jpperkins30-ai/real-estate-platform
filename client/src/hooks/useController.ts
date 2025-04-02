import { useState, useEffect, useCallback } from 'react';
import {
  controllerService,
  ControllerEvent,
  StateData,
  CountyData,
  PropertyData,
  DataFilter
} from '../services/controllerService';

/**
 * Custom hook for using the Controller Service in React components
 * Provides reactive state and methods for interacting with the controller
 */
export function useController() {
  // State for selected items
  const [currentState, setCurrentState] = useState<StateData | null>(
    controllerService.getCurrentState()
  );
  const [currentCounty, setCurrentCounty] = useState<CountyData | null>(
    controllerService.getCurrentCounty()
  );
  const [currentProperty, setCurrentProperty] = useState<PropertyData | null>(
    controllerService.getCurrentProperty()
  );
  const [currentFilter, setCurrentFilter] = useState<DataFilter>(
    controllerService.getCurrentFilter()
  );

  // Subscribe to controller events to update local state
  useEffect(() => {
    // Define event handlers
    const handleStateSelected = (state: StateData) => {
      setCurrentState(state);
      setCurrentCounty(null);
      setCurrentProperty(null);
    };

    const handleCountySelected = (county: CountyData) => {
      setCurrentCounty(county);
      setCurrentProperty(null);
    };

    const handlePropertySelected = (property: PropertyData) => {
      setCurrentProperty(property);
    };

    const handleFilterChanged = (filter: DataFilter) => {
      setCurrentFilter(filter);
    };

    const handleReset = () => {
      setCurrentState(null);
      setCurrentCounty(null);
      setCurrentProperty(null);
      setCurrentFilter({});
    };

    // Subscribe to events
    const unsubscribeState = controllerService.on(
      ControllerEvent.STATE_SELECTED,
      handleStateSelected
    );
    
    const unsubscribeCounty = controllerService.on(
      ControllerEvent.COUNTY_SELECTED,
      handleCountySelected
    );
    
    const unsubscribeProperty = controllerService.on(
      ControllerEvent.PROPERTY_SELECTED,
      handlePropertySelected
    );
    
    const unsubscribeFilter = controllerService.on(
      ControllerEvent.FILTER_CHANGED,
      handleFilterChanged
    );
    
    const unsubscribeReset = controllerService.on(
      ControllerEvent.RESET,
      handleReset
    );

    // Cleanup subscriptions when component unmounts
    return () => {
      unsubscribeState();
      unsubscribeCounty();
      unsubscribeProperty();
      unsubscribeFilter();
      unsubscribeReset();
    };
  }, []);

  // Memoized action methods
  const selectState = useCallback((state: StateData) => {
    controllerService.selectState(state);
  }, []);

  const selectCounty = useCallback((county: CountyData) => {
    controllerService.selectCounty(county);
  }, []);

  const selectProperty = useCallback((property: PropertyData) => {
    controllerService.selectProperty(property);
  }, []);

  const applyFilter = useCallback((filter: DataFilter) => {
    controllerService.applyFilter(filter);
  }, []);

  const resetFilter = useCallback(() => {
    controllerService.resetFilter();
  }, []);

  const reset = useCallback(() => {
    controllerService.reset();
  }, []);

  // Method to subscribe to controller events from components
  const subscribe = useCallback(
    (event: ControllerEvent, listener: (...args: any[]) => void) => {
      return controllerService.on(event, listener);
    },
    []
  );

  return {
    // Current state
    currentState,
    currentCounty,
    currentProperty,
    currentFilter,
    
    // Actions
    selectState,
    selectCounty,
    selectProperty,
    applyFilter,
    resetFilter,
    reset,
    
    // Event subscription
    subscribe,
    
    // Event types for reference
    events: ControllerEvent,
  };
}

