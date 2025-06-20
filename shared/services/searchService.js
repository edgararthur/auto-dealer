import supabase from "../supabase/supabaseClient.js";

class SearchService {
  static async searchProducts(query, filters = {}, options = {}) {
    try {
      const { page = 1, limit = 20, sort_by = "relevance" } = options;
      const offset = (page - 1) * limit;

      let searchQuery = supabase
        .from("products")
        .select(`
          *,
          product_images(url, is_primary),
          category:category_id(name),
          brand:brand_id(name),
          dealer:dealer_id(business_name, city, state)
        `)
        .eq("status", "active")
        .eq("is_active", true);

      if (query && query.trim()) {
        searchQuery = searchQuery.or(`
          name.ilike.%${query}%,
          description.ilike.%${query}%,
          tags.ilike.%${query}%
        `);
      }

      if (filters.category_id) {
        searchQuery = searchQuery.eq("category_id", filters.category_id);
      }

      if (filters.brand_id) {
        searchQuery = searchQuery.eq("brand_id", filters.brand_id);
      }

      if (filters.min_price) {
        searchQuery = searchQuery.gte("price", filters.min_price);
      }

      if (filters.max_price) {
        searchQuery = searchQuery.lte("price", filters.max_price);
      }

      searchQuery = searchQuery.range(offset, offset + limit - 1);

      const { data: products, error, count } = await searchQuery;

      if (error) throw error;

      const transformedProducts = products.map(product => {
        const primaryImage = product.product_images?.find(img => img.is_primary);
        return {
          ...product,
          image: primaryImage?.url || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80",
          dealer: product.dealer ? {
            name: product.dealer.business_name,
            location: `${product.dealer.city}, ${product.dealer.state}`
          } : null
        };
      });

      return {
        success: true,
        products: transformedProducts,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit)
        }
      };

    } catch (error) {
      console.error("SearchService.searchProducts error:", error);
      return {
        success: false,
        error: error.message,
        products: []
      };
    }
  }

  static async getSearchSuggestions(query, limit = 10) {
    try {
      if (!query || query.trim().length < 2) {
        return { success: true, suggestions: [] };
      }

      const { data: products, error } = await supabase
        .from("products")
        .select("name")
        .ilike("name", `%${query}%`)
        .eq("status", "active")
        .limit(limit);

      if (error) throw error;

      const suggestions = products.map(product => ({
        type: "product",
        text: product.name
      }));

      return {
        success: true,
        suggestions
      };

    } catch (error) {
      console.error("SearchService.getSearchSuggestions error:", error);
      return {
        success: false,
        error: error.message,
        suggestions: []
      };
    }
  }

  static async getPopularSearches(limit = 10) {
    try {
      const popularSearches = [
        { term: "brake pads", count: 1250 },
        { term: "engine oil", count: 980 },
        { term: "air filter", count: 875 },
        { term: "spark plugs", count: 720 },
        { term: "tires", count: 650 }
      ].slice(0, limit);

      return {
        success: true,
        popularSearches
      };

    } catch (error) {
      console.error("SearchService.getPopularSearches error:", error);
      return {
        success: false,
        error: error.message,
        popularSearches: []
      };
    }
  }
}

export default SearchService;
