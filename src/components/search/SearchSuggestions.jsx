import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiTrendingUp, 
  FiClock, 
  FiTag, 
  FiPackage,
  FiStar,
  FiArrowUpRight,
  FiX
} from 'react-icons/fi';

const SearchSuggestions = ({ 
  query = '', 
  isVisible = false, 
  onSelectSuggestion, 
  onClose,
  className = '' 
}) => {
  const [suggestions, setSuggestions] = useState({
    products: [],
    categories: [],
    brands: [],
    popular: [],
    recent: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Popular searches - could be fetched from API
  const popularSearches = [
    'brake pads',
    'engine oil',
    'air filter',
    'spark plugs',
    'battery',
    'tires',
    'headlights',
    'windshield wipers'
  ];

  // Popular categories
  const popularCategories = [
    { name: 'Engine Parts', icon: '🔧', slug: 'engine-parts' },
    { name: 'Brake System', icon: '🛑', slug: 'brake-system' },
    { name: 'Suspension', icon: '🚗', slug: 'suspension' },
    { name: 'Electrical', icon: '⚡', slug: 'electrical' },
    { name: 'Filters', icon: '🌪️', slug: 'filters' },
    { name: 'Fluids', icon: '💧', slug: 'fluids' }
  ];

  // Get recent searches from localStorage
  const getRecentSearches = () => {
    try {
      const recent = localStorage.getItem('recentSearches');
      return recent ? JSON.parse(recent) : [];
    } catch (error) {
      return [];
    }
  };

  // Add search to recent searches
  const addToRecentSearches = (searchTerm) => {
    try {
      const recent = getRecentSearches();
      const filtered = recent.filter(term => term !== searchTerm);
      const updated = [searchTerm, ...filtered].slice(0, 5); // Keep only 5 recent searches
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    try {
      localStorage.removeItem('recentSearches');
      setSuggestions(prev => ({ ...prev, recent: [] }));
    } catch (error) {
      console.error('Error clearing recent searches:', error);
    }
  };

  useEffect(() => {
    if (isVisible) {
      const recent = getRecentSearches();
      setSuggestions(prev => ({
        ...prev,
        recent,
        popular: popularSearches,
        categories: popularCategories
      }));

      // If there's a query, fetch suggestions
      if (query.trim()) {
        fetchSuggestions(query);
      }
    }
  }, [isVisible, query]);

  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock suggestions based on query
      const mockProducts = [
        `${searchQuery} for Toyota`,
        `${searchQuery} for Honda`,
        `${searchQuery} for Ford`,
        `Premium ${searchQuery}`,
        `OEM ${searchQuery}`
      ].slice(0, 5);

      const mockCategories = popularCategories.filter(cat => 
        cat.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const mockBrands = [
        'Bosch', 'Denso', 'NGK', 'Mobil 1', 'Castrol', 'AC Delco'
      ].filter(brand => 
        brand.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 3);

      setSuggestions(prev => ({
        ...prev,
        products: mockProducts,
        categories: mockCategories,
        brands: mockBrands
      }));
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion, type = 'search') => {
    if (onSelectSuggestion) {
      onSelectSuggestion(suggestion, type);
    }
    addToRecentSearches(suggestion);
    if (onClose) onClose();
  };

  const handleKeyDown = (e) => {
    const allSuggestions = [
      ...suggestions.products,
      ...suggestions.categories.map(c => c.name),
      ...suggestions.brands,
      ...suggestions.popular,
      ...suggestions.recent
    ];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleSuggestionSelect(allSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        if (onClose) onClose();
        break;
    }
  };

  useEffect(() => {
    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isVisible, selectedIndex, suggestions]);

  if (!isVisible) return null;

  const hasQuery = query.trim().length > 0;
  const hasResults = suggestions.products.length > 0 || 
                   suggestions.categories.length > 0 || 
                   suggestions.brands.length > 0;

  return (
    <div 
      ref={containerRef}
      className={`absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-lg shadow-xl z-50 max-h-96 overflow-y-auto ${className}`}
    >
      {loading && (
        <div className="p-4 text-center">
          <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Searching...</span>
        </div>
      )}

      {!loading && hasQuery && hasResults && (
        <div className="p-2">
          {/* Product Suggestions */}
          {suggestions.products.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                <FiPackage className="w-3 h-3 mr-1" />
                Products
              </div>
              {suggestions.products.map((product, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(product)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-center group"
                >
                  <FiSearch className="w-4 h-4 text-gray-400 mr-3 group-hover:text-blue-600" />
                  <span className="text-sm text-gray-900">{product}</span>
                  <FiArrowUpRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* Category Suggestions */}
          {suggestions.categories.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                <FiTag className="w-3 h-3 mr-1" />
                Categories
              </div>
              {suggestions.categories.map((category, index) => (
                <Link
                  key={index}
                  to={`/categories/${category.slug}`}
                  onClick={() => handleSuggestionSelect(category.name, 'category')}
                  className="block px-3 py-2 hover:bg-gray-50 rounded-md group"
                >
                  <div className="flex items-center">
                    <span className="text-base mr-3">{category.icon}</span>
                    <span className="text-sm text-gray-900 group-hover:text-blue-600">
                      {category.name}
                    </span>
                    <FiArrowUpRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Brand Suggestions */}
          {suggestions.brands.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
                <FiStar className="w-3 h-3 mr-1" />
                Brands
              </div>
              {suggestions.brands.map((brand, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(brand, 'brand')}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-center group"
                >
                  <div className="w-6 h-6 bg-gray-100 rounded mr-3 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">
                      {brand.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-900">{brand}</span>
                  <FiArrowUpRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Popular & Recent Searches when no query */}
      {!hasQuery && (
        <div className="p-2">
          {/* Recent Searches */}
          {suggestions.recent.length > 0 && (
            <div className="mb-4">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between">
                <div className="flex items-center">
                  <FiClock className="w-3 h-3 mr-1" />
                  Recent Searches
                </div>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              </div>
              {suggestions.recent.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionSelect(search)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-center group"
                >
                  <FiClock className="w-4 h-4 text-gray-400 mr-3" />
                  <span className="text-sm text-gray-700">{search}</span>
                  <FiX className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
              <FiTrendingUp className="w-3 h-3 mr-1" />
              Popular Searches
            </div>
            {suggestions.popular.map((search, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionSelect(search)}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md flex items-center group"
              >
                <FiTrendingUp className="w-4 h-4 text-gray-400 mr-3" />
                <span className="text-sm text-gray-700">{search}</span>
                <FiArrowUpRight className="w-3 h-3 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Popular Categories */}
          <div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center">
              <FiTag className="w-3 h-3 mr-1" />
              Browse Categories
            </div>
            <div className="grid grid-cols-2 gap-1">
              {suggestions.categories.map((category, index) => (
                <Link
                  key={index}
                  to={`/categories/${category.slug}`}
                  onClick={() => handleSuggestionSelect(category.name, 'category')}
                  className="px-3 py-2 hover:bg-gray-50 rounded-md group"
                >
                  <div className="flex items-center">
                    <span className="text-base mr-2">{category.icon}</span>
                    <span className="text-sm text-gray-700 group-hover:text-blue-600 truncate">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading && hasQuery && !hasResults && (
        <div className="p-6 text-center">
          <FiSearch className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-2">No suggestions found</p>
          <p className="text-xs text-gray-400">
            Try searching for "{query}" or browse our categories
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchSuggestions; 