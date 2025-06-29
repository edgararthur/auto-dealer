import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiTrendingUp, FiClock, FiArrowRight } from 'react-icons/fi';
import ProductService from '../../../shared/services/productService.js';
import { motion, AnimatePresence } from 'framer-motion';
import OptimizedImage from '../common/OptimizedImage';

/**
 * LiveSearchDropdown - Compact live search for header navigation
 */
const LiveSearchDropdown = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Popular search suggestions
  const popularSearches = [
    'Toyota Corolla battery',
    'Honda Civic brake pads', 
    'Ford F-150 oil filter',
    'BMW air filter',
    'brake rotors',
    'spark plugs',
    'headlight bulbs',
    'transmission fluid'
  ];

  // Debounced search for suggestions and products
  const debouncedSearch = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setSuggestions([]);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      // Get quick results for dropdown
      const result = await ProductService.getProducts({
        search: searchQuery,
        limit: 6, // Fewer results for dropdown
        sortBy: 'relevance'
      });

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (result.success) {
        setProducts(result.products || []);
        
        // Generate search suggestions based on the query
        const queryLower = searchQuery.toLowerCase();
        const matchingSuggestions = popularSearches
          .filter(suggestion => 
            suggestion.toLowerCase().includes(queryLower) ||
            queryLower.includes(suggestion.toLowerCase().split(' ')[0])
          )
          .slice(0, 3);
        
        setSuggestions(matchingSuggestions);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search dropdown error:', error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 200); // Faster for dropdown
  };

  // Handle search submission
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    // Add to history
    addToSearchHistory(searchQuery);
    
    // Navigate to search results page
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    
    // Close dropdown
    setIsOpen(false);
    setQuery('');
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle product click
  const handleProductClick = (productId) => {
    addToSearchHistory(query);
    navigate(`/products/${productId}`);
    setIsOpen(false);
    setQuery('');
  };

  // Search history management
  const addToSearchHistory = (searchQuery) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== searchQuery);
      const newHistory = [searchQuery, ...filtered].slice(0, 5);
      localStorage.setItem('autoraSearchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Load search history
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

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup
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

  const hasContent = query.trim().length > 0;
  const showResults = hasContent && (products.length > 0 || suggestions.length > 0 || loading);
  const showHistory = !hasContent && searchHistory.length > 0;

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSearch();
            }
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          }}
          placeholder="Search parts, vehicles..."
          className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        />
        
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setProducts([]);
              setSuggestions([]);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (showResults || showHistory) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-xl z-50 mt-2 max-h-96 overflow-y-auto"
          >
            {/* Loading */}
            {loading && (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                  Searching...
                </div>
              </div>
            )}

            {/* Search History */}
            {showHistory && (
              <div className="p-3">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <FiClock className="mr-1" size={12} />
                  Recent searches
                </div>
                {searchHistory.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(item)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700 flex items-center"
                  >
                    <FiSearch className="mr-2 text-gray-400" size={14} />
                    {item}
                  </button>
                ))}
              </div>
            )}

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="border-t border-gray-100 p-3">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <FiTrendingUp className="mr-1" size={12} />
                  Suggestions
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-gray-700 flex items-center justify-between"
                  >
                    <span>{suggestion}</span>
                    <FiArrowRight className="text-gray-400" size={12} />
                  </button>
                ))}
              </div>
            )}

            {/* Product Results */}
            {products.length > 0 && (
              <div className="border-t border-gray-100 p-3">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>Products</span>
                  <button
                    onClick={() => handleSearch()}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    View all results
                  </button>
                </div>
                
                <div className="space-y-2">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.id)}
                      className="w-full p-3 hover:bg-gray-50 rounded-lg transition-colors text-left flex items-center space-x-3"
                    >
                      <OptimizedImage
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded border"
                        sizes="48px"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {product.sku && `SKU: ${product.sku}`}
                          {product.partNumber && ` • Part: ${product.partNumber}`}
                        </div>
                        <div className="text-sm font-semibold text-primary-600 mt-1">
                          ${product.price}
                          {product.originalPrice && (
                            <span className="text-xs text-gray-500 line-through ml-2">
                              ${product.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Stock: {product.stockQuantity}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {hasContent && !loading && products.length === 0 && suggestions.length === 0 && (
              <div className="p-4 text-center text-gray-500 text-sm">
                <div>No products found for "{query}"</div>
                <button
                  onClick={() => handleSearch()}
                  className="text-primary-600 hover:text-primary-700 mt-1"
                >
                  Search anyway
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LiveSearchDropdown; 