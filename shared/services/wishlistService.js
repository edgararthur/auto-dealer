import supabase from '../supabase/supabaseClient.js';

/**
 * WishlistService - Complete wishlist management
 * Handles adding, removing, and managing user wishlists
 */
const WishlistService = {
  /**
   * Add item to wishlist
   * @param {string} productId - Product ID
   * @returns {Promise} - Operation result
   */
  addToWishlist: async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Check if already in wishlist
      const { data: existing, error: checkError } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      // If table doesn't exist, return graceful error
      if (checkError && checkError.code === 'PGRST200') {
        return { success: false, error: 'Wishlist feature not available. Please contact support.' };
      }

      if (existing) {
        return { success: false, error: 'Item already in wishlist' };
      }

      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId
        })
        .select('*')
        .single();

      if (error) throw error;

      return { success: true, wishlistItem: data };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return { success: false, error: 'Unable to add to wishlist at this time' };
    }
  },

  /**
   * Remove item from wishlist
   * @param {string} productId - Product ID
   * @returns {Promise} - Operation result
   */
  removeFromWishlist: async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get user's wishlist with product details
   * @param {Object} options - Query options
   * @returns {Promise} - Wishlist items
   */
  getWishlist: async (options = {}) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: true, wishlist: [] };
      }

      // Check if wishlists table exists first
      const { data: tableCheck, error: tableError } = await supabase
        .from('wishlists')
        .select('id')
        .limit(1);

      // If table doesn't exist, return empty wishlist
      if (tableError && tableError.code === 'PGRST200') {
        console.warn('Wishlists table not found. Please run the setup SQL script.');
        return { success: true, wishlist: [] };
      }

      let query = supabase
        .from('wishlists')
        .select(`
          id,
          created_at,
          product:products!product_id(
            id,
            name,
            description,
            price,
            cost_price,
            discount_price,
            stock_quantity,
            status,
            is_active,
            created_at,
            category:categories!category_id(id, name),
            brand:brands!brand_id(id, name),
            product_images!left(id, url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to include product details and image
      const transformedData = (data || []).map(item => {
        const product = item.product;
        const primaryImg = product?.product_images?.find(img => img.is_primary) || product?.product_images?.[0];
        
        return {
          id: item.id,
          created_at: item.created_at,
          product: {
            ...product,
            image: primaryImg?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
            inStock: product?.stock_quantity > 0,
            isDiscounted: product?.discount_price && product?.discount_price < product?.price,
            finalPrice: product?.discount_price || product?.price
          }
        };
      });

      return { success: true, wishlist: transformedData };
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      // Return empty wishlist instead of failing
      return { success: true, wishlist: [] };
    }
  },

  /**
   * Check if product is in user's wishlist
   * @param {string} productId - Product ID
   * @returns {Promise} - Boolean result
   */
  isInWishlist: async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: true, inWishlist: false };
      }

      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { success: true, inWishlist: !!data };
    } catch (error) {
      console.error('Error checking wishlist status:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get wishlist count for user
   * @returns {Promise} - Wishlist count
   */
  getWishlistCount: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: true, count: 0 };
      }

      const { count, error } = await supabase
        .from('wishlists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // If table doesn't exist, return 0 count
      if (error && error.code === 'PGRST200') {
        return { success: true, count: 0 };
      }

      if (error) throw error;

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error getting wishlist count:', error);
      return { success: true, count: 0 };
    }
  },

  /**
   * Clear entire wishlist
   * @returns {Promise} - Operation result
   */
  clearWishlist: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Move wishlist items to cart
   * @param {Array} productIds - Array of product IDs (optional, if empty moves all)
   * @returns {Promise} - Operation result
   */
  moveToCart: async (productIds = []) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get wishlist items to move
      let query = supabase
        .from('wishlists')
        .select(`
          product_id,
          product:products!product_id(id, price, dealer_id, stock_quantity)
        `)
        .eq('user_id', user.id);

      if (productIds.length > 0) {
        query = query.in('product_id', productIds);
      }

      const { data: wishlistItems, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      if (!wishlistItems || wishlistItems.length === 0) {
        return { success: false, error: 'No items to move' };
      }

      // Filter out out-of-stock items
      const availableItems = wishlistItems.filter(item => 
        item.product && item.product.stock_quantity > 0
      );

      if (availableItems.length === 0) {
        return { success: false, error: 'No items available for purchase' };
      }

      // Add to cart
      const cartItems = availableItems.map(item => ({
        user_id: user.id,
        product_id: item.product_id,
        dealer_id: item.product.dealer_id,
        quantity: 1,
        created_at: new Date().toISOString()
      }));

      const { error: cartError } = await supabase
        .from('cart_items')
        .insert(cartItems);

      if (cartError) throw cartError;

      // Remove from wishlist
      const productIdsToRemove = availableItems.map(item => item.product_id);
      const { error: removeError } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .in('product_id', productIdsToRemove);

      if (removeError) throw removeError;

      return { 
        success: true, 
        movedCount: availableItems.length,
        unavailableCount: wishlistItems.length - availableItems.length
      };
    } catch (error) {
      console.error('Error moving wishlist to cart:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get wishlist analytics for user
   * @returns {Promise} - Analytics data
   */
  getWishlistAnalytics: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { 
          success: true, 
          analytics: {
            totalItems: 0,
            totalValue: 0,
            categoriesCount: 0,
            availableItems: 0,
            oldestItem: null,
            newestItem: null
          }
        };
      }

      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          created_at,
          product:products!product_id(
            id,
            price,
            discount_price,
            stock_quantity,
            category_id
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        return { 
          success: true, 
          analytics: {
            totalItems: 0,
            totalValue: 0,
            categoriesCount: 0,
            availableItems: 0,
            oldestItem: null,
            newestItem: null
          }
        };
      }

      const analytics = {
        totalItems: data.length,
        totalValue: data.reduce((sum, item) => {
          const price = item.product?.discount_price || item.product?.price || 0;
          return sum + price;
        }, 0),
        categoriesCount: new Set(data.map(item => item.product?.category_id).filter(Boolean)).size,
        availableItems: data.filter(item => item.product?.stock_quantity > 0).length,
        oldestItem: data[data.length - 1]?.created_at,
        newestItem: data[0]?.created_at
      };

      return { success: true, analytics };
    } catch (error) {
      console.error('Error getting wishlist analytics:', error);
      return { success: false, error: error.message };
    }
  }
};

export default WishlistService; 