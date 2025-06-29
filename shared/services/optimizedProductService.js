import supabase from '../supabase/supabaseClient.js';

// Simple in-memory cache
const cache = new Map();
const cacheExpiry = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const isCacheValid = (key) => {
  const expiry = cacheExpiry.get(key);
  return expiry && Date.now() < expiry;
};

const setCache = (key, data) => {
  cache.set(key, data);
  cacheExpiry.set(key, Date.now() + CACHE_DURATION);
};

const getCache = (key) => {
  if (isCacheValid(key)) {
    return cache.get(key);
  }
  cache.delete(key);
  cacheExpiry.delete(key);
  return null;
};

const ProductService = {
  /**
   * OPTIMIZED: Get products with improved performance
   */
  getProducts: async (filters = {}) => {
    try {
      console.log('ProductService: getProducts called with filters:', filters);
      
      // Create cache key
      const cacheKey = `products_${JSON.stringify(filters)}`;
      const cached = getCache(cacheKey);
      if (cached) {
        console.log('ProductService: Serving from cache');
        return cached;
      }

      // OPTIMIZATION: Minimal select for better performance
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          discount_price,
          stock_quantity,
          created_at,
          dealer_id,
          category_id,
          brand_id,
          product_images!left(url, is_primary)
        `);

      // Count query
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Apply filters efficiently
      const applyFilters = (q) => {
        if (filters.category && filters.category !== 'all') {
          q = q.eq('category_id', filters.category);
        }
        if (filters.brand && filters.brand !== 'all') {
          q = q.eq('brand_id', filters.brand);
        }
        if (filters.dealer && filters.dealer !== 'all') {
          q = q.eq('dealer_id', filters.dealer);
        }
        if (filters.minPrice && filters.maxPrice) {
          q = q.gte('price', filters.minPrice).lte('price', filters.maxPrice);
        }
        if (filters.search) {
          q = q.or(`name.ilike.%${filters.search}%,part_number.ilike.%${filters.search}%`);
        }
        if (filters.inStock) {
          q = q.gt('stock_quantity', 0);
        }
        return q;
      };

      query = applyFilters(query);
      countQuery = applyFilters(countQuery);

      // Sorting
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'popularity':
          query = query.order('stock_quantity', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Pagination
      if (filters.page && filters.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit - 1;
        query = query.range(start, end);
      } else if (filters.limit) {
        query = query.limit(filters.limit);
      }

      // Execute in parallel
      const [{ data: products, error: productsError }, { count, error: countError }] = await Promise.all([
        query,
        countQuery
      ]);

      if (productsError || countError) {
        throw productsError || countError;
      }

      // Minimal transformation
      const transformedData = products.map(product => {
        const primaryImg = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
        
        return {
          id: product.id,
          name: product.name,
          price: product.discount_price || product.price,
          oldPrice: product.discount_price ? product.price : null,
          image: primaryImg?.url || null,
          inStock: product.stock_quantity > 0,
          stock_quantity: product.stock_quantity,
          isNew: new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          dealer: { id: product.dealer_id },
          brand: { id: product.brand_id },
          category: { id: product.category_id }
        };
      });

      const result = {
        success: true,
        products: transformedData,
        count: count || 0,
        hasMore: filters.limit ? transformedData.length === filters.limit : false
      };

      setCache(cacheKey, result);
      console.log('ProductService: Returning', transformedData.length, 'products, total:', count);
      return result;

    } catch (error) {
      console.error('Error in getProducts:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * OPTIMIZED: Get categories with caching
   */
  getCategories: async () => {
    try {
      const cached = getCache('categories');
      if (cached) return cached;

      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) throw error;

      const result = { success: true, categories: data || [] };
      setCache('categories', result);
      return result;

    } catch (error) {
      console.error('Error in getCategories:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * OPTIMIZED: Get brands with caching
   */
  getBrands: async () => {
    try {
      const cached = getCache('brands');
      if (cached) return cached;

      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .order('name');

      if (error) throw error;

      const result = { success: true, brands: data || [] };
      setCache('brands', result);
      return result;

    } catch (error) {
      console.error('Error in getBrands:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * OPTIMIZED: Get featured products
   */
  getFeaturedProducts: async (limit = 10) => {
    try {
      const cacheKey = `featured_${limit}`;
      const cached = getCache(cacheKey);
      if (cached) return cached;

      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          discount_price,
          stock_quantity,
          created_at,
          product_images!left(url, is_primary)
        `)
        .gte('stock_quantity', 1)
        .order('stock_quantity', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const transformedData = products.map(product => {
        const primaryImg = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
        
        return {
          id: product.id,
          name: product.name,
          price: product.discount_price || product.price,
          oldPrice: product.discount_price ? product.price : null,
          image: primaryImg?.url || null,
          inStock: product.stock_quantity > 0,
          stock_quantity: product.stock_quantity,
          isNew: new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        };
      });

      const result = {
        success: true,
        products: transformedData,
        count: transformedData.length
      };

      setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error in getFeaturedProducts:', error);
      return { success: false, error: error.message };
    }
  },

  // Simplified methods
  searchProducts: async (query, filters = {}) => {
    return await ProductService.getProducts({ ...filters, search: query });
  },

  getProductsByCategory: async (categoryId, filters = {}) => {
    return await ProductService.getProducts({ ...filters, category: categoryId });
  },

  getProductsByBrand: async (brandId, filters = {}) => {
    return await ProductService.getProducts({ ...filters, brand: brandId });
  },

  getNewArrivals: async (limit = 10) => {
    return await ProductService.getProducts({ limit, sortBy: 'newest' });
  },

  getBestSellers: async (limit = 10) => {
    return await ProductService.getProducts({ limit, sortBy: 'popularity' });
  },

  clearCache: () => {
    cache.clear();
    cacheExpiry.clear();
  }
};

export default ProductService; 