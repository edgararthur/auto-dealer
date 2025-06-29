import supabase from '../supabase/supabaseClient.js';

// Enhanced cache for vehicle data with longer duration
const cache = new Map();
const cacheExpiry = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes for vehicle data
const LONG_CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours for static vehicle data

// Performance tracking
const vehicleMetrics = {
  searchCount: 0,
  cacheHits: 0,
  avgResponseTime: 0
};

const isCacheValid = (key) => {
  const expiry = cacheExpiry.get(key);
  return expiry && Date.now() < expiry;
};

const setCache = (key, data, duration = CACHE_DURATION) => {
  cache.set(key, data);
  cacheExpiry.set(key, Date.now() + duration);
};

const getCache = (key) => {
  if (isCacheValid(key)) {
    vehicleMetrics.cacheHits++;
    return cache.get(key);
  }
  cache.delete(key);
  cacheExpiry.delete(key);
  return null;
};

/**
 * Enhanced Service for managing vehicle data and fitment checking
 */
const VehicleService = {
  /**
   * ENHANCED: Get all vehicle makes with year ranges and model counts
   */
  getMakes: async (tenantId = null) => {
    try {
      const cacheKey = `makes_${tenantId || 'default'}`;
      const cached = getCache(cacheKey);
      if (cached) return cached;

      // In production, this would come from a comprehensive vehicles database
      // For now, using an enhanced static list with additional data
      const makes = [
        { 
          id: 1, 
          name: 'Toyota', 
          slug: 'toyota',
          logo: '/brands/toyota-logo.png',
          yearRange: { min: 1970, max: 2024 },
          modelCount: 45,
          popular: true,
          description: 'Reliable Japanese automotive manufacturer'
        },
        { 
          id: 2, 
          name: 'Honda', 
          slug: 'honda',
          logo: '/brands/honda-logo.png',
          yearRange: { min: 1975, max: 2024 },
          modelCount: 32,
          popular: true,
          description: 'Innovative and fuel-efficient vehicles'
        },
        { 
          id: 3, 
          name: 'Nissan', 
          slug: 'nissan',
          logo: '/brands/nissan-logo.png',
          yearRange: { min: 1970, max: 2024 },
          modelCount: 28,
          popular: true,
          description: 'Innovation that excites'
        },
        { 
          id: 4, 
          name: 'Mercedes-Benz', 
          slug: 'mercedes-benz',
          logo: '/brands/mercedes-logo.png',
          yearRange: { min: 1960, max: 2024 },
          modelCount: 38,
          popular: true,
          description: 'Luxury and performance combined'
        },
        { 
          id: 5, 
          name: 'BMW', 
          slug: 'bmw',
          logo: '/brands/bmw-logo.png',
          yearRange: { min: 1965, max: 2024 },
          modelCount: 42,
          popular: true,
          description: 'The ultimate driving machine'
        },
        { 
          id: 6, 
          name: 'Audi', 
          slug: 'audi',
          logo: '/brands/audi-logo.png',
          yearRange: { min: 1970, max: 2024 },
          modelCount: 35,
          popular: true,
          description: 'Vorsprung durch Technik'
        },
        { 
          id: 7, 
          name: 'Volkswagen', 
          slug: 'volkswagen',
          logo: '/brands/vw-logo.png',
          yearRange: { min: 1965, max: 2024 },
          modelCount: 30,
          popular: true,
          description: 'Das Auto'
        },
        { 
          id: 8, 
          name: 'Ford', 
          slug: 'ford',
          logo: '/brands/ford-logo.png',
          yearRange: { min: 1950, max: 2024 },
          modelCount: 48,
          popular: true,
          description: 'Built Ford Tough'
        },
        { 
          id: 9, 
          name: 'Chevrolet', 
          slug: 'chevrolet',
          logo: '/brands/chevrolet-logo.png',
          yearRange: { min: 1950, max: 2024 },
          modelCount: 52,
          popular: true,
          description: 'Find New Roads'
        },
        { 
          id: 10, 
          name: 'Hyundai', 
          slug: 'hyundai',
          logo: '/brands/hyundai-logo.png',
          yearRange: { min: 1985, max: 2024 },
          modelCount: 25,
          popular: true,
          description: 'New Thinking. New Possibilities.'
        },
        { 
          id: 11, 
          name: 'Kia', 
          slug: 'kia',
          logo: '/brands/kia-logo.png',
          yearRange: { min: 1990, max: 2024 },
          modelCount: 22,
          popular: false,
          description: 'The Power to Surprise'
        },
        { 
          id: 12, 
          name: 'Mazda', 
          slug: 'mazda',
          logo: '/brands/mazda-logo.png',
          yearRange: { min: 1975, max: 2024 },
          modelCount: 18,
          popular: false,
          description: 'Zoom-Zoom'
        },
        { 
          id: 13, 
          name: 'Subaru', 
          slug: 'subaru',
          logo: '/brands/subaru-logo.png',
          yearRange: { min: 1975, max: 2024 },
          modelCount: 15,
          popular: false,
          description: 'Confidence in Motion'
        },
        { 
          id: 14, 
          name: 'Lexus', 
          slug: 'lexus',
          logo: '/brands/lexus-logo.png',
          yearRange: { min: 1990, max: 2024 },
          modelCount: 20,
          popular: false,
          description: 'The Relentless Pursuit of Perfection'
        },
        { 
          id: 15, 
          name: 'Acura', 
          slug: 'acura',
          logo: '/brands/acura-logo.png',
          yearRange: { min: 1986, max: 2024 },
          modelCount: 12,
          popular: false,
          description: 'Precision Crafted Performance'
        },
        { 
          id: 16, 
          name: 'Infiniti', 
          slug: 'infiniti',
          logo: '/brands/infiniti-logo.png',
          yearRange: { min: 1989, max: 2024 },
          modelCount: 14,
          popular: false,
          description: 'Empower the Drive'
        },
        { 
          id: 17, 
          name: 'Volvo', 
          slug: 'volvo',
          logo: '/brands/volvo-logo.png',
          yearRange: { min: 1960, max: 2024 },
          modelCount: 16,
          popular: false,
          description: 'For Life'
        },
        { 
          id: 18, 
          name: 'Jaguar', 
          slug: 'jaguar',
          logo: '/brands/jaguar-logo.png',
          yearRange: { min: 1970, max: 2024 },
          modelCount: 12,
          popular: false,
          description: 'Grace, Space, Pace'
        },
        { 
          id: 19, 
          name: 'Land Rover', 
          slug: 'land-rover',
          logo: '/brands/landrover-logo.png',
          yearRange: { min: 1970, max: 2024 },
          modelCount: 10,
          popular: false,
          description: 'Above and Beyond'
        },
        { 
          id: 20, 
          name: 'Porsche', 
          slug: 'porsche',
          logo: '/brands/porsche-logo.png',
          yearRange: { min: 1970, max: 2024 },
          modelCount: 18,
          popular: false,
          description: 'There is no substitute'
        },
        // Additional makes for comprehensive coverage
        { id: 21, name: 'Mitsubishi', slug: 'mitsubishi', yearRange: { min: 1980, max: 2024 }, modelCount: 12, popular: false },
        { id: 22, name: 'Suzuki', slug: 'suzuki', yearRange: { min: 1980, max: 2024 }, modelCount: 15, popular: false },
        { id: 23, name: 'Isuzu', slug: 'isuzu', yearRange: { min: 1980, max: 2024 }, modelCount: 8, popular: false },
        { id: 24, name: 'Peugeot', slug: 'peugeot', yearRange: { min: 1970, max: 2024 }, modelCount: 20, popular: false },
        { id: 25, name: 'Renault', slug: 'renault', yearRange: { min: 1970, max: 2024 }, modelCount: 18, popular: false },
        { id: 26, name: 'Citroën', slug: 'citroen', yearRange: { min: 1970, max: 2024 }, modelCount: 16, popular: false },
        { id: 27, name: 'Fiat', slug: 'fiat', yearRange: { min: 1970, max: 2024 }, modelCount: 14, popular: false },
        { id: 28, name: 'Alfa Romeo', slug: 'alfa-romeo', yearRange: { min: 1970, max: 2024 }, modelCount: 10, popular: false },
        { id: 29, name: 'Skoda', slug: 'skoda', yearRange: { min: 1990, max: 2024 }, modelCount: 12, popular: false },
        { id: 30, name: 'SEAT', slug: 'seat', yearRange: { min: 1985, max: 2024 }, modelCount: 10, popular: false },
        { id: 31, name: 'Buick', slug: 'buick', yearRange: { min: 1950, max: 2024 }, modelCount: 15, popular: false },
        { id: 32, name: 'Cadillac', slug: 'cadillac', yearRange: { min: 1950, max: 2024 }, modelCount: 18, popular: false },
        { id: 33, name: 'GMC', slug: 'gmc', yearRange: { min: 1960, max: 2024 }, modelCount: 20, popular: false },
        { id: 34, name: 'Jeep', slug: 'jeep', yearRange: { min: 1950, max: 2024 }, modelCount: 12, popular: false },
        { id: 35, name: 'Ram', slug: 'ram', yearRange: { min: 2010, max: 2024 }, modelCount: 8, popular: false },
        { id: 36, name: 'Chrysler', slug: 'chrysler', yearRange: { min: 1960, max: 2024 }, modelCount: 8, popular: false },
        { id: 37, name: 'Dodge', slug: 'dodge', yearRange: { min: 1960, max: 2024 }, modelCount: 15, popular: false },
        { id: 38, name: 'Lincoln', slug: 'lincoln', yearRange: { min: 1960, max: 2024 }, modelCount: 10, popular: false },
        { id: 39, name: 'Tesla', slug: 'tesla', yearRange: { min: 2008, max: 2024 }, modelCount: 8, popular: true },
        { id: 40, name: 'Genesis', slug: 'genesis', yearRange: { min: 2015, max: 2024 }, modelCount: 6, popular: false }
      ];

      // Sort by popularity and name
      const sortedMakes = makes.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.name.localeCompare(b.name);
      });

      const result = { success: true, makes: sortedMakes };
      setCache(cacheKey, result, LONG_CACHE_DURATION);
      return result;

    } catch (error) {
      console.error('Error in getMakes:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * ENHANCED: Get models for a specific make with comprehensive data
   */
  getModels: async (make, tenantId = null) => {
    try {
      const cacheKey = `models_${make}_${tenantId || 'default'}`;
      const cached = getCache(cacheKey);
      if (cached) return cached;

      // Enhanced models with additional metadata
      const modelsByMake = {
        'Toyota': [
          { id: 1, name: 'Corolla', slug: 'corolla', type: 'Sedan', yearRange: { min: 1970, max: 2024 }, popular: true, category: 'Compact' },
          { id: 2, name: 'Camry', slug: 'camry', type: 'Sedan', yearRange: { min: 1982, max: 2024 }, popular: true, category: 'Midsize' },
          { id: 3, name: 'RAV4', slug: 'rav4', type: 'SUV', yearRange: { min: 1996, max: 2024 }, popular: true, category: 'Compact SUV' },
          { id: 4, name: 'Prius', slug: 'prius', type: 'Hatchback', yearRange: { min: 2001, max: 2024 }, popular: true, category: 'Hybrid' },
          { id: 5, name: 'Highlander', slug: 'highlander', type: 'SUV', yearRange: { min: 2001, max: 2024 }, popular: true, category: 'Midsize SUV' },
          { id: 6, name: 'Tacoma', slug: 'tacoma', type: 'Truck', yearRange: { min: 1995, max: 2024 }, popular: true, category: 'Compact Truck' },
          { id: 7, name: 'Tundra', slug: 'tundra', type: 'Truck', yearRange: { min: 2000, max: 2024 }, popular: false, category: 'Full-size Truck' },
          { id: 8, name: 'Sienna', slug: 'sienna', type: 'Van', yearRange: { min: 1998, max: 2024 }, popular: false, category: 'Minivan' },
          { id: 9, name: 'Avalon', slug: 'avalon', type: 'Sedan', yearRange: { min: 1995, max: 2022 }, popular: false, category: 'Full-size' },
          { id: 10, name: 'Yaris', slug: 'yaris', type: 'Hatchback', yearRange: { min: 2007, max: 2020 }, popular: false, category: 'Subcompact' },
          { id: 11, name: 'Land Cruiser', slug: 'land-cruiser', type: 'SUV', yearRange: { min: 1970, max: 2021 }, popular: false, category: 'Full-size SUV' },
          { id: 12, name: '4Runner', slug: '4runner', type: 'SUV', yearRange: { min: 1984, max: 2024 }, popular: false, category: 'Midsize SUV' },
          { id: 13, name: 'C-HR', slug: 'c-hr', type: 'SUV', yearRange: { min: 2018, max: 2024 }, popular: false, category: 'Compact SUV' },
          { id: 14, name: 'Venza', slug: 'venza', type: 'SUV', yearRange: { min: 2021, max: 2024 }, popular: false, category: 'Midsize SUV' }
        ],
        'Honda': [
          { id: 1, name: 'Civic', slug: 'civic', type: 'Sedan', yearRange: { min: 1975, max: 2024 }, popular: true, category: 'Compact' },
          { id: 2, name: 'Accord', slug: 'accord', type: 'Sedan', yearRange: { min: 1976, max: 2024 }, popular: true, category: 'Midsize' },
          { id: 3, name: 'CR-V', slug: 'cr-v', type: 'SUV', yearRange: { min: 1997, max: 2024 }, popular: true, category: 'Compact SUV' },
          { id: 4, name: 'Pilot', slug: 'pilot', type: 'SUV', yearRange: { min: 2003, max: 2024 }, popular: true, category: 'Midsize SUV' },
          { id: 5, name: 'Fit', slug: 'fit', type: 'Hatchback', yearRange: { min: 2009, max: 2020 }, popular: false, category: 'Subcompact' },
          { id: 6, name: 'HR-V', slug: 'hr-v', type: 'SUV', yearRange: { min: 2016, max: 2024 }, popular: false, category: 'Subcompact SUV' },
          { id: 7, name: 'Odyssey', slug: 'odyssey', type: 'Van', yearRange: { min: 1995, max: 2024 }, popular: false, category: 'Minivan' },
          { id: 8, name: 'Passport', slug: 'passport', type: 'SUV', yearRange: { min: 2019, max: 2024 }, popular: false, category: 'Midsize SUV' },
          { id: 9, name: 'Ridgeline', slug: 'ridgeline', type: 'Truck', yearRange: { min: 2006, max: 2024 }, popular: false, category: 'Midsize Truck' },
          { id: 10, name: 'Insight', slug: 'insight', type: 'Sedan', yearRange: { min: 2019, max: 2022 }, popular: false, category: 'Hybrid' }
        ],
        'Nissan': [
          { id: 1, name: 'Altima', slug: 'altima', type: 'Sedan', yearRange: { min: 1993, max: 2024 }, popular: true, category: 'Midsize' },
          { id: 2, name: 'Sentra', slug: 'sentra', type: 'Sedan', yearRange: { min: 1982, max: 2024 }, popular: true, category: 'Compact' },
          { id: 3, name: 'Rogue', slug: 'rogue', type: 'SUV', yearRange: { min: 2008, max: 2024 }, popular: true, category: 'Compact SUV' },
          { id: 4, name: 'Pathfinder', slug: 'pathfinder', type: 'SUV', yearRange: { min: 1987, max: 2024 }, popular: true, category: 'Midsize SUV' },
          { id: 5, name: 'Murano', slug: 'murano', type: 'SUV', yearRange: { min: 2003, max: 2024 }, popular: false, category: 'Midsize SUV' },
          { id: 6, name: 'Frontier', slug: 'frontier', type: 'Truck', yearRange: { min: 1998, max: 2024 }, popular: false, category: 'Compact Truck' },
          { id: 7, name: 'Titan', slug: 'titan', type: 'Truck', yearRange: { min: 2004, max: 2024 }, popular: false, category: 'Full-size Truck' },
          { id: 8, name: 'Versa', slug: 'versa', type: 'Sedan', yearRange: { min: 2007, max: 2024 }, popular: false, category: 'Subcompact' },
          { id: 9, name: 'Armada', slug: 'armada', type: 'SUV', yearRange: { min: 2004, max: 2024 }, popular: false, category: 'Full-size SUV' },
          { id: 10, name: 'Leaf', slug: 'leaf', type: 'Hatchback', yearRange: { min: 2011, max: 2024 }, popular: false, category: 'Electric' }
        ],
        'Mercedes-Benz': [
          { id: 1, name: 'C-Class', slug: 'c-class', type: 'Sedan', yearRange: { min: 1993, max: 2024 }, popular: true, category: 'Luxury Compact' },
          { id: 2, name: 'E-Class', slug: 'e-class', type: 'Sedan', yearRange: { min: 1985, max: 2024 }, popular: true, category: 'Luxury Midsize' },
          { id: 3, name: 'S-Class', slug: 's-class', type: 'Sedan', yearRange: { min: 1972, max: 2024 }, popular: true, category: 'Luxury Full-size' },
          { id: 4, name: 'GLC', slug: 'glc', type: 'SUV', yearRange: { min: 2016, max: 2024 }, popular: true, category: 'Luxury Compact SUV' },
          { id: 5, name: 'GLE', slug: 'gle', type: 'SUV', yearRange: { min: 2016, max: 2024 }, popular: true, category: 'Luxury Midsize SUV' },
          { id: 6, name: 'GLS', slug: 'gls', type: 'SUV', yearRange: { min: 2017, max: 2024 }, popular: false, category: 'Luxury Full-size SUV' },
          { id: 7, name: 'A-Class', slug: 'a-class', type: 'Sedan', yearRange: { min: 2019, max: 2024 }, popular: false, category: 'Luxury Subcompact' },
          { id: 8, name: 'CLA', slug: 'cla', type: 'Sedan', yearRange: { min: 2014, max: 2024 }, popular: false, category: 'Luxury Compact' },
          { id: 9, name: 'GLA', slug: 'gla', type: 'SUV', yearRange: { min: 2015, max: 2024 }, popular: false, category: 'Luxury Subcompact SUV' },
          { id: 10, name: 'GLB', slug: 'glb', type: 'SUV', yearRange: { min: 2020, max: 2024 }, popular: false, category: 'Luxury Compact SUV' }
        ],
        'BMW': [
          { id: 1, name: '3 Series', slug: '3-series', type: 'Sedan', yearRange: { min: 1975, max: 2024 }, popular: true, category: 'Luxury Sport' },
          { id: 2, name: '5 Series', slug: '5-series', type: 'Sedan', yearRange: { min: 1972, max: 2024 }, popular: true, category: 'Luxury Midsize' },
          { id: 3, name: '7 Series', slug: '7-series', type: 'Sedan', yearRange: { min: 1977, max: 2024 }, popular: false, category: 'Luxury Full-size' },
          { id: 4, name: 'X3', slug: 'x3', type: 'SUV', yearRange: { min: 2004, max: 2024 }, popular: true, category: 'Luxury Compact SUV' },
          { id: 5, name: 'X5', slug: 'x5', type: 'SUV', yearRange: { min: 2000, max: 2024 }, popular: true, category: 'Luxury Midsize SUV' },
          { id: 6, name: 'X7', slug: 'x7', type: 'SUV', yearRange: { min: 2019, max: 2024 }, popular: false, category: 'Luxury Full-size SUV' },
          { id: 7, name: '1 Series', slug: '1-series', type: 'Hatchback', yearRange: { min: 2008, max: 2013 }, popular: false, category: 'Luxury Compact' },
          { id: 8, name: '2 Series', slug: '2-series', type: 'Coupe', yearRange: { min: 2014, max: 2024 }, popular: false, category: 'Luxury Sport' },
          { id: 9, name: 'X1', slug: 'x1', type: 'SUV', yearRange: { min: 2013, max: 2024 }, popular: false, category: 'Luxury Subcompact SUV' },
          { id: 10, name: 'X4', slug: 'x4', type: 'SUV', yearRange: { min: 2015, max: 2024 }, popular: false, category: 'Luxury Compact SUV' },
          { id: 11, name: 'X6', slug: 'x6', type: 'SUV', yearRange: { min: 2008, max: 2024 }, popular: false, category: 'Luxury Midsize SUV' }
        ],
        'Ford': [
          { id: 1, name: 'F-150', slug: 'f-150', type: 'Truck', yearRange: { min: 1975, max: 2024 }, popular: true, category: 'Full-size Truck' },
          { id: 2, name: 'Focus', slug: 'focus', type: 'Hatchback', yearRange: { min: 2000, max: 2018 }, popular: false, category: 'Compact' },
          { id: 3, name: 'Fusion', slug: 'fusion', type: 'Sedan', yearRange: { min: 2006, max: 2020 }, popular: false, category: 'Midsize' },
          { id: 4, name: 'Escape', slug: 'escape', type: 'SUV', yearRange: { min: 2001, max: 2024 }, popular: true, category: 'Compact SUV' },
          { id: 5, name: 'Explorer', slug: 'explorer', type: 'SUV', yearRange: { min: 1991, max: 2024 }, popular: true, category: 'Midsize SUV' },
          { id: 6, name: 'Expedition', slug: 'expedition', type: 'SUV', yearRange: { min: 1997, max: 2024 }, popular: false, category: 'Full-size SUV' },
          { id: 7, name: 'Mustang', slug: 'mustang', type: 'Coupe', yearRange: { min: 1965, max: 2024 }, popular: true, category: 'Sports Car' },
          { id: 8, name: 'Fiesta', slug: 'fiesta', type: 'Hatchback', yearRange: { min: 2011, max: 2019 }, popular: false, category: 'Subcompact' },
          { id: 9, name: 'Edge', slug: 'edge', type: 'SUV', yearRange: { min: 2007, max: 2021 }, popular: false, category: 'Midsize SUV' },
          { id: 10, name: 'Ranger', slug: 'ranger', type: 'Truck', yearRange: { min: 1983, max: 2024 }, popular: true, category: 'Compact Truck' },
          { id: 11, name: 'Bronco', slug: 'bronco', type: 'SUV', yearRange: { min: 2021, max: 2024 }, popular: true, category: 'Midsize SUV' },
          { id: 12, name: 'EcoSport', slug: 'ecosport', type: 'SUV', yearRange: { min: 2018, max: 2022 }, popular: false, category: 'Subcompact SUV' }
        ],
        'Hyundai': [
          { id: 1, name: 'Elantra', slug: 'elantra', type: 'Sedan', yearRange: { min: 1990, max: 2024 }, popular: true, category: 'Compact' },
          { id: 2, name: 'Sonata', slug: 'sonata', type: 'Sedan', yearRange: { min: 1985, max: 2024 }, popular: true, category: 'Midsize' },
          { id: 3, name: 'Tucson', slug: 'tucson', type: 'SUV', yearRange: { min: 2005, max: 2024 }, popular: true, category: 'Compact SUV' },
          { id: 4, name: 'Santa Fe', slug: 'santa-fe', type: 'SUV', yearRange: { min: 2001, max: 2024 }, popular: true, category: 'Midsize SUV' },
          { id: 5, name: 'Accent', slug: 'accent', type: 'Sedan', yearRange: { min: 1995, max: 2024 }, popular: false, category: 'Subcompact' },
          { id: 6, name: 'Kona', slug: 'kona', type: 'SUV', yearRange: { min: 2018, max: 2024 }, popular: false, category: 'Subcompact SUV' },
          { id: 7, name: 'Palisade', slug: 'palisade', type: 'SUV', yearRange: { min: 2020, max: 2024 }, popular: true, category: 'Midsize SUV' },
          { id: 8, name: 'Veloster', slug: 'veloster', type: 'Hatchback', yearRange: { min: 2012, max: 2022 }, popular: false, category: 'Sports Compact' },
          { id: 9, name: 'Ioniq', slug: 'ioniq', type: 'Hatchback', yearRange: { min: 2017, max: 2022 }, popular: false, category: 'Hybrid' },
          { id: 10, name: 'Genesis', slug: 'genesis', type: 'Sedan', yearRange: { min: 2009, max: 2016 }, popular: false, category: 'Luxury' }
        ]
      };

      const models = modelsByMake[make] || [];
      
      // Sort by popularity and name
      const sortedModels = models.sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        return a.name.localeCompare(b.name);
      });

      const result = { success: true, models: sortedModels };
      setCache(cacheKey, result, LONG_CACHE_DURATION);
      return result;

    } catch (error) {
      console.error('Error in getModels:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * ENHANCED: Get years for a specific make and model
   */
  getYears: async (make, model, tenantId = null) => {
    try {
      const cacheKey = `years_${make}_${model}_${tenantId || 'default'}`;
      const cached = getCache(cacheKey);
      if (cached) return cached;

      // Get the model data to determine year range
      const modelsResult = await VehicleService.getModels(make, tenantId);
      if (!modelsResult.success) {
        return { success: false, error: 'Failed to get model data' };
      }

      const modelData = modelsResult.models.find(m => 
        m.name.toLowerCase() === model.toLowerCase() || 
        m.slug === model.toLowerCase()
      );

      if (!modelData) {
        return { success: false, error: 'Model not found' };
      }

      // Generate years array from model's year range
      const { min, max } = modelData.yearRange;
      const years = [];
      for (let year = max; year >= min; year--) {
        years.push({
          year,
          label: year.toString(),
          available: true, // In production, check actual part availability
          generation: getVehicleGeneration(make, model, year)
        });
      }

      const result = { 
        success: true, 
        years,
        modelInfo: {
          name: modelData.name,
          type: modelData.type,
          category: modelData.category
        }
      };
      setCache(cacheKey, result, LONG_CACHE_DURATION);
      return result;

    } catch (error) {
      console.error('Error in getYears:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * ENHANCED: Get engines for a specific vehicle
   */
  getEngines: async (make, model, year, tenantId = null) => {
    try {
      const cacheKey = `engines_${make}_${model}_${year}_${tenantId || 'default'}`;
      const cached = getCache(cacheKey);
      if (cached) return cached;

      // In production, this would query a comprehensive database
      // For now, provide common engine configurations
      const engines = getCommonEngines(make, model, year);

      const result = { success: true, engines };
      setCache(cacheKey, result, CACHE_DURATION);
      return result;

    } catch (error) {
      console.error('Error in getEngines:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * ENHANCED: Search vehicles by text query with fuzzy matching
   */
  searchVehicles: async (query, options = {}, tenantId = null) => {
    const startTime = performance.now();
    try {
      vehicleMetrics.searchCount++;
      
      const { limit = 20, includeEngines = false } = options;
      const cacheKey = `vehicle_search_${query}_${JSON.stringify(options)}_${tenantId || 'default'}`;
      const cached = getCache(cacheKey);
      if (cached) return cached;

      const normalizedQuery = query.toLowerCase().trim();
      const searchTerms = normalizedQuery.split(/\s+/);

      // Get all makes and search through them
      const makesResult = await VehicleService.getMakes(tenantId);
      if (!makesResult.success) {
        return { success: false, error: 'Failed to get makes data' };
      }

      const results = [];

      // Search through makes
      for (const make of makesResult.makes) {
        const makeMatches = searchInText(make.name, searchTerms);
        if (makeMatches.score > 0) {
          // Get models for this make
          const modelsResult = await VehicleService.getModels(make.name, tenantId);
          if (modelsResult.success) {
            for (const model of modelsResult.models) {
              const modelMatches = searchInText(model.name, searchTerms);
              const combinedScore = Math.max(makeMatches.score, modelMatches.score);
              
              if (combinedScore > 0.3) { // Threshold for relevance
                const vehicleResult = {
                  make: make.name,
                  makeSlug: make.slug,
                  model: model.name,
                  modelSlug: model.slug,
                  type: model.type,
                  category: model.category,
                  yearRange: model.yearRange,
                  relevanceScore: combinedScore,
                  matchType: makeMatches.score > modelMatches.score ? 'make' : 'model'
                };

                // Include engines if requested
                if (includeEngines && model.yearRange) {
                  const currentYear = new Date().getFullYear();
                  const sampleYear = Math.min(currentYear, model.yearRange.max);
                  const enginesResult = await VehicleService.getEngines(make.name, model.name, sampleYear, tenantId);
                  if (enginesResult.success) {
                    vehicleResult.engines = enginesResult.engines;
                  }
                }

                results.push(vehicleResult);
              }
            }
          }
        }
      }

      // Sort by relevance score
      results.sort((a, b) => b.relevanceScore - a.relevanceScore);

      const result = {
        success: true,
        vehicles: results.slice(0, limit),
        totalResults: results.length,
        query: normalizedQuery,
        performance: {
          responseTime: performance.now() - startTime,
          cacheHit: false
        }
      };

      setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error in searchVehicles:', error);
      return { 
        success: false, 
        error: error.message,
        performance: {
          responseTime: performance.now() - startTime,
          failed: true
        }
      };
    }
  },

  /**
   * ENHANCED: Get complete vehicle information
   */
  getVehicleInfo: async (make, model, year, engine = null, tenantId = null) => {
    try {
      const cacheKey = `vehicle_info_${make}_${model}_${year}_${engine || 'any'}_${tenantId || 'default'}`;
      const cached = getCache(cacheKey);
      if (cached) return cached;

      // Get all available data for the vehicle
      const [modelsResult, yearsResult, enginesResult] = await Promise.all([
        VehicleService.getModels(make, tenantId),
        VehicleService.getYears(make, model, tenantId),
        VehicleService.getEngines(make, model, year, tenantId)
      ]);

      if (!modelsResult.success || !yearsResult.success) {
        return { success: false, error: 'Vehicle not found' };
      }

      const modelData = modelsResult.models.find(m => 
        m.name.toLowerCase() === model.toLowerCase()
      );

      const yearData = yearsResult.years.find(y => y.year === parseInt(year));

      const vehicleInfo = {
        make,
        model,
        year: parseInt(year),
        engine,
        modelData,
        yearData,
        engines: enginesResult.success ? enginesResult.engines : [],
        generation: getVehicleGeneration(make, model, year),
        specifications: getVehicleSpecifications(make, model, year),
        // Additional metadata
        fuelType: getFuelType(make, model, year, engine),
        driveType: getDriveType(make, model, year),
        bodyStyle: modelData?.type || 'Unknown',
        category: modelData?.category || 'Unknown'
      };

      const result = { success: true, vehicleInfo };
      setCache(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error in getVehicleInfo:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Performance and analytics methods
   */
  getVehicleMetrics: () => ({ ...vehicleMetrics }),
  
  resetVehicleMetrics: () => {
    vehicleMetrics.searchCount = 0;
    vehicleMetrics.cacheHits = 0;
    vehicleMetrics.avgResponseTime = 0;
  },

  clearCache: () => {
    cache.clear();
    cacheExpiry.clear();
  }
};

// Helper functions

function searchInText(text, searchTerms) {
  const normalizedText = text.toLowerCase();
  let score = 0;
  let matches = 0;

  for (const term of searchTerms) {
    if (normalizedText.includes(term)) {
      matches++;
      // Exact match gets higher score
      if (normalizedText === term) {
        score += 1.0;
      } else if (normalizedText.startsWith(term)) {
        score += 0.8;
      } else {
        score += 0.5;
      }
    }
  }

  // Normalize score by number of search terms
  return {
    score: searchTerms.length > 0 ? score / searchTerms.length : 0,
    matches,
    total: searchTerms.length
  };
}

function getVehicleGeneration(make, model, year) {
  // Simplified generation detection - in production this would be more comprehensive
  const generations = {
    'Toyota': {
      'Camry': [
        { start: 2018, end: 2024, name: '8th Generation' },
        { start: 2012, end: 2017, name: '7th Generation' },
        { start: 2007, end: 2011, name: '6th Generation' }
      ]
    }
  };

  const modelGens = generations[make]?.[model];
  if (modelGens) {
    const gen = modelGens.find(g => year >= g.start && year <= g.end);
    return gen?.name || 'Unknown Generation';
  }

  return 'Unknown Generation';
}

function getCommonEngines(make, model, year) {
  // Simplified engine database - in production this would be comprehensive
  const commonEngines = [
    { id: 1, name: '2.0L 4-Cylinder', displacement: '2.0L', cylinders: 4, fuelType: 'Gasoline', horsepower: 150 },
    { id: 2, name: '2.5L 4-Cylinder', displacement: '2.5L', cylinders: 4, fuelType: 'Gasoline', horsepower: 180 },
    { id: 3, name: '3.5L V6', displacement: '3.5L', cylinders: 6, fuelType: 'Gasoline', horsepower: 280 },
    { id: 4, name: '1.8L Hybrid', displacement: '1.8L', cylinders: 4, fuelType: 'Hybrid', horsepower: 120 }
  ];

  return commonEngines;
}

function getVehicleSpecifications(make, model, year) {
  // Simplified specifications - in production this would be comprehensive
  return {
    length: '185.0 in',
    width: '72.0 in',
    height: '58.0 in',
    wheelbase: '110.0 in',
    curbWeight: '3200 lbs',
    fuelCapacity: '15.0 gal'
  };
}

function getFuelType(make, model, year, engine) {
  if (engine && engine.toLowerCase().includes('hybrid')) return 'Hybrid';
  if (engine && engine.toLowerCase().includes('electric')) return 'Electric';
  return 'Gasoline';
}

function getDriveType(make, model, year) {
  // Simplified drive type detection
  return 'FWD'; // Front-wheel drive as default
}

export default VehicleService; 