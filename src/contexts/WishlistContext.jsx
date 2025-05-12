import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from 'autoplus-shared';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Load wishlist items when user changes
  useEffect(() => {
    if (user) {
      fetchWishlistItems();
    } else {
      setWishlist([]);
      setLoading(false);
    }
  }, [user]);
  
  // Fetch user's wishlist items from database
  const fetchWishlistItems = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id,
          product_id,
          products:product_id(
            id,
            name,
            price,
            image,
            product_images(url),
            dealer:dealer_id(name)
          )
        `)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setWishlist(data);
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product_id === productId);
  };
  
  // Add product to wishlist
  const addToWishlist = async (productId) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: user.id,
          product_id: productId
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Fetch product details to add to wishlist
      const { data: productData, error: productError } = await supabase
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
        
      if (productError) throw productError;
      
      const newWishlistItem = {
        ...data,
        products: productData
      };
      
      setWishlist([...wishlist, newWishlistItem]);
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      return false;
    }
  };
  
  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
        
      if (error) throw error;
      
      setWishlist(wishlist.filter(item => item.product_id !== productId));
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      return false;
    }
  };
  
  // Toggle product in wishlist
  const toggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  };
  
  // Clear entire wishlist
  const clearWishlist = async () => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setWishlist([]);
      return true;
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      return false;
    }
  };
  
  // Context value
  const value = {
    wishlist,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    refetchWishlist: fetchWishlistItems
  };
  
  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext; 