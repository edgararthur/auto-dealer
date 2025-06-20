import supabase from '../supabase/supabaseClient.js';

/**
 * AI-Powered Recommendation Service
 * Provides intelligent product recommendations based on:
 * - User browsing history
 * - Purchase history
 * - Similar user behavior
 * - Product relationships
 * - Current trends
 */
class RecommendationService {
  
  /**
   * Get personalized recommendations for a user
   */
  static async getPersonalizedRecommendations(userId, options = {}) {
    try {
      const {
        limit = 12,
        excludeProductIds = [],
        includeCategories = [],
        priceRange = null,
        type = 'mixed' // 'browsing', 'purchase', 'similar', 'trending', 'mixed'
      } = options;

      let recommendations = [];
      
      if (userId) {
        // Get user-specific recommendations
        const userRecommendations = await this.getUserBasedRecommendations(userId, {
          limit: Math.ceil(limit * 0.6),
          excludeProductIds,
          includeCategories,
          priceRange
        });
        recommendations = [...userRecommendations];
      }
      
      // Fill remaining slots with trending and collaborative filtering
      const remainingSlots = limit - recommendations.length;
      if (remainingSlots > 0) {
        const trendingRecommendations = await this.getTrendingRecommendations({
          limit: remainingSlots,
          excludeProductIds: [...excludeProductIds, ...recommendations.map(r => r.id)],
          includeCategories,
          priceRange
        });
        recommendations = [...recommendations, ...trendingRecommendations];
      }

      return {
        success: true,
        recommendations: recommendations.slice(0, limit),
        metadata: {
          algorithm: 'hybrid',
          personalization_score: userId ? 0.8 : 0.2,
          total_candidates: recommendations.length
        }
      };
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return {
        success: false,
        error: error.message,
        recommendations: []
      };
    }
  }

  /**
   * Get recommendations based on user behavior
   */
  static async getUserBasedRecommendations(userId, options = {}) {
    try {
      const { limit = 8, excludeProductIds = [] } = options;
      
      // Get user's browsing history
      const { data: browsingHistory } = await supabase
        .from('browsing_history')
        .select(`
          product_id,
          viewed_at,
          products:product_id (
            id, name, price, category_id, dealer_id,
            categories:category_id (id, name)
          )
        `)
        .eq('user_id', userId)
        .order('viewed_at', { ascending: false })
        .limit(20);

      // Get user's purchase history
      const { data: purchaseHistory } = await supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          orders:order_id (created_at, user_id),
          products:product_id (
            id, name, price, category_id, dealer_id,
            categories:category_id (id, name)
          )
        `)
        .eq('orders.user_id', userId)
        .order('orders.created_at', { ascending: false })
        .limit(10);

      // Get user's wishlist
      const { data: wishlistItems } = await supabase
        .from('wishlists')
        .select(`
          product_id,
          products:product_id (
            id, name, price, category_id, dealer_id,
            categories:category_id (id, name)
          )
        `)
        .eq('user_id', userId);

      // Analyze user preferences
      const userPreferences = this.analyzeUserPreferences({
        browsingHistory: browsingHistory || [],
        purchaseHistory: purchaseHistory || [],
        wishlistItems: wishlistItems || []
      });

      // Get recommendations based on preferences
      const recommendations = await this.getProductsByPreferences(userPreferences, {
        limit,
        excludeProductIds
      });

      return recommendations;
    } catch (error) {
      console.error('Error getting user-based recommendations:', error);
      return [];
    }
  }

  /**
   * Get "Customers who bought this also bought" recommendations
   */
  static async getRelatedProducts(productId, options = {}) {
    try {
      const { limit = 8 } = options;

      // Get products frequently bought together
      const { data: relatedOrders } = await supabase
        .from('order_items')
        .select(`
          order_id,
          product_id,
          products:product_id (
            id, name, price, image, dealer_id, stock_quantity,
            dealers:dealer_id (id, name, company_name)
          )
        `)
        .neq('product_id', productId);

      // Find orders that contain the target product
      const { data: targetProductOrders } = await supabase
        .from('order_items')
        .select('order_id')
        .eq('product_id', productId);

      const targetOrderIds = targetProductOrders?.map(o => o.order_id) || [];

      // Get products from those orders
      const relatedProducts = relatedOrders
        ?.filter(item => targetOrderIds.includes(item.order_id))
        .map(item => ({
          ...item.products,
          relation_strength: 1, // Could be calculated based on frequency
          relation_type: 'frequently_bought_together'
        }))
        .slice(0, limit) || [];

      return {
        success: true,
        products: relatedProducts,
        type: 'frequently_bought_together'
      };
    } catch (error) {
      console.error('Error getting related products:', error);
      return {
        success: false,
        error: error.message,
        products: []
      };
    }
  }

  /**
   * Get similar products by category and features
   */
  static async getSimilarProducts(productId, options = {}) {
    try {
      const { limit = 8 } = options;

      // Get the target product details
      const { data: targetProduct } = await supabase
        .from('products')
        .select(`
          id, name, price, category_id, brand_id,
          categories:category_id (id, name),
          brands:brand_id (id, name)
        `)
        .eq('id', productId)
        .single();

      if (!targetProduct) {
        throw new Error('Product not found');
      }

      // Get similar products from the same category
      const { data: similarProducts } = await supabase
        .from('products')
        .select(`
          id, name, price, image, stock_quantity, dealer_id,
          dealers:dealer_id (id, name, company_name),
          categories:category_id (id, name),
          brands:brand_id (id, name)
        `)
        .eq('category_id', targetProduct.category_id)
        .neq('id', productId)
        .eq('status', 'active')
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false })
        .limit(limit);

      const processedProducts = similarProducts?.map(product => ({
        ...product,
        similarity_score: this.calculateSimilarityScore(targetProduct, product),
        relation_type: 'similar_products'
      }))
      .sort((a, b) => b.similarity_score - a.similarity_score) || [];

      return {
        success: true,
        products: processedProducts,
        type: 'similar_products'
      };
    } catch (error) {
      console.error('Error getting similar products:', error);
      return {
        success: false,
        error: error.message,
        products: []
      };
    }
  }

  /**
   * Get trending products
   */
  static async getTrendingRecommendations(options = {}) {
    try {
      const { limit = 12, excludeProductIds = [] } = options;

      // Get trending products based on recent activity
      const { data: trendingProducts } = await supabase
        .from('products')
        .select(`
          id, name, price, image, stock_quantity, created_at, dealer_id,
          dealers:dealer_id (id, name, company_name),
          categories:category_id (id, name)
        `)
        .not('id', 'in', `(${excludeProductIds.join(',')})`)
        .eq('status', 'active')
        .gt('stock_quantity', 0)
        .order('created_at', { ascending: false })
        .limit(limit * 2); // Get more to filter later

      // Mock trending score calculation (in production, use real analytics)
      const processedProducts = trendingProducts?.map(product => ({
        ...product,
        trending_score: Math.random() * 100, // Replace with real trending algorithm
        relation_type: 'trending'
      }))
      .sort((a, b) => b.trending_score - a.trending_score)
      .slice(0, limit) || [];

      return processedProducts;
    } catch (error) {
      console.error('Error getting trending recommendations:', error);
      return [];
    }
  }

  /**
   * Get recommendations for cart items (upsell/cross-sell)
   */
  static async getCartRecommendations(cartItems, options = {}) {
    try {
      const { limit = 6 } = options;
      
      if (!cartItems || cartItems.length === 0) {
        return { success: true, products: [] };
      }

      const productIds = cartItems.map(item => item.product_id);
      const recommendations = [];

      // Get complementary products for each cart item
      for (const productId of productIds) {
        const related = await this.getRelatedProducts(productId, { limit: 3 });
        if (related.success) {
          recommendations.push(...related.products);
        }
      }

      // Remove duplicates and cart items
      const uniqueRecommendations = recommendations
        .filter((product, index, self) => 
          index === self.findIndex(p => p.id === product.id) &&
          !productIds.includes(product.id)
        )
        .slice(0, limit);

      return {
        success: true,
        products: uniqueRecommendations,
        type: 'cart_recommendations'
      };
    } catch (error) {
      console.error('Error getting cart recommendations:', error);
      return {
        success: false,
        error: error.message,
        products: []
      };
    }
  }

  /**
   * Analyze user preferences from behavior data
   */
  static analyzeUserPreferences(data) {
    const { browsingHistory, purchaseHistory, wishlistItems } = data;
    
    const preferences = {
      categories: {},
      priceRanges: {},
      brands: {},
      dealers: {}
    };

    // Analyze browsing history (weight: 1)
    browsingHistory.forEach(item => {
      const category = item.products?.categories?.name;
      const price = item.products?.price;
      
      if (category) {
        preferences.categories[category] = (preferences.categories[category] || 0) + 1;
      }
      if (price) {
        const range = this.getPriceRange(price);
        preferences.priceRanges[range] = (preferences.priceRanges[range] || 0) + 1;
      }
    });

    // Analyze purchase history (weight: 3)
    purchaseHistory.forEach(item => {
      const category = item.products?.categories?.name;
      const price = item.products?.price;
      const weight = 3;
      
      if (category) {
        preferences.categories[category] = (preferences.categories[category] || 0) + weight;
      }
      if (price) {
        const range = this.getPriceRange(price);
        preferences.priceRanges[range] = (preferences.priceRanges[range] || 0) + weight;
      }
    });

    // Analyze wishlist (weight: 2)
    wishlistItems.forEach(item => {
      const category = item.products?.categories?.name;
      const price = item.products?.price;
      const weight = 2;
      
      if (category) {
        preferences.categories[category] = (preferences.categories[category] || 0) + weight;
      }
      if (price) {
        const range = this.getPriceRange(price);
        preferences.priceRanges[range] = (preferences.priceRanges[range] || 0) + weight;
      }
    });

    return preferences;
  }

  /**
   * Get products based on user preferences
   */
  static async getProductsByPreferences(preferences, options = {}) {
    try {
      const { limit = 8, excludeProductIds = [] } = options;

      // Get top categories
      const topCategories = Object.entries(preferences.categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([category]) => category);

      if (topCategories.length === 0) {
        return [];
      }

      // Get products from preferred categories
      const { data: products } = await supabase
        .from('products')
        .select(`
          id, name, price, image, stock_quantity, dealer_id, category_id,
          dealers:dealer_id (id, name, company_name),
          categories:category_id (id, name)
        `)
        .in('categories.name', topCategories)
        .not('id', 'in', `(${excludeProductIds.join(',')})`)
        .eq('status', 'active')
        .gt('stock_quantity', 0)
        .limit(limit);

      return products || [];
    } catch (error) {
      console.error('Error getting products by preferences:', error);
      return [];
    }
  }

  /**
   * Calculate similarity score between products
   */
  static calculateSimilarityScore(product1, product2) {
    let score = 0;

    // Same category: +40 points
    if (product1.category_id === product2.category_id) {
      score += 40;
    }

    // Same brand: +30 points
    if (product1.brand_id === product2.brand_id) {
      score += 30;
    }

    // Similar price range: +20 points
    const priceDiff = Math.abs(product1.price - product2.price);
    const avgPrice = (product1.price + product2.price) / 2;
    const priceVariation = priceDiff / avgPrice;
    
    if (priceVariation < 0.2) score += 20;
    else if (priceVariation < 0.5) score += 10;

    // Random factor for diversity: +0-10 points
    score += Math.random() * 10;

    return score;
  }

  /**
   * Get price range category
   */
  static getPriceRange(price) {
    if (price < 50) return 'budget';
    if (price < 200) return 'mid';
    if (price < 500) return 'premium';
    return 'luxury';
  }
}

export default RecommendationService; 