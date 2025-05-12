import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import supabase from '../../shared/supabase/supabaseClient';

const ComparisonContext = createContext();

export const useComparison = () => useContext(ComparisonContext);

export const ComparisonProvider = ({ children }) => {
  const { user } = useAuth();
  const [comparisonItems, setComparisonItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load comparison items from localStorage or database on component mount
  useEffect(() => {
    const loadComparisonItems = async () => {
      setLoading(true);
      try {
        if (user) {
          // If user is logged in, load from database
          const { data, error } = await supabase
            .from('user_comparison')
            .select('product_id')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          // Extract product IDs
          const productIds = data.map(item => item.product_id);
          setComparisonItems(productIds);
        } else {
          // If not logged in, load from localStorage
          const savedItems = localStorage.getItem('comparisonItems');
          setComparisonItems(savedItems ? JSON.parse(savedItems) : []);
        }
      } catch (error) {
        console.error('Error loading comparison items:', error);
        // Fallback to localStorage
        const savedItems = localStorage.getItem('comparisonItems');
        setComparisonItems(savedItems ? JSON.parse(savedItems) : []);
      } finally {
        setLoading(false);
      }
    };
    
    loadComparisonItems();
  }, [user]);

  // Save comparison items to localStorage and database if user is logged in
  useEffect(() => {
    if (!loading) {
      // Save to localStorage
      localStorage.setItem('comparisonItems', JSON.stringify(comparisonItems));
      
      // Save to database if user is logged in
      if (user) {
        const saveToDatabase = async () => {
          // First, remove all existing items
          await supabase
            .from('user_comparison')
            .delete()
            .eq('user_id', user.id);
            
          // Then, add current items
          if (comparisonItems.length > 0) {
            const comparisonData = comparisonItems.map(productId => ({
              user_id: user.id,
              product_id: productId,
              created_at: new Date()
            }));
            
            await supabase
              .from('user_comparison')
              .insert(comparisonData);
          }
        };
        
        saveToDatabase().catch(error => 
          console.error('Error saving comparison items to database:', error)
        );
      }
    }
  }, [comparisonItems, loading, user]);

  // Add product to comparison
  const addToComparison = (productId) => {
    if (!comparisonItems.includes(productId)) {
      // Limit to 4 items max for comparison
      if (comparisonItems.length >= 4) {
        // Remove the oldest item (first in the array)
        setComparisonItems([...comparisonItems.slice(1), productId]);
      } else {
        setComparisonItems([...comparisonItems, productId]);
      }
    }
  };

  // Remove product from comparison
  const removeFromComparison = (productId) => {
    setComparisonItems(comparisonItems.filter(id => id !== productId));
  };

  // Clear all comparison items
  const clearComparison = () => {
    setComparisonItems([]);
  };

  // Check if product is in comparison
  const isInComparison = (productId) => {
    return comparisonItems.includes(productId);
  };

  const value = {
    comparisonItems,
    loading,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};

export default ComparisonContext; 