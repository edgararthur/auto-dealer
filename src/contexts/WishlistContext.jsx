import React, { createContext, useState, useContext, useEffect } from 'react';
import WishlistService from '../../shared/services/wishlistService.js';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const { user } = useAuth();
  
  // Load wishlist items when user changes
  useEffect(() => {
    if (user) {
      fetchWishlistItems();
      fetchWishlistCount();
    } else {
      setWishlist([]);
      setCount(0);
      setLoading(false);
    }
  }, [user]);
  
  // Fetch user's wishlist items using WishlistService
  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const result = await WishlistService.getWishlist();
      
      if (result.success) {
        setWishlist(result.wishlist || []);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching wishlist:', result.error);
        }
        setWishlist([]);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching wishlist items:', error);
      }
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch wishlist count
  const fetchWishlistCount = async () => {
    try {
      const result = await WishlistService.getWishlistCount();
      if (result.success) {
        setCount(result.count || 0);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching wishlist count:', error);
      }
    }
  };
  
  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    return wishlist.some(item => item.product?.id === productId);
  };
  
  // Add product to wishlist
  const addToWishlist = async (productId) => {
    try {
      const result = await WishlistService.addToWishlist(productId);
      
      if (result.success) {
        await fetchWishlistItems();
        await fetchWishlistCount();
        return true;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error adding to wishlist:', result.error);
        }
        return false;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding to wishlist:', error);
      }
      return false;
    }
  };
  
  // Remove product from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      const result = await WishlistService.removeFromWishlist(productId);
      
      if (result.success) {
        setWishlist(wishlist.filter(item => item.product?.id !== productId));
        setCount(Math.max(0, count - 1));
        return true;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error removing from wishlist:', result.error);
        }
        return false;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing from wishlist:', error);
      }
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
    try {
      const result = await WishlistService.clearWishlist();
      
      if (result.success) {
        setWishlist([]);
        setCount(0);
        return true;
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error clearing wishlist:', result.error);
        }
        return false;
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error clearing wishlist:', error);
      }
      return false;
    }
  };
  
  // Move wishlist items to cart
  const moveToCart = async (productIds = []) => {
    try {
      const result = await WishlistService.moveToCart(productIds);
      
      if (result.success) {
        await fetchWishlistItems();
        await fetchWishlistCount();
        return {
          success: true,
          movedCount: result.movedCount,
          unavailableCount: result.unavailableCount
        };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error moving to cart:', error);
      }
      return { success: false, error: error.message };
    }
  };
  
  // Get wishlist analytics
  const getAnalytics = async () => {
    try {
      const result = await WishlistService.getWishlistAnalytics();
      return result;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error getting wishlist analytics:', error);
      }
      return { success: false, error: error.message };
    }
  };
  
  // Context value
  const value = {
    wishlist,
    wishlistItems: wishlist, // Alias for backward compatibility
    loading,
    count,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    clearWishlist,
    moveToCart,
    getAnalytics,
    refetchWishlist: fetchWishlistItems
  };
  
  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext; 