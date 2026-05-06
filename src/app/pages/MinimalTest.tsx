import React from 'react';

export default function MinimalTest() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0f172a', 
      color: '#f8fafc',
      padding: '3rem',
      fontFamily: 'system-ui'
    }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#10b981' }}>
        ✅ Router is Working!
      </h1>
      <p style={{ fontSize: '1.25rem', color: '#cbd5e1', marginBottom: '2rem' }}>
        Caresolis v6.45.5 - Minimal Test Page
      </p>
      
      <div style={{ 
        background: '#1e293b', 
        padding: '2rem', 
        borderRadius: '12px',
        maxWidth: '600px'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Success!</h2>
        <ul style={{ lineHeight: '2' }}>
          <li>✓ React is rendering</li>
          <li>✓ React Router is working</li>
          <li>✓ Vite build is successful</li>
          <li>✓ TypeScript compilation succeeded</li>
        </ul>
        
        <div style={{ 
          marginTop: '2rem', 
          padding: '1rem', 
          background: '#064e3b',
          borderRadius: '8px'
        }}>
          <p style={{ color: '#d1fae5' }}>
            <strong>Next Step:</strong> Gradually add back contexts and route components
            to identify which one causes the "Load failed" error.
          </p>
        </div>
      </div>
    </div>
  );
}
