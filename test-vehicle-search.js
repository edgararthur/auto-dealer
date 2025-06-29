// Simple test to demonstrate vehicle compatibility search functionality
console.log('🧪 Vehicle Compatibility Search Demonstration\n');

// Mock product data with vehicle compatibility
const mockProducts = [
  {
    id: 1,
    name: 'ACDelco Battery for Toyota Corolla 2017-2020',
    description: 'High-performance battery compatible with 2017 2018 2019 2020 Toyota Corolla',
    price: 89.99,
    vehicleCompatibility: [
      { year: '2017', make: 'toyota', model: 'corolla', matchType: 'specific' },
      { year: '2018', make: 'toyota', model: 'corolla', matchType: 'specific' },
      { year: '2019', make: 'toyota', model: 'corolla', matchType: 'specific' },
      { year: '2020', make: 'toyota', model: 'corolla', matchType: 'specific' }
    ]
  },
  {
    id: 2,
    name: 'Universal Car Battery 12V',
    description: 'Compatible with most vehicles including Toyota Honda Ford',
    price: 65.99,
    vehicleCompatibility: [
      { year: null, make: 'toyota', model: null, matchType: 'make' },
      { year: null, make: 'honda', model: null, matchType: 'make' },
      { year: null, make: 'ford', model: null, matchType: 'make' }
    ]
  },
  {
    id: 3,
    name: 'Toyota Corolla Brake Pads 2017-2021',
    description: 'OEM brake pads for Toyota Corolla models from 2017 to 2021',
    price: 45.99,
    vehicleCompatibility: [
      { year: '2017', make: 'toyota', model: 'corolla', matchType: 'specific' },
      { year: '2018', make: 'toyota', model: 'corolla', matchType: 'specific' },
      { year: '2019', make: 'toyota', model: 'corolla', matchType: 'specific' },
      { year: '2020', make: 'toyota', model: 'corolla', matchType: 'specific' },
      { year: '2021', make: 'toyota', model: 'corolla', matchType: 'specific' }
    ]
  },
  {
    id: 4,
    name: 'Honda Civic Air Filter',
    description: 'High-flow air filter for Honda Civic all years',
    price: 25.99,
    vehicleCompatibility: [
      { year: null, make: 'honda', model: 'civic', matchType: 'model' }
    ]
  },
  {
    id: 5,
    name: 'Ford F-150 Oil Filter 2015-2023',
    description: 'Premium oil filter for Ford F-150 pickup trucks',
    price: 15.99,
    vehicleCompatibility: [
      { year: '2015', make: 'ford', model: 'f-150', matchType: 'specific' },
      { year: '2016', make: 'ford', model: 'f-150', matchType: 'specific' },
      { year: '2017', make: 'ford', model: 'f-150', matchType: 'specific' },
      { year: '2018', make: 'ford', model: 'f-150', matchType: 'specific' },
      { year: '2019', make: 'ford', model: 'f-150', matchType: 'specific' },
      { year: '2020', make: 'ford', model: 'f-150', matchType: 'specific' },
      { year: '2021', make: 'ford', model: 'f-150', matchType: 'specific' },
      { year: '2022', make: 'ford', model: 'f-150', matchType: 'specific' },
      { year: '2023', make: 'ford', model: 'f-150', matchType: 'specific' }
    ]
  }
];

// Enhanced search query parser (copied from productService.js)
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

  // Common model names
  const commonModels = [
    'corolla', 'camry', 'prius', 'rav4', 'highlander', 'sienna', 'tacoma', 'tundra',
    'civic', 'accord', 'cr-v', 'pilot', 'odyssey', 'ridgeline',
    'focus', 'fusion', 'escape', 'explorer', 'f-150', 'f150', 'mustang',
    'malibu', 'impala', 'equinox', 'tahoe', 'silverado', 'corvette',
    'altima', 'sentra', 'rogue', 'pathfinder', 'frontier', 'titan'
  ];

  // Auto parts terms
  const autoPartTerms = [
    'battery', 'brake', 'brakes', 'pad', 'pads', 'rotor', 'rotors', 'filter', 'filters',
    'oil', 'engine', 'transmission', 'alternator', 'starter', 'radiator', 'coolant',
    'spark', 'plug', 'plugs', 'belt', 'hose', 'pump', 'sensor', 'light', 'headlight'
  ];

  // Extract year
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

  // Extract make
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
    if (makeMatch === 'chevy') vehicleInfo.make = 'chevrolet';
    else if (makeMatch === 'vw') vehicleInfo.make = 'volkswagen';
    else if (makeMatch === 'mercedes') vehicleInfo.make = 'mercedes-benz';
    else vehicleInfo.make = makeMatch;
    
    const index = remainingWords.indexOf(makeMatch);
    if (index > -1) remainingWords.splice(index, 1);
  }

  // Extract model
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
    if (word.length > 1) {
      productTerms.push(word);
    }
  });

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

// Vehicle compatibility scoring
const calculateVehicleCompatibilityScore = (product, searchQuery) => {
  const parsed = parseSearchQuery(searchQuery);
  if (!parsed.hasVehicleInfo) return 0;
  
  const compatibility = product.vehicleCompatibility || [];
  let score = 0;
  
  const { vehicleInfo } = parsed;
  
  compatibility.forEach(compat => {
    let matchScore = 0;
    
    if (vehicleInfo.year && compat.year === vehicleInfo.year) {
      matchScore += 3;
    }
    
    if (vehicleInfo.make && compat.make === vehicleInfo.make) {
      matchScore += 3;
    }
    
    if (vehicleInfo.model && compat.model === vehicleInfo.model) {
      matchScore += 3;
    }
    
    if (compat.matchType === 'specific' && 
        vehicleInfo.year && vehicleInfo.make && vehicleInfo.model &&
        compat.year === vehicleInfo.year && 
        compat.make === vehicleInfo.make && 
        compat.model === vehicleInfo.model) {
      matchScore += 5;
    }
    
    score = Math.max(score, matchScore);
  });
  
  return score;
};

// Mock search function
const searchProducts = (query) => {
  console.log(`🔍 Searching for: "${query}"`);
  
  const parsed = parseSearchQuery(query);
  console.log('📋 Parsed Query:', {
    vehicleInfo: parsed.vehicleInfo,
    productTerms: parsed.productTerms,
    hasVehicleInfo: parsed.hasVehicleInfo
  });
  
  // Calculate relevance scores
  const results = mockProducts.map(product => {
    const productName = product.name.toLowerCase();
    const productDesc = product.description.toLowerCase();
    let relevanceScore = 1.0;
    
    // Text-based scoring
    if (parsed.hasVehicleInfo) {
      const { vehicleInfo } = parsed;
      
      if (vehicleInfo.year && (productName.includes(vehicleInfo.year) || productDesc.includes(vehicleInfo.year))) {
        relevanceScore += 2.0;
      }
      
      if (vehicleInfo.make && (productName.includes(vehicleInfo.make) || productDesc.includes(vehicleInfo.make))) {
        relevanceScore += 2.0;
      }
      
      if (vehicleInfo.model && (productName.includes(vehicleInfo.model) || productDesc.includes(vehicleInfo.model))) {
        relevanceScore += 2.0;
      }
      
      parsed.productTerms.forEach(term => {
        if (term !== 'parts' && term !== 'accessories') {
          if (productName.includes(term)) {
            relevanceScore += 1.5;
          } else if (productDesc.includes(term)) {
            relevanceScore += 1.0;
          }
        }
      });
    }
    
    // Add vehicle compatibility scoring
    const compatibilityScore = calculateVehicleCompatibilityScore(product, query);
    relevanceScore += compatibilityScore;
    
    return {
      ...product,
      relevanceScore,
      compatibilityScore
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  return results;
};

// Run tests
console.log('=== Test 1: "2017 Toyota Corolla" ===');
let results = searchProducts('2017 Toyota Corolla');
results.slice(0, 3).forEach((product, index) => {
  console.log(`${index + 1}. ${product.name}`);
  console.log(`   Relevance Score: ${product.relevanceScore} (Compatibility: ${product.compatibilityScore})`);
  console.log(`   Price: $${product.price}`);
  console.log(`   Vehicle Compatibility: ${product.vehicleCompatibility.length} vehicles`);
  console.log('');
});

console.log('=== Test 2: "2017 Toyota Corolla battery" ===');
results = searchProducts('2017 Toyota Corolla battery');
results.slice(0, 3).forEach((product, index) => {
  console.log(`${index + 1}. ${product.name}`);
  console.log(`   Relevance Score: ${product.relevanceScore} (Compatibility: ${product.compatibilityScore})`);
  console.log(`   Price: $${product.price}`);
  console.log(`   Vehicle Compatibility: ${product.vehicleCompatibility.length} vehicles`);
  console.log('');
});

console.log('=== Test 3: "Honda Civic brake pads" ===');
results = searchProducts('Honda Civic brake pads');
results.slice(0, 3).forEach((product, index) => {
  console.log(`${index + 1}. ${product.name}`);
  console.log(`   Relevance Score: ${product.relevanceScore} (Compatibility: ${product.compatibilityScore})`);
  console.log(`   Price: $${product.price}`);
  console.log(`   Vehicle Compatibility: ${product.vehicleCompatibility.length} vehicles`);
  console.log('');
});

console.log('✅ Vehicle compatibility search demonstration completed!');
console.log('\n📋 Summary:');
console.log('• Vehicle compatibility data is populated for each product');
console.log('• Search queries are parsed to extract vehicle information (year, make, model)');
console.log('• Relevance scoring includes both text matching and vehicle compatibility');
console.log('• Products with exact vehicle matches get highest scores');
console.log('• Compatibility data helps in search but is not shown on product cards');
console.log('• Compatibility will be displayed in product detail pages'); 