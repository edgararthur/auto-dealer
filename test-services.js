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