import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('MindForge: Starting app initialization...');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('MindForge: Root element not found!');
  throw new Error("Could not find root element to mount to");
}

console.log('MindForge: Root element found, creating React root...');

try {
  const root = ReactDOM.createRoot(rootElement);
  console.log('MindForge: React root created, rendering app...');
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('MindForge: App rendered successfully!');
} catch (error) {
  console.error('MindForge: Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: white; font-family: sans-serif;">
      <h1 style="color: #ef4444; margin-bottom: 1rem;">Failed to Load</h1>
      <p style="margin-bottom: 1rem;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">
        Reload Page
      </button>
    </div>
  `;
}