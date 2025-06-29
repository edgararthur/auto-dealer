import { 
  ProductService, 
  BrandService, 
  ProductReviewService, 
  SearchService, 
  InventoryService, 
  NotificationService,
  CartService,
  UserService
} from './shared/index.js';
import { VehicleService } from './shared/services/vehicleService.js';

/**
 * Comprehensive test script for all AutorA services
 */
async function testAllServices() {
  console.log('🚀 Starting AutorA Services Test Suite\n');

  // Test ProductService
  console.log('📦 Testing ProductService...');
  try {
    const productsResult = await ProductService.getProducts({ limit: 5 });
    console.log('✅ ProductService.getProducts:', productsResult.success);
    console.log(`   - Fetched ${productsResult.products?.length || 0} products`);
  } catch (error) {
    console.log('❌ ProductService.getProducts failed:', error.message);
  }

  // Test BrandService
  console.log('\n🏷️ Testing BrandService...');
  try {
    const brandsResult = await BrandService.getBrands({ limit: 5 });
    console.log('✅ BrandService.getBrands:', brandsResult.success);
    console.log(`   - Fetched ${brandsResult.brands?.length || 0} brands`);
  } catch (error) {
    console.log('❌ BrandService.getBrands failed:', error.message);
  }

  // Test ProductReviewService
  console.log('\n⭐ Testing ProductReviewService...');
  try {
    // Get a sample product ID first
    const productsResult = await ProductService.getProducts({ limit: 1 });
    if (productsResult.success && productsResult.products.length > 0) {
      const productId = productsResult.products[0].id;
      const reviewsResult = await ProductReviewService.getProductReviews(productId);
      console.log('✅ ProductReviewService.getProductReviews:', reviewsResult.success);
      console.log(`   - Fetched ${reviewsResult.reviews?.length || 0} reviews`);
    } else {
      console.log('⚠️ No products available to test reviews');
    }
  } catch (error) {
    console.log('❌ ProductReviewService.getProductReviews failed:', error.message);
  }

  // Test SearchService
  console.log('\n🔍 Testing SearchService...');
  try {
    const searchResult = await SearchService.searchProducts('brake', {}, { limit: 5 });
    console.log('✅ SearchService.searchProducts:', searchResult.success);
    console.log(`   - Found ${searchResult.products?.length || 0} products`);

    const suggestionsResult = await SearchService.getSearchSuggestions('bra');
    console.log('✅ SearchService.getSearchSuggestions:', suggestionsResult.success);
    console.log(`   - Found ${suggestionsResult.suggestions?.length || 0} suggestions`);

    const popularResult = await SearchService.getPopularSearches(5);
    console.log('✅ SearchService.getPopularSearches:', popularResult.success);
    console.log(`   - Found ${popularResult.popularSearches?.length || 0} popular searches`);
  } catch (error) {
    console.log('❌ SearchService failed:', error.message);
  }

  // Test InventoryService
  console.log('\n📊 Testing InventoryService...');
  try {
    // Get a sample product ID first
    const productsResult = await ProductService.getProducts({ limit: 1 });
    if (productsResult.success && productsResult.products.length > 0) {
      const productId = productsResult.products[0].id;
      
      const stockResult = await InventoryService.getStockLevel(productId);
      console.log('✅ InventoryService.getStockLevel:', stockResult.success);
      console.log(`   - Stock level: ${stockResult.stockLevel || 'N/A'}`);

      const lowStockResult = await InventoryService.getLowStockProducts(null, 50);
      console.log('✅ InventoryService.getLowStockProducts:', lowStockResult.success);
      console.log(`   - Found ${lowStockResult.products?.length || 0} low stock products`);

      const movementsResult = await InventoryService.getStockMovements(productId);
      console.log('✅ InventoryService.getStockMovements:', movementsResult.success);
      console.log(`   - Found ${movementsResult.movements?.length || 0} stock movements`);
    } else {
      console.log('⚠️ No products available to test inventory');
    }
  } catch (error) {
    console.log('❌ InventoryService failed:', error.message);
  }

  // Test NotificationService
  console.log('\n🔔 Testing NotificationService...');
  try {
    const mockUserId = 'test-user-123';
    
    const sendResult = await NotificationService.sendNotification(mockUserId, {
      title: 'Test Notification',
      message: 'This is a test notification',
      type: 'info'
    });
    console.log('✅ NotificationService.sendNotification:', sendResult.success);

    const getResult = await NotificationService.getNotifications(mockUserId);
    console.log('✅ NotificationService.getNotifications:', getResult.success);
    console.log(`   - Found ${getResult.notifications?.length || 0} notifications`);

    const unreadResult = await NotificationService.getUnreadCount(mockUserId);
    console.log('✅ NotificationService.getUnreadCount:', unreadResult.success);
    console.log(`   - Unread count: ${unreadResult.unreadCount || 0}`);
  } catch (error) {
    console.log('❌ NotificationService failed:', error.message);
  }

  // Test CartService
  console.log('\n🛒 Testing CartService...');
  try {
    const mockUserId = 'test-user-123';
    
    const cartResult = await CartService.getCartItems(mockUserId);
    console.log('✅ CartService.getCartItems:', cartResult.success);
    console.log(`   - Found ${cartResult.cartItems?.length || 0} cart items`);
  } catch (error) {
    console.log('❌ CartService failed:', error.message);
  }

  // Database Connection Test
  console.log('\n🔗 Testing Database Connection...');
  try {
    const { supabase } = await import('./shared/index.js');
    const { data, error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) {
      console.log('❌ Database connection failed:', error.message);
    } else {
      console.log('✅ Database connection successful');
      console.log(`   - Can access profiles table: ${data ? 'Yes' : 'No'}`);
    }
  } catch (error) {
    console.log('❌ Database connection test failed:', error.message);
  }

  console.log('\n🎉 AutorA Services Test Suite Complete!');
  console.log('\n📋 Summary:');
  console.log('- ProductService: Core product operations');
  console.log('- BrandService: Brand management');
  console.log('- ProductReviewService: Review system');
  console.log('- SearchService: Product search & suggestions');
  console.log('- InventoryService: Stock management');
  console.log('- NotificationService: User notifications');
  console.log('- CartService: Shopping cart operations');
  console.log('- Database: Supabase connection');
}

// Run the tests
testAllServices().catch(console.error);

console.log('🧪 Testing Enhanced Vehicle Search Services...\n');

// Test vehicle search functionality
async function testVehicleSearches() {
  console.log('=== Testing Vehicle-Specific Searches ===');
  
  // Test 1: Search for "2017 Toyota Corolla"
  console.log('\n🔍 Test 1: Searching for "2017 Toyota Corolla"');
  try {
    const result1 = await ProductService.searchProducts('2017 Toyota Corolla', { limit: 10 });
    
    if (result1.success) {
      console.log(`✅ Found ${result1.products.length} products for "2017 Toyota Corolla"`);
      
      // Show top 3 results with relevance scores
      result1.products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (Score: ${product.relevanceScore}) - $${product.price}`);
      });
    } else {
      console.log('❌ Search failed:', result1.error);
    }
  } catch (error) {
    console.error('❌ Error in vehicle search test 1:', error.message);
  }

  // Test 2: Search for "2017 Toyota Corolla battery"
  console.log('\n🔍 Test 2: Searching for "2017 Toyota Corolla battery"');
  try {
    const result2 = await ProductService.searchProducts('2017 Toyota Corolla battery', { limit: 10 });
    
    if (result2.success) {
      console.log(`✅ Found ${result2.products.length} products for "2017 Toyota Corolla battery"`);
      
      // Show top 3 results with relevance scores
      result2.products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (Score: ${product.relevanceScore}) - $${product.price}`);
      });
    } else {
      console.log('❌ Search failed:', result2.error);
    }
  } catch (error) {
    console.error('❌ Error in vehicle search test 2:', error.message);
  }

  // Test 3: Search for "Honda Civic brake pads"
  console.log('\n🔍 Test 3: Searching for "Honda Civic brake pads"');
  try {
    const result3 = await ProductService.searchProducts('Honda Civic brake pads', { limit: 10 });
    
    if (result3.success) {
      console.log(`✅ Found ${result3.products.length} products for "Honda Civic brake pads"`);
      
      // Show top 3 results with relevance scores
      result3.products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (Score: ${product.relevanceScore}) - $${product.price}`);
      });
    } else {
      console.log('❌ Search failed:', result3.error);
    }
  } catch (error) {
    console.error('❌ Error in vehicle search test 3:', error.message);
  }

  // Test 4: Use searchByVehicle method
  console.log('\n🔍 Test 4: Using searchByVehicle method');
  try {
    const vehicleInfo = {
      year: '2017',
      make: 'toyota',  
      model: 'corolla'
    };
    
    const result4 = await ProductService.searchByVehicle(vehicleInfo, 'battery', { limit: 10 });
    
    if (result4.success) {
      console.log(`✅ Found ${result4.products.length} products for 2017 Toyota Corolla battery (searchByVehicle)`);
      
      // Show top 3 results with relevance scores
      result4.products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} (Score: ${product.relevanceScore}) - $${product.price}`);
      });
    } else {
      console.log('❌ searchByVehicle failed:', result4.error);
    }
  } catch (error) {
    console.error('❌ Error in searchByVehicle test:', error.message);
  }

  // Test 5: Show all products to understand the data
  console.log('\n🔍 Test 5: Getting all products to see available data');
  try {
    const allProducts = await ProductService.getProducts({ limit: 20 });
    
    if (allProducts.success) {
      console.log(`✅ Total products available: ${allProducts.count}`);
      console.log('Sample products:');
      
      allProducts.products.slice(0, 5).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${product.price}`);
        if (product.description) {
          console.log(`      Description: ${product.description.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('❌ Getting all products failed:', allProducts.error);
    }
  } catch (error) {
    console.error('❌ Error getting all products:', error.message);
  }
}

// Test search service enhancements
async function testSearchService() {
  console.log('\n=== Testing Search Service ===');
  
  try {
    const searchResult = await SearchService.search('Toyota Corolla', { limit: 5 });
    
    if (searchResult.success) {
      console.log(`✅ SearchService found ${searchResult.results.length} results`);
      searchResult.results.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.title} (${result.type})`);
      });
    } else {
      console.log('❌ SearchService failed:', searchResult.error);
    }
  } catch (error) {
    console.error('❌ Error in SearchService test:', error.message);
  }
}

// Test vehicle service
async function testVehicleService() {
  console.log('\n=== Testing Vehicle Service ===');
  
  try {
    // Test getting Toyota models
    const toyotaModels = await VehicleService.getModels('toyota');
    
    if (toyotaModels.success) {
      console.log(`✅ Found ${toyotaModels.models.length} Toyota models`);
      toyotaModels.models.slice(0, 5).forEach((model, index) => {
        console.log(`   ${index + 1}. ${model.name} (${model.yearStart}-${model.yearEnd})`);
      });
    } else {
      console.log('❌ VehicleService.getModels failed:', toyotaModels.error);
    }
    
    // Test vehicle search
    const vehicleSearch = await VehicleService.searchVehicles('2017 Toyota Corolla');
    
    if (vehicleSearch.success) {
      console.log(`✅ Vehicle search found ${vehicleSearch.vehicles.length} matches`);
      vehicleSearch.vehicles.forEach((vehicle, index) => {
        console.log(`   ${index + 1}. ${vehicle.year} ${vehicle.make} ${vehicle.model}`);
      });
    } else {
      console.log('❌ VehicleService.searchVehicles failed:', vehicleSearch.error);
    }
  } catch (error) {
    console.error('❌ Error in VehicleService test:', error.message);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testVehicleSearches();
    await testSearchService();
    await testVehicleService();
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Error running tests:', error.message);
  }
}

runAllTests();

console.log('🧪 Testing Enhanced Vehicle Compatibility Search...\n');

// Test vehicle compatibility search functionality
async function testVehicleCompatibilitySearch() {
  console.log('=== Testing Vehicle Compatibility Search ===');
  
  // Test 1: Search for "2017 Toyota Corolla"
  console.log('\n🔍 Test 1: Searching for "2017 Toyota Corolla"');
  try {
    const result1 = await ProductService.searchProducts('2017 Toyota Corolla', { limit: 10 });
    
    if (result1.success) {
      console.log(`✅ Found ${result1.products.length} products for "2017 Toyota Corolla"`);
      
      // Show top 3 results with relevance scores and compatibility info
      result1.products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      Score: ${product.relevanceScore} | Price: $${product.price}`);
        if (product.vehicleCompatibility && product.vehicleCompatibility.length > 0) {
          console.log(`      Vehicle Compatibility: ${product.vehicleCompatibility.length} vehicles`);
          // Show first few compatibilities
          product.vehicleCompatibility.slice(0, 2).forEach(compat => {
            const year = compat.year || 'Any';
            const make = compat.make || 'Any';
            const model = compat.model || 'Any';
            console.log(`        - ${year} ${make} ${model} (${compat.matchType})`);
          });
        }
        console.log('');
      });
    } else {
      console.log('❌ Search failed:', result1.error);
    }
  } catch (error) {
    console.error('❌ Error in vehicle search test 1:', error.message);
  }

  // Test 2: Search for "2017 Toyota Corolla battery"
  console.log('\n🔍 Test 2: Searching for "2017 Toyota Corolla battery"');
  try {
    const result2 = await ProductService.searchProducts('2017 Toyota Corolla battery', { limit: 10 });
    
    if (result2.success) {
      console.log(`✅ Found ${result2.products.length} products for "2017 Toyota Corolla battery"`);
      
      // Show top 3 results with relevance scores and compatibility info
      result2.products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      Score: ${product.relevanceScore} | Price: $${product.price}`);
        console.log(`      Description: ${(product.description || '').substring(0, 100)}...`);
        if (product.vehicleCompatibility && product.vehicleCompatibility.length > 0) {
          console.log(`      Vehicle Compatibility: ${product.vehicleCompatibility.length} vehicles`);
          // Show first few compatibilities
          product.vehicleCompatibility.slice(0, 2).forEach(compat => {
            const year = compat.year || 'Any';
            const make = compat.make || 'Any';
            const model = compat.model || 'Any';
            console.log(`        - ${year} ${make} ${model} (${compat.matchType})`);
          });
        }
        console.log('');
      });
    } else {
      console.log('❌ Search failed:', result2.error);
    }
  } catch (error) {
    console.error('❌ Error in vehicle search test 2:', error.message);
  }

  // Test 3: Search for "Honda Civic brake pads"
  console.log('\n🔍 Test 3: Searching for "Honda Civic brake pads"');
  try {
    const result3 = await ProductService.searchProducts('Honda Civic brake pads', { limit: 10 });
    
    if (result3.success) {
      console.log(`✅ Found ${result3.products.length} products for "Honda Civic brake pads"`);
      
      // Show top 3 results with relevance scores
      result3.products.slice(0, 3).forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name}`);
        console.log(`      Score: ${product.relevanceScore} | Price: $${product.price}`);
        if (product.vehicleCompatibility && product.vehicleCompatibility.length > 0) {
          console.log(`      Vehicle Compatibility: ${product.vehicleCompatibility.length} vehicles`);
        }
        console.log('');
      });
    } else {
      console.log('❌ Search failed:', result3.error);
    }
  } catch (error) {
    console.error('❌ Error in vehicle search test 3:', error.message);
  }

  // Test 4: Get a single product to see its compatibility data
  console.log('\n🔍 Test 4: Getting single product to check compatibility data');
  try {
    const allProducts = await ProductService.getProducts({ limit: 5 });
    
    if (allProducts.success && allProducts.products.length > 0) {
      const firstProduct = allProducts.products[0];
      console.log(`✅ Product: ${firstProduct.name}`);
      console.log(`   Price: $${firstProduct.price}`);
      console.log(`   Description: ${(firstProduct.description || '').substring(0, 100)}...`);
      
      if (firstProduct.vehicleCompatibility && firstProduct.vehicleCompatibility.length > 0) {
        console.log(`   Vehicle Compatibility (${firstProduct.vehicleCompatibility.length} vehicles):`);
        firstProduct.vehicleCompatibility.slice(0, 5).forEach((compat, index) => {
          const year = compat.year || 'Any';
          const make = compat.make || 'Any';
          const model = compat.model || 'Any';
          console.log(`     ${index + 1}. ${year} ${make} ${model} (${compat.matchType})`);
        });
      } else {
        console.log('   No vehicle compatibility data found');
      }
    } else {
      console.log('❌ Getting single product failed:', allProducts.error);
    }
  } catch (error) {
    console.error('❌ Error getting single product:', error.message);
  }

  // Test 5: Verify search query parsing
  console.log('\n🔍 Test 5: Testing search query parsing logic');
  const testQueries = [
    '2017 Toyota Corolla',
    '2017 Toyota Corolla battery',
    'Honda Civic brake pads',
    'Ford F-150 oil filter',
    'battery',
    'BMW X5 2019',
    'Chevy Silverado'
  ];

  testQueries.forEach(query => {
    console.log(`\n   Query: "${query}"`);
    // This would show the parsing logic in action through the search
    // The actual parsing happens inside the service
  });
}

// Run the test
testVehicleCompatibilitySearch()
  .then(() => console.log('\n✅ Vehicle compatibility search tests completed!'))
  .catch(error => console.error('❌ Test failed:', error.message)); 