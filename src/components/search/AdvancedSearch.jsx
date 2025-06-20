import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiSearch, 
  FiMic, 
  FiCamera, 
  FiX, 
  FiClock, 
  FiTrendingUp,
  FiShoppingBag,
  FiMapPin
} from 'react-icons/fi';
import ProductService from '../../../shared/services/productService';
import { useBrowsingHistory } from '../../contexts/BrowsingHistoryContext';
import { debounce } from 'lodash';

const AdvancedSearch = ({ 
  className = '',
  showTrending = true,
  showRecentSearches = true,
  autoFocus = false
}) => {
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const { getRecentlyViewed } = useBrowsingHistory();

  // Initialize component
  useEffect(() => {
    fetchInitialData();
    loadRecentSearches();
    
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Fetch initial data
  const fetchInitialData = async () => {
    try {
      const [categoriesRes] = await Promise.all([
        ProductService.getCategories()
      ]);
      
      if (categoriesRes.success) {
        setCategories(categoriesRes.categories || []);
      }
      
      // Mock trending searches - in production, this would come from analytics
      setTrendingSearches([
        'brake pads',
        'engine oil',
        'spark plugs',
        'air filter',
        'transmission fluid',
        'headlights'
      ]);
    } catch (error) {
      console.error('Error fetching search data:', error);
    }
  };

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  };

  // Save search to recent searches
  const saveSearch = (searchTerm) => {
    try {
      const updated = [searchTerm, ...recentSearches.filter(s => s !== searchTerm)].slice(0, 10);
      setRecentSearches(updated);
      localStorage.setItem('recentSearches', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  // Debounced search suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm.trim()) {
        setSuggestions([]);
        return;
      }

      setIsLoading(true);
      try {
        // Get product suggestions
        const productRes = await ProductService.searchProducts({
          query: searchTerm,
          limit: 5
        });

        const suggestions = [];
        
        // Add exact match suggestion
        suggestions.push({
          type: 'search',
          text: searchTerm,
          icon: <FiSearch size={16} />,
          action: () => performSearch(searchTerm)
        });

        // Add product suggestions
        if (productRes.success && productRes.products) {
          productRes.products.forEach(product => {
            suggestions.push({
              type: 'product',
              text: product.name,
              subtitle: `${product.price} • ${product.dealer?.name || 'Unknown dealer'}`,
              icon: <FiShoppingBag size={16} />,
              image: product.image,
              action: () => navigate(`/products/${product.id}`)
            });
          });
        }

        // Add category suggestions
        const matchingCategories = categories.filter(cat => 
          cat.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        matchingCategories.slice(0, 3).forEach(category => {
          suggestions.push({
            type: 'category',
            text: `${searchTerm} in ${category.name}`,
            subtitle: `Browse ${category.name} category`,
            icon: <FiMapPin size={16} />,
            action: () => navigate(`/categories/${category.id}?search=${encodeURIComponent(searchTerm)}`)
          });
        });

        setSuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [categories, navigate]
  );

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedGetSuggestions(value);
  };

  // Perform search
  const performSearch = (searchTerm = query) => {
    if (!searchTerm.trim()) return;
    
    saveSearch(searchTerm.trim());
    navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    setQuery('');
    setIsExpanded(false);
    inputRef.current?.blur();
  };

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch();
  };

  // Voice search functionality
  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search is not supported in your browser');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
      performSearch(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Handle visual search (placeholder for future implementation)
  const handleVisualSearch = () => {
    // This would integrate with image recognition API
    alert('Visual search coming soon! Upload a photo to find similar products.');
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className={`flex items-center bg-white rounded-lg border-2 transition-all duration-200 ${
          isExpanded ? 'border-primary-500 shadow-lg' : 'border-neutral-200 hover:border-neutral-300'
        }`}>
          <div className="flex-1 flex items-center">
            <FiSearch 
              size={20} 
              className="text-neutral-400 ml-4 mr-3" 
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={() => setIsExpanded(true)}
              placeholder="Search for auto parts, brands, or part numbers..."
              className="flex-1 py-3 px-0 text-neutral-900 placeholder-neutral-500 bg-transparent border-none outline-none text-lg"
              autoComplete="off"
            />
            
            {/* Clear button */}
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center pr-2">
            {/* Voice search */}
            <button
              type="button"
              onClick={handleVoiceSearch}
              disabled={isListening}
              className={`p-2 rounded-lg transition-colors ${
                isListening 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-neutral-400 hover:text-primary-600 hover:bg-primary-50'
              }`}
              aria-label="Voice search"
            >
              <FiMic size={18} />
            </button>
            
            {/* Visual search */}
            <button
              type="button"
              onClick={handleVisualSearch}
              className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              aria-label="Visual search"
            >
              <FiCamera size={18} />
            </button>
            
            {/* Search button */}
            <button
              type="submit"
              className="ml-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Search
            </button>
          </div>
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isExpanded && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-neutral-200 z-50 max-h-96 overflow-y-auto">
          {/* Loading state */}
          {isListening && (
            <div className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-red-500">
                <FiMic size={20} />
                <span>Listening...</span>
              </div>
            </div>
          )}
          
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={suggestion.action}
                  className="w-full px-4 py-3 text-left hover:bg-neutral-50 transition-colors flex items-center space-x-3"
                >
                  <div className="text-neutral-400">
                    {suggestion.icon}
                  </div>
                  {suggestion.image && (
                    <img 
                      src={suggestion.image} 
                      alt=""
                      className="w-8 h-8 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <div className="text-neutral-900 font-medium">
                      {suggestion.text}
                    </div>
                    {suggestion.subtitle && (
                      <div className="text-xs text-neutral-500">
                        {suggestion.subtitle}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {/* Recent Searches */}
          {showRecentSearches && recentSearches.length > 0 && !query && (
            <div className="py-2 border-t border-neutral-100">
              <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide flex items-center">
                <FiClock size={12} className="mr-1" />
                Recent Searches
              </div>
              {recentSearches.slice(0, 5).map((search, index) => (
                <button
                  key={index}
                  onClick={() => performSearch(search)}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors flex items-center justify-between"
                >
                  <span className="text-neutral-700">{search}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = recentSearches.filter(s => s !== search);
                      setRecentSearches(updated);
                      localStorage.setItem('recentSearches', JSON.stringify(updated));
                    }}
                    className="text-neutral-400 hover:text-neutral-600 p-1"
                  >
                    <FiX size={14} />
                  </button>
                </button>
              ))}
            </div>
          )}
          
          {/* Trending Searches */}
          {showTrending && trendingSearches.length > 0 && !query && (
            <div className="py-2 border-t border-neutral-100">
              <div className="px-4 py-2 text-xs font-semibold text-neutral-500 uppercase tracking-wide flex items-center">
                <FiTrendingUp size={12} className="mr-1" />
                Trending
              </div>
              {trendingSearches.slice(0, 6).map((trend, index) => (
                <button
                  key={index}
                  onClick={() => performSearch(trend)}
                  className="w-full px-4 py-2 text-left hover:bg-neutral-50 transition-colors text-neutral-700"
                >
                  {trend}
                </button>
              ))}
            </div>
          )}
          
          {/* No results */}
          {query && suggestions.length === 0 && !isLoading && (
            <div className="p-4 text-center text-neutral-500">
              No suggestions found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch; 