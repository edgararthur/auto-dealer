import supabase from "../supabase/supabaseClient.js";

// Advanced caching for search results
const searchCache = new Map();
const searchCacheExpiry = new Map();
const SEARCH_CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const SUGGESTION_CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Performance tracking
const searchMetrics = {
  totalSearches: 0,
  cacheHits: 0,
  avgResponseTime: 0,
  popularQueries: new Map()
};

const isSearchCacheValid = (key) => {
  const expiry = searchCacheExpiry.get(key);
  return expiry && Date.now() < expiry;
};

const setSearchCache = (key, data, duration = SEARCH_CACHE_DURATION) => {
  searchCache.set(key, data);
  searchCacheExpiry.set(key, Date.now() + duration);
};

const getSearchCache = (key) => {
  if (isSearchCacheValid(key)) {
    searchMetrics.cacheHits++;
    return searchCache.get(key);
  }
  searchCache.delete(key);
  searchCacheExpiry.delete(key);
  return null;
};

// Track popular searches
const trackSearch = (query) => {
  if (query && query.trim().length > 2) {
    const normalizedQuery = query.toLowerCase().trim();
    searchMetrics.popularQueries.set(
      normalizedQuery, 
      (searchMetrics.popularQueries.get(normalizedQuery) || 0) + 1
    );
    searchMetrics.totalSearches++;
  }
};

class SearchService {
  /**
   * ENHANCED: Advanced product search with performance optimization
   */
  static async searchProducts(query, filters = {}, options = {}, tenantId = null) {
    const startTime = performance.now();
    try {
      const { page = 1, limit = 20, sort_by = "relevance" } = options;
      const offset = (page - 1) * limit;

      // Create cache key
      const cacheKey = `search_${query}_${JSON.stringify(filters)}_${JSON.stringify(options)}_${tenantId || 'default'}`;
      const cached = getSearchCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          fromCache: true,
          responseTime: performance.now() - startTime
        };
      }

      // Track the search
      trackSearch(query);

      // Enhanced query with better joins and performance
      let searchQuery = supabase
        .from("products")
        .select(`
          id, name, description, price, discount_price, stock_quantity,
          part_number, sku, created_at, weight, dimensions, warranty_period,
          meta_title, meta_description, tags,
          product_images!left(url, alt_text, is_primary, sort_order),
          brands!inner(id, name, slug, logo_url),
          categories!inner(id, name, slug, description),
          dealers!inner(id, business_name, city, state, rating, phone),
          product_reviews!left(rating)
        `)
        .eq("status", "active")
        .eq("is_active", true);

      // Multi-tenant filtering
      if (tenantId) {
        searchQuery = searchQuery.eq("tenant_id", tenantId);
      }

      // Enhanced search logic with scoring
      if (query && query.trim()) {
        const searchTerms = query.trim().split(/\s+/);
        const searchConditions = [];

        // Primary search fields with weighting
        searchConditions.push(`name.ilike.%${query}%`);
        searchConditions.push(`description.ilike.%${query}%`);
        searchConditions.push(`part_number.ilike.%${query}%`);
        searchConditions.push(`sku.ilike.%${query}%`);
        searchConditions.push(`tags.ilike.%${query}%`);

        // Brand and category search
        searchConditions.push(`brands.name.ilike.%${query}%`);
        searchConditions.push(`categories.name.ilike.%${query}%`);

        // Multi-term search for better relevance
        if (searchTerms.length > 1) {
          searchTerms.forEach(term => {
            if (term.length > 2) {
              searchConditions.push(`name.ilike.%${term}%`);
              searchConditions.push(`description.ilike.%${term}%`);
            }
          });
        }

        searchQuery = searchQuery.or(searchConditions.join(','));
      }

      // Apply filters with optimization
      if (filters.category_id && filters.category_id !== 'all') {
        searchQuery = searchQuery.eq("category_id", filters.category_id);
      }

      if (filters.brand_id && filters.brand_id !== 'all') {
        searchQuery = searchQuery.eq("brand_id", filters.brand_id);
      }

      if (filters.dealer_id && filters.dealer_id !== 'all') {
        searchQuery = searchQuery.eq("dealer_id", filters.dealer_id);
      }

      if (filters.min_price !== undefined && filters.min_price !== null) {
        searchQuery = searchQuery.gte("price", filters.min_price);
      }

      if (filters.max_price !== undefined && filters.max_price !== null) {
        searchQuery = searchQuery.lte("price", filters.max_price);
      }

      if (filters.in_stock) {
        searchQuery = searchQuery.gt("stock_quantity", 0);
      }

      if (filters.on_sale) {
        searchQuery = searchQuery.not("discount_price", "is", null);
      }

      if (filters.min_rating && filters.min_rating > 0) {
        // This would require a subquery for average rating
        // For now, we'll implement it as a post-processing filter
      }

      // Enhanced sorting with relevance scoring
      switch (sort_by) {
        case "price_asc":
          searchQuery = searchQuery.order("price", { ascending: true });
          break;
        case "price_desc":
          searchQuery = searchQuery.order("price", { ascending: false });
          break;
        case "name_asc":
          searchQuery = searchQuery.order("name", { ascending: true });
          break;
        case "name_desc":
          searchQuery = searchQuery.order("name", { ascending: false });
          break;
        case "newest":
          searchQuery = searchQuery.order("created_at", { ascending: false });
          break;
        case "popularity":
          searchQuery = searchQuery.order("stock_quantity", { ascending: false });
          break;
        case "rating":
          // Will be sorted in post-processing
          searchQuery = searchQuery.order("created_at", { ascending: false });
          break;
        case "relevance":
        default:
          // For relevance, we prioritize exact matches and stock availability
          searchQuery = searchQuery
            .order("stock_quantity", { ascending: false })
            .order("created_at", { ascending: false });
          break;
      }

      // Pagination
      searchQuery = searchQuery.range(offset, offset + limit - 1);

      // Execute query
      const { data: products, error, count } = await searchQuery;

      if (error) throw error;

      // Enhanced product transformation with relevance scoring
      const transformedProducts = products.map(product => {
        const primaryImage = product.product_images?.find(img => img.is_primary) || 
                            product.product_images?.[0];
        
        // Calculate relevance score for search query
        let relevanceScore = 0;
        if (query && query.trim()) {
          const queryLower = query.toLowerCase();
          const nameMatch = product.name.toLowerCase().includes(queryLower);
          const exactNameMatch = product.name.toLowerCase() === queryLower;
          const partNumberMatch = product.part_number?.toLowerCase().includes(queryLower);
          const brandMatch = product.brands?.name.toLowerCase().includes(queryLower);
          
          if (exactNameMatch) relevanceScore += 100;
          else if (nameMatch) relevanceScore += 50;
          if (partNumberMatch) relevanceScore += 30;
          if (brandMatch) relevanceScore += 20;
        }

        // Calculate average rating
        const ratings = product.product_reviews?.map(review => review.rating) || [];
        const avgRating = ratings.length > 0 ? 
          ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0;

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.discount_price || product.price,
          originalPrice: product.discount_price ? product.price : null,
          discount: product.discount_price ? 
            Math.round(((product.price - product.discount_price) / product.price) * 100) : 0,
          image: primaryImage?.url || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80",
          imageAlt: primaryImage?.alt_text || product.name,
          inStock: product.stock_quantity > 0,
          stockQuantity: product.stock_quantity,
          partNumber: product.part_number,
          sku: product.sku,
          weight: product.weight,
          dimensions: product.dimensions,
          warrantyPeriod: product.warranty_period,
          tags: product.tags ? product.tags.split(',').map(t => t.trim()) : [],
          isNew: new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          isOnSale: !!product.discount_price,
          relevanceScore,
          rating: avgRating,
          reviewCount: ratings.length,
          
          // SEO data
          metaTitle: product.meta_title || product.name,
          metaDescription: product.meta_description || product.description,
          
          // Related entities
          brand: product.brands ? {
            id: product.brands.id,
            name: product.brands.name,
            slug: product.brands.slug,
            logo: product.brands.logo_url
          } : null,
          
          category: product.categories ? {
            id: product.categories.id,
            name: product.categories.name,
            slug: product.categories.slug,
            description: product.categories.description
          } : null,
          
          dealer: product.dealers ? {
            id: product.dealers.id,
            name: product.dealers.business_name,
            location: `${product.dealers.city}, ${product.dealers.state}`,
            rating: product.dealers.rating,
            phone: product.dealers.phone
          } : null
        };
      });

      // Apply post-processing filters and sorting
      let finalProducts = transformedProducts;

      // Filter by minimum rating if specified
      if (filters.min_rating && filters.min_rating > 0) {
        finalProducts = finalProducts.filter(product => product.rating >= filters.min_rating);
      }

      // Sort by rating if requested
      if (sort_by === "rating") {
        finalProducts.sort((a, b) => b.rating - a.rating);
      } else if (sort_by === "relevance" && query && query.trim()) {
        // Sort by relevance score for search queries
        finalProducts.sort((a, b) => b.relevanceScore - a.relevanceScore);
      }

      const result = {
        success: true,
        products: finalProducts,
        pagination: {
          page,
          limit,
          total: count || finalProducts.length,
          totalPages: Math.ceil((count || finalProducts.length) / limit),
          hasNext: (page * limit) < (count || finalProducts.length),
          hasPrev: page > 1
        },
        filters: {
          applied: Object.keys(filters).length,
          query: query || null
        },
        performance: {
          responseTime: performance.now() - startTime,
          fromCache: false
        }
      };

      // Cache the result
      setSearchCache(cacheKey, result);
      
      return result;

    } catch (error) {
      console.error("SearchService.searchProducts error:", error);
      return {
        success: false,
        error: error.message,
        products: [],
        performance: {
          responseTime: performance.now() - startTime,
          failed: true
        }
      };
    }
  }

  /**
   * ENHANCED: Vehicle-based product search
   */
  static async searchByVehicle(vehicleData, filters = {}, options = {}, tenantId = null) {
    const startTime = performance.now();
    try {
      const { make, model, year, engine } = vehicleData;
      const { page = 1, limit = 20, sort_by = "relevance" } = options;
      
      const cacheKey = `vehicle_search_${make}_${model}_${year}_${engine || 'any'}_${JSON.stringify(filters)}_${tenantId || 'default'}`;
      const cached = getSearchCache(cacheKey);
      if (cached) {
        return {
          ...cached,
          fromCache: true,
          responseTime: performance.now() - startTime
        };
      }

      // Track vehicle search
      trackSearch(`${make} ${model} ${year} ${engine || ''}`.trim());

      let query = supabase
        .from("products")
        .select(`
          id, name, description, price, discount_price, stock_quantity,
          part_number, sku, created_at, tags,
          product_images!left(url, alt_text, is_primary),
          brands!inner(id, name, slug),
          categories!inner(id, name, slug),
          dealers!inner(id, business_name, city, state, rating),
          vehicle_compatibility!inner(make, model, year, engine)
        `)
        .eq("status", "active")
        .eq("is_active", true);

      // Multi-tenant filtering
      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }

      // Vehicle compatibility filters
      query = query
        .eq("vehicle_compatibility.make", make)
        .eq("vehicle_compatibility.model", model)
        .eq("vehicle_compatibility.year", year);

      if (engine) {
        query = query.eq("vehicle_compatibility.engine", engine);
      }

      // Apply additional filters
      if (filters.category_id && filters.category_id !== 'all') {
        query = query.eq("category_id", filters.category_id);
      }

      if (filters.brand_id && filters.brand_id !== 'all') {
        query = query.eq("brand_id", filters.brand_id);
      }

      if (filters.in_stock) {
        query = query.gt("stock_quantity", 0);
      }

      // Sorting
      switch (sort_by) {
        case "price_asc":
          query = query.order("price", { ascending: true });
          break;
        case "price_desc":
          query = query.order("price", { ascending: false });
          break;
        case "name":
          query = query.order("name", { ascending: true });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        default:
          query = query.order("stock_quantity", { ascending: false });
      }

      // Pagination
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data: products, error } = await query;

      if (error) throw error;

      const transformedProducts = products.map(product => {
        const primaryImage = product.product_images?.find(img => img.is_primary) || 
                            product.product_images?.[0];

        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.discount_price || product.price,
          originalPrice: product.discount_price ? product.price : null,
          image: primaryImage?.url || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80",
          imageAlt: primaryImage?.alt_text || product.name,
          inStock: product.stock_quantity > 0,
          stockQuantity: product.stock_quantity,
          partNumber: product.part_number,
          sku: product.sku,
          tags: product.tags ? product.tags.split(',').map(t => t.trim()) : [],
          isOnSale: !!product.discount_price,
          
          // Vehicle compatibility info
          vehicleCompatibility: {
            make: product.vehicle_compatibility?.make,
            model: product.vehicle_compatibility?.model,
            year: product.vehicle_compatibility?.year,
            engine: product.vehicle_compatibility?.engine,
            fitsVehicle: true // Since it came from compatibility query
          },
          
          brand: product.brands ? {
            id: product.brands.id,
            name: product.brands.name,
            slug: product.brands.slug
          } : null,
          
          category: product.categories ? {
            id: product.categories.id,
            name: product.categories.name,
            slug: product.categories.slug
          } : null,
          
          dealer: product.dealers ? {
            id: product.dealers.id,
            name: product.dealers.business_name,
            location: `${product.dealers.city}, ${product.dealers.state}`,
            rating: product.dealers.rating
          } : null
        };
      });

      const result = {
        success: true,
        products: transformedProducts,
        vehicleInfo: { make, model, year, engine },
        pagination: {
          page,
          limit,
          total: transformedProducts.length,
          totalPages: Math.ceil(transformedProducts.length / limit)
        },
        performance: {
          responseTime: performance.now() - startTime,
          fromCache: false
        }
      };

      setSearchCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error("SearchService.searchByVehicle error:", error);
      return {
        success: false,
        error: error.message,
        products: [],
        performance: {
          responseTime: performance.now() - startTime,
          failed: true
        }
      };
    }
  }

  /**
   * ENHANCED: Smart search suggestions with caching
   */
  static async getSearchSuggestions(query, limit = 10, tenantId = null) {
    try {
      if (!query || query.trim().length < 2) {
        return { success: true, suggestions: [] };
      }

      const cacheKey = `suggestions_${query}_${limit}_${tenantId || 'default'}`;
      const cached = getSearchCache(cacheKey);
      if (cached) {
        return cached;
      }

      const queryTerm = query.trim();

      // Parallel queries for different suggestion types
      const [productsRes, brandsRes, categoriesRes] = await Promise.all([
        // Product suggestions
        supabase
        .from("products")
          .select("name, part_number")
          .ilike("name", `%${queryTerm}%`)
          .eq("status", "active")
          .eq("is_active", true)
          .limit(Math.ceil(limit * 0.6)),

        // Brand suggestions
        supabase
          .from("brands")
          .select("name")
          .ilike("name", `%${queryTerm}%`)
          .eq("is_active", true)
          .limit(Math.ceil(limit * 0.2)),

        // Category suggestions
        supabase
          .from("categories")
        .select("name")
          .ilike("name", `%${queryTerm}%`)
          .eq("is_active", true)
          .limit(Math.ceil(limit * 0.2))
      ]);

      const suggestions = [];

      // Add product suggestions
      if (productsRes.data) {
        productsRes.data.forEach(product => {
          suggestions.push({
        type: "product",
            text: product.name,
            subtext: product.part_number,
            category: "Products"
          });
        });
      }

      // Add brand suggestions
      if (brandsRes.data) {
        brandsRes.data.forEach(brand => {
          suggestions.push({
            type: "brand",
            text: brand.name,
            category: "Brands"
          });
        });
      }

      // Add category suggestions
      if (categoriesRes.data) {
        categoriesRes.data.forEach(category => {
          suggestions.push({
            type: "category",
            text: category.name,
            category: "Categories"
          });
        });
      }

      // Add popular search suggestions if query is short
      if (queryTerm.length <= 3) {
        const popularSuggestions = this.getPopularSearchTerms(queryTerm);
        popularSuggestions.forEach(term => {
          suggestions.push({
            type: "popular",
            text: term,
            category: "Popular Searches"
          });
        });
      }

      // Remove duplicates and limit results
      const uniqueSuggestions = suggestions
        .filter((suggestion, index, self) => 
          index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
        )
        .slice(0, limit);

      const result = {
        success: true,
        suggestions: uniqueSuggestions,
        query: queryTerm
      };

      setSearchCache(cacheKey, result, SUGGESTION_CACHE_DURATION);
      return result;

    } catch (error) {
      console.error("SearchService.getSearchSuggestions error:", error);
      return {
        success: false,
        error: error.message,
        suggestions: []
      };
    }
  }

  /**
   * Get popular search terms
   */
  static getPopularSearches(limit = 10) {
    try {
      // Get from tracked searches
      const popularFromTracking = Array.from(searchMetrics.popularQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, Math.ceil(limit / 2))
        .map(([term, count]) => ({ term, count }));

      // Static popular searches for automotive parts
      const staticPopular = [
        { term: "brake pads", count: 1250 },
        { term: "engine oil", count: 980 },
        { term: "air filter", count: 875 },
        { term: "spark plugs", count: 720 },
        { term: "tires", count: 650 },
        { term: "battery", count: 580 },
        { term: "alternator", count: 520 },
        { term: "brake rotors", count: 480 },
        { term: "transmission fluid", count: 420 },
        { term: "radiator", count: 380 }
      ];

      // Combine and deduplicate
      const combined = [...popularFromTracking];
      staticPopular.forEach(staticItem => {
        if (!combined.find(item => item.term === staticItem.term)) {
          combined.push(staticItem);
        }
      });

      return {
        success: true,
        popularSearches: combined.slice(0, limit)
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

  /**
   * Get popular search terms matching a prefix
   */
  static getPopularSearchTerms(prefix) {
    const popular = [
      "brake pads", "brake rotors", "brake fluid",
      "engine oil", "engine filter", "engine parts",
      "air filter", "air conditioning", "alternator",
      "spark plugs", "suspension", "steering",
      "tires", "transmission", "timing belt",
      "battery", "belts", "brake lines"
    ];

    return popular
      .filter(term => term.toLowerCase().startsWith(prefix.toLowerCase()))
      .slice(0, 3);
  }

  /**
   * Advanced search with filters and facets
   */
  static async advancedSearch(searchParams, tenantId = null) {
    const {
      query,
      filters = {},
      facets = [],
      page = 1,
      limit = 20,
      sort_by = "relevance"
    } = searchParams;

    // Use the enhanced search
    const searchResult = await this.searchProducts(
      query, 
      filters, 
      { page, limit, sort_by }, 
      tenantId
    );

    // Add facet data if requested
    if (facets.length > 0 && searchResult.success) {
      searchResult.facets = await this.getFacets(query, filters, facets, tenantId);
    }

    return searchResult;
  }

  /**
   * Get search facets for filtering
   */
  static async getFacets(query, filters, requestedFacets, tenantId = null) {
    const facets = {};

    try {
      // Base query for facet calculations
      let baseQuery = supabase
        .from("products")
        .select("category_id, brand_id, price, dealer_id")
        .eq("status", "active")
        .eq("is_active", true);

      if (tenantId) {
        baseQuery = baseQuery.eq("tenant_id", tenantId);
      }

      if (query && query.trim()) {
        baseQuery = baseQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,part_number.ilike.%${query}%`);
      }

      const { data: facetData } = await baseQuery;

      if (facetData) {
        // Calculate facets
        if (requestedFacets.includes('categories')) {
          const categoryCounts = facetData.reduce((acc, item) => {
            acc[item.category_id] = (acc[item.category_id] || 0) + 1;
            return acc;
          }, {});
          facets.categories = Object.entries(categoryCounts)
            .map(([id, count]) => ({ id, count }))
            .sort((a, b) => b.count - a.count);
        }

        if (requestedFacets.includes('brands')) {
          const brandCounts = facetData.reduce((acc, item) => {
            acc[item.brand_id] = (acc[item.brand_id] || 0) + 1;
            return acc;
          }, {});
          facets.brands = Object.entries(brandCounts)
            .map(([id, count]) => ({ id, count }))
            .sort((a, b) => b.count - a.count);
        }

        if (requestedFacets.includes('price_ranges')) {
          const priceRanges = [
            { min: 0, max: 25, label: 'Under $25' },
            { min: 25, max: 50, label: '$25 - $50' },
            { min: 50, max: 100, label: '$50 - $100' },
            { min: 100, max: 250, label: '$100 - $250' },
            { min: 250, max: 500, label: '$250 - $500' },
            { min: 500, max: null, label: 'Over $500' }
          ];

          facets.price_ranges = priceRanges.map(range => ({
            ...range,
            count: facetData.filter(item => {
              const price = item.price;
              return price >= range.min && (range.max === null || price < range.max);
            }).length
          })).filter(range => range.count > 0);
        }
      }

    } catch (error) {
      console.error("Error calculating facets:", error);
    }

    return facets;
  }

  /**
   * Performance and analytics methods
   */
  static getSearchMetrics() {
    return {
      ...searchMetrics,
      cacheHitRate: searchMetrics.totalSearches > 0 ? 
        (searchMetrics.cacheHits / searchMetrics.totalSearches) * 100 : 0,
      topQueries: Array.from(searchMetrics.popularQueries.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([query, count]) => ({ query, count }))
    };
  }

  static clearSearchCache() {
    searchCache.clear();
    searchCacheExpiry.clear();
  }

  static resetSearchMetrics() {
    searchMetrics.totalSearches = 0;
    searchMetrics.cacheHits = 0;
    searchMetrics.avgResponseTime = 0;
    searchMetrics.popularQueries.clear();
  }
}

export default SearchService;
