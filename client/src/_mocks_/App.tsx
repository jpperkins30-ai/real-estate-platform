import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import api from './services/api';
import { State, County, Property } from './types/api';
import './App.css';

// Import components for inventory module
import InventoryModule from './components/inventory/InventoryModule';
import InventorySidebar from './components/inventory/InventorySidebar';
import PropertySearchPage from './pages/inventory/PropertySearchPage';

// Mock data for testing
const MOCK_STATES: State[] = [
  {
    id: '1',
    name: 'California',
    abbreviation: 'CA',
    type: 'state',
    metadata: {
      totalCounties: 2,
      totalProperties: 5,
      statistics: {
        totalTaxLiens: 0,
        totalValue: 0,
        averagePropertyValue: 0
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'New York',
    abbreviation: 'NY',
    type: 'state',
    metadata: {
      totalCounties: 0,
      totalProperties: 0,
      statistics: {
        totalTaxLiens: 0,
        totalValue: 0,
        averagePropertyValue: 0
      }
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function App() {
  const [states, setStates] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getStates();
        if (response && response.length > 0) {
          setStates(response);
        } else {
          // Use mock data if the API doesn't return any states
          setStates(MOCK_STATES);
        }
      } catch (err) {
        console.error('Error fetching states:', err);
        setError('Failed to load states');
        // Use mock data on error
        setStates(MOCK_STATES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <Link to="/" className="app-logo">Real Estate Platform</Link>
          <nav className="app-nav">
            <Link to="/">Dashboard</Link>
            <Link to="/inventory">Inventory</Link>
          </nav>
        </header>

        <div className="app-content">
          <Routes>
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
            
            <Route path="/inventory/*" element={
              <div className="inventory-layout">
                <InventorySidebar />
                <div className="inventory-content">
                  <InventoryModule />
                </div>
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
