import ProductService from './shared/services/productService.js';

console.log('🧪 Testing Vehicle Search Fix...\\n');

async function testVehicleSearchFix() {
  console.log('Testing the exact search that was causing the error: "2016 rav4"');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\\n');
  
  try {
    const result = await ProductService.getProducts({
      search: '2016 rav4',
      limit: 10,
      sortBy: 'relevance'
    });

    if (result.success) {
      console.log('✅ SUCCESS! Vehicle search is working');
      console.log(`📦 Found ${result.products.length} products`);
      console.log(`📊 Total count: ${result.count}`);
      
      if (result.products.length > 0) {
        console.log('\\n🔍 Sample products found:');
        result.products.slice(0, 3).forEach((product, index) => {
          console.log(`${index + 1}. ${product.name}`);
          console.log(`   SKU: ${product.sku || 'N/A'}`);
          console.log(`   Price: $${product.discount_price || product.price}`);
          console.log(`   Stock: ${product.stock_quantity}`);
          if (product.compatibility) {
            console.log(`   Compatibility: ${JSON.stringify(product.compatibility).substring(0, 100)}...`);
          }
          console.log('');
        });
      } else {
        console.log('⚠️  No products found, but search completed without errors');
      }
    } else {
      console.log('❌ FAILED with error:', result.error);
    }
  } catch (error) {
    console.log('❌ EXCEPTION caught:', error.message);
    console.log('Full error:', error);
  }
}

// Test additional vehicle searches
async function testMultipleSearches() {
  const testCases = [
    '2016 toyota rav4',
    '2020 honda civic brake pads',
    '2018 ford f150',
    'toyota corolla oil filter'
  ];

  console.log('\\n🧪 Testing multiple vehicle searches...\\n');

  for (const searchQuery of testCases) {
    console.log(`🔍 Testing: "${searchQuery}"`);
    try {
      const result = await ProductService.getProducts({
        search: searchQuery,
        limit: 5,
        sortBy: 'relevance'
      });

      if (result.success) {
        console.log(`   ✅ Success - Found ${result.products.length} products`);
      } else {
        console.log(`   ❌ Failed - ${result.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Exception - ${error.message}`);
    }
  }
}

// Run tests
testVehicleSearchFix()
  .then(() => testMultipleSearches())
  .then(() => {
    console.log('\\n🎉 All tests completed!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  }); 