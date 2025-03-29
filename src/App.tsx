import React from 'react';
import './App.css';

function App() {
  return (
    <div style={{ 
      textAlign: 'center', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px' 
    }}>
      <header style={{ 
        backgroundColor: '#282c34', 
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h1>Real Estate Platform</h1>
      </header>
      
      <main>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h2>Welcome</h2>
          <p>This is a very simple React app that should render without any issues.</p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flex: '1',
            minWidth: '250px'
          }}>
            <h3>About</h3>
            <p>This is a minimal version designed to work without external dependencies.</p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            flex: '1',
            minWidth: '250px'
          }}>
            <h3>Status</h3>
            <p>If you can see this content, React is working correctly!</p>
          </div>
        </div>
      </main>
      
      <footer style={{ 
        marginTop: '40px', 
        color: '#666',
        borderTop: '1px solid #eee',
        paddingTop: '20px'
      }}>
        <p>© 2025 Real Estate Platform</p>
      </footer>
    </div>
  );
}

export default App; 