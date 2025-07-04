import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiX,
  FiTruck,
  FiChevronDown,
  FiArrowRight,
  FiClock,
  FiTrendingUp
} from 'react-icons/fi';
import ProductService from '../../../shared/services/productService.js';
import { motion, AnimatePresence } from 'framer-motion';
import OptimizedImage from '../common/OptimizedImage';

/**
 * VehicleSearchDropdown - Enhanced search with vehicle compatibility
 * Allows users to search by vehicle and find compatible parts
 */
const VehicleSearchDropdown = ({ className = '' }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [vehicleQuery, setVehicleQuery] = useState('');
  const [vehicleSuggestions, setVehicleSuggestions] = useState([]);
  
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const vehicleRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const vehicleTimeoutRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Popular vehicle searches
  const popularVehicles = [
    { year: 2020, make: 'Toyota', model: 'Corolla' },
    { year: 2019, make: 'Honda', model: 'Civic' },
    { year: 2021, make: 'Ford', model: 'F-150' },
    { year: 2018, make: 'BMW', model: '3 Series' },
    { year: 2020, make: 'Chevrolet', model: 'Silverado' },
    { year: 2019, make: 'Nissan', model: 'Altima' },
    { year: 2021, make: 'Jeep', model: 'Wrangler' },
    { year: 2020, make: 'Subaru', model: 'Outback' }
  ];

  // Popular search suggestions
  const popularSearches = [
    'brake pads',
    'oil filter',
    'air filter',
    'spark plugs',
    'brake rotors',
    'headlight bulbs',
    'transmission fluid',
    'battery'
  ];

  // Generate vehicle suggestions based on query
  const generateVehicleSuggestions = useCallback((query) => {
    if (!query.trim()) return [];
    
    const queryLower = query.toLowerCase();
    const suggestions = [];
    
    // Search through popular vehicles
    popularVehicles.forEach(vehicle => {
      const vehicleString = `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase();
      if (vehicleString.includes(queryLower)) {
        suggestions.push(vehicle);
      }
    });
    
    // Add some common makes if query matches
    const commonMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Volkswagen'];
    commonMakes.forEach(make => {
      if (make.toLowerCase().includes(queryLower) && !suggestions.find(s => s.make === make)) {
        suggestions.push({ make, model: '', year: '' });
      }
    });
    
    return suggestions.slice(0, 6);
  }, []);

  // Enhanced search with automatic vehicle detection
  const debouncedSearch = useCallback(async (searchQuery, vehicle = selectedVehicle) => {
    if (!searchQuery.trim() && !vehicle) {
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
      // Build search parameters - let ProductService handle vehicle detection from search query
      const searchParams = {
        limit: 12, // Show more products in dropdown
        sortBy: 'relevance'
      };

      // Build combined search query that includes vehicle information
      let combinedQuery = searchQuery.trim();
      
      // If a vehicle is explicitly selected, prepend it to the search query
      // This ensures ProductService's parseSearchQuery can detect it properly
      if (vehicle && (vehicle.year || vehicle.make || vehicle.model)) {
        const vehicleParts = [vehicle.year, vehicle.make, vehicle.model].filter(Boolean);
        const vehicleString = vehicleParts.join(' ');
        
        // Only prepend if the search query doesn't already contain the vehicle info
        if (!combinedQuery.toLowerCase().includes(vehicleString.toLowerCase())) {
          combinedQuery = `${vehicleString} ${combinedQuery}`.trim();
        }
      }

      // Send the combined query to ProductService - it will handle all vehicle compatibility logic
      if (combinedQuery) {
        searchParams.search = combinedQuery;
      }

      console.log('🔍 VehicleSearchDropdown sending search:', combinedQuery, 'for vehicle compatibility'); // Debug

      const result = await ProductService.getProducts(searchParams);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (result.success) {
        setProducts(result.products || []);
        
        // Generate search suggestions based on query
        if (searchQuery.trim()) {
          const suggestions = generateSearchSuggestions(searchQuery, result.products || []);
          setSuggestions(suggestions);
        } else {
          setSuggestions([]);
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search dropdown error:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedVehicle]);

  // Simplified vehicle parsing - mainly for UI display purposes
  // The actual vehicle compatibility logic is handled by ProductService.parseSearchQuery
  const parseVehicleFromQuery = (query) => {
    const words = query.toLowerCase().trim().split(/\s+/);
    let year = '';
    let make = '';
    let model = '';
    let hasVehicleInfo = false;

    // Extract year (4-digit number between 1990 and current year + 2)
    const currentYear = new Date().getFullYear();
    const yearMatch = words.find(word => {
      const num = parseInt(word);
      return num >= 1990 && num <= currentYear + 2;
    });
    if (yearMatch) {
      year = yearMatch;
      hasVehicleInfo = true;
    }

    // Common vehicle makes (expanded list)
    const vehicleMakes = [
      'toyota', 'honda', 'ford', 'chevrolet', 'chevy', 'nissan', 'bmw', 'mercedes', 'mercedes-benz',
      'audi', 'volkswagen', 'vw', 'hyundai', 'kia', 'subaru', 'mazda', 'mitsubishi', 'lexus',
      'acura', 'infiniti', 'cadillac', 'buick', 'gmc', 'jeep', 'chrysler', 'dodge', 'ram',
      'volvo', 'porsche', 'jaguar', 'land rover', 'mini', 'fiat', 'alfa romeo', 'tesla',
      'lincoln', 'saab', 'scion', 'isuzu', 'suzuki'
    ];

    // Extract make
    const makeMatch = words.find(word => vehicleMakes.includes(word));
    if (makeMatch) {
      make = makeMatch === 'chevy' ? 'chevrolet' : 
            makeMatch === 'vw' ? 'volkswagen' : 
            makeMatch === 'mercedes' ? 'mercedes-benz' :
            makeMatch;
      hasVehicleInfo = true;
    }

    // DYNAMIC MODEL DETECTION - Extract any remaining word that could be a model
    const modelCandidates = words.filter(word => {
      // Skip if it's a known auto part term
      if (isCommonAutoPartTerm(word)) return false;
      
      // Skip very short words (likely not model names)
      if (word.length < 2) return false;
      
      // Skip common words that are not vehicle models
      const skipWords = ['the', 'and', 'or', 'for', 'with', 'in', 'on', 'at', 'to', 'from', 'by', 'of', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'];
      if (skipWords.includes(word.toLowerCase())) return false;
      
      // Skip numbers that aren't years
      if (/^\d+$/.test(word) && (parseInt(word) < 1990 || parseInt(word) > currentYear + 2)) return false;
      
      // Skip if it's already been identified as year or make
      if (word === year || word === make) return false;
      
      // This could be a model name - allow ANY word (dynamic detection)
      return true;
    });

    // Take the first model candidate as the model
    if (modelCandidates.length > 0) {
      model = modelCandidates[0];
      hasVehicleInfo = true;
    }

    return { year, make, model, hasVehicleInfo };
  };

  // Check if a word is a common auto part term
  const isCommonAutoPartTerm = (word) => {
    const autoPartTerms = [
      'battery', 'brake', 'brakes', 'pad', 'pads', 'rotor', 'filter', 'oil',
      'spark', 'plug', 'plugs', 'belt', 'hose', 'pump', 'sensor', 'light',
      'bulb', 'fuse', 'relay', 'switch', 'tire', 'wheel', 'engine', 'transmission'
    ];
    return autoPartTerms.includes(word.toLowerCase());
  };

  // Generate enhanced search suggestions
  const generateSearchSuggestions = (query, products) => {
    const suggestions = [];
    const parsed = parseVehicleFromQuery(query);
    
    // If we detected vehicle info, suggest parts for that vehicle
    if (parsed.hasVehicleInfo) {
      const vehicleStr = [parsed.year, parsed.make, parsed.model].filter(Boolean).join(' ');
      
      const commonParts = [
        'brake pads', 'oil filter', 'air filter', 'spark plugs', 'battery',
        'brake rotors', 'headlight bulbs', 'transmission fluid', 'coolant',
        'windshield wipers', 'cabin filter', 'fuel filter', 'timing belt'
      ];
      
      commonParts.forEach(part => {
        if (!query.toLowerCase().includes(part.toLowerCase())) {
          suggestions.push({
            type: 'vehicle_part',
            text: `${vehicleStr} ${part}`,
            description: `${part} for ${vehicleStr}`
          });
        }
      });
    }
    
    // Add product-based suggestions from search results
    if (products.length > 0) {
      const uniqueCategories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];
      uniqueCategories.slice(0, 3).forEach(category => {
        suggestions.push({
          type: 'category',
          text: `${query} in ${category}`,
          description: `Search ${category} category`
        });
      });
    }
    
    return suggestions.slice(0, 6);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    // Open dropdown when user starts typing
    if (value.trim() && !isOpen) {
      setIsOpen(true);
    }

    // Close dropdown if query is cleared
    if (!value.trim() && isOpen) {
      setIsOpen(false);
      setProducts([]);
      setSuggestions([]);
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearch(value);
    }, 500); // Increased debounce time to reduce API calls
  };

  // Handle vehicle query change
  const handleVehicleQueryChange = (e) => {
    const value = e.target.value;
    setVehicleQuery(value);

    if (vehicleTimeoutRef.current) {
      clearTimeout(vehicleTimeoutRef.current);
    }

    vehicleTimeoutRef.current = setTimeout(() => {
      const suggestions = generateVehicleSuggestions(value);
      setVehicleSuggestions(suggestions);
    }, 200);
  };

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleQuery(`${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim());
    setShowVehicleSelector(false);
    setVehicleSuggestions([]);
    
    // Trigger search with selected vehicle
    if (query.trim()) {
      debouncedSearch(query, vehicle);
    }
  };

  // Force close dropdown and clear all state
  const forceCloseDropdown = () => {
    setIsOpen(false);
    setProducts([]);
    setSuggestions([]);
    setShowVehicleSelector(false);
    setLoading(false);

    // Cancel any pending requests
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim() && !selectedVehicle) return;

    // Add to history
    addToSearchHistory(searchQuery);

    // Build search URL with vehicle filter
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery);
    }
    if (selectedVehicle) {
      params.set('year', selectedVehicle.year);
      params.set('make', selectedVehicle.make);
      params.set('model', selectedVehicle.model);
    }

    // Navigate to search results page
    navigate(`/search?${params.toString()}`);

    // Clear query after navigation
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

    // Close dropdown immediately
    setIsOpen(false);
    setProducts([]);
    setSuggestions([]);
    setQuery('');

    navigate(`/products/${productId}`);
  };

  // Search history management
  const addToSearchHistory = (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== searchQuery);
      const newHistory = [searchQuery, ...filtered].slice(0, 5);
      localStorage.setItem('autoraSearchHistory', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Load search history and saved vehicle
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('autoraSearchHistory');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }
      
      const savedVehicle = localStorage.getItem('autoraSelectedVehicle');
      if (savedVehicle) {
        const vehicle = JSON.parse(savedVehicle);
        setSelectedVehicle(vehicle);
        setVehicleQuery(`${vehicle.year} ${vehicle.make} ${vehicle.model}`.trim());
      }
    } catch (error) {
      console.warn('Failed to load saved data:', error);
    }
  }, []);

  // Save selected vehicle
  useEffect(() => {
    if (selectedVehicle) {
      localStorage.setItem('autoraSelectedVehicle', JSON.stringify(selectedVehicle));
    }
  }, [selectedVehicle]);

  // Click outside and keyboard handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setProducts([]);
        setSuggestions([]);
      }
      if (vehicleRef.current && !vehicleRef.current.contains(event.target)) {
        setShowVehicleSelector(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setProducts([]);
        setSuggestions([]);
        setQuery('');
        setShowVehicleSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Search Input Container */}
      <div className="flex bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        {/* Vehicle Selector */}
        <div className="relative" ref={vehicleRef}>
          <button
            onClick={() => setShowVehicleSelector(!showVehicleSelector)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border-r border-gray-200"
          >
            <FiTruck className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">
              {selectedVehicle ? 
                `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`.trim() || 'Vehicle' 
                : 'Vehicle'
              }
            </span>
            <FiChevronDown className="w-3 h-3 ml-1" />
          </button>

          {/* Vehicle Selector Dropdown */}
          <AnimatePresence>
            {showVehicleSelector && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              >
                <div className="p-3">
                  <input
                    type="text"
                    placeholder="Enter year, make, model..."
                    value={vehicleQuery}
                    onChange={handleVehicleQueryChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                {vehicleSuggestions.length > 0 && (
                  <div className="border-t border-gray-100">
                    {vehicleSuggestions.map((vehicle, index) => (
                      <button
                        key={index}
                        onClick={() => handleVehicleSelect(vehicle)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                      >
                        <FiTruck className="w-4 h-4 mr-2 text-gray-400" />
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </button>
                    ))}
                  </div>
                )}
                
                {vehicleQuery && vehicleSuggestions.length === 0 && (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    No vehicles found. Try a different search.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder={selectedVehicle ? "Search parts for your vehicle..." : "Search auto parts..."}
            value={query}
            onChange={handleInputChange}
            onClick={() => {
              // If dropdown is open and there are results, close it
              if (isOpen && (products.length > 0 || suggestions.length > 0)) {
                setIsOpen(false);
                setProducts([]);
                setSuggestions([]);
              }
            }}
            onFocus={() => {
              // Only open if there's a query to show results for and dropdown is not already open
              if (query.trim() && !isOpen) {
                setIsOpen(true);
              }
            }}
            onBlur={() => {
              // Delay closing to allow clicks on dropdown items
              setTimeout(() => {
                setIsOpen(false);
                setProducts([]);
                setSuggestions([]);
              }, 200);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setIsOpen(false);
                setProducts([]);
                setSuggestions([]);
                handleSearch();
              }
            }}
            className="w-full px-4 py-2 text-sm focus:outline-none"
          />
          
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setIsOpen(false);
                setProducts([]);
                setSuggestions([]);
              }}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            // Close dropdown immediately
            setIsOpen(false);
            setProducts([]);
            setSuggestions([]);

            // Handle search
            handleSearch();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
        >
          <FiSearch className="w-4 h-4" />
        </button>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && query.trim() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto"
          >
            {loading && (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            )}

            {!loading && (
              <>
                {/* Product Results */}
                {products.length > 0 && (
                  <div className="p-2">
                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                      Products {selectedVehicle && `for ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                    </div>
                    {products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.id)}
                        className="w-full px-2 py-2 text-left hover:bg-gray-50 rounded flex items-center"
                      >
                        <div className="w-10 h-10 mr-3 flex-shrink-0">
                          <OptimizedImage
                            src={product.image || product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${product.price || product.discount_price || 0}
                          </div>
                        </div>
                        <FiArrowRight className="w-4 h-4 text-gray-400 ml-2" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Search Suggestions */}
                {suggestions.length > 0 && (
                  <div className="p-2 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">
                      Suggested Searches
                    </div>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion.text || suggestion)}
                        className="w-full px-2 py-2 text-left hover:bg-gray-50 rounded flex items-center"
                      >
                        <div className="w-8 h-8 mr-3 flex-shrink-0 flex items-center justify-center">
                          {suggestion.type === 'vehicle_part' ? (
                            <FiTruck className="w-4 h-4 text-blue-500" />
                          ) : suggestion.type === 'category' ? (
                            <FiSearch className="w-4 h-4 text-gray-400" />
                          ) : (
                            <FiTrendingUp className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 truncate">
                            {suggestion.text || suggestion}
                          </div>
                          {suggestion.description && (
                            <div className="text-xs text-gray-500 truncate">
                              {suggestion.description}
                            </div>
                          )}
                        </div>
                        <FiArrowRight className="w-4 h-4 text-gray-400 ml-2" />
                      </button>
                    ))}
                  </div>
                )}

                {/* No Results */}
                {!loading && query.trim() && products.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <div className="text-sm">No products found</div>
                    {selectedVehicle && (
                      <div className="text-xs mt-1">
                        Try searching without vehicle filter or check your vehicle details
                      </div>
                    )}
                  </div>
                )}

                {/* Search History */}
                {!query.trim() && searchHistory.length > 0 && (
                  <div className="p-2 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-500 mb-2 px-2">Recent Searches</div>
                    {searchHistory.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full px-2 py-1 text-left text-sm hover:bg-gray-50 rounded flex items-center"
                      >
                        <FiClock className="w-3 h-3 mr-2 text-gray-400" />
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VehicleSearchDropdown;
