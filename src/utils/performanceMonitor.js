/**
 * Performance Monitor Utility - Tracks application performance metrics
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      api: new Map(),
      renders: new Map(),
      webVitals: new Map(),
      navigation: new Map(),
      cache: new Map()
    };
    
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    
    // Track Web Vitals
    this.trackWebVitals();
  }

  trackWebVitals() {
    // Track Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.recordMetric('webVitals', 'LCP', {
            value: lastEntry.renderTime || lastEntry.loadTime,
            timestamp: Date.now()
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Track First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('webVitals', 'FID', {
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now()
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });

        // Track Cumulative Layout Shift (CLS)
        // Check if layout-shift is supported
        if (PerformanceObserver.supportedEntryTypes && PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
          let clsValue = 0;
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
                this.recordMetric('webVitals', 'CLS', {
                  value: clsValue,
                  timestamp: Date.now()
                });
              }
            }
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
        }
      } catch (error) {
        console.warn('Performance observers not supported:', error);
      }
    }
  }

  // API Performance Tracking
  trackAPICall(endpoint, startTime, endTime, success = true, cacheHit = false) {
    const duration = endTime - startTime;
    
    // Track individual call
    this.recordMetric('api', `${endpoint}_calls`, {
      endpoint,
      duration,
      success,
      cacheHit,
      timestamp: Date.now()
    });
    
    // Track API statistics
    const key = `api_${endpoint}`;
    if (!this.metrics.api.has(key)) {
      this.metrics.api.set(key, {
        calls: 0,
        totalDuration: 0,
        successRate: 0,
        cacheHitRate: 0,
        averageDuration: 0,
        errors: 0
      });
    }
    
    const stats = this.metrics.api.get(key);
    stats.calls++;
    stats.totalDuration += duration;
    stats.averageDuration = stats.totalDuration / stats.calls;
    
    if (success) {
      stats.successRate = ((stats.calls - stats.errors) / stats.calls) * 100;
    } else {
      stats.errors++;
      stats.successRate = ((stats.calls - stats.errors) / stats.calls) * 100;
    }
    
    if (cacheHit) {
      stats.cacheHitRate = (stats.cacheHitRate * (stats.calls - 1) + 100) / stats.calls;
    } else {
      stats.cacheHitRate = (stats.cacheHitRate * (stats.calls - 1)) / stats.calls;
    }
  }

  // Component Render Performance
  trackRender(componentName, startTime, endTime) {
    const duration = endTime - startTime;
    this.recordMetric('renders', componentName, {
      component: componentName,
      duration,
      timestamp: Date.now()
    });
  }

  // Cache Performance
  trackCache(cacheType, operation, hit = true) {
    const key = `${cacheType}_${operation}`;
    if (!this.metrics.cache.has(key)) {
      this.metrics.cache.set(key, {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalOperations: 0
      });
    }
    
    const stats = this.metrics.cache.get(key);
    stats.totalOperations++;
    
    if (hit) {
      stats.hits++;
    } else {
      stats.misses++;
    }
    
    stats.hitRate = (stats.hits / stats.totalOperations) * 100;
  }

  // Navigation Performance
  trackNavigation(from, to, duration) {
    this.recordMetric('navigation', `${from}_to_${to}`, {
      from,
      to,
      duration,
      timestamp: Date.now()
    });
  }

  // Helper method to record metrics
  recordMetric(category, key, data) {
    if (!this.metrics[category]) {
      this.metrics[category] = new Map();
    }
    
    if (!this.metrics[category].has(key)) {
      this.metrics[category].set(key, []);
    }
    
    const metrics = this.metrics[category].get(key);
    metrics.push(data);
    
    // Keep only last 50 entries to prevent memory issues
    if (metrics.length > 50) {
      metrics.shift();
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    return {
      api: this.getAPISummary(),
      webVitals: this.getWebVitalsSummary(),
      cache: this.getCacheSummary(),
      navigation: this.getNavigationSummary()
    };
  }

  getAPISummary() {
    const apiMetrics = Array.from(this.metrics.api.entries());
    return apiMetrics
      .filter(([key]) => !key.endsWith('_calls'))
      .map(([endpoint, stats]) => ({
        endpoint: endpoint.replace('api_', ''),
        ...stats
      }));
  }

  getWebVitalsSummary() {
    const vitals = {};
    ['LCP', 'FID', 'CLS'].forEach(vital => {
      const metrics = this.metrics.webVitals?.get(vital);
      if (metrics && metrics.length > 0) {
        const latest = metrics[metrics.length - 1];
        vitals[vital] = latest.value;
      }
    });
    return vitals;
  }

  getCacheSummary() {
    return Array.from(this.metrics.cache.entries()).map(([key, stats]) => ({
      key,
      ...stats
    }));
  }

  getNavigationSummary() {
    const navMetrics = Array.from(this.metrics.navigation.entries());
    return navMetrics.map(([route, data]) => ({
      route,
      averageDuration: data.reduce((sum, item) => sum + item.duration, 0) / data.length,
      totalNavigations: data.length
    }));
  }

  // Export metrics for analysis
  exportMetrics() {
    const exported = {};
    
    for (const [category, metrics] of Object.entries(this.metrics)) {
      exported[category] = {};
      for (const [key, data] of metrics.entries()) {
        exported[category][key] = data;
      }
    }
    
    return {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: exported
    };
  }

  // Clear old metrics
  clearOldMetrics(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoff = Date.now() - maxAge;
    
    for (const [category, metrics] of Object.entries(this.metrics)) {
      for (const [key, data] of metrics.entries()) {
        if (Array.isArray(data)) {
          const filtered = data.filter(item => item.timestamp > cutoff);
          metrics.set(key, filtered);
        }
      }
    }
  }

  // Clear all metrics
  reset() {
    this.metrics = {
      api: new Map(),
      renders: new Map(),
      webVitals: new Map(),
      navigation: new Map(),
      cache: new Map()
    };
  }

  // Compatibility methods for Performance API
  mark(name) {
    if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
      try {
        window.performance.mark(name);
      } catch (error) {
        console.warn('Performance.mark not supported:', error);
      }
    }
  }

  measure(name, startMark, endMark) {
    if (typeof window !== 'undefined' && window.performance && window.performance.measure) {
      try {
        window.performance.measure(name, startMark, endMark);
        
        // Also record in our custom metrics
        if (window.performance.getEntriesByName) {
          const measure = window.performance.getEntriesByName(name, 'measure')[0];
          if (measure) {
            this.recordMetric('navigation', name, {
              name,
              duration: measure.duration,
              timestamp: Date.now()
            });
          }
        }
      } catch (error) {
        console.warn('Performance.measure not supported:', error);
      }
    }
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
