import React, { useState, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import api from './services/api';
import { State } from './types/api';
import './App.css';

import ErrorBoundary from './components/common/ErrorBoundary';
import usePerformanceMonitor from './hooks/usePerformanceMonitor';

// Lazy load components with prefetching
const InventoryModule = React.lazy(() => {
  const module = import('./components/inventory').then(m => ({ default: m.InventoryModule }));
  // Prefetch related components
  import('./components/inventory').then(m => m.InventoryTree);
  import('./components/inventory').then(m => m.StateDetails);
  return module;
});

// Lazy load standalone components
const InventorySidebar = React.lazy(() => import('./components/inventory').then(module => ({ default: module.InventorySidebar })));
const InventoryTree = React.lazy(() => import('./components/inventory').then(module => ({ default: module.InventoryTree })));
const InventoryDashboard = React.lazy(() => import('./components/inventory').then(module => ({ default: module.InventoryMain })));
const StateDetails = React.lazy(() => import('./components/inventory').then(module => ({ default: module.StateDetails })));
const CountyDetails = React.lazy(() => import('./components/inventory').then(module => ({ default: module.CountyDetails })));
const PropertyDetails = React.lazy(() => import('./components/inventory').then(module => ({ default: module.PropertyDetails })));

// Lazy load standalone components
const CollectionHistory = React.lazy(() => import('./components/CollectionHistory'));
const CollectorConfigurationForm = React.lazy(() => import('./components/CollectorConfigurationForm'));
const HierarchyTree = React.lazy(() => import('./components/HierarchyTree'));
const PropertyValuationPage = React.lazy(() => import('./pages/PropertyValuationPage'));

// Loading and error fallback components
const LoadingFallback = () => (
  <div className="loading-spinner">
    <p>Loading...</p>
  </div>
);

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="error-boundary">
    <h2>Something went wrong</h2>
    <p>{error.message}</p>
    <button onClick={() => window.location.reload()} className="retry-button">
      Reload Page
    </button>
  </div>
);

function App() {
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Monitor app performance
  const { logRender } = usePerformanceMonitor('App');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getStates();
        if (response && response.length > 0) {
          setStates(response);
        }
      } catch (err) {
        console.error('Error fetching states:', err);
        setError('Failed to load states');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Log render performance
  useEffect(() => {
    logRender();
  });

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <Link to="/" className="app-logo">Real Estate Platform</Link>
          <nav className="app-nav">
            <Link to="/">Dashboard</Link>
            <Link to="/inventory">Inventory</Link>
            <Link to="/valuation">Property Valuation</Link>
            <Link to="/collection">Collection History</Link>
          </nav>
        </header>

        <div className="app-content">
          <ErrorBoundary fallback={<ErrorFallback error={new Error('Application error')} />}>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Dashboard Route */}
                <Route path="/" element={
                  <div className="dashboard">
                    <h1>Real Estate Dashboard</h1>
                    {isLoading ? (
                      <p>Loading states...</p>
                    ) : error ? (
                      <p className="error">{error}</p>
                    ) : (
                      <div className="states-grid">
                        {states.map(state => (
                          <div key={state.id} className="state-card">
                            <h2>{state.name} ({state.abbreviation})</h2>
                            <p>Counties: {state.metadata?.totalCounties || 0}</p>
                            <p>Properties: {state.metadata?.totalProperties || 0}</p>
                            <Link to={`/inventory/state/${state.id}`} className="view-link">View Details</Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                } />
                
                {/* Inventory Routes */}
                <Route path="/inventory/*" element={
                  <ErrorBoundary>
                    <div className="inventory-layout">
                      <Suspense fallback={<LoadingFallback />}>
                        <InventorySidebar />
                        <div className="inventory-content">
                          <Routes>
                            <Route index element={<InventoryDashboard />} />
                            <Route path="tree" element={<InventoryTree />} />
                            <Route path="hierarchy" element={<HierarchyTree />} />
                            <Route path="state/:stateId" element={<StateDetails />} />
                            <Route path="county/:countyId" element={<CountyDetails />} />
                            <Route path="property/:propertyId" element={<PropertyDetails />} />
                          </Routes>
                        </div>
                      </Suspense>
                    </div>
                  </ErrorBoundary>
                } />

                {/* Property Valuation Route */}
                <Route path="/valuation" element={
                  <ErrorBoundary>
                    <PropertyValuationPage />
                  </ErrorBoundary>
                } />

                {/* Collection Routes */}
                <Route path="/collection" element={
                  <ErrorBoundary>
                    <CollectionHistory />
                  </ErrorBoundary>
                } />
                <Route path="/collection/configure" element={
                  <ErrorBoundary>
                    <CollectorConfigurationForm />
                  </ErrorBoundary>
                } />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </Router>
  );
}

export default App; 