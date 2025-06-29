import ProductService from './shared/services/productService.js';

console.log('🛍️ Testing Product Display Data...\n');

async function testProductDisplay() {
  try {
    console.log('Fetching products...');
    const result = await ProductService.getProducts({ limit: 3 });
    
    console.log('✅ Products fetched successfully');
    console.log('   - Success:', result.success);
    console.log('   - Count:', result.count);
    console.log('   - Products returned:', result.products?.length || 0);
    
    if (result.products && result.products.length > 0) {
      console.log('\n📦 Product Display Data:');
      
      result.products.forEach((product, index) => {
        console.log('\n' + (index + 1) + '. ' + (product.name?.substring(0, 50) || 'No name') + '...');
        console.log('   - ID:', product.id);
        console.log('   - Price: GHS', product.price);
        console.log('   - In Stock:', product.inStock);
        console.log('   - Stock Quantity:', product.stockQuantity);
        console.log('   - Image:', product.image ? 'Available' : 'No image');
        console.log('   - Status:', product.status || 'N/A');
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testProductDisplay();
