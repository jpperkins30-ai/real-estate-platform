import { useState, useCallback, useEffect } from 'react';

interface MaximizableOptions {
  stateKey?: string;
  onMaximize?: (maximized: boolean) => void;
}

export function useMaximizable(options: MaximizableOptions = {}) {
  // Initialize state from localStorage if stateKey is provided
  const [isMaximized, setIsMaximized] = useState(() => {
    if (options.stateKey) {
      try {
        const savedState = localStorage.getItem(options.stateKey);
        return savedState === 'true'; 
      } catch (error) {
        console.error('Error loading maximized state:', error);
      }
    }
    return false;
  });

  // Save state to localStorage when it changes
  useEffect(() => {
    if (options.stateKey) {
      try {
        localStorage.setItem(options.stateKey, isMaximized.toString());
      } catch (error) {
        console.error('Error saving maximized state:', error);
      }
    }
  }, [isMaximized, options.stateKey]);

  const toggleMaximize = useCallback((ref: React.RefObject<HTMLElement>) => {
    setIsMaximized(prev => {
      const newState = !prev;
      if (options.onMaximize) {
        options.onMaximize(newState);
      }
      return newState;
    });
  }, [options.onMaximize]);

  return {
    isMaximized,
    toggleMaximize
  };
}
