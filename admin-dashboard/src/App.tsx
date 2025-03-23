import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { Snackbar, Alert } from '@mui/material';

// Components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import ErrorBoundary from './components/ErrorBoundary';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExpiredSession, setShowExpiredSession] = React.useState(false);

  // Check for expired session message in URL
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setShowExpiredSession(true);
      // Clean up the URL
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  const handleErrorBoundaryReset = () => {
    // Navigate to the dashboard when recovering from an error
    navigate('/', { replace: true });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary onReset={handleErrorBoundaryReset}>
        <Box sx={{ display: 'flex' }}>
          <Layout>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
              <Routes>
                <Route path="/" element={
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                } />
                <Route path="/properties" element={
                  <ErrorBoundary>
                    <Properties />
                  </ErrorBoundary>
                } />
                <Route path="/users" element={
                  <ErrorBoundary>
                    <Users />
                  </ErrorBoundary>
                } />
                <Route path="/analytics" element={
                  <ErrorBoundary>
                    <Analytics />
                  </ErrorBoundary>
                } />
                <Route path="/settings" element={
                  <ErrorBoundary>
                    <Settings />
                  </ErrorBoundary>
                } />
                <Route path="/logs" element={
                  <ErrorBoundary>
                    <Logs />
                  </ErrorBoundary>
                } />
              </Routes>
            </Box>
          </Layout>
        </Box>
      </ErrorBoundary>

      {/* Session expired notification */}
      <Snackbar 
        open={showExpiredSession} 
        autoHideDuration={6000} 
        onClose={() => setShowExpiredSession(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowExpiredSession(false)} 
          severity="warning" 
          variant="filled"
        >
          Your session has expired. Please log in again.
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App; 