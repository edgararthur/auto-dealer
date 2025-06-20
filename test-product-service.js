import ProductService from "./shared/services/productService.js";

console.log("Testing ProductService...");

async function testProductService() {
  try {
    const result = await ProductService.getProducts({ limit: 3 });
    console.log("✅ ProductService.getProducts:", result.success);
    console.log("   - Products found:", result.products?.length || 0);
    
    if (result.products && result.products.length > 0) {
      console.log("   - Sample product:", result.products[0].name);
    }
  } catch (error) {
    console.log("❌ ProductService test failed:", error.message);
  }
}

testProductService();
