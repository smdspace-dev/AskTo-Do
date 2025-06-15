import React from 'react';

const SimpleTest = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      color: '#333'
    }}>
      <h1>AI Todo Assistant - Test</h1>
      <p>This is a simple test to verify the app is loading correctly.</p>
      <button 
        onClick={() => alert('App is working!')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  );
};

export default SimpleTest;