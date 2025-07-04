import supabase from '../supabase/supabaseClient.js';
import { sanitizeProducts, sanitizeProduct } from '../../src/utils/textSanitizer.js';

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

// Enhanced smart search query parser with multi-field support
const parseSearchQuery = (query) => {
  if (!query) return {
    vehicleInfo: {},
    productTerms: [],
    partNumbers: [],
    originalQuery: '',
    hasVehicleInfo: false,
    hasPartNumber: false,
    searchType: 'general'
  };

  const originalQuery = query.toLowerCase().trim();
  const words = originalQuery.split(/\s+/);

  const vehicleInfo = {
    year: '',
    make: '',
    model: ''
  };
  const productTerms = [];
  const partNumbers = [];
  const remainingWords = [...words];

  // Enhanced vehicle make database with better matching
  const vehicleMakes = [
    'toyota', 'honda', 'ford', 'chevrolet', 'chevy', 'nissan', 'bmw', 'mercedes', 'mercedes-benz',
    'audi', 'volkswagen', 'vw', 'hyundai', 'kia', 'subaru', 'mazda', 'mitsubishi', 'lexus',
    'acura', 'infiniti', 'cadillac', 'buick', 'gmc', 'jeep', 'chrysler', 'dodge', 'ram',
    'volvo', 'porsche', 'jaguar', 'land rover', 'mini', 'fiat', 'alfa romeo', 'tesla',
    'lincoln', 'saab', 'scion', 'isuzu', 'suzuki', 'daihatsu', 'geo', 'hummer', 'saturn',
    'pontiac', 'oldsmobile', 'plymouth', 'eagle', 'daewoo', 'smart', 'maybach', 'bentley',
    'rolls royce', 'ferrari', 'lamborghini', 'maserati', 'bugatti', 'koenigsegg', 'pagani'
  ];

  // Common auto parts terms for filtering
  const autoPartTerms = [
    'battery', 'brake', 'brakes', 'pad', 'pads', 'rotor', 'rotors', 'filter', 'filters',
    'oil', 'engine', 'transmission', 'alternator', 'starter', 'radiator', 'coolant',
    'spark', 'plug', 'plugs', 'belt', 'hose', 'pump', 'sensor', 'light', 'headlight',
    'taillight', 'bulb', 'fuse', 'relay', 'switch', 'motor', 'compressor', 'clutch',
    'tire', 'tires', 'wheel', 'wheels', 'suspension', 'shock', 'strut', 'spring',
    'exhaust', 'muffler', 'catalytic', 'converter', 'gasket', 'seal', 'bearing',
    'fluid', 'antifreeze', 'windshield', 'wiper', 'wipers', 'mirror', 'door', 'handle',
    'window', 'glass', 'bumper', 'fender', 'hood', 'trunk', 'grille', 'spoiler',
    'antenna', 'horn', 'siren', 'alarm', 'keychain', 'remote', 'key', 'lock',
    'ignition', 'coil', 'wire', 'cable', 'harness', 'connector', 'terminal', 'fuse',
    'thermostat', 'water', 'power', 'steering', 'rack', 'pinion', 'tie', 'rod',
    'ball', 'joint', 'control', 'arm', 'sway', 'bar', 'link', 'mount', 'bushing'
  ];

  // Extract year (4-digit number between 1990 and current year + 2)
  const currentYear = new Date().getFullYear();
  const yearMatch = remainingWords.find(word => {
    const year = parseInt(word);
    return year >= 1990 && year <= currentYear + 2;
  });

  if (yearMatch) {
    vehicleInfo.year = yearMatch;
    const index = remainingWords.indexOf(yearMatch);
    if (index > -1) remainingWords.splice(index, 1);
  }

  // Extract make with enhanced matching
  const makeMatch = remainingWords.find(word => {
    return vehicleMakes.some(make => {
      // Direct match
      if (make === word) return true;
      // Handle compound makes like "land rover"
      if (make.includes(' ') && originalQuery.includes(make)) return true;
      // Handle abbreviations
      if (make === 'chevrolet' && word === 'chevy') return true;
      if (make === 'volkswagen' && word === 'vw') return true;
      if (make === 'mercedes-benz' && word === 'mercedes') return true;
      return false;
    });
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

  // DYNAMIC MODEL DETECTION - Extract any remaining word that could be a model
  // After removing year, make, and known auto parts, assume remaining significant words are model
  const modelCandidates = remainingWords.filter(word => {
    // Skip if it's a known auto part term
    if (autoPartTerms.includes(word.toLowerCase())) return false;
    
    // Skip very short words (likely not model names)
    if (word.length < 2) return false;
    
    // Skip common words that are not vehicle models
    const skipWords = ['the', 'and', 'or', 'for', 'with', 'in', 'on', 'at', 'to', 'from', 'by', 'of', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'];
    if (skipWords.includes(word.toLowerCase())) return false;
    
    // Skip numbers that aren't years
    if (/^\d+$/.test(word) && (parseInt(word) < 1990 || parseInt(word) > currentYear + 2)) return false;
    
    // This could be a model name
    return true;
  });

  // Take the first model candidate as the model
  // This allows for any model name: corolla, camry, f150, mustang, wrangler, etc.
  if (modelCandidates.length > 0) {
    let detectedModel = modelCandidates[0];
    
    // Apply some common normalizations for known patterns
    if (detectedModel === 'rav4') detectedModel = 'rav-4';
    else if (detectedModel === 'crv') detectedModel = 'cr-v';
    else if (detectedModel === 'hrv') detectedModel = 'hr-v';
    else if (detectedModel === 'chr') detectedModel = 'c-hr';
    else if (detectedModel === 'f150') detectedModel = 'f-150';
    else if (detectedModel === 'f250') detectedModel = 'f-250';
    else if (detectedModel === 'f350') detectedModel = 'f-350';
    
    vehicleInfo.model = detectedModel;
    
    // Remove the detected model from remaining words
    const index = remainingWords.indexOf(modelCandidates[0]);
    if (index > -1) remainingWords.splice(index, 1);
  }

  // Handle part numbers (alphanumeric patterns)
  const partNumberPattern = /^[A-Za-z0-9-]{3,}$/;
  remainingWords.forEach(word => {
    if (partNumberPattern.test(word) && word.length >= 3) {
      partNumbers.push(word);
    } else if (word.length > 1 && !autoPartTerms.includes(word)) {
      // If it's not a part number but also not a common auto part, it might be a product term
      productTerms.push(word);
    } else if (autoPartTerms.includes(word)) {
      // It's a known auto part term
      productTerms.push(word);
    }
  });

  // Determine if we have vehicle info
  const hasVehicleInfo = !!(vehicleInfo.year || vehicleInfo.make || vehicleInfo.model);

  // Determine search type
  let searchType = 'general';
  if (partNumbers.length > 0) {
    searchType = 'part_number';
  } else if (hasVehicleInfo && productTerms.length > 0) {
    searchType = 'vehicle_with_product';
  } else if (hasVehicleInfo) {
    searchType = 'vehicle_compatibility';
  } else if (productTerms.length > 0) {
    searchType = 'product_name';
  }

  return {
    vehicleInfo,
    productTerms,
    partNumbers,
    originalQuery,
    hasVehicleInfo,
    hasPartNumber: partNumbers.length > 0,
    searchType
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
    'audi': ['a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'q3', 'q5', 'q7', 'q8', 'tt', 'r8', 'rs3', 'rs4', 'rs5', 'rs6', 'rs7', 's3', 's4', 's5', 's6', 's7', 's8'],
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

  // If still no compatibility found, generate targeted vehicle compatibility for common parts
  if (compatibility.length === 0) {
    // Check if it's a common part that would have specific vehicle compatibility
    const commonParts = [
      // Filters - generally have specific vehicle applications
      'oil filter', 'air filter', 'cabin filter', 'fuel filter', 'filter',
      // Brakes - vehicle-specific
      'brake pad', 'brake disc', 'brake rotor', 'brake', 'pad', 'rotor',
      // Engine - model-specific
      'spark plug', 'ignition coil', 'alternator', 'plug',
      'starter', 'radiator', 'thermostat', 'water pump',
      // Belts - vehicle-specific
      'timing belt', 'serpentine belt', 'drive belt', 'belt',
      // Suspension - vehicle-specific
      'shock absorber', 'strut', 'tie rod', 'ball joint', 'shock',
      'cv joint', 'wheel bearing', 'hub assembly', 'bearing',
      // Lighting - often vehicle-specific
      'headlight', 'taillight', 'turn signal', 'fog light', 'light', 'bulb'
    ];

    const isCommonPart = commonParts.some(part => text.includes(part));

    if (isCommonPart) {
      // Instead of generating universal compatibility, try to extract any specific vehicle info
      // that might be mentioned in the product name or description
      
      // Look for specific model mentions in the text
      const specificModels = {
        'toyota': ['corolla', 'camry', 'prius', 'rav4', 'highlander', 'sienna', 'tacoma', 'tundra'],
        'honda': ['civic', 'accord', 'cr-v', 'pilot', 'odyssey', 'ridgeline', 'fit', 'hr-v'],
        'ford': ['f-150', 'f-250', 'f-350', 'mustang', 'explorer', 'escape', 'fusion', 'focus'],
        'chevrolet': ['silverado', 'tahoe', 'suburban', 'equinox', 'malibu', 'cruze', 'camaro', 'corvette'],
        'nissan': ['altima', 'sentra', 'rogue', 'pathfinder', 'murano', 'frontier', 'titan', 'versa']
      };

      // Try to find specific vehicle mentions
      let foundSpecific = false;
      for (const [make, models] of Object.entries(specificModels)) {
        for (const model of models) {
          if (text.includes(model)) {
            // Found specific model mention
            foundSpecific = true;
            
            // Add compatibility for years where this model was popular
            const modelYears = getModelYears(make, model);
            modelYears.forEach(year => {
              compatibility.push({
                year: year,
                make: make,
                model: model,
                matchType: 'specific'
              });
            });
            break;
          }
        }
        if (foundSpecific) break;
      }

      // If no specific vehicle found, only add generic compatibility for very universal items
      if (!foundSpecific) {
        const trulyUniversalParts = ['battery', 'oil', 'coolant', 'brake fluid', 'fuse', 'relay'];
        const isTrulyUniversal = trulyUniversalParts.some(part => text.includes(part));
        
        if (isTrulyUniversal) {
          // Add limited, recent-year compatibility for popular makes only
          const popularMakes = ['toyota', 'honda', 'ford', 'chevrolet', 'nissan'];
          const recentYears = ['2020', '2021', '2022', '2023', '2024'];

          popularMakes.forEach(make => {
            recentYears.slice(0, 2).forEach(year => { // Only add 2 recent years
              compatibility.push({
                year: year,
                make: make,
                model: null, // Will be filtered out by the UI unless it has specific model info
                matchType: 'make_year'
              });
            });
          });
        }
      }
    }
  }

  return compatibility;
};

// Helper function to get typical model years for specific vehicles
const getModelYears = (make, model) => {
  // Return years when specific models were commonly available
  const currentYear = new Date().getFullYear();
  const modelGenerations = {
    'toyota': {
      'corolla': ['2020', '2021', '2022', '2023', '2024'],
      'camry': ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      'rav4': ['2019', '2020', '2021', '2022', '2023', '2024'],
      'prius': ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']
    },
    'honda': {
      'civic': ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      'accord': ['2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      'cr-v': ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']
    },
    'ford': {
      'f-150': ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      'mustang': ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024'],
      'explorer': ['2020', '2021', '2022', '2023', '2024']
    }
  };

  return modelGenerations[make]?.[model] || [String(currentYear - 2), String(currentYear - 1), String(currentYear)];
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
      // Reduced logging for performance
      if (filters.vehicle || filters.search) {
        console.log('ProductService: getProducts called with filters:', filters);
      }
      
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
        
        // Vehicle compatibility filter (from VehicleSearchDropdown)
        if (filters.vehicle) {
          const vehicle = filters.vehicle;
          console.log('🚗 Filtering by vehicle:', vehicle);

          const vehicleConditions = [];

          // Simplified vehicle matching using ILIKE to avoid regex syntax errors
          if (vehicle.make) {
            const makeLower = vehicle.make.toLowerCase();
            const makeCapitalized = vehicle.make.charAt(0).toUpperCase() + vehicle.make.slice(1).toLowerCase();

            // Use simple ILIKE patterns instead of complex regex
            vehicleConditions.push(`name ILIKE '%${makeLower}%'`);
            vehicleConditions.push(`name ILIKE '%${makeCapitalized}%'`);
            vehicleConditions.push(`description ILIKE '%${makeLower}%'`);
            vehicleConditions.push(`description ILIKE '%${makeCapitalized}%'`);
            vehicleConditions.push(`compatibility::text ILIKE '%${makeLower}%'`);
            vehicleConditions.push(`compatibility::text ILIKE '%${makeCapitalized}%'`);
          }

          if (vehicle.model) {
            const modelLower = vehicle.model.toLowerCase();
            const modelCapitalized = vehicle.model.charAt(0).toUpperCase() + vehicle.model.slice(1).toLowerCase();

            vehicleConditions.push(`name ILIKE '%${modelLower}%'`);
            vehicleConditions.push(`name ILIKE '%${modelCapitalized}%'`);
            vehicleConditions.push(`description ILIKE '%${modelLower}%'`);
            vehicleConditions.push(`description ILIKE '%${modelCapitalized}%'`);
            vehicleConditions.push(`compatibility::text ILIKE '%${modelLower}%'`);
            vehicleConditions.push(`compatibility::text ILIKE '%${modelCapitalized}%'`);
            
            // Handle common model variations
            if (modelLower === 'rav4') {
              vehicleConditions.push(`name ILIKE '%rav-4%'`);
              vehicleConditions.push(`description ILIKE '%rav-4%'`);
              vehicleConditions.push(`compatibility::text ILIKE '%rav-4%'`);
            } else if (modelLower === 'rav-4') {
              vehicleConditions.push(`name ILIKE '%rav4%'`);
              vehicleConditions.push(`description ILIKE '%rav4%'`);
              vehicleConditions.push(`compatibility::text ILIKE '%rav4%'`);
            }
          }

          if (vehicle.year) {
            vehicleConditions.push(`name ILIKE '%${vehicle.year}%'`);
            vehicleConditions.push(`description ILIKE '%${vehicle.year}%'`);
            vehicleConditions.push(`compatibility::text ILIKE '%${vehicle.year}%'`);
          }

          if (vehicleConditions.length > 0) {
            q = q.or(vehicleConditions.join(','));
            console.log('🔍 Vehicle filter conditions applied:', vehicleConditions.length, 'conditions for', vehicle);
          }
        }

        // Enhanced multi-field search functionality with vehicle compatibility priority
        if (filters.search) {
          const parsed = parseSearchQuery(filters.search);
          const searchConditions = [];

          console.log('🔍 Parsed search:', parsed); // Enable for debugging vehicle searches

          // Priority 1: Part number search (highest priority for exact matches)
          if (parsed.hasPartNumber) {
            parsed.partNumbers.forEach(partNum => {
              // Exact match gets highest priority
              searchConditions.push(`part_number.ilike.${partNum}`);
              searchConditions.push(`sku.ilike.${partNum}`);
              // Partial matches for flexibility
              searchConditions.push(`part_number.ilike.%${partNum}%`);
              searchConditions.push(`sku.ilike.%${partNum}%`);
              // Also search in name and description for part numbers
              searchConditions.push(`name.ilike.%${partNum}%`);
              searchConditions.push(`description.ilike.%${partNum}%`);
            });
          }

          // Priority 2: Enhanced Vehicle compatibility search (MOST IMPORTANT)
          if (parsed.hasVehicleInfo) {
            const { vehicleInfo } = parsed;

            // Use correct PostgREST format - separate JSONB compatibility searches
            if (vehicleInfo.year) {
              // For JSONB compatibility field, use cs (contains) operator AND text search as fallback
              searchConditions.push(`compatibility.cs.{"year":"${vehicleInfo.year}"}`);
              searchConditions.push(`compatibility.cs.{"year":${vehicleInfo.year}}`); // Also try numeric
              searchConditions.push(`name.ilike.%${vehicleInfo.year}%`);
              searchConditions.push(`description.ilike.%${vehicleInfo.year}%`);
            }
            
            if (vehicleInfo.make) {
              const makeLower = vehicleInfo.make.toLowerCase();
              const makeCapitalized = vehicleInfo.make.charAt(0).toUpperCase() + vehicleInfo.make.slice(1);
              
              // Use JSONB contains operator for compatibility, ilike for text fields
              searchConditions.push(`compatibility.cs.{"make":"${makeLower}"}`);
              searchConditions.push(`compatibility.cs.{"make":"${makeCapitalized}"}`);
              searchConditions.push(`name.ilike.%${makeLower}%`);
              searchConditions.push(`name.ilike.%${makeCapitalized}%`);
              searchConditions.push(`description.ilike.%${makeLower}%`);
              searchConditions.push(`description.ilike.%${makeCapitalized}%`);
            }
            
            if (vehicleInfo.model) {
              const modelLower = vehicleInfo.model.toLowerCase();
              const modelCapitalized = vehicleInfo.model.charAt(0).toUpperCase() + vehicleInfo.model.slice(1);
              
              // Handle common model variations more efficiently
              const modelVariations = [modelLower, modelCapitalized];
              
              // Add hyphenated/non-hyphenated variations for common models
              if (modelLower === 'rav4') {
                modelVariations.push('rav-4');
              } else if (modelLower === 'rav-4') {
                modelVariations.push('rav4');
              } else if (modelLower === 'crv') {
                modelVariations.push('cr-v');
              } else if (modelLower === 'cr-v') {
                modelVariations.push('crv');
              }
              
              // Use JSONB contains for compatibility, ilike for text fields
              modelVariations.slice(0, 3).forEach(variation => { // Limit to 3 to avoid too many conditions
                searchConditions.push(`compatibility.cs.{"model":"${variation}"}`);
                searchConditions.push(`name.ilike.%${variation}%`);
                searchConditions.push(`description.ilike.%${variation}%`);
              });
            }
          }

          // Priority 3: Product name/term search
          if (parsed.productTerms.length > 0) {
            parsed.productTerms.forEach(term => {
              if (term !== 'parts' && term !== 'accessories') {
                searchConditions.push(`name.ilike.%${term}%`);
                searchConditions.push(`description.ilike.%${term}%`);
                searchConditions.push(`short_description.ilike.%${term}%`);
                // Don't duplicate part_number search if we already have part numbers
                if (!parsed.hasPartNumber) {
                  searchConditions.push(`part_number.ilike.%${term}%`);
                  searchConditions.push(`sku.ilike.%${term}%`);
                }
              }
            });
          }

          // Fallback: If no specific parsing worked, do comprehensive search
          if (searchConditions.length === 0) {
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

      // Pagination - default to showing more products
      const limit = filters.limit || 50; // Default to 50 products if no limit specified
      if (filters.page) {
        const start = (filters.page - 1) * limit;
        const end = start + limit - 1;
        query = query.range(start, end);
      } else {
        query = query.limit(limit);
      }

      // Execute in parallel
      const [{ data: products, error: productsError }, { count, error: countError }] = await Promise.all([
        query,
        countQuery
      ]);

      // If vehicle search returns no results, try a broader search
      let fallbackProducts = null;
      let fallbackCount = 0;
      if (filters.vehicle && (!products || products.length === 0) && filters.search) {
        console.log('🔄 Vehicle search returned no results, trying broader search...');

        // Create a fallback query without vehicle filter but with search term
        const fallbackFilters = { ...filters };
        delete fallbackFilters.vehicle;

        const fallbackQuery = supabase
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

        const fallbackCountQuery = supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Apply basic filters without vehicle
        const applyBasicFilters = (q) => {
          q = q.eq('status', 'approved').eq('is_active', true);

          if (fallbackFilters.search) {
            const searchTerm = fallbackFilters.search.toLowerCase();
            q = q.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,part_number.ilike.%${searchTerm}%`);
          }

          return q;
        };

        const fallbackQueryWithFilters = applyBasicFilters(fallbackQuery);
        const fallbackCountQueryWithFilters = applyBasicFilters(fallbackCountQuery);

        // Add pagination
        if (fallbackFilters.page && fallbackFilters.limit) {
          const start = (fallbackFilters.page - 1) * fallbackFilters.limit;
          const end = start + fallbackFilters.limit - 1;
          fallbackQueryWithFilters.range(start, end);
        }

        const [{ data: fallbackData, error: fallbackError }, { count: fallbackCountData, error: fallbackCountError }] = await Promise.all([
          fallbackQueryWithFilters,
          fallbackCountQueryWithFilters
        ]);

        if (!fallbackError && fallbackData && fallbackData.length > 0) {
          fallbackProducts = fallbackData;
          fallbackCount = fallbackCountData || 0;
          console.log(`🔄 Fallback search found ${fallbackProducts.length} products`);
        }
      }

      if (productsError || countError) {
        // If main query failed but we have fallback results, use them
        if (fallbackProducts && fallbackProducts.length > 0) {
          console.log('🔄 Using fallback results due to main query error');
        } else {
          throw productsError || countError;
        }
      }

      // Use fallback results if main query returned no results
      const finalProducts = (products && products.length > 0) ? products : (fallbackProducts || []);
      const finalCount = (products && products.length > 0) ? count : fallbackCount;

      if (!finalProducts || finalProducts.length === 0) {
        console.log('No products found');
        return { success: true, products: [], count: 0, totalCount: 0 };
      }

      // Enhanced transformation with real schema and vehicle compatibility
      const transformedData = finalProducts.map(product => {
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
        
        // Calculate enhanced relevance score for multi-field search results
        let relevanceScore = 1.0;

        if (filters.search) {
          const parsed = parseSearchQuery(filters.search);
          const productName = (product.name || '').toLowerCase();
          const productDesc = (product.description || '').toLowerCase();
          const productShortDesc = (product.short_description || '').toLowerCase();
          const productSku = (product.sku || '').toLowerCase();
          const productPartNumber = (product.part_number || '').toLowerCase();

          // Priority 1: Part number scoring (highest relevance)
          if (parsed.hasPartNumber) {
            parsed.partNumbers.forEach(partNum => {
              const partNumLower = partNum.toLowerCase();

              // Exact matches get maximum score
              if (productPartNumber === partNumLower) relevanceScore += 15.0;
              else if (productSku === partNumLower) relevanceScore += 12.0;

              // Partial matches get good scores
              else if (productPartNumber.includes(partNumLower)) relevanceScore += 8.0;
              else if (productSku.includes(partNumLower)) relevanceScore += 6.0;
              else if (productName.includes(partNumLower)) relevanceScore += 4.0;
              else if (productDesc.includes(partNumLower)) relevanceScore += 2.0;
            });
          }

          // Priority 2: Vehicle compatibility scoring
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

            // Add vehicle compatibility scoring from database
            const compatibilityScore = calculateVehicleCompatibilityScore(
              { ...product, vehicleCompatibility },
              filters.search
            );
            relevanceScore += compatibilityScore;
          }

          // Priority 3: Product name/term scoring
          if (parsed.productTerms.length > 0) {
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

          // Fallback: General text matching if no specific parsing
          if (!parsed.hasPartNumber && !parsed.hasVehicleInfo && parsed.productTerms.length === 0) {
            const searchTerm = filters.search.toLowerCase();
            if (productName.includes(searchTerm)) relevanceScore += 2.0;
            if (productDesc.includes(searchTerm)) relevanceScore += 1.0;
            if (productShortDesc.includes(searchTerm)) relevanceScore += 1.5;
            if (productSku.includes(searchTerm)) relevanceScore += 1.5;
            if (productPartNumber.includes(searchTerm)) relevanceScore += 1.5;
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

      // Sanitize product text content to remove eBay references and unprofessional language
      const sanitizedProducts = sanitizeProducts(transformedData);

      const result = {
        success: true,
        products: sanitizedProducts,
        count: finalCount || 0,
        totalCount: finalCount || 0, // Add totalCount for compatibility
        hasMore: filters.limit ? sanitizedProducts.length === filters.limit : false,
        filters: {
          applied: filters,
          parsed: filters.search ? parseSearchQuery(filters.search) : null
        }
      };

      setCache(cacheKey, result);
      // Reduced logging for performance
      if (filters.vehicle || filters.search) {
        console.log('ProductService: Returning', transformedData.length, 'products, total:', finalCount);
      }

      // Debug logging for vehicle searches
      if (filters.vehicle) {
        console.log('🚗 Vehicle search results:', {
          vehicle: filters.vehicle,
          totalFound: finalCount,
          productsReturned: transformedData.length,
          usedFallback: finalProducts === fallbackProducts,
          sampleProducts: transformedData.slice(0, 3).map(p => ({
            name: p.name,
            sku: p.sku,
            compatibility: p.compatibility
          }))
        });
      }

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
          product_images(*)
        `)
        .eq('id', productId)
        .eq('status', 'approved')
        .eq('is_active', true)
        .single();

      if (error) throw error;
      if (!product) return { success: false, error: 'Product not found' };

      // Fetch dealer information from profiles table using dealer_id
      let dealerInfo = null;
      if (product.dealer_id) {
        try {
          const { data: dealer, error: dealerError } = await supabase
            .from('profiles')
            .select(`
              id,
              company_name,
              full_name,
              email,
              city,
              state,
              verification_status
            `)
            .eq('id', product.dealer_id)
            .single();

          if (!dealerError && dealer) {
            dealerInfo = dealer;
          }
        } catch (dealerErr) {
          console.log('Could not fetch dealer info from profiles:', dealerErr);
        }
      }

      // Ensure compatibility data exists - always regenerate for better accuracy
      let vehicleCompatibility = [];

      // Always generate fresh compatibility data
      vehicleCompatibility = getVehicleCompatibility(product.name, product.description);

      // If we have existing compatibility data, merge it with generated data
      if (product.compatibility) {
        const existingCompatibility = Array.isArray(product.compatibility)
          ? product.compatibility
          : [product.compatibility];

        // Combine existing and generated data, removing duplicates
        const combined = [...existingCompatibility, ...vehicleCompatibility];
        const uniqueCompatibility = combined.filter((item, index, self) =>
          index === self.findIndex(t =>
            t.year === item.year && t.make === item.make && t.model === item.model
          )
        );
        vehicleCompatibility = uniqueCompatibility;
      }

      // Save updated compatibility data if we have any
      if (vehicleCompatibility.length > 0) {
        await ProductService.updateProductCompatibility(productId, vehicleCompatibility);
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
        dealer: dealerInfo,
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

      // Sanitize product text content to remove eBay references and unprofessional language
      const sanitizedProduct = sanitizeProduct(transformedProduct);

      const result = { success: true, product: sanitizedProduct };
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