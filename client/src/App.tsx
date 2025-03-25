import React from 'react';
import { Container, Row, Col, Nav, Tab } from 'react-bootstrap';
import { FaTachometerAlt, FaLayerGroup, FaCogs, FaHistory } from 'react-icons/fa';
import InventoryDashboard from './components/InventoryDashboard.jsx';
import HierarchyTree from './components/HierarchyTree.jsx';
import CollectorConfigurationForm from './components/CollectorConfigurationForm.jsx';
import CollectionHistory from './components/CollectionHistory.jsx';
import ControllerWizard from './components/ControllerWizard';
import PropertyValuationPage from './pages/PropertyValuationPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { InventoryModule } from './components/inventory';
import { InventoryProvider } from './context/InventoryContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const App: React.FC = () => {
  return (
    <div className="App">
      <InventoryProvider>
        <Router>
          <Routes>
            <Route path="/" element={<InventoryModule />} />
            <Route path="/inventory/*" element={<InventoryModule />} />
            <Route path="/controller-wizard" element={<ControllerWizard />} />
            <Route path="/property-valuation" element={<PropertyValuationPage />} />
          </Routes>
        </Router>
      </InventoryProvider>
    </div>
  );
};

export default App;
