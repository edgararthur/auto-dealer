import supabase from '../supabase/supabaseClient.js';

/**
 * BrowsingHistoryService - Track and manage user browsing behavior
 * Provides insights and recommendations based on user viewing patterns
 */
const BrowsingHistoryService = {
  /**
   * Track product view
   * @param {string} productId - Product ID
   * @param {Object} metadata - Additional tracking data
   * @returns {Promise} - Operation result
   */
  trackProductView: async (productId, metadata = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // For anonymous users, store in localStorage
        const history = JSON.parse(localStorage.getItem('browsing_history') || '[]');
        const newEntry = {
          product_id: productId,
          viewed_at: new Date().toISOString(),
          session_id: metadata.sessionId || generateSessionId(),
          referrer: metadata.referrer || document.referrer
        };
        
        // Keep only last 50 items for anonymous users
        const updatedHistory = [newEntry, ...history.slice(0, 49)];
        localStorage.setItem('browsing_history', JSON.stringify(updatedHistory));
        
        return { success: true };
      }

      // For authenticated users, store in database
      const { data, error } = await supabase
        .from('browsing_history')
        .insert({
          user_id: user.id,
          product_id: productId,
          session_id: metadata.sessionId || generateSessionId(),
          referrer: metadata.referrer || document.referrer
        })
        .select('*')
        .single();

      if (error) {
        // Log error but don't fail - browsing history is not critical
        if (process.env.NODE_ENV === 'development') {
          console.warn('Browsing history tracking failed:', error);
        }
        return { success: true }; // Fail silently
      }

      return { success: true, entry: data };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error tracking product view:', error);
      }
      return { success: true }; // Fail silently for user experience
    }
  },

  /**
   * Get user's browsing history with product details
   * @param {Object} options - Query options
   * @returns {Promise} - Browsing history
   */
  getBrowsingHistory: async (options = {}) => {
    try {
      const { limit = 50, offset = 0 } = options;
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Return localStorage data for anonymous users
        const history = JSON.parse(localStorage.getItem('browsing_history') || '[]');
        return { 
          success: true, 
          history: history.slice(offset, offset + limit),
          hasMore: history.length > offset + limit
        };
      }

      const { data, error } = await supabase
        .from('browsing_history')
        .select(`
          id,
          viewed_at,
          product:products!product_id(
            id,
            name,
            description,
            price,
            discount_price,
            stock_quantity,
            status,
            is_active,
            category:categories!category_id(id, name),
            brand:brands!brand_id(id, name),
            product_images!left(id, url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Transform data and filter out deleted/inactive products
      const transformedData = data
        .filter(item => item.product && item.product.status === 'approved' && item.product.is_active)
        .map(item => {
          const product = item.product;
          const primaryImg = product?.product_images?.find(img => img.is_primary) || product?.product_images?.[0];
          
          return {
            id: item.id,
            viewed_at: item.viewed_at,
            product: {
              ...product,
              image: primaryImg?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
              inStock: product?.stock_quantity > 0,
              isDiscounted: product?.discount_price && product?.discount_price < product?.price,
              finalPrice: product?.discount_price || product?.price
            }
          };
        });

      return { 
        success: true, 
        history: transformedData,
        hasMore: data.length === limit
      };
    } catch (error) {
      console.error('Error fetching browsing history:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get recently viewed products (unique products only)
   * @param {number} limit - Number of products to return
   * @returns {Promise} - Recent products
   */
  getRecentlyViewed: async (limit = 10) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Handle anonymous users
        const history = JSON.parse(localStorage.getItem('browsing_history') || '[]');
        const uniqueProducts = [];
        const seenProductIds = new Set();
        
        for (const item of history) {
          if (!seenProductIds.has(item.product_id) && uniqueProducts.length < limit) {
            seenProductIds.add(item.product_id);
            uniqueProducts.push(item);
          }
        }
        
        return { success: true, products: uniqueProducts };
      }

      // For authenticated users, get unique products from recent history
      const { data, error } = await supabase
        .from('browsing_history')
        .select(`
          product_id,
          viewed_at,
          product:products!product_id(
            id,
            name,
            price,
            discount_price,
            stock_quantity,
            status,
            is_active,
            product_images!left(id, url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(limit * 3); // Get more to filter out duplicates

      if (error) throw error;

      // Remove duplicates and filter valid products
      const uniqueProducts = [];
      const seenProductIds = new Set();
      
      for (const item of data) {
        if (!seenProductIds.has(item.product_id) && 
            item.product && 
            item.product.status === 'approved' && 
            item.product.is_active &&
            uniqueProducts.length < limit) {
          
          seenProductIds.add(item.product_id);
          const primaryImg = item.product?.product_images?.find(img => img.is_primary) || item.product?.product_images?.[0];
          
          uniqueProducts.push({
            product_id: item.product_id,
            viewed_at: item.viewed_at,
            product: {
              ...item.product,
              image: primaryImg?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
              inStock: item.product?.stock_quantity > 0,
              finalPrice: item.product?.discount_price || item.product?.price
            }
          });
        }
      }

      return { success: true, products: uniqueProducts };
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get browsing patterns and recommendations
   * @returns {Promise} - User patterns and recommendations
   */
  getBrowsingPatterns: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: true, patterns: {}, recommendations: [] };
      }

      // Get browsing data with categories
      const { data, error } = await supabase
        .from('browsing_history')
        .select(`
          viewed_at,
          product:products!product_id(
            id,
            category_id,
            price,
            brand_id,
            category:categories!category_id(id, name)
          )
        `)
        .eq('user_id', user.id)
        .gte('viewed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('viewed_at', { ascending: false });

      if (error) throw error;

      // Analyze patterns
      const categoryViews = {};
      const brandViews = {};
      const priceRanges = { low: 0, medium: 0, high: 0 };
      const timePatterns = { morning: 0, afternoon: 0, evening: 0, night: 0 };

      data.forEach(item => {
        if (!item.product) return;

        // Category analysis
        const categoryId = item.product.category_id;
        if (categoryId) {
          categoryViews[categoryId] = (categoryViews[categoryId] || 0) + 1;
        }

        // Brand analysis
        const brandId = item.product.brand_id;
        if (brandId) {
          brandViews[brandId] = (brandViews[brandId] || 0) + 1;
        }

        // Price range analysis
        const price = item.product.price || 0;
        if (price < 50) priceRanges.low++;
        else if (price < 200) priceRanges.medium++;
        else priceRanges.high++;

        // Time pattern analysis
        const hour = new Date(item.viewed_at).getHours();
        if (hour < 6) timePatterns.night++;
        else if (hour < 12) timePatterns.morning++;
        else if (hour < 18) timePatterns.afternoon++;
        else timePatterns.evening++;
      });

      const patterns = {
        favoriteCategories: Object.entries(categoryViews)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        favoriteBrands: Object.entries(brandViews)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5),
        pricePreferences: priceRanges,
        browsingTimes: timePatterns,
        totalViews: data.length,
        uniqueProducts: new Set(data.map(item => item.product?.id).filter(Boolean)).size
      };

      return { success: true, patterns };
    } catch (error) {
      console.error('Error analyzing browsing patterns:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Clear browsing history
   * @param {number} olderThanDays - Clear items older than N days (optional)
   * @returns {Promise} - Operation result
   */
  clearHistory: async (olderThanDays = null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        localStorage.removeItem('browsing_history');
        return { success: true };
      }

      let query = supabase
        .from('browsing_history')
        .delete()
        .eq('user_id', user.id);

      if (olderThanDays) {
        const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString();
        query = query.lt('viewed_at', cutoffDate);
      }

      const { error } = await query;

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error clearing browsing history:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get browsing statistics
   * @returns {Promise} - Statistics
   */
  getStatistics: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const history = JSON.parse(localStorage.getItem('browsing_history') || '[]');
        return { 
          success: true, 
          stats: {
            totalViews: history.length,
            uniqueProducts: new Set(history.map(item => item.product_id)).size,
            lastActivity: history[0]?.viewed_at || null
          }
        };
      }

      const [totalResult, recentResult] = await Promise.all([
        supabase
          .from('browsing_history')
          .select('product_id', { count: 'exact' })
          .eq('user_id', user.id),
        supabase
          .from('browsing_history')
          .select('viewed_at')
          .eq('user_id', user.id)
          .order('viewed_at', { ascending: false })
          .limit(1)
      ]);

      const stats = {
        totalViews: totalResult.count || 0,
        uniqueProducts: new Set(totalResult.data?.map(item => item.product_id) || []).size,
        lastActivity: recentResult.data?.[0]?.viewed_at || null
      };

      return { success: true, stats };
    } catch (error) {
      console.error('Error getting browsing statistics:', error);
      return { success: false, error: error.message };
    }
  }
};

// Helper function to generate session ID
function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export default BrowsingHistoryService; 