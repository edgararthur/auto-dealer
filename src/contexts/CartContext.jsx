import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import supabase from '../../shared/supabase/supabaseClient.js';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Safely get user from auth context
  const authContext = useAuth();
  const user = authContext?.user;

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedCarts, setSavedCarts] = useState([]);

  // Group cart items by dealer for multi-tenant support
  const itemsByDealer = items.reduce((acc, item) => {
    const dealerId = item.dealer_id || item.dealerId || 'unknown';
    if (!acc[dealerId]) {
      acc[dealerId] = {
        dealerId,
        dealerName: item.dealer?.business_name || item.dealer?.company_name || 'Unknown Dealer',
        dealerInfo: item.dealer || null,
        items: [],
        subtotal: 0,
        itemCount: 0
      };
    }
    acc[dealerId].items.push(item);
    acc[dealerId].subtotal += (item.price * item.quantity);
    acc[dealerId].itemCount += item.quantity;
    return acc;
  }, {});

  // Calculate totals
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalDealers = Object.keys(itemsByDealer).length;

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('autora_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('autora_cart', JSON.stringify(items));
  }, [items]);

  // Load cart from database if user is logged in
  useEffect(() => {
    if (user?.id) {
      loadCartFromDatabase();
    }
  }, [user]);

  const loadCartFromDatabase = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // TODO: Fix database schema - cart_items table doesn't exist or lacks proper foreign key relationship
      // For now, skip database loading to prevent errors
      console.log('Cart database loading temporarily disabled due to schema issues');
      
      // Keep existing localStorage items instead of clearing them
      // setItems([]);
      
    } catch (error) {
      console.error('Error loading cart from database:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      const existingItemIndex = items.findIndex(item => item.product_id === product.id);
      
      if (existingItemIndex > -1) {
        // Update existing item
        const newQuantity = items[existingItemIndex].quantity + quantity;
        
        // Check stock availability
        if (newQuantity > product.stock_quantity) {
          throw new Error(`Only ${product.stock_quantity} items available in stock`);
        }

        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantity = newQuantity;
        setItems(updatedItems);

        // Skip database update for now
        // if (user?.id) {
        //   await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', items[existingItemIndex].id);
        // }
      } else {
        // Add new item
        if (quantity > product.stock_quantity) {
          throw new Error(`Only ${product.stock_quantity} items available in stock`);
        }

        const newItem = {
          id: Date.now(), // Temp ID
          product_id: product.id,
          name: product.name,
          price: product.discount_price || product.price,
          originalPrice: product.discount_price ? product.price : null,
          quantity,
          stock_quantity: product.stock_quantity,
          image: product.image,
          dealer_id: product.dealer_id || product.dealerId,
          dealer: product.dealer || {
            id: product.dealer_id || product.dealerId,
            business_name: 'Unknown Dealer',
            company_name: 'Unknown Dealer'
          },
          added_at: new Date().toISOString()
        };

        // Skip database insert for now
        // if (user?.id) {
        //   const { data, error } = await supabase.from('cart_items').insert({...}).select().single();
        // }

        setItems([...items, newItem]);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, error: error.message };
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const itemToRemove = items.find(item => item.product_id === productId);
      
      if (!itemToRemove) return { success: false, error: 'Item not found in cart' };

      // Skip database removal for now
      // if (user?.id && itemToRemove.id) {
      //   await supabase.from('cart_items').delete().eq('id', itemToRemove.id);
      // }

      setItems(items.filter(item => item.product_id !== productId));
      return { success: true };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, error: error.message };
    }
  };
  
  const updateQuantity = async (productId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        return removeFromCart(productId);
      }

      const itemIndex = items.findIndex(item => item.product_id === productId);
      if (itemIndex === -1) return { success: false, error: 'Item not found in cart' };

      const item = items[itemIndex];
      
      // Check stock availability
      if (newQuantity > item.stock_quantity) {
        throw new Error(`Only ${item.stock_quantity} items available in stock`);
      }

      // Skip database update for now
      // if (user?.id && item.id) {
      //   await supabase.from('cart_items').update({ quantity: newQuantity }).eq('id', item.id);
      // }

      const updatedItems = [...items];
      updatedItems[itemIndex].quantity = newQuantity;
      setItems(updatedItems);

      return { success: true };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, error: error.message };
    }
  };

  const clearCart = async () => {
    try {
      // Skip database clearing for now
      // if (user?.id) {
      //   await supabase.from('cart_items').delete().eq('customer_id', user.id);
      // }

      setItems([]);
      return { success: true };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, error: error.message };
    }
  };

  const clearDealerCart = async (dealerId) => {
    try {
      // Skip database operations for now
      setItems(items.filter(item => (item.dealer_id || item.dealerId) !== dealerId));
      return { success: true };
    } catch (error) {
      console.error('Error clearing dealer cart:', error);
      return { success: false, error: error.message };
    }
  };

  const getItemQuantity = (productId) => {
    const item = items.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId) => {
    return items.some(item => item.product_id === productId);
  };

  // Get shipping cost for a dealer (could be customized per dealer)
  const getDealerShippingCost = (dealerId) => {
    const dealerCart = itemsByDealer[dealerId];
    if (!dealerCart) return 0;

    // Simple shipping logic - could be enhanced based on dealer settings
    if (dealerCart.subtotal >= 100) return 0; // Free shipping over $100
    return 9.99; // Standard shipping
  };

  // Get total cost including shipping for all dealers
  const getTotalWithShipping = () => {
    let total = totalAmount;
    Object.keys(itemsByDealer).forEach(dealerId => {
      total += getDealerShippingCost(dealerId);
    });
    return total;
  };

  // Saved cart functionality
  const saveCartForLater = async (cartName) => {
    try {
      if (items.length === 0) {
        return { success: false, error: 'Cart is empty' };
      }

      const savedCart = {
        id: Date.now().toString(),
        name: cartName || `Cart saved on ${new Date().toLocaleDateString()}`,
        items: [...items],
        totalItems: totalItems,
        totalAmount: totalAmount,
        savedAt: new Date().toISOString(),
        userId: user?.id || 'guest'
      };

      // Save to localStorage for now
      const existingSavedCarts = JSON.parse(localStorage.getItem('autora_saved_carts') || '[]');
      const updatedSavedCarts = [...existingSavedCarts, savedCart];
      localStorage.setItem('autora_saved_carts', JSON.stringify(updatedSavedCarts));
      
      setSavedCarts(updatedSavedCarts);
      
      // Clear current cart after saving
      setItems([]);
      
      return { success: true, cart: savedCart };
    } catch (error) {
      console.error('Error saving cart:', error);
      return { success: false, error: error.message };
    }
  };

  const loadSavedCart = async (cartId) => {
    try {
      const existingSavedCarts = JSON.parse(localStorage.getItem('autora_saved_carts') || '[]');
      const cartToLoad = existingSavedCarts.find(cart => cart.id === cartId);
      
      if (!cartToLoad) {
        return { success: false, error: 'Saved cart not found' };
      }

      // Add saved cart items to current cart
      setItems(cartToLoad.items);
      
      return { success: true };
    } catch (error) {
      console.error('Error loading saved cart:', error);
      return { success: false, error: error.message };
    }
  };

  const deleteSavedCart = async (cartId) => {
    try {
      const existingSavedCarts = JSON.parse(localStorage.getItem('autora_saved_carts') || '[]');
      const updatedSavedCarts = existingSavedCarts.filter(cart => cart.id !== cartId);
      
      localStorage.setItem('autora_saved_carts', JSON.stringify(updatedSavedCarts));
      setSavedCarts(updatedSavedCarts);
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting saved cart:', error);
      return { success: false, error: error.message };
    }
  };

  // Load saved carts on mount
  React.useEffect(() => {
    const loadSavedCarts = () => {
      try {
        const existingSavedCarts = JSON.parse(localStorage.getItem('autora_saved_carts') || '[]');
        setSavedCarts(existingSavedCarts);
      } catch (error) {
        console.error('Error loading saved carts:', error);
        setSavedCarts([]);
      }
    };
    
    loadSavedCarts();
  }, []);

  const value = {
    items,
    itemsByDealer,
    totalItems,
    totalAmount,
    totalDealers,
    loading,
    savedCarts,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearDealerCart,
    getItemQuantity,
    isInCart,
    getDealerShippingCost,
    getTotalWithShipping,
    loadCartFromDatabase,
    saveCartForLater,
    loadSavedCart,
    deleteSavedCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 