import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from 'autoplus-shared';
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
            .select(`
              id,
              name,
              created_at,
              cart_items (*)
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          if (savedCartsError) throw savedCartsError;
          
          setSavedCarts(savedCartsData || []);
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
  const addToCart = async (productId, quantity = 1, variantId = null) => {
    // Check if product already exists in cart
    const existingItemIndex = items.findIndex(item => 
      item.product_id === productId && item.variant_id === variantId
    );
    
    if (existingItemIndex > -1) {
      // Update quantity of existing item
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += quantity;
      setItems(updatedItems);
      
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
        product: null // Will be populated when fetched from database or API
      };
      
      // Add item to database if user is logged in
      if (user) {
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
            variant_id: variantId
          })
          .select('id')
          .single();
          
        if (error) {
          console.error('Error adding item to cart:', error);
        } else {
          newItem.id = data.id;
        }
      }
      
      setItems([...items, newItem]);
      
      // Fetch complete product data
      fetchProductDetails(productId, newItem.id);
    }
  };
  
  // Fetch product details for cart item
  const fetchProductDetails = async (productId, cartItemId) => {
    try {
      const { data: productData, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          image,
          product_images(url),
          dealer:dealer_id(name)
        `)
        .eq('id', productId)
        .single();
        
      if (error) throw error;
      
      setItems(prevItems => 
        prevItems.map(item => 
          item.id === cartItemId 
            ? { 
                ...item, 
                product: {
                  id: productData.id,
                  name: productData.name,
                  price: productData.price,
                  image: productData.product_images?.[0]?.url || productData.image,
                  dealer: productData.dealer?.name
                }
              }
            : item
        )
      );
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
      const price = item.product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };
  
  // Add to value
  const value = {
    items,
    loading,
    addToCart,
    updateCartItem,
    removeCartItem,
    clearCart,
    getCartItemCount,
    getCartTotal,
    savedCarts,
    saveCartForLater,
    loadSavedCart,
    deleteSavedCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext; 