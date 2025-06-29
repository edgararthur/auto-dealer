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

// Smart search query parser
const parseSearchQuery = (query) => {
  if (!query) return { vehicleInfo: {}, productTerms: [], originalQuery: '', hasVehicleInfo: false };

  const originalQuery = query.toLowerCase().trim();
  const words = originalQuery.split(/\s+/);
  
  const vehicleInfo = {
    year: '',
    make: '',
    model: ''
  };
  const productTerms = [];
  const remainingWords = [...words];

  // Enhanced vehicle make database
  const vehicleMakes = [
    'toyota', 'honda', 'ford', 'chevrolet', 'chevy', 'nissan', 'bmw', 'mercedes', 'mercedes-benz',
    'audi', 'volkswagen', 'vw', 'hyundai', 'kia', 'subaru', 'mazda', 'mitsubishi', 'lexus',
    'acura', 'infiniti', 'cadillac', 'buick', 'gmc', 'jeep', 'chrysler', 'dodge', 'ram',
    'volvo', 'porsche', 'jaguar', 'land rover', 'mini', 'fiat', 'alfa romeo', 'tesla'
  ];

  // Common model names for better parsing
  const commonModels = [
    'corolla', 'camry', 'prius', 'rav4', 'highlander', 'sienna', 'tacoma', 'tundra',
    'civic', 'accord', 'cr-v', 'pilot', 'odyssey', 'ridgeline',
    'focus', 'fusion', 'escape', 'explorer', 'f-150', 'f150', 'mustang',
    'malibu', 'impala', 'equinox', 'tahoe', 'silverado', 'corvette',
    'altima', 'sentra', 'rogue', 'pathfinder', 'frontier', 'titan',
    'series', '3-series', '5-series', '7-series', 'x1', 'x3', 'x5', 'x7'
  ];

  // Auto parts terms for better categorization
  const autoPartTerms = [
    'battery', 'brake', 'brakes', 'pad', 'pads', 'rotor', 'rotors', 'filter', 'filters',
    'oil', 'engine', 'transmission', 'alternator', 'starter', 'radiator', 'coolant',
    'spark', 'plug', 'plugs', 'belt', 'hose', 'pump', 'sensor', 'light', 'headlight',
    'taillight', 'bulb', 'fuse', 'relay', 'switch', 'motor', 'compressor', 'clutch',
    'tire', 'tires', 'wheel', 'wheels', 'suspension', 'shock', 'strut', 'spring',
    'exhaust', 'muffler', 'catalytic', 'converter', 'gasket', 'seal', 'bearing',
    'fluid', 'antifreeze', 'windshield', 'wiper', 'wipers', 'mirror', 'door', 'handle'
  ];

  // Extract year (4-digit number between 1990 and current year + 2)
  const currentYear = new Date().getFullYear();
  const yearMatch = words.find(word => {
    const year = parseInt(word);
    return year >= 1990 && year <= currentYear + 2;
  });
  
  if (yearMatch) {
    vehicleInfo.year = yearMatch;
    const index = remainingWords.indexOf(yearMatch);
    if (index > -1) remainingWords.splice(index, 1);
  }

  // Extract make (check against known makes, including partial matches)
  const makeMatch = remainingWords.find(word => {
    return vehicleMakes.some(make => 
      make === word || 
      make.includes(word) || 
      word.includes(make) ||
      (make === 'mercedes-benz' && word === 'mercedes') ||
      (make === 'chevrolet' && word === 'chevy') ||
      (make === 'volkswagen' && word === 'vw')
    );
  });
  
  if (makeMatch) {
    // Map common abbreviations to full names
    if (makeMatch === 'chevy') vehicleInfo.make = 'chevrolet';
    else if (makeMatch === 'vw') vehicleInfo.make = 'volkswagen';
    else if (makeMatch === 'mercedes') vehicleInfo.make = 'mercedes-benz';
    else vehicleInfo.make = makeMatch;
    
    const index = remainingWords.indexOf(makeMatch);
    if (index > -1) remainingWords.splice(index, 1);
  }

  // Extract model (check against common models and remaining words)
  const modelMatch = remainingWords.find(word => {
    return commonModels.includes(word) || 
           (word.length > 2 && !autoPartTerms.includes(word));
  });
  
  if (modelMatch) {
    vehicleInfo.model = modelMatch;
    const index = remainingWords.indexOf(modelMatch);
    if (index > -1) remainingWords.splice(index, 1);
  }

  // Remaining words are product terms
  remainingWords.forEach(word => {
    if (word.length > 1) { // Include shorter terms that might be important
      productTerms.push(word);
    }
  });

  // If no specific product terms found but we have vehicle info, 
  // this might be a general vehicle search
  if (productTerms.length === 0 && (vehicleInfo.year || vehicleInfo.make || vehicleInfo.model)) {
    productTerms.push('parts', 'accessories');
  }

  return { 
    vehicleInfo, 
    productTerms, 
    originalQuery,
    hasVehicleInfo: !!(vehicleInfo.year || vehicleInfo.make || vehicleInfo.model)
  };
};

// Enhanced vehicle compatibility data - this would typically come from database
const getVehicleCompatibility = (productName, productDescription) => {
  const name = (productName || '').toLowerCase();
  const desc = (productDescription || '').toLowerCase();
  const text = `${name} ${desc}`;
  
  const compatibility = [];
  
  // Extract years from product info
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
  const years = yearMatches ? [...new Set(yearMatches)] : [];
  
  // Map of vehicle makes and their common variations
  const makeVariations = {
    'toyota': ['toyota', 'toyot'],
    'honda': ['honda'],
    'ford': ['ford'],
    'chevrolet': ['chevrolet', 'chevy', 'chev'],
    'nissan': ['nissan', 'datsun'],
    'bmw': ['bmw'],
    'mercedes-benz': ['mercedes', 'mercedes-benz', 'merc'],
    'audi': ['audi'],
    'volkswagen': ['volkswagen', 'vw', 'volks'],
    'hyundai': ['hyundai'],
    'kia': ['kia'],
    'subaru': ['subaru'],
    'mazda': ['mazda'],
    'mitsubishi': ['mitsubishi'],
    'lexus': ['lexus'],
    'acura': ['acura'],
    'infiniti': ['infiniti'],
    'volvo': ['volvo'],
    'porsche': ['porsche'],
    'jaguar': ['jaguar', 'jag'],
    'jeep': ['jeep'],
    'dodge': ['dodge'],
    'chrysler': ['chrysler'],
    'buick': ['buick'],
    'cadillac': ['cadillac'],
    'gmc': ['gmc'],
    'ram': ['ram']
  };
  
  // Common models for each make
  const makeModels = {
    'toyota': ['corolla', 'camry', 'prius', 'rav4', 'highlander', 'sienna', 'tacoma', 'tundra', '4runner', 'sequoia', 'land cruiser', 'yaris', 'avalon'],
    'honda': ['civic', 'accord', 'cr-v', 'pilot', 'odyssey', 'ridgeline', 'fit', 'hr-v', 'passport', 'insight'],
    'ford': ['focus', 'fusion', 'escape', 'explorer', 'f-150', 'f150', 'mustang', 'edge', 'expedition', 'ranger', 'fiesta'],
    'chevrolet': ['malibu', 'impala', 'equinox', 'tahoe', 'silverado', 'corvette', 'cruze', 'sonic', 'trax', 'traverse'],
    'nissan': ['altima', 'sentra', 'rogue', 'pathfinder', 'frontier', 'titan', 'versa', 'murano', 'armada', 'maxima'],
    'bmw': ['3-series', '5-series', '7-series', 'x1', 'x3', 'x5', 'x7', 'z4', 'i3', 'i8'],
    'mercedes-benz': ['c-class', 'e-class', 's-class', 'glc', 'gle', 'gls', 'a-class', 'cla', 'gla'],
    'audi': ['a3', 'a4', 'a6', 'a8', 'q3', 'q5', 'q7', 'q8', 'tt', 'r8'],
    'volkswagen': ['jetta', 'passat', 'golf', 'tiguan', 'atlas', 'beetle', 'arteon'],
    'hyundai': ['elantra', 'sonata', 'tucson', 'santa fe', 'accent', 'veloster', 'genesis'],
    'kia': ['optima', 'forte', 'soul', 'sportage', 'sorento', 'rio', 'stinger', 'telluride']
  };
  
  // Find compatible makes and models
  for (const [make, variations] of Object.entries(makeVariations)) {
    if (variations.some(variation => text.includes(variation))) {
      // Check for specific models
      const models = makeModels[make] || [];
      const foundModels = models.filter(model => text.includes(model));
      
      if (foundModels.length > 0) {
        // Add specific vehicle combinations
        foundModels.forEach(model => {
          if (years.length > 0) {
            years.forEach(year => {
              compatibility.push({
                year: year,
                make: make,
                model: model,
                matchType: 'specific'
              });
            });
          } else {
            // Add without year if no year found
            compatibility.push({
              year: null,
              make: make,
              model: model,
              matchType: 'model'
            });
          }
        });
      } else {
        // Add make-only compatibility
        if (years.length > 0) {
          years.forEach(year => {
            compatibility.push({
              year: year,
              make: make,
              model: null,
              matchType: 'make_year'
            });
          });
        } else {
          compatibility.push({
            year: null,
            make: make,
            model: null,
            matchType: 'make'
          });
        }
      }
    }
  }
  
  // If no specific compatibility found, try to extract generic info
  if (compatibility.length === 0 && years.length > 0) {
    years.forEach(year => {
      compatibility.push({
        year: year,
        make: null,
        model: null,
        matchType: 'year'
      });
    });
  }
  
  return compatibility;
};

// Enhanced search scoring with vehicle compatibility
const calculateVehicleCompatibilityScore = (product, searchQuery) => {
  const parsed = parseSearchQuery(searchQuery);
  if (!parsed.hasVehicleInfo) return 0;
  
  const compatibility = product.vehicleCompatibility || [];
  let score = 0;
  
  const { vehicleInfo } = parsed;
  
  compatibility.forEach(compat => {
    let matchScore = 0;
    
    // Exact matches get highest scores
    if (vehicleInfo.year && compat.year === vehicleInfo.year) {
      matchScore += 3;
    }
    
    if (vehicleInfo.make && compat.make === vehicleInfo.make) {
      matchScore += 3;
    }
    
    if (vehicleInfo.model && compat.model === vehicleInfo.model) {
      matchScore += 3;
    }
    
    // Bonus for complete matches
    if (compat.matchType === 'specific' && 
        vehicleInfo.year && vehicleInfo.make && vehicleInfo.model &&
        compat.year === vehicleInfo.year && 
        compat.make === vehicleInfo.make && 
        compat.model === vehicleInfo.model) {
      matchScore += 5; // Perfect match bonus
    }
    
    score = Math.max(score, matchScore); // Take the best match
  });
  
  return score;
};

const ProductService = {
  /**
   * ENHANCED: Get products with vehicle search support and real database schema
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

      // OPTIMIZED: Use actual database schema fields
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          short_description,
          sku,
          part_number,
          price,
          discount_price,
          cost_price,
          stock_quantity,
          condition,
          status,
          is_active,
          created_at,
          updated_at,
          dealer_id,
          category_id,
          brand_id,
          supplier_id,
          subcategory_id,
          specifications,
          compatibility,
          warranty_info,
          shipping,
          product_images!left(id, url, is_primary)
        `);

      // Count query
      let countQuery = supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Apply filters efficiently with real schema
      const applyFilters = (q) => {
        // Core filters - only show approved and active products
        q = q.eq('status', 'approved').eq('is_active', true);
        
        if (filters.category && filters.category !== 'all') {
          q = q.eq('category_id', filters.category);
        }
        if (filters.subcategory && filters.subcategory !== 'all') {
          q = q.eq('subcategory_id', filters.subcategory);
        }
        if (filters.brand && filters.brand !== 'all') {
          q = q.eq('brand_id', filters.brand);
        }
        if (filters.dealer && filters.dealer !== 'all') {
          q = q.eq('dealer_id', filters.dealer);
        }
        if (filters.supplier && filters.supplier !== 'all') {
          q = q.eq('supplier_id', filters.supplier);
        }
        if (filters.condition && filters.condition !== 'all') {
          q = q.eq('condition', filters.condition);
        }
        
        // Price range filters
        if (filters.minPrice && filters.maxPrice) {
          // Use discount_price if available, otherwise regular price
          q = q.or(`price.gte.${filters.minPrice},discount_price.gte.${filters.minPrice}`)
               .or(`price.lte.${filters.maxPrice},discount_price.lte.${filters.maxPrice}`);
        }
        
        // Enhanced search functionality with vehicle compatibility
        if (filters.search) {
          const parsed = parseSearchQuery(filters.search);
          const searchConditions = [];
          
          console.log('🔍 Parsed search:', parsed);

          // If we have vehicle information, use compatibility search
          if (parsed.hasVehicleInfo) {
            const { vehicleInfo } = parsed;
            
            // Search in compatibility JSONB column
            if (vehicleInfo.year) {
              searchConditions.push(`compatibility->>'year'.ilike.%${vehicleInfo.year}%`);
            }
            if (vehicleInfo.make) {
              searchConditions.push(`compatibility->>'make'.ilike.%${vehicleInfo.make}%`);
            }
            if (vehicleInfo.model) {
              searchConditions.push(`compatibility->>'model'.ilike.%${vehicleInfo.model}%`);
            }
            
            // Also search in product fields
            if (vehicleInfo.year) {
              searchConditions.push(`name.ilike.%${vehicleInfo.year}%`);
              searchConditions.push(`description.ilike.%${vehicleInfo.year}%`);
              searchConditions.push(`part_number.ilike.%${vehicleInfo.year}%`);
            }
            
            if (vehicleInfo.make) {
              searchConditions.push(`name.ilike.%${vehicleInfo.make}%`);
              searchConditions.push(`description.ilike.%${vehicleInfo.make}%`);
              searchConditions.push(`sku.ilike.%${vehicleInfo.make}%`);
            }
            
            if (vehicleInfo.model) {
              searchConditions.push(`name.ilike.%${vehicleInfo.model}%`);
              searchConditions.push(`description.ilike.%${vehicleInfo.model}%`);
              searchConditions.push(`sku.ilike.%${vehicleInfo.model}%`);
            }

            // Search for product terms if specified
            if (parsed.productTerms.length > 0) {
              parsed.productTerms.forEach(term => {
                if (term !== 'parts' && term !== 'accessories') {
                  searchConditions.push(`name.ilike.%${term}%`);
                  searchConditions.push(`description.ilike.%${term}%`);
                  searchConditions.push(`short_description.ilike.%${term}%`);
                  searchConditions.push(`sku.ilike.%${term}%`);
                  searchConditions.push(`part_number.ilike.%${term}%`);
                }
              });
            }
          } else {
            // No vehicle info, do comprehensive text search
            const searchTerm = filters.search.toLowerCase();
            searchConditions.push(`name.ilike.%${searchTerm}%`);
            searchConditions.push(`description.ilike.%${searchTerm}%`);
            searchConditions.push(`short_description.ilike.%${searchTerm}%`);
            searchConditions.push(`sku.ilike.%${searchTerm}%`);
            searchConditions.push(`part_number.ilike.%${searchTerm}%`);
          }

          // Apply search conditions with OR logic
          if (searchConditions.length > 0) {
            q = q.or(searchConditions.join(','));
          }
        }

        // Stock filter
        if (filters.inStock) {
          q = q.gt('stock_quantity', 0);
        }
        
        return q;
      };

      query = applyFilters(query);
      countQuery = applyFilters(countQuery);

      // Sorting with proper field names
      switch (filters.sortBy) {
        case 'price_asc':
          // Sort by discount_price if available, otherwise price
          query = query.order('discount_price', { ascending: true, nullsLast: true })
                       .order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('discount_price', { ascending: false, nullsFirst: true })
                       .order('price', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        case 'stock':
          query = query.order('stock_quantity', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'updated':
          query = query.order('updated_at', { ascending: false });
          break;
        case 'relevance':
          // For relevance, we'll sort in JavaScript after scoring
          query = query.order('created_at', { ascending: false });
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

      // Enhanced transformation with real schema and vehicle compatibility
      const transformedData = products.map(product => {
        const primaryImg = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
        
        // Use existing compatibility data or generate it
        let vehicleCompatibility = [];
        if (product.compatibility) {
          // Use existing compatibility data from database
          vehicleCompatibility = Array.isArray(product.compatibility) 
            ? product.compatibility 
            : [product.compatibility];
        } else {
          // Generate compatibility data if not present
          vehicleCompatibility = getVehicleCompatibility(product.name, product.description);
        }
        
        // Calculate relevance score for search results
        let relevanceScore = 1.0;
        
        if (filters.search) {
          const parsed = parseSearchQuery(filters.search);
          const productName = (product.name || '').toLowerCase();
          const productDesc = (product.description || '').toLowerCase();
          const productShortDesc = (product.short_description || '').toLowerCase();
          const productSku = (product.sku || '').toLowerCase();
          const productPartNumber = (product.part_number || '').toLowerCase();
          
          // Text-based relevance scoring across multiple fields
          if (parsed.hasVehicleInfo) {
            const { vehicleInfo } = parsed;
            
            // Year matches - check multiple fields
            if (vehicleInfo.year) {
              if (productName.includes(vehicleInfo.year)) relevanceScore += 3.0;
              if (productDesc.includes(vehicleInfo.year)) relevanceScore += 2.0;
              if (productShortDesc.includes(vehicleInfo.year)) relevanceScore += 2.5;
              if (productSku.includes(vehicleInfo.year)) relevanceScore += 2.0;
              if (productPartNumber.includes(vehicleInfo.year)) relevanceScore += 2.5;
            }
            
            // Make matches
            if (vehicleInfo.make) {
              if (productName.includes(vehicleInfo.make)) relevanceScore += 3.0;
              if (productDesc.includes(vehicleInfo.make)) relevanceScore += 2.0;
              if (productShortDesc.includes(vehicleInfo.make)) relevanceScore += 2.5;
              if (productSku.includes(vehicleInfo.make)) relevanceScore += 2.0;
            }
            
            // Model matches
            if (vehicleInfo.model) {
              if (productName.includes(vehicleInfo.model)) relevanceScore += 3.0;
              if (productDesc.includes(vehicleInfo.model)) relevanceScore += 2.0;
              if (productShortDesc.includes(vehicleInfo.model)) relevanceScore += 2.5;
              if (productSku.includes(vehicleInfo.model)) relevanceScore += 2.0;
            }
            
            // Product term matches
            parsed.productTerms.forEach(term => {
              if (term !== 'parts' && term !== 'accessories') {
                if (productName.includes(term)) relevanceScore += 2.0;
                if (productDesc.includes(term)) relevanceScore += 1.0;
                if (productShortDesc.includes(term)) relevanceScore += 1.5;
                if (productSku.includes(term)) relevanceScore += 1.5;
                if (productPartNumber.includes(term)) relevanceScore += 1.5;
              }
            });
          }
          
          // Add vehicle compatibility scoring
          const compatibilityScore = calculateVehicleCompatibilityScore(
            { ...product, vehicleCompatibility }, 
            filters.search
          );
          relevanceScore += compatibilityScore;
          
          // Boost score for exact SKU or part number matches
          if (filters.search.toLowerCase() === productSku) {
            relevanceScore += 10.0;
          }
          if (filters.search.toLowerCase() === productPartNumber) {
            relevanceScore += 8.0;
          }
        }
        
        // Calculate effective price (discount_price if available, otherwise price)
        const effectivePrice = product.discount_price || product.price;
        const hasDiscount = product.discount_price && product.discount_price < product.price;
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          shortDescription: product.short_description,
          sku: product.sku,
          partNumber: product.part_number,
          price: effectivePrice,
          originalPrice: hasDiscount ? product.price : null,
          discountPrice: product.discount_price,
          costPrice: product.cost_price,
          stockQuantity: product.stock_quantity,
          inStock: product.stock_quantity > 0,
          condition: product.condition,
          status: product.status,
          isActive: product.is_active,
          image: primaryImg?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
          brandId: product.brand_id,
          categoryId: product.category_id,
          subcategoryId: product.subcategory_id,
          dealerId: product.dealer_id,
          supplierId: product.supplier_id,
          specifications: product.specifications,
          warrantyInfo: product.warranty_info,
          shipping: product.shipping,
          createdAt: product.created_at,
          updatedAt: product.updated_at,
          relevanceScore,
          vehicleCompatibility // Include for product details
        };
      });

      // Sort by relevance score if it's a search query
      if (filters.search && (filters.sortBy === 'relevance' || !filters.sortBy)) {
        transformedData.sort((a, b) => {
          // First sort by relevance score
          if (b.relevanceScore !== a.relevanceScore) {
            return b.relevanceScore - a.relevanceScore;
          }
          // Then by stock quantity (prioritize in-stock items)
          if (b.stockQuantity !== a.stockQuantity) {
            return b.stockQuantity - a.stockQuantity;
          }
          // Finally by creation date for ties
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        console.log('🎯 Sorted by relevance, top results:', transformedData.slice(0, 3).map(p => ({
          name: p.name,
          score: p.relevanceScore,
          sku: p.sku,
          stock: p.stockQuantity
        })));
      }

      const result = {
        success: true,
        products: transformedData,
        count: count || 0,
        hasMore: filters.limit ? transformedData.length === filters.limit : false,
        filters: {
          applied: filters,
          parsed: filters.search ? parseSearchQuery(filters.search) : null
        }
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
   * ENHANCED: Search products with vehicle information
   */
  searchProducts: async (query, filters = {}) => {
    return await ProductService.getProducts({ 
      ...filters, 
      search: query,
      sortBy: 'relevance'
    });
  },

  /**
   * NEW: Search products by vehicle specifications
   */
  searchByVehicle: async (vehicleInfo, productQuery = '', filters = {}) => {
    const searchTerms = [];
    
    if (vehicleInfo.year) searchTerms.push(vehicleInfo.year);
    if (vehicleInfo.make) searchTerms.push(vehicleInfo.make);
    if (vehicleInfo.model) searchTerms.push(vehicleInfo.model);
    if (productQuery) searchTerms.push(productQuery);

    const combinedQuery = searchTerms.join(' ');

    return await ProductService.getProducts({
      ...filters,
      search: combinedQuery,
      make: vehicleInfo.make,
      model: vehicleInfo.model,
      year: vehicleInfo.year,
      sortBy: 'relevance'
    });
  },

  /**
   * NEW: Get suggested search terms based on partial input
   */
  getSearchSuggestions: async (query, limit = 8) => {
    try {
      if (!query || query.length < 2) {
        return { success: true, suggestions: [] };
      }

      const parsed = parseSearchQuery(query);
      const suggestions = [];

      // Common auto parts
      const commonParts = [
        'battery', 'brake pads', 'oil filter', 'air filter', 'spark plugs',
        'alternator', 'starter', 'radiator', 'headlight', 'taillight',
        'tire', 'wheel', 'engine oil', 'transmission fluid', 'coolant',
        'brake fluid', 'power steering fluid', 'windshield wipers',
        'cabin filter', 'fuel filter', 'timing belt', 'serpentine belt'
      ];

      // If we have vehicle info, suggest parts for that vehicle
      if (parsed.vehicleInfo.year || parsed.vehicleInfo.make || parsed.vehicleInfo.model) {
        const vehicleStr = [
          parsed.vehicleInfo.year,
          parsed.vehicleInfo.make,
          parsed.vehicleInfo.model
        ].filter(Boolean).join(' ');

        commonParts.forEach(part => {
          if (!parsed.productTerms.some(term => part.includes(term))) {
            suggestions.push(`${vehicleStr} ${part}`);
          }
        });
      } else {
        // Suggest completing the query with common parts
        commonParts.forEach(part => {
          if (part.includes(query.toLowerCase()) || query.toLowerCase().includes(part)) {
            suggestions.push(part);
          }
        });
      }

      return {
        success: true,
        suggestions: suggestions.slice(0, limit)
      };

    } catch (error) {
      console.error('Error in getSearchSuggestions:', error);
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
  },

  /**
   * DEBUG: Get all products without any filters
   */
  getAllProductsDebug: async () => {
    try {
      console.log('🐛 DEBUG: Getting ALL products without filters...');
      
      // Get total count
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Count error:', countError);
        throw countError;
      }

      // Get first 50 products
      const { data: products, error: productsError } = await supabase
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
          brand_id,
          product_images!left(id, url, is_primary)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (productsError) {
        console.error('Products error:', productsError);
        throw productsError;
      }

      console.log('🐛 DEBUG Results:');
      console.log('📊 Total products in database:', count);
      console.log('📦 Products with stock > 0:', products.filter(p => p.stock_quantity > 0).length);
      console.log('📦 Products with stock = 0:', products.filter(p => p.stock_quantity === 0).length);
      console.log('📝 Sample products:', products.slice(0, 5).map(p => ({
        id: p.id,
        name: p.name,
        stock: p.stock_quantity,
        price: p.price
      })));

      const transformedData = products.map(product => {
        const primaryImg = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
        
        return {
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.discount_price || product.price,
          originalPrice: product.discount_price ? product.price : null,
          discountPrice: product.discount_price,
          stockQuantity: product.stock_quantity,
          inStock: product.stock_quantity > 0,
          image: primaryImg?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
          brandId: product.brand_id,
          categoryId: product.category_id,
          dealerId: product.dealer_id,
          createdAt: product.created_at
        };
      });

      return {
        success: true,
        products: transformedData,
        count: count || 0,
        hasMore: products.length === 50
      };

    } catch (error) {
      console.error('🐛 DEBUG: Error getting all products:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * NEW: Update product compatibility data in database
   */
  updateProductCompatibility: async (productId, compatibilityData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ 
          compatibility: compatibilityData,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId)
        .select();

      if (error) throw error;

      // Clear cache for this product
      const cacheKeys = Array.from(cache.keys()).filter(key => key.includes(productId));
      cacheKeys.forEach(key => {
        cache.delete(key);
        cacheExpiry.delete(key);
      });

      return { success: true, product: data[0] };
    } catch (error) {
      console.error('Error updating product compatibility:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * NEW: Batch update compatibility for multiple products
   */
  batchUpdateCompatibility: async (products) => {
    try {
      const updates = products.map(({ id, name, description }) => {
        const compatibility = getVehicleCompatibility(name, description);
        return {
          id,
          compatibility,
          updated_at: new Date().toISOString()
        };
      });

      const { data, error } = await supabase
        .from('products')
        .upsert(updates, { onConflict: 'id' });

      if (error) throw error;

      // Clear all product caches
      cache.clear();
      cacheExpiry.clear();

      console.log(`✅ Updated compatibility for ${updates.length} products`);
      return { success: true, updated: updates.length };
    } catch (error) {
      console.error('Error batch updating compatibility:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * ENHANCED: Get product by ID with full compatibility data
   */
  getProductById: async (productId) => {
    try {
      const cacheKey = `product_${productId}`;
      const cached = getCache(cacheKey);
      if (cached) {
        return cached;
      }

      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images(*),
          categories(id, name),
          brands(id, name),
          dealers:dealer_id(id, business_name, company_name, name, city, state, phone, email),
          subcategories:subcategory_id(id, name)
        `)
        .eq('id', productId)
        .eq('status', 'approved')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!product) return { success: false, error: 'Product not found' };

      // Ensure compatibility data exists
      let vehicleCompatibility = [];
      if (product.compatibility) {
        vehicleCompatibility = Array.isArray(product.compatibility) 
          ? product.compatibility 
          : [product.compatibility];
      } else {
        // Generate and save compatibility data
        vehicleCompatibility = getVehicleCompatibility(product.name, product.description);
        if (vehicleCompatibility.length > 0) {
          await ProductService.updateProductCompatibility(productId, vehicleCompatibility);
        }
      }

      const transformedProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        shortDescription: product.short_description,
        sku: product.sku,
        partNumber: product.part_number,
        price: product.discount_price || product.price,
        originalPrice: product.discount_price ? product.price : null,
        discountPrice: product.discount_price,
        stockQuantity: product.stock_quantity,
        inStock: product.stock_quantity > 0,
        condition: product.condition,
        specifications: product.specifications,
        warrantyInfo: product.warranty_info,
        shipping: product.shipping,
        images: product.product_images || [],
        category: product.categories,
        subcategory: product.subcategories,
        brand: product.brands,
        dealer: product.dealers,
        vehicleCompatibility,
        compatibility: vehicleCompatibility,
        stock_quantity: product.stock_quantity,
        discount_price: product.discount_price,
        part_number: product.part_number,
        image: product.product_images?.[0]?.url || null,
        rating: 4.2,
        review_count: 0,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      };

      const result = { success: true, product: transformedProduct };
      setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Alias for getProductById for backward compatibility
   */
  getProduct: async (productId) => {
    return await ProductService.getProductById(productId);
  },
};

export default ProductService; 