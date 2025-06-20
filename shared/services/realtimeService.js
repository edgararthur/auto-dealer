import supabase from '../supabase/supabaseClient.js';

/**
 * Real-time Service for Live Updates
 * Provides real-time notifications for:
 * - Stock level changes
 * - Price updates
 * - New product arrivals
 * - Order status updates
 * - Flash sales and deals
 */
class RealtimeService {
  static listeners = new Map();
  static isInitialized = false;

  /**
   * Initialize real-time subscriptions
   */
  static async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Start demo mode for development
      if (process.env.NODE_ENV === 'development') {
        this.startDemoMode();
      }
      
      this.isInitialized = true;
      console.log('Real-time service initialized');
    } catch (error) {
      console.error('Failed to initialize real-time service:', error);
    }
  }

  /**
   * Subscribe to product changes (new products, updates)
   */
  static subscribeToProductChanges() {
    const subscription = supabase
      .channel('products_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'products' 
        }, 
        (payload) => {
          this.handleNewProduct(payload.new);
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products'
        },
        (payload) => {
          this.handleProductUpdate(payload.old, payload.new);
        }
      )
      .subscribe();

    this.listeners.set('products_changes', subscription);
  }

  /**
   * Subscribe to stock level changes
   */
  static subscribeToStockChanges() {
    const subscription = supabase
      .channel('stock_changes')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: 'stock_quantity=neq.old.stock_quantity'
        },
        (payload) => {
          this.handleStockChange(payload.old, payload.new);
        }
      )
      .subscribe();

    this.listeners.set('stock_changes', subscription);
  }

  /**
   * Subscribe to price changes
   */
  static subscribeToPriceChanges() {
    const subscription = supabase
      .channel('price_changes')
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: 'price=neq.old.price'
        },
        (payload) => {
          this.handlePriceChange(payload.old, payload.new);
        }
      )
      .subscribe();

    this.listeners.set('price_changes', subscription);
  }

  /**
   * Subscribe to user-specific notifications
   */
  static subscribeToUserNotifications(userId, callback) {
    if (!userId) return null;

    const subscription = supabase
      .channel(`user_notifications_${userId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    this.listeners.set(`user_notifications_${userId}`, subscription);
    return subscription;
  }

  /**
   * Handle new product notifications
   */
  static handleNewProduct(product) {
    const notification = {
      type: 'new_product',
      title: 'New Product Available! 🆕',
      message: `Check out the new ${product.name}`,
      data: { productId: product.id },
      timestamp: new Date().toISOString()
    };

    this.broadcastNotification(notification);
  }

  /**
   * Handle product updates
   */
  static handleProductUpdate(oldProduct, newProduct) {
    // Check if it's a significant update worth notifying about
    const significantChanges = [
      'name', 'description', 'category_id', 'status'
    ];

    const hasSignificantChange = significantChanges.some(
      field => oldProduct[field] !== newProduct[field]
    );

    if (hasSignificantChange) {
      const notification = {
        type: 'product_update',
        title: 'Product Updated 📝',
        message: `${newProduct.name} has been updated`,
        data: { productId: newProduct.id },
        timestamp: new Date().toISOString()
      };

      this.broadcastNotification(notification);
    }
  }

  /**
   * Handle stock level changes
   */
  static handleStockChange(oldProduct, newProduct) {
    const oldStock = oldProduct.stock_quantity || 0;
    const newStock = newProduct.stock_quantity || 0;

    // Back in stock notification
    if (oldStock === 0 && newStock > 0) {
      const notification = {
        type: 'back_in_stock',
        title: 'Back in Stock! ✅',
        message: `${newProduct.name} is now available`,
        data: { productId: newProduct.id },
        priority: 'high',
        timestamp: new Date().toISOString()
      };

      this.broadcastNotification(notification);
    }
    
    // Low stock warning
    else if (newStock > 0 && newStock <= 5 && oldStock > 5) {
      const notification = {
        type: 'low_stock',
        title: 'Limited Stock! ⚠️',
        message: `Only ${newStock} left of ${newProduct.name}`,
        data: { productId: newProduct.id },
        priority: 'medium',
        timestamp: new Date().toISOString()
      };

      this.broadcastNotification(notification);
    }
    
    // Out of stock notification
    else if (oldStock > 0 && newStock === 0) {
      const notification = {
        type: 'out_of_stock',
        title: 'Out of Stock 📦',
        message: `${newProduct.name} is currently unavailable`,
        data: { productId: newProduct.id },
        priority: 'low',
        timestamp: new Date().toISOString()
      };

      this.broadcastNotification(notification);
    }

    // Update any open product pages with new stock info
    this.updateProductPages(newProduct.id, { stock_quantity: newStock });
  }

  /**
   * Handle price changes
   */
  static handlePriceChange(oldProduct, newProduct) {
    const oldPrice = parseFloat(oldProduct.price) || 0;
    const newPrice = parseFloat(newProduct.price) || 0;
    
    if (oldPrice === newPrice) return;

    const priceChange = ((newPrice - oldPrice) / oldPrice) * 100;
    const isPriceDrop = newPrice < oldPrice;
    
    // Only notify for significant price changes (>5%)
    if (Math.abs(priceChange) >= 5) {
      const notification = {
        type: isPriceDrop ? 'price_drop' : 'price_increase',
        title: isPriceDrop ? 'Price Drop! 📉' : 'Price Updated 📈',
        message: `${newProduct.name} is now GH₵${newPrice.toFixed(2)} ${
          isPriceDrop 
            ? `(${Math.abs(priceChange).toFixed(1)}% off!)` 
            : `(${priceChange.toFixed(1)}% increase)`
        }`,
        data: { 
          productId: newProduct.id, 
          oldPrice, 
          newPrice, 
          priceChange 
        },
        priority: isPriceDrop ? 'high' : 'low',
        timestamp: new Date().toISOString()
      };

      this.broadcastNotification(notification);
    }

    // Update any open product pages with new price info
    this.updateProductPages(newProduct.id, { 
      price: newPrice, 
      oldPrice: oldPrice !== newPrice ? oldPrice : null 
    });
  }

  /**
   * Broadcast notification to all listeners
   */
  static broadcastNotification(notification) {
    // Dispatch custom event for components to listen to
    const event = new CustomEvent('realtimeNotification', {
      detail: notification
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }

    // Also log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Real-time notification:', notification);
    }
  }

  /**
   * Update product pages with real-time data
   */
  static updateProductPages(productId, updates) {
    const event = new CustomEvent('productUpdate', {
      detail: { productId, updates }
    });
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  /**
   * Simulate real-time events for demo purposes
   */
  static startDemoMode() {
    console.log('Starting real-time demo mode...');

    // Simulate stock changes every 30 seconds
    setInterval(() => {
      if (Math.random() > 0.7) {
        this.simulateStockChange();
      }
    }, 30000);

    // Simulate price changes every 60 seconds
    setInterval(() => {
      if (Math.random() > 0.8) {
        this.simulatePriceChange();
      }
    }, 60000);

    // Initial demo notifications
    setTimeout(() => this.simulateStockChange(), 5000);
    setTimeout(() => this.simulatePriceChange(), 10000);
  }

  /**
   * Simulate stock change for demo
   */
  static simulateStockChange() {
    const mockProducts = [
      { id: 1, name: 'Brake Pads Set', stock_quantity: Math.floor(Math.random() * 20) },
      { id: 2, name: 'Engine Oil Filter', stock_quantity: Math.floor(Math.random() * 15) },
      { id: 3, name: 'Spark Plugs', stock_quantity: Math.floor(Math.random() * 25) }
    ];

    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const oldStock = Math.floor(Math.random() * 20) + 5;
    
    this.handleStockChange(
      { ...product, stock_quantity: oldStock },
      product
    );
  }

  /**
   * Simulate price change for demo
   */
  static simulatePriceChange() {
    const mockProducts = [
      { id: 1, name: 'Brake Pads Set', price: 89.99 },
      { id: 2, name: 'Engine Oil Filter', price: 24.99 },
      { id: 3, name: 'Spark Plugs', price: 45.99 }
    ];

    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const priceVariation = (Math.random() - 0.5) * 0.2; // ±10% variation
    const newPrice = product.price * (1 + priceVariation);
    
    this.handlePriceChange(
      product,
      { ...product, price: newPrice }
    );
  }

  /**
   * Add custom notification listener
   */
  static addNotificationListener(callback) {
    if (typeof window !== 'undefined') {
      window.addEventListener('realtimeNotification', callback);
    }
  }

  /**
   * Remove notification listener
   */
  static removeNotificationListener(callback) {
    if (typeof window !== 'undefined') {
      window.removeEventListener('realtimeNotification', callback);
    }
  }

  /**
   * Add product update listener
   */
  static addProductUpdateListener(callback) {
    if (typeof window !== 'undefined') {
      window.addEventListener('productUpdate', callback);
    }
  }

  /**
   * Remove product update listener
   */
  static removeProductUpdateListener(callback) {
    if (typeof window !== 'undefined') {
      window.removeEventListener('productUpdate', callback);
    }
  }

  /**
   * Clean up all subscriptions
   */
  static cleanup() {
    this.listeners.forEach((subscription, key) => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    });
    
    this.listeners.clear();
    this.isInitialized = false;
  }

  /**
   * Check connection status
   */
  static getConnectionStatus() {
    return {
      isConnected: this.isInitialized,
      activeSubscriptions: this.listeners.size,
      subscriptions: Array.from(this.listeners.keys())
    };
  }
}

export default RealtimeService; 