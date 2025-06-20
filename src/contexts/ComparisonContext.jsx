import React, { createContext, useState, useContext, useEffect } from 'react';
import ComparisonService from '../../shared/services/comparisonService.js';
import { useAuth } from './AuthContext';

const ComparisonContext = createContext();

export const useComparison = () => useContext(ComparisonContext);

export const ComparisonProvider = ({ children }) => {
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  // Load comparison items from localStorage or database on component mount
  useEffect(() => {
    fetchComparisonItems();
    fetchComparisonCount();
  }, [user]);

  // Fetch user's comparison items using ComparisonService
  const fetchComparisonItems = async () => {
    try {
      setLoading(true);
      const result = await ComparisonService.getComparison();
      
      if (result.success) {
        setComparison(result.comparison || []);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error('Error fetching comparison:', result.error);
        }
        setComparison([]);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching comparison items:', error);
      }
      setComparison([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comparison count
  const fetchComparisonCount = async () => {
    try {
      const result = await ComparisonService.getComparisonCount();
      if (result.success) {
        setCount(result.count || 0);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error fetching comparison count:', error);
      }
    }
  };

  // Check if product is in comparison
  const isInComparison = (productId) => {
    return comparison.some(item => item.product?.id === productId);
  };

  // Add product to comparison
  const addToComparison = async (productId) => {
    try {
      const result = await ComparisonService.addToComparison(productId);
      
      if (result.success) {
        await fetchComparisonItems();
        await fetchComparisonCount();
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error adding to comparison:', error);
      }
      return { success: false, error: error.message };
    }
  };

  // Remove product from comparison
  const removeFromComparison = async (productId) => {
    try {
      const result = await ComparisonService.removeFromComparison(productId);
      
      if (result.success) {
        setComparison(comparison.filter(item => item.product?.id !== productId));
        setCount(Math.max(0, count - 1));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing from comparison:', error);
      }
      return { success: false, error: error.message };
    }
  };

  // Toggle product in comparison
  const toggleComparison = async (productId) => {
    if (isInComparison(productId)) {
      return await removeFromComparison(productId);
    } else {
      return await addToComparison(productId);
    }
  };

  // Clear entire comparison
  const clearComparison = async () => {
    try {
      const result = await ComparisonService.clearComparison();
      
      if (result.success) {
        setComparison([]);
        setCount(0);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error clearing comparison:', error);
      }
      return { success: false, error: error.message };
    }
  };

  // Context value
  const value = {
    comparison,
    comparisonItems: comparison, // Alias for backward compatibility
    count,
    loading,
    isInComparison,
    addToComparison,
    removeFromComparison,
    toggleComparison,
    clearComparison,
    refetchComparison: fetchComparisonItems
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

export default ComparisonContext; 