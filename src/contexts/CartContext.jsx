import React, { createContext, useState, useContext, useEffect } from 'react';
import supabase from '../../shared/supabase/supabaseClient.js';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedCarts, setSavedCarts] = useState([]);
  const { user } = useAuth();
  
  // Load cart items from localStorage or database on component mount
  useEffect(() => {
    const loadCartData = async () => {
      setLoading(true);
      try {
        if (user) {
          // If user is logged in, load from database
          // Load cart items
          const { data: cartData, error: cartError } = await supabase
            .from('cart_items')
            .select('*')
            .eq('user_id', user.id)
            .is('saved_cart_id', null);
          
          if (cartError) throw cartError;
          
          setItems(cartData || []);
          
          // Load saved carts
          const { data: savedCartsData, error: savedCartsError } = await supabase
            .from('saved_carts')
            .select('id, name, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (savedCartsError) {
            console.warn('Saved carts feature not available:', savedCartsError);
            setSavedCarts([]);
          } else {
            // Get cart items for each saved cart separately
            const cartsWithItems = await Promise.all(
              (savedCartsData || []).map(async (cart) => {
                const { data: cartItems } = await supabase
                  .from('cart_items')
                  .select('*')
                  .eq('saved_cart_id', cart.id);
                
                return {
                  ...cart,
                  cart_items: cartItems || []
                };
              })
            );
            
            setSavedCarts(cartsWithItems);
          }
        } else {
          // If not logged in, load from localStorage
          const savedItems = localStorage.getItem('cartItems');
          setItems(savedItems ? JSON.parse(savedItems) : []);
          
          const savedCartsData = localStorage.getItem('savedCarts');
          setSavedCarts(savedCartsData ? JSON.parse(savedCartsData) : []);
        }
      } catch (error) {
        console.error('Error loading cart data:', error);
        // Fallback to localStorage
        const savedItems = localStorage.getItem('cartItems');
        setItems(savedItems ? JSON.parse(savedItems) : []);
        
        const savedCartsData = localStorage.getItem('savedCarts');
        setSavedCarts(savedCartsData ? JSON.parse(savedCartsData) : []);
      } finally {
        setLoading(false);
      }
    };
    
    loadCartData();
  }, [user]);

  // Save cart items to localStorage and database if user is logged in
  useEffect(() => {
    if (!loading) {
      // Save to localStorage
      localStorage.setItem('cartItems', JSON.stringify(items));
      
      // Save to database if user is logged in
      if (user) {
        const saveToDatabase = async () => {
          try {
            // First, remove all existing items
            await supabase
              .from('cart_items')
              .delete()
              .eq('user_id', user.id)
              .is('saved_cart_id', null);
            
            // Then, add current items
            if (items.length > 0) {
              const cartData = items.map(item => ({
                ...item,
                user_id: user.id,
                saved_cart_id: null
              }));
              
              await supabase.from('cart_items').insert(cartData);
            }
          } catch (error) {
            console.error('Error saving cart items to database:', error);
          }
        };
        
        saveToDatabase();
      }
    }
  }, [items, loading, user]);

  // Save savedCarts to localStorage and database if user is logged in
  useEffect(() => {
    if (!loading) {
      // Save to localStorage
      localStorage.setItem('savedCarts', JSON.stringify(savedCarts));
    }
  }, [savedCarts, loading]);

  // Save current cart for later
  const saveCartForLater = async (name) => {
    if (items.length === 0) {
      return { success: false, error: 'Cart is empty' };
    }
    
    try {
      const cartName = name || `Cart ${new Date().toLocaleString()}`;
      
      if (user) {
        // Save to database
        const { data, error } = await supabase
          .from('saved_carts')
          .insert({
            user_id: user.id,
            name: cartName,
            created_at: new Date()
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Save cart items with reference to saved cart
        const cartItemsData = items.map(item => ({
          ...item,
          user_id: user.id,
          saved_cart_id: data.id
        }));
        
        await supabase.from('cart_items').insert(cartItemsData);
        
        // Add saved cart to state with cart items
        const newSavedCart = {
          ...data,
          cart_items: cartItemsData
        };
        
        setSavedCarts([newSavedCart, ...savedCarts]);
      } else {
        // Save to localStorage
        const savedCartId = Date.now().toString(); // Generate a unique ID
        
        const newSavedCart = {
          id: savedCartId,
          name: cartName,
          created_at: new Date(),
          cart_items: items
        };
        
        setSavedCarts([newSavedCart, ...savedCarts]);
      }
      
      // Clear current cart
      setItems([]);
      
      return { success: true };
    } catch (error) {
      console.error('Error saving cart for later:', error);
      return { success: false, error: error.message };
    }
  };

  // Load a saved cart
  const loadSavedCart = async (savedCartId, replace = true) => {
    try {
      const savedCart = savedCarts.find(cart => cart.id === savedCartId);
      
      if (!savedCart) {
        return { success: false, error: 'Saved cart not found' };
      }
      
      // If replace is true, replace current cart, otherwise merge
      if (replace) {
        setItems(savedCart.cart_items);
      } else {
        // Merge the items, ensuring no duplicates
        const newItems = [...items];
        
        savedCart.cart_items.forEach(savedItem => {
          const existingItemIndex = newItems.findIndex(item => 
            item.product_id === savedItem.product_id && 
            item.variant_id === savedItem.variant_id
          );
          
          if (existingItemIndex >= 0) {
            // Update existing item quantity
            newItems[existingItemIndex].quantity += savedItem.quantity;
          } else {
            // Add new item
            newItems.push(savedItem);
          }
        });
        
        setItems(newItems);
      }
      
      // Remove the saved cart
      await deleteSavedCart(savedCartId);
      
      return { success: true };
    } catch (error) {
      console.error('Error loading saved cart:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete a saved cart
  const deleteSavedCart = async (savedCartId) => {
    try {
      // Remove from state
      setSavedCarts(savedCarts.filter(cart => cart.id !== savedCartId));
      
      if (user) {
        // Remove from database
        await supabase
          .from('cart_items')
          .delete()
          .eq('saved_cart_id', savedCartId);
        
        await supabase
          .from('saved_carts')
          .delete()
          .eq('id', savedCartId);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting saved cart:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Add an item to the cart
  const addToCart = async (productId, quantity = 1, options = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Adding to cart:', { productId, quantity, options });
  }
    
    const { variantId = null, dealerId = null, price = null } = options;
    
    // Check if product already exists in cart from the same dealer
    const existingItemIndex = items.findIndex(item => 
      item.product_id === productId && 
      item.variant_id === variantId &&
      item.dealer_id === dealerId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity of existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      setItems(updatedItems);
      if (process.env.NODE_ENV === 'development') {
        console.log('Updated existing item quantity:', updatedItems[existingItemIndex]);
  }
      
      if (user) {
        await updateCartItemInDatabase(
          updatedItems[existingItemIndex].id, 
          updatedItems[existingItemIndex].quantity
        );
      }
    } else {
      // Add new item to cart
      const newItem = {
        id: Date.now().toString(), // Temporary ID if not in database
        product_id: productId,
        quantity,
        variant_id: variantId,
        dealer_id: dealerId,
        custom_price: price, // For dealer-specific pricing
        product: null // Will be populated when fetched from database or API
      };
      
      if (process.env.NODE_ENV === 'development') {
      
        console.log('Adding new item to cart:', newItem);
  }
      
      // Add item to database if user is logged in
      if (user) {
        try {
          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: user.id,
              product_id: productId,
              quantity,
              variant_id: variantId,
              dealer_id: dealerId,
              custom_price: price
            })
            .select('id')
            .single();
            
          if (error) {
            console.error('Error adding item to cart database:', error);
          } else {
            newItem.id = data.id;
            if (process.env.NODE_ENV === 'development') {
              console.log('Item added to database with ID:', data.id);
  }
          }
        } catch (dbError) {
          console.error('Database error when adding to cart:', dbError);
        }
      }
      
      // Add to state immediately
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      if (process.env.NODE_ENV === 'development') {
        console.log('Updated cart items state:', updatedItems);
  }
      
      // Fetch complete product data including dealer info
      await fetchProductDetails(productId, newItem.id);
    }
  };
  
  // Fetch product details for cart item
  const fetchProductDetails = async (productId, cartItemId) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching product details for:', { productId, cartItemId });
  }
    
    try {
      // Get basic product data
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id, name, price, dealer_id, category_id')
        .eq('id', productId)
        .single();
        
      if (productError) {
        console.error('Error fetching product data:', productError);
        throw productError;
      }
      
      if (process.env.NODE_ENV === 'development') {
      
        console.log('Product data fetched:', productData);
  }
      
      // Get related data separately
      const [imagesResult, categoryResult, dealerResult] = await Promise.allSettled([
        supabase
          .from('product_images')
          .select('url, is_primary')
          .eq('product_id', productId),
        productData.category_id ? supabase
          .from('categories')
          .select('id, name')
          .eq('id', productData.category_id)
          .single() : null,
        supabase
          .from('profiles')
          .select('id, name, business_name, company_name, city, state, verified, rating')
          .eq('id', productData.dealer_id)
          .single()
      ]);
      
      const images = imagesResult.status === 'fulfilled' ? imagesResult.value.data || [] : [];
      const category = categoryResult?.status === 'fulfilled' ? categoryResult.value.data : null;
      const dealer = dealerResult.status === 'fulfilled' ? dealerResult.value.data : null;
      
      if (process.env.NODE_ENV === 'development') {
      
        console.log('Related data fetched:', { 
        images: images.length, 
        category: category?.name, 
        dealer: dealer?.business_name || dealer?.name 
      });
  }
      
      const primaryImage = images.find(img => img.is_primary) || images[0];
      
      const enrichedItem = {
        name: productData.name,
        price: productData.price, // Use product price as base
        image: primaryImage?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
        category: category,
        dealer: dealer ? {
          id: dealer.id,
          company_name: dealer.business_name || dealer.company_name || dealer.name,
          location: dealer.city && dealer.state ? `${dealer.city}, ${dealer.state}` : 'Location not available',
          rating: dealer.rating || 0,
          verified: dealer.verified || false
        } : null
      };
      
      if (process.env.NODE_ENV === 'development') {
      
        console.log('Enriched item data:', enrichedItem);
  }
      
      setItems(prevItems => {
        const updatedItems = prevItems.map(item => 
          item.id === cartItemId 
            ? { ...item, ...enrichedItem }
            : item
        );
        if (process.env.NODE_ENV === 'development') {
          console.log('Updated cart items after enrichment:', updatedItems);
  }
        return updatedItems;
      });
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };
  
  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    if (quantity <= 0) {
      removeCartItem(itemId);
      return;
    }
    
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, quantity } : item
    );
    
    setItems(updatedItems);
    
    if (user) {
      await updateCartItemInDatabase(itemId, quantity);
    }
  };
  
  // Update cart item in database
  const updateCartItemInDatabase = async (itemId, quantity) => {
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('user_id', user.id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };
  
  // Remove item from cart
  const removeCartItem = async (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
    
    if (user) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId)
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (error) {
        console.error('Error removing cart item:', error);
      }
    }
  };
  
  // Clear entire cart
  const clearCart = async () => {
    setItems([]);
    
    if (user) {
      try {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);
          
        if (error) throw error;
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    } else {
      localStorage.removeItem('cartItems');
    }
  };
  
  // Get total number of items in cart
  const getCartItemCount = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };
  
  // Get total cart value
  const getCartTotal = () => {
    return items.reduce((total, item) => {
      const price = item.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  // Group cart items by dealer
  const getCartItemsByDealer = () => {
    return items.reduce((groups, item) => {
      const dealerId = item.dealer?.id || 'unknown';
      const dealerKey = `${dealerId}-${item.dealer?.company_name || 'Unknown Dealer'}`;
      
      if (!groups[dealerKey]) {
        groups[dealerKey] = {
          dealer: item.dealer || {
            id: 'unknown',
            company_name: 'Unknown Dealer',
            location: 'Unknown Location',
            rating: 0,
            verified: false
          },
          items: []
        };
      }
      
      groups[dealerKey].items.push(item);
      return groups;
    }, {});
  };

  // Get cart totals grouped by dealer
  const getCartTotalsByDealer = () => {
    const groupedItems = getCartItemsByDealer();
    const totals = {};
    let overallTotal = 0;

    Object.keys(groupedItems).forEach(dealerKey => {
      const group = groupedItems[dealerKey];
      let subtotal = 0;
      
      group.items.forEach(item => {
        subtotal += (item.price || 0) * (item.quantity || 1);
      });
      
      // Calculate shipping per dealer (mock calculation)
      const shipping = subtotal >= 100 ? 0 : (group.dealer?.shippingRate || 9.99);
      const total = subtotal + shipping;
      
      totals[dealerKey] = {
        subtotal,
        shipping,
        total
      };
      
      overallTotal += total;
    });

    return {
      dealerTotals: totals,
      grandTotal: overallTotal
    };
  };
  
  // Debug function to log cart state
  const debugCartState = () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== CART DEBUG INFO ===');
  }
    if (process.env.NODE_ENV === 'development') {
      console.log('Items count:', items.length);
  }
    if (process.env.NODE_ENV === 'development') {
      console.log('Items:', items);
  }
    if (process.env.NODE_ENV === 'development') {
      console.log('Loading:', loading);
  }
    if (process.env.NODE_ENV === 'development') {
      console.log('User:', user?.id);
  }
    if (process.env.NODE_ENV === 'development') {
      console.log('========================');
  }
  };

  // Add to value
  const value = {
    items,
    cartItems: items, // Alias for backward compatibility
    loading,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getCartItemCount,
    getCartTotal,
    getCartItemsByDealer,
    getCartTotalsByDealer,
    savedCarts,
    saveCartForLater,
    loadSavedCart,
    deleteSavedCart,
    debugCartState // For debugging purposes
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 