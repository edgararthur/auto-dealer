import supabase from '../supabase/supabaseClient.js';

/**
 * Service for managing brands in the marketplace
 */
const BrandService = {
  /**
   * Get all brands with product counts
   * @param {Object} options - Optional filters
   * @returns {Promise} - Brands
   */
  getBrands: async (options = {}) => {
    try {
      let query = supabase
        .from('brands')
        .select(`
          id,
          name,
          description,
          website,
          created_at,
          updated_at,
          products!brand_id(count)
        `)
        .order('name');

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data: brands, error } = await query;

      if (error) {
        console.error('Error fetching brands:', error);
        throw error;
      }

      const transformedData = brands.map(brand => ({
        ...brand,
        product_count: brand.products?.[0]?.count || 0
      }));

      return { success: true, brands: transformedData };

    } catch (error) {
      console.error('Error in getBrands:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get a single brand by ID
   * @param {string} brandId - Brand ID
   * @returns {Promise} - Brand details
   */
  getBrandById: async (brandId) => {
    try {
      const { data: brand, error } = await supabase
        .from('brands')
        .select(`
          id,
          name,
          description,
          website,
          created_at,
          updated_at,
          products!brand_id(
            id,
            name,
            price,
            discount_price,
            stock_quantity,
            product_images!left(id, url, is_primary)
          )
        `)
        .eq('id', brandId)
        .single();

      if (error) {
        console.error('Error fetching brand by ID:', error);
        throw error;
      }

      if (!brand) {
        throw new Error('Brand not found');
      }

      // Transform products data
      const transformedProducts = brand.products?.map(product => {
        const primaryImg = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
        return {
          ...product,
          image: primaryImg?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
          inStock: product.stock_quantity > 0,
          price: product.discount_price || product.price,
          oldPrice: product.discount_price ? product.price : null
        };
      }) || [];

      const transformedData = {
        ...brand,
        products: transformedProducts,
        product_count: transformedProducts.length
      };

      return { success: true, brand: transformedData };

    } catch (error) {
      console.error('Error in getBrandById:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get products by brand with pagination
   * @param {string} brandId - Brand ID
   * @param {Object} options - Additional options
   * @returns {Promise} - Products for brand
   */
  getBrandProducts: async (brandId, options = {}) => {
    try {
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          discount_price,
          stock_quantity,
          created_at,
          dealer_id,
          category_id,
          product_images!left(id, url, is_primary),
          category:categories!category_id(id, name),
          dealer:profiles!dealer_id(id, full_name, company_name)
        `)
        .eq('brand_id', brandId)
        .eq('status', 'approved')
        .eq('is_active', true);

      // Apply sorting
      if (options.sortBy) {
        switch (options.sortBy) {
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

      // Apply pagination
      if (options.page && options.limit) {
        const start = (options.page - 1) * options.limit;
        const end = start + options.limit - 1;
        query = query.range(start, end);
      } else if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data: products, error } = await query;

      if (error) {
        console.error('Error fetching brand products:', error);
        throw error;
      }

      const transformedData = products.map(product => {
        const primaryImg = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
        
        return {
          ...product,
          image: primaryImg?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
          inStock: product.stock_quantity > 0,
          price: product.discount_price || product.price,
          oldPrice: product.discount_price ? product.price : null,
          dealer: {
            id: product.dealer_id,
            business_name: product.dealer?.company_name || product.dealer?.full_name || 'Unknown Dealer',
            name: product.dealer?.full_name || 'Unknown Dealer'
          }
        };
      });

      return { 
        success: true, 
        products: transformedData,
        hasMore: options.limit ? transformedData.length === options.limit : false
      };

    } catch (error) {
      console.error('Error in getBrandProducts:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get brand statistics
   * @param {string} brandId - Brand ID
   * @returns {Promise} - Brand statistics
   */
  getBrandStats: async (brandId) => {
    try {
      const { data: stats, error } = await supabase
        .from('products')
        .select('price, stock_quantity, created_at')
        .eq('brand_id', brandId)
        .eq('status', 'approved')
        .eq('is_active', true);

      if (error) {
        console.error('Error fetching brand stats:', error);
        throw error;
      }

      const totalProducts = stats.length;
      const inStockProducts = stats.filter(p => p.stock_quantity > 0).length;
      const avgPrice = totalProducts > 0 ? stats.reduce((sum, p) => sum + p.price, 0) / totalProducts : 0;
      const minPrice = totalProducts > 0 ? Math.min(...stats.map(p => p.price)) : 0;
      const maxPrice = totalProducts > 0 ? Math.max(...stats.map(p => p.price)) : 0;
      
      // Products added in last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentProducts = stats.filter(p => new Date(p.created_at) > thirtyDaysAgo).length;

      return {
        success: true,
        stats: {
          totalProducts,
          inStockProducts,
          outOfStockProducts: totalProducts - inStockProducts,
          avgPrice: Math.round(avgPrice * 100) / 100,
          minPrice,
          maxPrice,
          recentProducts,
          stockPercentage: totalProducts > 0 ? Math.round((inStockProducts / totalProducts) * 100) : 0
        }
      };

    } catch (error) {
      console.error('Error in getBrandStats:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Search brands by name
   * @param {string} searchTerm - Search term
   * @param {Object} options - Additional options
   * @returns {Promise} - Search results
   */
  searchBrands: async (searchTerm, options = {}) => {
    try {
      let query = supabase
        .from('brands')
        .select(`
          id,
          name,
          description,
          website,
          products!brand_id(count)
        `)
        .ilike('name', `%${searchTerm}%`)
        .order('name');

      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data: brands, error } = await query;

      if (error) {
        console.error('Error searching brands:', error);
        throw error;
      }

      const transformedData = brands.map(brand => ({
        ...brand,
        product_count: brand.products?.[0]?.count || 0
      }));

      return { success: true, brands: transformedData };

    } catch (error) {
      console.error('Error in searchBrands:', error);
      return { success: false, error: error.message };
    }
  }
};

export default BrandService; 