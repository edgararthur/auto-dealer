import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiSearch, FiX, FiFilter, FiLoader, FiClock } from 'react-icons/fi';
import PropTypes from 'prop-types';
import ProductService from '../../../shared/services/productService.js';
import { ProductGrid, Spinner, EmptyState } from '../common';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LiveSearch Component - Real-time product search with instant filtering
 * 
 * @param {Function} onSearch - Callback when search is performed
 * @param {Function} onProductSelect - Callback when product is selected
 * @param {String} placeholder - Search input placeholder
 * @param {Boolean} showResults - Whether to show search results inline
 * @param {Object} filters - Additional search filters
 * @param {String} className - Additional CSS classes
 */
const LiveSearch = ({
  onSearch,
  onProductSelect,
  placeholder = "Search for auto parts, vehicles, or part numbers...",
  showResults = true,
  filters = {},
  className = '',
  initialQuery = ''
}) => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounced search function
  const debouncedSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setHasSearched(false);
      setTotalCount(0);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Live search for:', searchQuery);
      
      const searchFilters = {
        ...filters,
        search: searchQuery,
        limit: 48, // Show more products for live search
        sortBy: 'relevance'
      };

      const result = await ProductService.getProducts(searchFilters);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (result.success) {
        setProducts(result.products || []);
        setTotalCount(result.count || 0);
        setHasSearched(true);
        
        // Add to search history if meaningful results
        if (result.products?.length > 0) {
          addToSearchHistory(searchQuery);
        }

        // Callback for external handlers
        if (onSearch) {
          onSearch({
            query: searchQuery,
            results: result.products,
            count: result.count,
            filters: result.filters
          });
        }
      } else {
        setError(result.error || 'Search failed');
        setProducts([]);
        setTotalCount(0);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Live search error:', error);
        setError('Search failed. Please try again.');
        setProducts([]);
        setTotalCount(0);
      }
    } finally {
      setLoading(false);
    }
  }, [filters, onSearch]);

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 300); // 300ms debounce
  };

  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setProducts([]);
    setHasSearched(false);
    setShowHistory(false);
    setError(null);
    setTotalCount(0);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    searchInputRef.current?.focus();
  };

  // Handle search history
  const addToSearchHistory = (searchQuery) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== searchQuery);
      const newHistory = [searchQuery, ...filtered].slice(0, 5); // Keep last 5 searches
      localStorage.setItem('autoraSearchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Load search history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('autoraSearchHistory');
      if (saved) {
        setSearchHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('Failed to load search history:', error);
    }
  }, []);

  // Set initial query and trigger search
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      console.log('🔄 LiveSearch: Setting initial query:', initialQuery);
      setQuery(initialQuery);
      debouncedSearch(initialQuery);
    }
  }, [initialQuery, debouncedSearch, query]);

  // Trigger search when filters change (especially vehicle filter)
  useEffect(() => {
    if (query.trim() && filters.vehicle) {
      console.log('🔄 LiveSearch: Vehicle filter changed, re-searching with:', filters.vehicle);
      debouncedSearch(query);
    }
  }, [filters.vehicle, debouncedSearch, query]);

  // Handle search history click
  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery);
    setShowHistory(false);
    debouncedSearch(historyQuery);
  };

  // Handle product click
  const handleProductClick = (productId) => {
    if (onProductSelect) {
      onProductSelect(productId);
    }
  };

  // Focus management
  const handleFocus = () => {
    setShowHistory(searchHistory.length > 0 && !query);
  };

  const handleBlur = () => {
    // Delay hiding history to allow clicks
    setTimeout(() => setShowHistory(false), 200);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={`live-search ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-sm"
          />
          
          {/* Loading spinner or clear button */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <Spinner size="small" />
            ) : query ? (
              <button
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FiX size={20} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Search History Dropdown */}
        <AnimatePresence>
          {showHistory && searchHistory.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-2"
            >
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center text-sm text-gray-600">
                  <FiClock className="mr-2" size={14} />
                  Recent searches
                </div>
              </div>
              <div className="py-2">
                {searchHistory.map((historyItem, index) => (
                  <button
                    key={index}
                    onClick={() => handleHistoryClick(historyItem)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center">
                      <FiSearch className="mr-3 text-gray-400" size={14} />
                      <span className="text-gray-700">{historyItem}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="mt-6">
          {/* Search Status */}
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8"
              >
                <Spinner size="medium" />
                <span className="ml-3 text-gray-600">Searching for products...</span>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center text-red-700">
                  <FiX className="mr-2" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}

            {!loading && !error && hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between mb-6"
              >
                <div className="text-gray-600">
                  {totalCount > 0 ? (
                    <>
                      Found <span className="font-semibold text-gray-900">{totalCount}</span> product{totalCount !== 1 ? 's' : ''} 
                      {query && <span> for "<span className="font-medium">{query}</span>"</span>}
                    </>
                  ) : (
                    <>
                      No products found
                      {query && <span> for "<span className="font-medium">{query}</span>"</span>}
                    </>
                  )}
                </div>
                
                {query && (
                  <button
                    onClick={handleClear}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Clear search
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <AnimatePresence mode="wait">
            {!loading && !error && products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProductGrid 
                  products={products}
                  onProductClick={handleProductClick}
                  showQuickActions={true}
                />
              </motion.div>
            )}

            {!loading && !error && hasSearched && products.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <EmptyState
                  icon={<FiSearch size={48} />}
                  title="No products found"
                  description={query ? `Try searching for different keywords or check your spelling.` : 'Start typing to search for products.'}
                  action={query ? (
                    <button
                      onClick={handleClear}
                      className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Clear search
                    </button>
                  ) : null}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

LiveSearch.propTypes = {
  onSearch: PropTypes.func,
  onProductSelect: PropTypes.func,
  placeholder: PropTypes.string,
  showResults: PropTypes.bool,
  filters: PropTypes.object,
  className: PropTypes.string
};

export default LiveSearch; 