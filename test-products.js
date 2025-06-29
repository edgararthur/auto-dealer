import ProductService from './shared/services/productService.js';
import supabase from './shared/supabase/supabaseClient.js';

console.log('🧪 Testing Product Service...\n');

async function testProductService() {
  try {
    // Test 1: Check if products table exists and has data
    console.log('1️⃣ Testing direct database query...');
    const { data: directData, error: directError, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (directError) {
      console.log('❌ Direct database query failed:', directError.message);
      return;
    }
    
    console.log('✅ Direct database query successful');
    console.log(`   - Total products in database: ${count}`);
    console.log(`   - Sample products retrieved: ${directData?.length || 0}`);
    
    if (directData && directData.length > 0) {
      console.log('   - Sample product:', {
        id: directData[0].id,
        name: directData[0].name?.substring(0, 50) + '...',
        price: directData[0].price,
        stock: directData[0].stock_quantity,
        status: directData[0].status
      });
    }
    
    console.log('');

    // Test 2: Test ProductService.getProducts() with no filters
    console.log('2️⃣ Testing ProductService.getProducts() with no filters...');
    const basicResult = await ProductService.getProducts({});
    
    if (!basicResult.success) {
      console.log('❌ ProductService.getProducts() failed:', basicResult.error);
      return;
    }
    
    console.log('✅ ProductService.getProducts() successful');
    console.log(`   - Products returned: ${basicResult.products?.length || 0}`);
    console.log(`   - Total count: ${basicResult.count}`);
    
    if (basicResult.products && basicResult.products.length > 0) {
      console.log('   - Sample transformed product:', {
        id: basicResult.products[0].id,
        name: basicResult.products[0].name?.substring(0, 50) + '...',
        price: basicResult.products[0].price,
        inStock: basicResult.products[0].inStock,
        image: basicResult.products[0].image ? 'Has image' : 'No image'
      });
    }
    
    console.log('');

    // Test 3: Test ProductService with pagination
    console.log('3️⃣ Testing ProductService with pagination...');
    const paginatedResult = await ProductService.getProducts({
      page: 1,
      limit: 10
    });
    
    if (!paginatedResult.success) {
      console.log('❌ ProductService pagination failed:', paginatedResult.error);
    } else {
      console.log('✅ ProductService pagination successful');
      console.log(`   - Products on page 1: ${paginatedResult.products?.length || 0}`);
      console.log(`   - Has more pages: ${paginatedResult.hasMore}`);
    }
    
    console.log('');

    // Test 4: Test ProductService with search
    console.log('4️⃣ Testing ProductService with search...');
    const searchResult = await ProductService.getProducts({
      search: 'brake',
      limit: 5
    });
    
    if (!searchResult.success) {
      console.log('❌ ProductService search failed:', searchResult.error);
    } else {
      console.log('✅ ProductService search successful');
      console.log(`   - Search results for "brake": ${searchResult.products?.length || 0}`);
      
      if (searchResult.products && searchResult.products.length > 0) {
        console.log('   - Top search result:', {
          name: searchResult.products[0].name?.substring(0, 60) + '...',
          relevanceScore: searchResult.products[0].relevanceScore
        });
      }
    }
    
    console.log('');

    // Test 5: Test ProductService with filters
    console.log('5️⃣ Testing ProductService with filters...');
    const filteredResult = await ProductService.getProducts({
      inStock: true,
      sortBy: 'price_asc',
      limit: 5
    });
    
    if (!filteredResult.success) {
      console.log('❌ ProductService filtering failed:', filteredResult.error);
    } else {
      console.log('✅ ProductService filtering successful');
      console.log(`   - In-stock products (sorted by price): ${filteredResult.products?.length || 0}`);
      
      if (filteredResult.products && filteredResult.products.length > 0) {
        console.log('   - Cheapest in-stock product:', {
          name: filteredResult.products[0].name?.substring(0, 50) + '...',
          price: filteredResult.products[0].price,
          stock: filteredResult.products[0].stockQuantity
        });
      }
    }
    
    console.log('');

    // Test 6: Check database schema
    console.log('6️⃣ Checking database schema...');
    const { data: schemaData, error: schemaError } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (!schemaError && schemaData && schemaData.length > 0) {
      const product = schemaData[0];
      const fields = Object.keys(product);
      console.log('✅ Database schema check successful');
      console.log(`   - Available fields: ${fields.join(', ')}`);
      
      // Check for important fields
      const requiredFields = ['id', 'name', 'price', 'stock_quantity', 'status', 'is_active'];
      const missingFields = requiredFields.filter(field => !fields.includes(field));
      
      if (missingFields.length > 0) {
        console.log(`   - ⚠️  Missing required fields: ${missingFields.join(', ')}`);
      } else {
        console.log('   - ✅ All required fields present');
      }
    }

    console.log('🏁 Product service testing completed');

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

// Run the tests
testProductService(); 