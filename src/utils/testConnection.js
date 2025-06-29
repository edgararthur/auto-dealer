import supabase from '../../shared/supabase/supabaseClient';

/**
 * Test Supabase connection and basic data availability
 */
export const testSupabaseConnection = async () => {
  console.log('🔍 Testing Supabase connection...');
  
  try {
    // Test 1: Basic connection
    console.log('📡 Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Connection test failed:', testError);
      return false;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test 2: Categories table
    console.log('📦 Testing categories table...');
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);
    
    if (catError) {
      console.error('❌ Categories test failed:', catError);
    } else {
      console.log('✅ Categories table accessible:', categories?.length || 0, 'records');
    }
    
    // Test 3: Products table - Get total count
    console.log('🛍️ Testing products table...');
    const { count: totalProducts, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Products count test failed:', countError);
    } else {
      console.log('📊 TOTAL products in database:', totalProducts);
    }

    // Test 3b: Products with stock > 0
    const { count: stockProducts, error: stockError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .gt('stock_quantity', 0);
    
    if (stockError) {
      console.error('❌ Products with stock test failed:', stockError);
    } else {
      console.log('📦 Products with stock > 0:', stockProducts);
    }

    // Test 3c: Sample products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, price, stock_quantity')
      .limit(5);
    
    if (prodError) {
      console.error('❌ Products test failed:', prodError);
    } else {
      console.log('✅ Products table accessible:', products?.length || 0, 'records');
      console.log('📝 Sample products:', products);
    }
    
    // Test 4: Brands table
    console.log('🏷️ Testing brands table...');
    const { data: brands, error: brandError } = await supabase
      .from('brands')
      .select('id, name')
      .limit(5);
    
    if (brandError) {
      console.error('❌ Brands test failed:', brandError);
    } else {
      console.log('✅ Brands table accessible:', brands?.length || 0, 'records');
    }
    
    console.log('🎉 Supabase connection test completed!');
    return true;
    
  } catch (error) {
    console.error('💥 Unexpected error during connection test:', error);
    return false;
  }
};

// Auto-run test in development - DISABLED to prevent reloads
// if (import.meta.env.DEV) {
//   testSupabaseConnection();
// }