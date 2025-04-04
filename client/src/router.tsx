import { createBrowserRouter } from 'react-router-dom';
import App from './App';

// Simple error page component
const ErrorPage = () => (
  <div className="error-page">
    <h1>Oops!</h1>
    <p>Sorry, an unexpected error has occurred.</p>
  </div>
);

// Define the routes for the application
const routes = [
  {
    path: '/*',
    element: <App />,
    errorElement: <ErrorPage />
  }
];

// Create the router with future flags that are compatible with the current version
export const router = createBrowserRouter(routes, {
  // Add future flags as they become available in the React Router version used
  // This comment serves as a reminder to update with proper flags when upgrading
}); 