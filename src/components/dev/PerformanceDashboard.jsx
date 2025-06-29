import React, { useState, useEffect } from 'react';
import { FiActivity, FiClock, FiZap, FiDatabase, FiImage, FiWifi } from 'react-icons/fi';
import performanceMonitor from '../../utils/performanceMonitor';
import CacheUtils from '../../utils/cacheUtils';

/**
 * Performance Dashboard - Development tool for monitoring app performance
 * Only shown in development mode
 */
const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [cacheStats, setCacheStats] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    const updateMetrics = () => {
      const summary = performanceMonitor.getPerformanceSummary();
      setMetrics(summary);
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial load

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time) => {
    if (!time) return 'N/A';
    return time < 1000 ? `${Math.round(time)}ms` : `${(time / 1000).toFixed(2)}s`;
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getScoreColor = (score, thresholds) => {
    if (score <= thresholds.good) return 'text-green-600';
    if (score <= thresholds.needs_improvement) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoreWebVitalScore = (metric, value) => {
    const thresholds = {
      lcp: { good: 2500, needs_improvement: 4000 },
      fid: { good: 100, needs_improvement: 300 },
      cls: { good: 0.1, needs_improvement: 0.25 }
    };
    
    if (!value) return 'N/A';
    return getScoreColor(value, thresholds[metric]);
  };

  // Don't render in production
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
        title="Performance Dashboard"
      >
        📊
      </button>

      {/* Dashboard Modal */}
      {isVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Performance Dashboard</h2>
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>

              {metrics && (
                <div className="space-y-6">
                  {/* Web Vitals */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Web Vitals</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {metrics.webVitals.LCP ? `${Math.round(metrics.webVitals.LCP)}ms` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">LCP</div>
                        <div className="text-xs text-gray-500">Largest Contentful Paint</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {metrics.webVitals.FID ? `${Math.round(metrics.webVitals.FID)}ms` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">FID</div>
                        <div className="text-xs text-gray-500">First Input Delay</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {metrics.webVitals.CLS ? metrics.webVitals.CLS.toFixed(3) : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">CLS</div>
                        <div className="text-xs text-gray-500">Cumulative Layout Shift</div>
                      </div>
                    </div>
                  </div>

                  {/* API Performance */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">API Performance</h3>
                    {metrics.api.length > 0 ? (
                      <div className="space-y-3">
                        {metrics.api.slice(0, 5).map((api, index) => (
                          <div key={index} className="flex justify-between items-center bg-white p-3 rounded">
                            <div>
                              <div className="font-medium">{api.endpoint}</div>
                              <div className="text-sm text-gray-600">
                                {api.calls} calls • {api.successRate.toFixed(1)}% success
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                {Math.round(api.averageDuration)}ms
                              </div>
                              <div className="text-sm text-gray-600">
                                {api.cacheHitRate.toFixed(1)}% cached
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">No API calls recorded</div>
                    )}
                  </div>

                  {/* Cache Performance */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Cache Performance</h3>
                    {metrics.cache.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {metrics.cache.map((cache, index) => (
                          <div key={index} className="bg-white p-3 rounded">
                            <div className="font-medium">{cache.key}</div>
                            <div className="text-sm text-gray-600">
                              {cache.totalOperations} operations
                            </div>
                            <div className="text-lg font-semibold text-green-600">
                              {cache.hitRate.toFixed(1)}% hit rate
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">No cache operations recorded</div>
                    )}
                  </div>

                  {/* Navigation Performance */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">Navigation Performance</h3>
                    {metrics.navigation.length > 0 ? (
                      <div className="space-y-2">
                        {metrics.navigation.slice(0, 5).map((nav, index) => (
                          <div key={index} className="flex justify-between items-center bg-white p-3 rounded">
                            <div className="font-medium">{nav.route}</div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                {Math.round(nav.averageDuration)}ms
                              </div>
                              <div className="text-sm text-gray-600">
                                {nav.totalNavigations} navigations
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">No navigation data recorded</div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        const exported = performanceMonitor.exportMetrics();
                        console.log('Performance Metrics:', exported);
                        
                        // Download as JSON
                        const blob = new Blob([JSON.stringify(exported, null, 2)], {
                          type: 'application/json'
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `performance-metrics-${new Date().toISOString()}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                      Export Metrics
                    </button>
                    <button
                      onClick={() => {
                        performanceMonitor.reset();
                        setMetrics(performanceMonitor.getPerformanceSummary());
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Reset Metrics
                    </button>
                    <button
                      onClick={() => {
                        performanceMonitor.clearOldMetrics();
                        setMetrics(performanceMonitor.getPerformanceSummary());
                      }}
                      className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                    >
                      Clear Old
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PerformanceDashboard;
