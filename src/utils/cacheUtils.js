/**
 * Cache Utilities for AutorA Buyer App
 * Implements in-memory and localStorage caching for API responses
 */

// Cache configuration
const CACHE_CONFIG = {
  // Cache durations in milliseconds
  PRODUCTS: 5 * 60 * 1000,      // 5 minutes
  CATEGORIES: 30 * 60 * 1000,   // 30 minutes
  BRANDS: 30 * 60 * 1000,       // 30 minutes
  DEALERS: 15 * 60 * 1000,      // 15 minutes
  PRODUCT_DETAIL: 10 * 60 * 1000, // 10 minutes
  SEARCH_RESULTS: 2 * 60 * 1000,  // 2 minutes
  USER_DATA: 1 * 60 * 1000,       // 1 minute
  
  // Maximum cache sizes
  MAX_MEMORY_CACHE_SIZE: 50,    // Maximum items in memory cache
  MAX_STORAGE_CACHE_SIZE: 100,  // Maximum items in localStorage
};

// In-memory cache for frequently accessed data
class MemoryCache {
  constructor(maxSize = CACHE_CONFIG.MAX_MEMORY_CACHE_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set(key, value, ttl = 5 * 60 * 1000) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const expiresAt = Date.now() + ttl;
    this.cache.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  delete(key) {
    return this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

// localStorage cache for persistent data
class StorageCache {
  constructor(prefix = 'autora_cache_') {
    this.prefix = prefix;
  }

  set(key, value, ttl = 5 * 60 * 1000) {
    try {
      const expiresAt = Date.now() + ttl;
      const item = { value, expiresAt };
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      
      // Clean up old entries periodically
      this.cleanup();
    } catch (error) {
      console.warn('StorageCache: Failed to set item', error);
    }
  }

  get(key) {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiresAt) {
        localStorage.removeItem(this.prefix + key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.warn('StorageCache: Failed to get item', error);
      return null;
    }
  }

  delete(key) {
    try {
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.warn('StorageCache: Failed to delete item', error);
      return false;
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('StorageCache: Failed to clear cache', error);
    }
  }

  cleanup() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(this.prefix));
      
      // Remove expired items
      cacheKeys.forEach(key => {
        const itemStr = localStorage.getItem(key);
        if (itemStr) {
          try {
            const item = JSON.parse(itemStr);
            if (Date.now() > item.expiresAt) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Remove corrupted items
            localStorage.removeItem(key);
          }
        }
      });

      // Remove oldest items if cache is too large
      const remainingKeys = Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix));
      
      if (remainingKeys.length > CACHE_CONFIG.MAX_STORAGE_CACHE_SIZE) {
        const itemsToRemove = remainingKeys.length - CACHE_CONFIG.MAX_STORAGE_CACHE_SIZE;
        remainingKeys.slice(0, itemsToRemove).forEach(key => {
          localStorage.removeItem(key);
        });
      }
    } catch (error) {
      console.warn('StorageCache: Cleanup failed', error);
    }
  }
}

// Initialize cache instances
const memoryCache = new MemoryCache();
const storageCache = new StorageCache();

// Main cache utility class
class CacheUtils {
  /**
   * Get cached data with fallback to storage cache
   */
  static get(key, useStorage = true) {
    // Try memory cache first
    let data = memoryCache.get(key);
    if (data) return data;

    // Try storage cache if enabled
    if (useStorage) {
      data = storageCache.get(key);
      if (data) {
        // Promote to memory cache
        memoryCache.set(key, data, CACHE_CONFIG.PRODUCTS);
        return data;
      }
    }

    return null;
  }

  /**
   * Set data in both memory and storage cache
   */
  static set(key, value, ttl = CACHE_CONFIG.PRODUCTS, useStorage = true) {
    memoryCache.set(key, value, ttl);
    
    if (useStorage) {
      storageCache.set(key, value, ttl);
    }
  }

  /**
   * Delete from both caches
   */
  static delete(key) {
    memoryCache.delete(key);
    storageCache.delete(key);
  }

  /**
   * Clear all caches
   */
  static clear() {
    memoryCache.clear();
    storageCache.clear();
  }

  /**
   * Generate cache key for API requests
   */
  static generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${endpoint}_${JSON.stringify(sortedParams)}`;
  }

  /**
   * Cache API response with automatic key generation
   */
  static cacheAPIResponse(endpoint, params, data, ttl) {
    const key = this.generateKey(endpoint, params);
    this.set(key, data, ttl);
  }

  /**
   * Get cached API response
   */
  static getCachedAPIResponse(endpoint, params) {
    const key = this.generateKey(endpoint, params);
    return this.get(key);
  }

  /**
   * Invalidate cache by pattern
   */
  static invalidatePattern(pattern) {
    // Clear memory cache entries matching pattern
    for (const [key] of memoryCache.cache) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }

    // Clear storage cache entries matching pattern
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes(pattern)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('CacheUtils: Pattern invalidation failed', error);
    }
  }

  /**
   * Get cache statistics
   */
  static getStats() {
    return {
      memorySize: memoryCache.size(),
      storageSize: Object.keys(localStorage).filter(key => 
        key.startsWith('autora_cache_')
      ).length,
      config: CACHE_CONFIG
    };
  }
}

export default CacheUtils;
export { CACHE_CONFIG, MemoryCache, StorageCache };
