import performanceMonitor from './performanceMonitor';

/**
 * API Performance Tracker - Automatically tracks API performance
 */

// Original fetch function
const originalFetch = window.fetch;

// Override fetch to track performance
window.fetch = async (...args) => {
  const startTime = performance.now();
  const url = args[0];
  let endpoint = 'unknown';
  
  try {
    // Extract endpoint name from URL
    if (typeof url === 'string') {
      const urlObj = new URL(url, window.location.origin);
      endpoint = urlObj.pathname.split('/').slice(-2).join('/'); // Get last 2 path segments
    } else if (url.url) {
      const urlObj = new URL(url.url, window.location.origin);
      endpoint = urlObj.pathname.split('/').slice(-2).join('/');
    }
    
    // Make the actual request
    const response = await originalFetch(...args);
    const endTime = performance.now();
    
    // Track the API call
    performanceMonitor.trackAPICall(
      endpoint,
      startTime,
      endTime,
      response.ok,
      response.headers.get('x-cache') === 'HIT' // Check if response was cached
    );
    
    return response;
  } catch (error) {
    const endTime = performance.now();
    
    // Track failed API call
    performanceMonitor.trackAPICall(
      endpoint,
      startTime,
      endTime,
      false,
      false
    );
    
    throw error;
  }
};

/**
 * Service call wrapper for manual tracking
 */
export const trackServiceCall = async (serviceName, operation, serviceCall) => {
  const startTime = performance.now();
  
  try {
    const result = await serviceCall();
    const endTime = performance.now();
    
    // Check if result came from cache
    const fromCache = result?.performance?.fromCache || result?.fromCache || false;
    const success = result?.success !== false;
    
    performanceMonitor.trackAPICall(
      `${serviceName}/${operation}`,
      startTime,
      endTime,
      success,
      fromCache
    );
    
    return result;
  } catch (error) {
    const endTime = performance.now();
    
    performanceMonitor.trackAPICall(
      `${serviceName}/${operation}`,
      startTime,
      endTime,
      false,
      false
    );
    
    throw error;
  }
};

/**
 * React hook for tracking component render performance
 */
import React from 'react';

export const useRenderTracking = (componentName) => {
  const renderStartTime = React.useRef(performance.now());
  
  React.useEffect(() => {
    const endTime = performance.now();
    performanceMonitor.trackRender(
      componentName,
      renderStartTime.current,
      endTime
    );
  });
  
  // Update start time for re-renders
  renderStartTime.current = performance.now();
};

/**
 * HOC for automatic render tracking
 */
export const withRenderTracking = (WrappedComponent, componentName) => {
  return React.memo((props) => {
    useRenderTracking(componentName || WrappedComponent.name);
    return <WrappedComponent {...props} />;
  });
};

export default {
  trackServiceCall,
  useRenderTracking,
  withRenderTracking
}; 