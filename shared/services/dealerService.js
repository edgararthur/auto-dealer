import supabase from '../supabase/supabaseClient.js';
import { logError } from '../utils/errorLogger';
import CacheUtils, { CACHE_CONFIG } from '../../src/utils/cacheUtils.js';

/**
 * DealerService - Multi-tenant dealer management for buyers
 * Handles dealer discovery, profiles, reviews, and location-based search
 */
const DealerService = {
  /**
   * Get all active dealers with optional filters
   * @param {Object} filters - Filter options
   * @returns {Promise} - List of dealers
   */
  getDealers: async (filters = {}) => {
    try {
      // Check cache first
      const cachedData = CacheUtils.getCachedAPIResponse('dealers', filters);
      if (cachedData) {
        console.log('DealerService: Serving dealers from cache');
        return cachedData;
      }

      let query = supabase
        .from('dealers')
        .select(`
          id,
          business_name,
          company_name,
          description,
          phone,
          email,
          address,
          city,
          state,
          country,
          postal_code,
          latitude,
          longitude,
          business_hours,
          website_url,
          logo_url,
          banner_url,
          verification,
          verification_status,
          rating,
          total_reviews,
          total_sales,
          created_at,
          is_active,
          specialties,
          business_type,
          profiles:user_id(full_name, avatar_url)
        `)
        .eq('is_active', true)
        .eq('verification', 'approved');

      // Apply filters
      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters.state) {
        query = query.ilike('state', `%${filters.state}%`);
      }

      if (filters.country) {
        query = query.eq('country', filters.country);
      }

      if (filters.specialty) {
        query = query.contains('specialties', [filters.specialty]);
      }

      if (filters.businessType) {
        query = query.eq('business_type', filters.businessType);
      }

      if (filters.minRating) {
        query = query.gte('rating', filters.minRating);
      }

      // Location-based search (if coordinates provided)
      if (filters.latitude && filters.longitude && filters.radius) {
        // Use PostGIS extension for distance calculation
        query = query.rpc('dealers_within_radius', {
          lat: filters.latitude,
          lng: filters.longitude,
          radius_km: filters.radius
        });
      }

      // Sorting
      if (filters.sortBy) {
        switch (filters.sortBy) {
          case 'rating':
            query = query.order('rating', { ascending: false });
            break;
          case 'reviews':
            query = query.order('total_reviews', { ascending: false });
            break;
          case 'sales':
            query = query.order('total_sales', { ascending: false });
            break;
          case 'distance':
            // Distance sorting handled by RPC function
            break;
          case 'name':
            query = query.order('business_name', { ascending: true });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
      } else {
        query = query.order('rating', { ascending: false });
      }

      // Pagination
      if (filters.page && filters.limit) {
        const start = (filters.page - 1) * filters.limit;
        const end = start + filters.limit - 1;
        query = query.range(start, end);
      } else if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data: dealers, error, count } = await query;

      if (error) {
        console.error('Error fetching dealers:', error);
        throw error;
      }

      // Transform data
      const transformedDealers = dealers.map(dealer => ({
        ...dealer,
        displayName: dealer.business_name || dealer.company_name || 'Unknown Business',
        fullAddress: [dealer.address, dealer.city, dealer.state, dealer.postal_code]
          .filter(Boolean)
          .join(', '),
        isVerified: dealer.verification === 'approved',
        hasLocation: Boolean(dealer.latitude && dealer.longitude),
        ownerName: dealer.profiles?.full_name || 'Unknown Owner',
        ownerAvatar: dealer.profiles?.avatar_url || null,
        businessHours: dealer.business_hours || {},
        specialties: dealer.specialties || [],
        contactInfo: {
          phone: dealer.phone,
          email: dealer.email,
          website: dealer.website_url
        }
      }));

      const result = {
        success: true,
        dealers: transformedDealers,
        count: count || transformedDealers.length,
        hasMore: filters.limit ? transformedDealers.length === filters.limit : false
      };

      // Cache the result
      CacheUtils.cacheAPIResponse('dealers', filters, result, CACHE_CONFIG.DEALERS);

      return result;

    } catch (error) {
      console.error('Error in getDealers:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get a single dealer by ID with detailed information
   * @param {string} dealerId - Dealer ID
   * @returns {Promise} - Dealer details
   */
  getDealerById: async (dealerId) => {
    try {
      const cacheKey = `dealer_${dealerId}`;
      const cachedDealer = CacheUtils.get(cacheKey);
      if (cachedDealer) {
        console.log('DealerService: Serving dealer detail from cache');
        return cachedDealer;
      }
      
      const { data: dealer, error } = await supabase
        .from('dealers')
        .select(`
          *,
          profiles:user_id(full_name, avatar_url, email),
          dealer_reviews(
            id,
            rating,
            review_text,
            created_at,
            profiles:customer_id(full_name, avatar_url)
          )
        `)
        .eq('id', dealerId)
        .eq('is_active', true)
        .single();
        
      if (error) {
        console.error('Error fetching dealer:', error);
        throw error;
      }
      
      if (!dealer) {
        return { success: false, error: 'Dealer not found' };
      }

      // Calculate average rating from reviews
      const reviews = dealer.dealer_reviews || [];
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      const transformedDealer = {
          ...dealer,
        displayName: dealer.business_name || dealer.company_name || 'Unknown Business',
        fullAddress: [dealer.address, dealer.city, dealer.state, dealer.postal_code]
          .filter(Boolean)
          .join(', '),
        isVerified: dealer.verification === 'approved',
        hasLocation: Boolean(dealer.latitude && dealer.longitude),
        ownerName: dealer.profiles?.full_name || 'Unknown Owner',
        ownerAvatar: dealer.profiles?.avatar_url || null,
        ownerEmail: dealer.profiles?.email || dealer.email,
        businessHours: dealer.business_hours || {},
        specialties: dealer.specialties || [],
        contactInfo: {
          phone: dealer.phone,
          email: dealer.email,
          website: dealer.website_url
        },
        reviews: reviews.map(review => ({
          ...review,
          customerName: review.profiles?.full_name || 'Anonymous',
          customerAvatar: review.profiles?.avatar_url || null
        })),
        calculatedRating: avgRating,
        totalReviews: reviews.length
      };

      const result = { success: true, dealer: transformedDealer };
      
      // Cache the result
      CacheUtils.set(cacheKey, result, CACHE_CONFIG.DEALER_DETAILS);

      return result;

    } catch (error) {
      console.error('Error in getDealerById:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get products from a specific dealer
   * @param {string} dealerId - Dealer ID
   * @param {Object} filters - Filter options
   * @returns {Promise} - Dealer's products
   */
  getDealerProducts: async (dealerId, filters = {}) => {
    try {
      const cacheKey = `dealer_products_${dealerId}`;
      const cachedData = CacheUtils.getCachedAPIResponse(cacheKey, filters);
      if (cachedData) {
        console.log('DealerService: Serving dealer products from cache');
        return cachedData;
      }

      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          short_description,
          sku,
          price,
          discount_price,
          stock_quantity,
          condition,
          status,
          created_at,
          category_id,
          brand_id,
          product_images!left(id, url, is_primary),
          category:categories!category_id(id, name, description),
          brand:brands!brand_id(id, name, description)
        `)
        .eq('dealer_id', dealerId)
        .eq('status', 'approved')
        .eq('is_active', true);
      
      // Apply filters
      if (filters.category) {
        query = query.eq('category_id', filters.category);
      }

      if (filters.brand) {
        query = query.eq('brand_id', filters.brand);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.minPrice && filters.maxPrice) {
        query = query.gte('price', filters.minPrice).lte('price', filters.maxPrice);
      }

      if (filters.inStock) {
        query = query.gt('stock_quantity', 0);
      }

      if (filters.condition) {
        query = query.eq('condition', filters.condition);
      }

      // Sorting
      if (filters.sortBy) {
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
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
      } else {
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

      const { data: products, error, count } = await query;

      if (error) {
        console.error('Error fetching dealer products:', error);
        throw error;
      }

      // Transform products
      const transformedProducts = products.map(product => {
        const primaryImg = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
        
        return {
          ...product,
          image: primaryImg?.url || null,
          product_images: product.product_images || [],
          inStock: product.stock_quantity > 0,
          isNew: new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          oldPrice: product.discount_price ? product.price : null,
          price: product.discount_price || product.price,
          category: product.category || { id: product.category_id, name: 'Unknown Category' },
          brand: product.brand || { id: product.brand_id, name: 'Unknown Brand' },
          dealerId: dealerId
        };
      });
      
      const result = {
        success: true,
        products: transformedProducts,
        count: count || transformedProducts.length,
        hasMore: filters.limit ? transformedProducts.length === filters.limit : false
      };

      // Cache the result
      CacheUtils.cacheAPIResponse(cacheKey, filters, result, CACHE_CONFIG.PRODUCTS);

      return result;

    } catch (error) {
      console.error('Error in getDealerProducts:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Search dealers by location
   * @param {Object} location - Location parameters
   * @returns {Promise} - Nearby dealers
   */
  searchDealersByLocation: async (location) => {
    try {
      const { latitude, longitude, radius = 50 } = location;

      if (!latitude || !longitude) {
        return { success: false, error: 'Location coordinates required' };
      }

      return await DealerService.getDealers({
        latitude,
        longitude,
        radius,
        sortBy: 'distance',
        limit: 20
      });

    } catch (error) {
      console.error('Error in searchDealersByLocation:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get featured/top-rated dealers
   * @param {number} limit - Number of dealers to return
   * @returns {Promise} - Featured dealers
   */
  getFeaturedDealers: async (limit = 12) => {
    try {
      return await DealerService.getDealers({
        minRating: 4.0,
        sortBy: 'rating',
        limit
      });

    } catch (error) {
      console.error('Error in getFeaturedDealers:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Add a review for a dealer
   * @param {string} dealerId - Dealer ID
   * @param {Object} reviewData - Review information
   * @returns {Promise} - Review result
   */
  addDealerReview: async (dealerId, reviewData) => {
    try {
      const { rating, review_text, customer_id } = reviewData;

      const { data, error } = await supabase
        .from('dealer_reviews')
        .insert({
          dealer_id: dealerId,
          customer_id,
          rating,
          review_text,
          created_at: new Date()
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding dealer review:', error);
        throw error;
      }

      // Update dealer's average rating
      await DealerService.updateDealerRating(dealerId);

      return { success: true, review: data };

    } catch (error) {
      console.error('Error in addDealerReview:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update dealer's average rating (internal function)
   * @param {string} dealerId - Dealer ID
   */
  updateDealerRating: async (dealerId) => {
    try {
      // Calculate new average rating
      const { data: reviews, error } = await supabase
        .from('dealer_reviews')
        .select('rating')
        .eq('dealer_id', dealerId);
        
      if (error || !reviews.length) return;

      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      const totalReviews = reviews.length;

      // Update dealer record
      await supabase
        .from('dealers')
        .update({
          rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal place
          total_reviews: totalReviews,
          updated_at: new Date()
        })
        .eq('id', dealerId);
        
      // Clear cache
      CacheUtils.delete(`dealer_${dealerId}`);

    } catch (error) {
      console.error('Error updating dealer rating:', error);
    }
  },

  /**
   * Get dealer statistics
   * @param {string} dealerId - Dealer ID
   * @returns {Promise} - Dealer statistics
   */
  getDealerStats: async (dealerId) => {
    try {
      const [productsResult, ordersResult, reviewsResult] = await Promise.all([
        supabase
          .from('products')
          .select('id', { count: 'exact' })
          .eq('dealer_id', dealerId)
          .eq('status', 'approved'),
        supabase
          .from('orders')
          .select('id', { count: 'exact' })
          .eq('dealer_id', dealerId)
          .eq('status', 'completed'),
        supabase
          .from('dealer_reviews')
          .select('rating')
          .eq('dealer_id', dealerId)
      ]);

      const totalProducts = productsResult.count || 0;
      const totalOrders = ordersResult.count || 0;
      const reviews = reviewsResult.data || [];
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0;

      return {
        success: true,
        stats: {
          totalProducts,
          totalOrders,
          totalReviews: reviews.length,
          averageRating: Math.round(avgRating * 10) / 10
        }
      };

    } catch (error) {
      console.error('Error in getDealerStats:', error);
      return { success: false, error: error.message };
    }
  }
};

export default DealerService; 