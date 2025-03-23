import { useState, useCallback } from 'react';
import { logError } from '../services/errorService';

/**
 * Custom hook for handling errors in React components
 * @returns Object with error state and utility functions
 */
export default function useErrorHandler() {
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * Handle an error by logging it and updating state
   */
  const handleError = useCallback((err: any) => {
    logError(err);
    setError(err);
    setLoading(false);
    return err;
  }, []);

  /**
   * Clear the current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Wrap an async function with error handling
   */
  const wrapAsync = useCallback(<T>(promise: Promise<T>): Promise<T> => {
    setLoading(true);
    clearError();
    
    return promise
      .then((result) => {
        setLoading(false);
        return result;
      })
      .catch((err) => {
        handleError(err);
        throw err;
      });
  }, [handleError, clearError]);

  /**
   * Execute an async function with built-in error handling
   */
  const executeAsync = useCallback(async <T>(asyncFn: () => Promise<T>): Promise<T | undefined> => {
    try {
      setLoading(true);
      clearError();
      const result = await asyncFn();
      setLoading(false);
      return result;
    } catch (err) {
      handleError(err);
      return undefined;
    }
  }, [handleError, clearError]);

  return {
    error,
    loading,
    handleError,
    clearError,
    wrapAsync,
    executeAsync,
    hasError: !!error
  };
} 