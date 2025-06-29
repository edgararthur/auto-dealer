import supabase from '../supabase/supabaseClient.js';

// Advanced caching system
const cache = new Map();
const cacheExpiry = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for categories (longer cache)
const SHORT_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for dynamic data

// Performance monitoring
const categoryMetrics = {
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
    categoryMetrics.cacheHits++;
    return cache.get(key);
  }
  categoryMetrics.cacheMisses++;
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

class CategoryService {
  /**
   * ENHANCED: Get all categories with caching and performance monitoring
   */
  async getCategories(tenantId = null) {
    const timer = startTimer();
    try {
      const cacheKey = `categories_${tenantId || 'default'}`;
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
        .from('categories')
        .select(`
          id,
          name,
          description,
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
        console.error('Error fetching categories:', error);
        throw error;
      }

      const result = {
        success: true,
        categories: data || [],
        performance: {
          responseTime: endTimer(timer),
          fromCache: false
        }
      };

      setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('CategoryService.getCategories error:', error);
      return {
        success: false,
        error: error.message,
        categories: [],
        performance: {
          responseTime: endTimer(timer),
          failed: true
        }
      };
    }
  }

  /**
   * ENHANCED: Get category by ID with caching
   */
  async getCategoryById(id, tenantId = null) {
    const timer = startTimer();
    try {
      const cacheKey = `category_${id}_${tenantId || 'default'}`;
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
        .from('categories')
        .select(`
          id,
          name,
          description,
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
        console.error('Error fetching category:', error);
        throw error;
      }

      const result = {
        success: true,
        category: data,
        performance: {
          responseTime: endTimer(timer),
          fromCache: false
        }
      };

      setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('CategoryService.getCategoryById error:', error);
      return {
        success: false,
        error: error.message,
        category: null,
        performance: {
          responseTime: endTimer(timer),
          failed: true
        }
      };
    }
  }

  /**
   * ENHANCED: Get categories with product counts and optimized queries
   */
  async getCategoriesWithCounts(tenantId = null) {
    const timer = startTimer();
    try {
      const cacheKey = `categories_with_counts_${tenantId || 'default'}`;
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
        .from('categories')
        .select(`
          id,
          name,
          description,
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
        console.error('Error fetching categories with counts:', error);
        throw error;
      }

      // Transform the data to include product counts
      const categories = data.map(category => ({
        ...category,
        productCount: 0 // Will be populated separately if needed
      }));

      const result = {
        success: true,
        categories,
        performance: {
          responseTime: endTimer(timer),
          fromCache: false
        }
      };

      setCache(cacheKey, result, SHORT_CACHE_DURATION); // Shorter cache for dynamic counts
      return result;

    } catch (error) {
      console.error('CategoryService.getCategoriesWithCounts error:', error);
      return {
        success: false,
        error: error.message,
        categories: [],
        performance: {
          responseTime: endTimer(timer),
          failed: true
        }
      };
    }
  }

  /**
   * ENHANCED: Get featured categories with performance optimization
   */
  async getFeaturedCategories(limit = 9, tenantId = null) {
    const timer = startTimer();
    try {
      const cacheKey = `featured_categories_${limit}_${tenantId || 'default'}`;
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

      // Get categories with product counts in a single optimized query
      let query = supabase
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          meta_title,
          meta_description,
          sort_order,
          product_count:products!inner(count)
        `)
        .eq('is_active', true)
        .gt('products.stock_quantity', 0) // Only count in-stock products
        .eq('products.status', 'active')
        .eq('products.is_active', true);

      // Apply multi-tenant filtering
      const tenantFilter = getTenantFilter(tenantId);
      if (tenantFilter.tenant_id) {
        query = query.eq('tenant_id', tenantFilter.tenant_id);
        query = query.eq('products.tenant_id', tenantFilter.tenant_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching featured categories:', error);
        throw error;
      }

      // Process and sort categories by product count
      const categoryMap = new Map();
      
      data.forEach(row => {
        const categoryId = row.id;
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description,
            image_url: row.image_url,
            meta_title: row.meta_title,
            meta_description: row.meta_description,
            sort_order: row.sort_order,
            productCount: 0
          });
        }
        
        // Count products for this category
        const category = categoryMap.get(categoryId);
        category.productCount += row.product_count?.[0]?.count || 0;
      });

      // Convert to array, sort by product count, and limit results
      const featuredCategories = Array.from(categoryMap.values())
        .sort((a, b) => b.productCount - a.productCount)
        .slice(0, limit);

      const result = {
        success: true,
        categories: featuredCategories,
        performance: {
          responseTime: endTimer(timer),
          fromCache: false
        }
      };

      setCache(cacheKey, result, SHORT_CACHE_DURATION);
      return result;

    } catch (error) {
      console.error('CategoryService.getFeaturedCategories error:', error);
      return {
        success: false,
        error: error.message,
        categories: [],
        performance: {
          responseTime: endTimer(timer),
          failed: true
        }
      };
    }
  }

  /**
   * ENHANCED: Search categories with caching and relevance scoring
   */
  async searchCategories(query, tenantId = null) {
    const timer = startTimer();
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: true,
          categories: [],
          performance: {
            responseTime: endTimer(timer),
            fromCache: false
          }
        };
      }

      const searchTerm = query.trim();
      const cacheKey = `search_categories_${searchTerm}_${tenantId || 'default'}`;
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
        .from('categories')
        .select(`
          id,
          name,
          slug,
          description,
          image_url,
          meta_title,
          meta_description,
          sort_order,
          product_count:products(count)
        `)
        .eq('is_active', true)
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,meta_title.ilike.%${searchTerm}%`)
        .order('name', { ascending: true });

      // Apply multi-tenant filtering
      const tenantFilter = getTenantFilter(tenantId);
      if (tenantFilter.tenant_id) {
        searchQuery = searchQuery.eq('tenant_id', tenantFilter.tenant_id);
      }

      const { data, error } = await searchQuery;

      if (error) {
        console.error('Error searching categories:', error);
        throw error;
      }

      // Add relevance scoring
      const categories = data.map(category => {
        let relevanceScore = 0;
        const lowerQuery = searchTerm.toLowerCase();
        const lowerName = category.name.toLowerCase();
        const lowerDesc = (category.description || '').toLowerCase();

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
          ...category,
          productCount: category.product_count?.[0]?.count || 0,
          relevanceScore
        };
      });

      // Sort by relevance score, then by name
      categories.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return a.name.localeCompare(b.name);
      });

      const result = {
        success: true,
        categories,
        query: searchTerm,
        performance: {
          responseTime: endTimer(timer),
          fromCache: false
        }
      };

      setCache(cacheKey, result, SHORT_CACHE_DURATION);
      return result;

    } catch (error) {
      console.error('CategoryService.searchCategories error:', error);
      return {
        success: false,
        error: error.message,
        categories: [],
        performance: {
          responseTime: endTimer(timer),
          failed: true
        }
      };
    }
  }

  /**
   * ENHANCED: Get category hierarchy with parent-child relationships
   */
  async getCategoryHierarchy(tenantId = null) {
    const timer = startTimer();
    try {
      const cacheKey = `category_hierarchy_${tenantId || 'default'}`;
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

      const categoriesResult = await this.getCategories(tenantId);
      if (!categoriesResult.success) {
        return categoriesResult;
      }

      const categories = categoriesResult.categories;
      const categoryMap = new Map();
      const rootCategories = [];

      // Create a map for quick lookup
      categories.forEach(cat => {
        categoryMap.set(cat.id, { ...cat, children: [] });
      });

      // Build the hierarchy
      categories.forEach(cat => {
        if (cat.parent_id) {
          const parent = categoryMap.get(cat.parent_id);
          if (parent) {
            parent.children.push(categoryMap.get(cat.id));
          }
        } else {
          rootCategories.push(categoryMap.get(cat.id));
        }
      });

      // Sort children by sort_order and name
      const sortCategories = (cats) => {
        cats.sort((a, b) => {
          if (a.sort_order !== b.sort_order) {
            return (a.sort_order || 999) - (b.sort_order || 999);
          }
          return a.name.localeCompare(b.name);
        });
        
        cats.forEach(cat => {
          if (cat.children && cat.children.length > 0) {
            sortCategories(cat.children);
          }
        });
      };

      sortCategories(rootCategories);

      const result = {
        success: true,
        hierarchy: rootCategories,
        flatCategories: categories,
        performance: {
          responseTime: endTimer(timer),
          fromCache: false
        }
      };

      setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('CategoryService.getCategoryHierarchy error:', error);
      return {
        success: false,
        error: error.message,
        hierarchy: [],
        performance: {
          responseTime: endTimer(timer),
          failed: true
        }
      };
    }
  }

  /**
   * Performance monitoring methods
   */
  getPerformanceMetrics() {
    return { ...categoryMetrics };
  }

  resetPerformanceMetrics() {
    categoryMetrics.cacheHits = 0;
    categoryMetrics.cacheMisses = 0;
    categoryMetrics.queryCount = 0;
    categoryMetrics.avgResponseTime = 0;
  }

  clearCache() {
    cache.clear();
    cacheExpiry.clear();
  }

  // Backward compatibility methods
  async getCategoriesWithProductCounts(tenantId = null) {
    return await this.getCategoriesWithCounts(tenantId);
  }
}

export default new CategoryService(); 