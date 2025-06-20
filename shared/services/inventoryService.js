import supabase from "../supabase/supabaseClient.js";

class InventoryService {
  static async getStockLevel(productId, locationId = null) {
    try {
      if (!productId) {
        return { success: false, error: "Product ID is required" };
      }

      let query = supabase
        .from("products")
        .select("id, stock_quantity, low_stock_threshold")
        .eq("id", productId)
        .single();

      const { data: product, error } = await query;

      if (error) throw error;

      return {
        success: true,
        stockLevel: product.stock_quantity,
        lowStockThreshold: product.low_stock_threshold || 10,
        isLowStock: product.stock_quantity <= (product.low_stock_threshold || 10)
      };

    } catch (error) {
      console.error("InventoryService.getStockLevel error:", error);
      return {
        success: false,
        error: error.message || "Failed to get stock level"
      };
    }
  }

  static async updateStock(productId, quantity, reason = "manual_adjustment") {
    try {
      if (!productId || quantity === undefined) {
        return { success: false, error: "Product ID and quantity are required" };
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("stock_quantity")
        .eq("id", productId)
        .single();

      if (productError) throw productError;

      const newQuantity = Math.max(0, product.stock_quantity + quantity);

      const { data, error } = await supabase
        .from("products")
        .update({ 
          stock_quantity: newQuantity,
          updated_at: new Date()
        })
        .eq("id", productId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        product: data,
        previousQuantity: product.stock_quantity,
        newQuantity: newQuantity,
        change: quantity
      };

    } catch (error) {
      console.error("InventoryService.updateStock error:", error);
      return {
        success: false,
        error: error.message || "Failed to update stock"
      };
    }
  }

  static async getLowStockProducts(dealerId = null, threshold = 10) {
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          product_images(url, is_primary),
          dealer:dealer_id(business_name, company_name)
        `)
        .lte("stock_quantity", threshold)
        .eq("status", "active")
        .eq("is_active", true);

      if (dealerId) {
        query = query.eq("dealer_id", dealerId);
      }

      const { data: products, error } = await query;

      if (error) throw error;

      const transformedProducts = products.map(product => {
        const primaryImage = product.product_images?.find(img => img.is_primary);
        return {
          ...product,
          image: primaryImage?.url || "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80",
          dealer: product.dealer ? {
            name: product.dealer.business_name || product.dealer.company_name
          } : null
        };
      });

      return {
        success: true,
        products: transformedProducts,
        count: transformedProducts.length
      };

    } catch (error) {
      console.error("InventoryService.getLowStockProducts error:", error);
      return {
        success: false,
        error: error.message || "Failed to get low stock products",
        products: []
      };
    }
  }

  static async getStockMovements(productId, options = {}) {
    try {
      if (!productId) {
        return { success: false, error: "Product ID is required" };
      }

      // In a real implementation, this would query a stock_movements table
      // For now, return mock data
      const movements = [
        {
          id: "1",
          product_id: productId,
          type: "sale",
          quantity: -2,
          reason: "Order #12345",
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: "2",
          product_id: productId,
          type: "restock",
          quantity: 50,
          reason: "Supplier delivery",
          created_at: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: "3",
          product_id: productId,
          type: "adjustment",
          quantity: -1,
          reason: "Damage during handling",
          created_at: new Date(Date.now() - 259200000).toISOString()
        }
      ];

      return {
        success: true,
        movements: movements.slice(0, options.limit || 10)
      };

    } catch (error) {
      console.error("InventoryService.getStockMovements error:", error);
      return {
        success: false,
        error: error.message || "Failed to get stock movements",
        movements: []
      };
    }
  }
}

export default InventoryService;
