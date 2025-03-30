import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  loadTime: number;
}

const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>(performance.now());
  const renderTimeRef = useRef<number>(0);

  useEffect(() => {
    const loadTime = performance.now() - startTimeRef.current;
    renderTimeRef.current = loadTime;

    // Log performance metrics
    const metrics: PerformanceMetrics = {
      componentName,
      renderTime: renderTimeRef.current,
      loadTime
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', metrics);
    }

    // You could send metrics to your analytics service here
    // Example: sendToAnalytics(metrics);

    return () => {
      const unmountTime = performance.now();
      const totalMountedTime = unmountTime - startTimeRef.current;

      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} was mounted for ${totalMountedTime}ms`);
      }
    };
  }, [componentName]);

  return {
    logRender: () => {
      const currentRenderTime = performance.now() - startTimeRef.current;
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} render time: ${currentRenderTime}ms`);
      }
    }
  };
};

export default usePerformanceMonitor; 