import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// import performanceMonitor from './utils/performanceMonitor';
import './utils/testConnection';
import { initializeCurrency } from './utils/priceFormatter.js';

// Register service worker for caching and offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Performance monitoring - mark app start
// performanceMonitor.mark('app-start');

// Initialize currency system with location detection
initializeCurrency();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Performance monitoring - mark app rendered
// performanceMonitor.mark('app-rendered');
// performanceMonitor.measure('app-initialization', 'app-start', 'app-rendered');