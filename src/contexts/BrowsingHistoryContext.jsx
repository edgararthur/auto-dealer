import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import supabase from '../../shared/supabase/supabaseClient';

const BrowsingHistoryContext = createContext();

export const useBrowsingHistory = () => useContext(BrowsingHistoryContext);

export const BrowsingHistoryProvider = ({ children, maxHistoryItems = 100 }) => {
  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load browsing history from localStorage or database
  useEffect(() => {
    const loadBrowsingHistory = async () => {
      setLoading(true);
      try {
        if (user) {
          // If user is logged in, load from database
          const { data, error } = await supabase
            .from('browsing_history')
            .select('*')
            .eq('user_id', user.id)
            .order('viewed_at', { ascending: false })
            .limit(maxHistoryItems);
          
          if (error) throw error;
          
          setHistoryItems(data || []);
        } else {
          // If not logged in, load from localStorage
          const savedHistory = localStorage.getItem('browsingHistory');
          setHistoryItems(savedHistory ? JSON.parse(savedHistory) : []);
        }
      } catch (error) {
        console.error('Error loading browsing history:', error);
        // Fallback to localStorage
        const savedHistory = localStorage.getItem('browsingHistory');
        setHistoryItems(savedHistory ? JSON.parse(savedHistory) : []);
      } finally {
        setLoading(false);
      }
    };
    
    loadBrowsingHistory();
  }, [user, maxHistoryItems]);

  // Save browsing history to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('browsingHistory', JSON.stringify(historyItems));
    }
  }, [historyItems, loading]);

  // Add a product to browsing history
  const addToHistory = async (productData) => {
    // Don't add if no product data
    if (!productData || !productData.id) return;

    // Create history item with timestamp
    const newHistoryItem = {
      id: Date.now().toString(),
      product_id: productData.id,
      product: productData,
      viewed_at: new Date().toISOString()
    };

    // Remove existing entry for the same product (if any)
    const filteredHistory = historyItems.filter(item => 
      item.product_id !== productData.id
    );

    // Add new entry at the beginning (most recent)
    const updatedHistory = [newHistoryItem, ...filteredHistory];
    
    // Limit the history size
    const limitedHistory = updatedHistory.slice(0, maxHistoryItems);
    
    setHistoryItems(limitedHistory);

    // Save to database if user is logged in
    if (user) {
      try {
        // First check if this product is already in history
        const { data: existingItem } = await supabase
          .from('browsing_history')
          .select('id')
          .eq('user_id', user.id)
          .eq('product_id', productData.id)
          .single();

        if (existingItem) {
          // Update existing entry with new timestamp
          await supabase
            .from('browsing_history')
            .update({ 
              viewed_at: newHistoryItem.viewed_at,
              product_data: productData
            })
            .eq('id', existingItem.id);
        } else {
          // Insert new entry
          await supabase
            .from('browsing_history')
            .insert({
              user_id: user.id,
              product_id: productData.id,
              product_data: productData,
              viewed_at: newHistoryItem.viewed_at
            });
        }
        
        // Ensure we don't exceed the limit in the database
        if (limitedHistory.length >= maxHistoryItems) {
          const { data: oldestEntries } = await supabase
            .from('browsing_history')
            .select('id')
            .eq('user_id', user.id)
            .order('viewed_at', { ascending: true })
            .limit(Math.max(0, limitedHistory.length - maxHistoryItems + 1));
          
          if (oldestEntries && oldestEntries.length > 0) {
            // Delete oldest entries that exceed the limit
            const idsToDelete = oldestEntries.map(entry => entry.id);
            await supabase
              .from('browsing_history')
              .delete()
              .in('id', idsToDelete);
          }
        }
      } catch (error) {
        console.error('Error saving browsing history to database:', error);
      }
    }
  };

  // Clear browsing history
  const clearHistory = async () => {
    setHistoryItems([]);
    localStorage.removeItem('browsingHistory');
    
    if (user) {
      try {
        await supabase
          .from('browsing_history')
          .delete()
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error clearing browsing history from database:', error);
      }
    }
  };

  // Remove a single item from browsing history
  const removeFromHistory = async (historyItemId) => {
    const updatedHistory = historyItems.filter(item => item.id !== historyItemId);
    setHistoryItems(updatedHistory);
    
    if (user) {
      try {
        await supabase
          .from('browsing_history')
          .delete()
          .eq('id', historyItemId)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error removing item from browsing history:', error);
      }
    }
  };

  // Get browsing history grouped by date
  const getHistoryGroupedByDate = () => {
    const groups = {};
    
    historyItems.forEach(item => {
      const date = new Date(item.viewed_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items
    }));
  };

  const value = {
    historyItems,
    loading,
    addToHistory,
    clearHistory,
    removeFromHistory,
    getHistoryGroupedByDate
  };

  return (
    <BrowsingHistoryContext.Provider value={value}>
      {children}
    </BrowsingHistoryContext.Provider>
  );
};

BrowsingHistoryProvider.propTypes = {
  children: PropTypes.node.isRequired,
  maxHistoryItems: PropTypes.number
};

export default BrowsingHistoryContext; 