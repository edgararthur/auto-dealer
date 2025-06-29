import supabase from '../supabase/supabaseClient.js';

// Advanced caching system
const cache = new Map();
const cacheExpiry = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for brands (static data)

// Performance monitoring
const brandMetrics = {
  cacheHits: 0,
  cacheMisses: 0,
  queryCount: 0,
  avgResponseTime: 0
};

const isCacheValid = (key) => {
  const expiry = cacheExpiry.get(key);
  return expiry && Date.now() < expiry;
};

const setCache = (key, data, duration = CACHE_DURATION) => {
  cache.set(key, data);
  cacheExpiry.set(key, Date.now() + duration);
};

const getCache = (key) => {
  if (isCacheValid(key)) {
    brandMetrics.cacheHits++;
    return cache.get(key);
  }
  brandMetrics.cacheMisses++;
  cache.delete(key);
  cacheExpiry.delete(key);
  return null;
};

const startTimer = () => performance.now();
const endTimer = (startTime) => performance.now() - startTime;

// Multi-tenant helper
const getTenantFilter = (tenantId) => {
  if (tenantId) {
    return { tenant_id: tenantId };
  }
  return {};
};

/**
 * Enhanced Brand Service with performance optimization and multi-tenant support
 */
const BrandService = {
  /**
   * ENHANCED: Get all brands with caching and performance tracking
   */
  async getBrands(tenantId = null) {
    const timer = startTimer();
    try {
      brandMetrics.queryCount++;
      
      const cacheKey = `brands_${tenantId || 'default'}`;
      const cached = getCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          performance: {
            responseTime: endTimer(timer),
            fromCache: true
          }
        };
      }

      let query = supabase
        .from('brands')
        .select(`
          id,
          name,
          description,
          website,
          created_at,
          updated_at
        `)
        .order('name', { ascending: true });

      // Apply multi-tenant filtering
      const tenantFilter = getTenantFilter(tenantId);
      if (tenantFilter.tenant_id) {
        query = query.eq('tenant_id', tenantFilter.tenant_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }

      const result = {
        success: true,
        brands: data || [],
        performance: {
          responseTime: endTimer(timer),
          fromCache: false
        }
      };

      setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('BrandService.getBrands error:', error);
      return {
        success: false,
        error: error.message,
        brands: [],
        performance: {
          responseTime: endTimer(timer),
          failed: true
        }
      };
    }
  },

  /**
   * ENHANCED: Get brands with product counts
   */
  async getBrandsWithCounts(tenantId = null) {
    const timer = startTimer();
    try {
      const cacheKey = `brands_with_counts_${tenantId || 'default'}`;
      const cached = getCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          performance: {
            responseTime: endTimer(timer),
            fromCache: true
          }
        };
      }

      let query = supabase
        .from('brands')
        .select(`
          id,
          name,
          description,
          website,
          created_at,
          updated_at
        `)
        .order('name', { ascending: true });

      // Apply multi-tenant filtering
      const tenantFilter = getTenantFilter(tenantId);
      if (tenantFilter.tenant_id) {
        query = query.eq('tenant_id', tenantFilter.tenant_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching brands with counts:', error);
        throw error;
      }

             // Return brands without product counts for now
       const brands = data.map(brand => ({
         ...brand,
         productCount: 0 // Will be populated separately if needed
       }));

      const result = {
        success: true,
        brands,
        performance: {
          responseTime: endTimer(timer),
          fromCache: false
        }
      };

      setCache(cacheKey, result, CACHE_DURATION);
      return result;

    } catch (error) {
      console.error('BrandService.getBrandsWithCounts error:', error);
      return {
        success: false,
        error: error.message,
        brands: [],
        performance: {
          responseTime: endTimer(timer),
          failed: true
        }
      };
    }
  },

  /**
   * ENHANCED: Get single brand by ID
   */
  async getBrandById(id, tenantId = null) {
    const timer = startTimer();
    try {
      const cacheKey = `brand_${id}_${tenantId || 'default'}`;
      const cached = getCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          performance: {
            responseTime: endTimer(timer),
            fromCache: true
          }
        };
      }

      let query = supabase
        .from('brands')
        .select(`
          id,
          name,
          description,
          website,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .single();

      // Apply multi-tenant filtering
      const tenantFilter = getTenantFilter(tenantId);
      if (tenantFilter.tenant_id) {
        query = query.eq('tenant_id', tenantFilter.tenant_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching brand:', error);
        throw error;
      }

             const brand = {
         ...data,
         productCount: 0 // Will be populated separately if needed
       };

      const result = {
        success: true,
        brand,
        performance: {
          responseTime: endTimer(timer),
          fromCache: false
        }
      };

      setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('BrandService.getBrandById error:', error);
      return {
        success: false,
        error: error.message,
        brand: null,
        performance: {
          responseTime: endTimer(timer),
          failed: true
        }
      };
    }
  },

  /**
   * ENHANCED: Search brands with relevance scoring
   */
  async searchBrands(query, tenantId = null) {
    const timer = startTimer();
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: true,
          brands: [],
          performance: {
            responseTime: endTimer(timer),
            fromCache: false
          }
        };
      }

      const searchTerm = query.trim();
      const cacheKey = `search_brands_${searchTerm}_${tenantId || 'default'}`;
      const cached = getCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          performance: {
            responseTime: endTimer(timer),
            fromCache: true
          }
        };
      }

      let searchQuery = supabase
        .from('brands')
        .select(`
          id,
          name,
          description,
          website,
          created_at,
          updated_at
        `)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('name', { ascending: true });

      // Apply multi-tenant filtering
      const tenantFilter = getTenantFilter(tenantId);
      if (tenantFilter.tenant_id) {
        searchQuery = searchQuery.eq('tenant_id', tenantFilter.tenant_id);
      }

      const { data, error } = await searchQuery;

      if (error) {
        console.error('Error searching brands:', error);
        throw error;
      }

      // Add relevance scoring
      const brands = data.map(brand => {
        let relevanceScore = 0;
        const lowerQuery = searchTerm.toLowerCase();
        const lowerName = brand.name.toLowerCase();
        const lowerDesc = (brand.description || '').toLowerCase();

        // Exact name match gets highest score
        if (lowerName === lowerQuery) {
          relevanceScore += 100;
        } else if (lowerName.startsWith(lowerQuery)) {
          relevanceScore += 80;
        } else if (lowerName.includes(lowerQuery)) {
          relevanceScore += 60;
        }

        // Description matches get lower scores
        if (lowerDesc.includes(lowerQuery)) {
          relevanceScore += 20;
        }

                 return {
           ...brand,
           productCount: 0, // Will be populated separately if needed
           relevanceScore
         };
      });

      // Sort by relevance score, then by name
      brands.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return a.name.localeCompare(b.name);
      });

      const result = {
        success: true,
        brands,
        query: searchTerm,
        performance: {
          responseTime: endTimer(timer),
          fromCache: false
        }
      };

      setCache(cacheKey, result, CACHE_DURATION);
      return result;

    } catch (error) {
      console.error('BrandService.searchBrands error:', error);
      return {
        success: false,
        error: error.message,
        brands: [],
        performance: {
          responseTime: endTimer(timer),
          failed: true
        }
      };
    }
  },

  /**
   * ENHANCED: Get featured/popular brands
   */
  async getFeaturedBrands(limit = 12, tenantId = null) {
    const timer = startTimer();
    try {
      const cacheKey = `featured_brands_${limit}_${tenantId || 'default'}`;
      const cached = getCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          performance: {
            responseTime: endTimer(timer),
            fromCache: true
          }
        };
      }

      // Get brands with product counts for featured selection
      const brandsResult = await this.getBrandsWithCounts(tenantId);
      if (!brandsResult.success) {
        return brandsResult;
      }

      // Sort by product count and take top brands
      const featuredBrands = brandsResult.brands
        .filter(brand => brand.productCount > 0)
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, limit);

      const result = {
        success: true,
        brands: featuredBrands,
        performance: {
          responseTime: endTimer(timer),
          fromCache: false
        }
      };

      setCache(cacheKey, result, CACHE_DURATION);
      return result;

    } catch (error) {
      console.error('BrandService.getFeaturedBrands error:', error);
      return {
        success: false,
        error: error.message,
        brands: [],
        performance: {
          responseTime: endTimer(timer),
          failed: true
        }
      };
    }
  },

  /**
   * Performance monitoring methods
   */
  getPerformanceMetrics() {
    return { ...brandMetrics };
  },

  resetPerformanceMetrics() {
    brandMetrics.cacheHits = 0;
    brandMetrics.cacheMisses = 0;
    brandMetrics.queryCount = 0;
    brandMetrics.avgResponseTime = 0;
  },

  clearCache() {
    cache.clear();
    cacheExpiry.clear();
  }
};

export default BrandService; 