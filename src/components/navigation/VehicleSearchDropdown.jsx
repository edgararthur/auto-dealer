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

  // Debounced search for products
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
      // Build search parameters
      const searchParams = {
        limit: 12, // Show more products in dropdown
        sortBy: 'relevance'
      };

      if (searchQuery.trim()) {
        searchParams.search = searchQuery;
      }

      // Add vehicle compatibility filter if vehicle is selected
      if (vehicle) {
        searchParams.vehicle = {
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model
        };
      }

      const result = await ProductService.getProducts(searchParams);

      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (result.success) {
        setProducts(result.products || []);
        
        // Don't show suggestions, focus on products
        setSuggestions([]);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Search dropdown error:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedVehicle]);

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

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

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (vehicleRef.current && !vehicleRef.current.contains(event.target)) {
        setShowVehicleSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
            onFocus={() => setIsOpen(true)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full px-4 py-2 text-sm focus:outline-none"
          />
          
          {query && (
            <button
              onClick={() => {
                setQuery('');
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
          onClick={() => handleSearch()}
          className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
        >
          <FiSearch className="w-4 h-4" />
        </button>
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.trim() || selectedVehicle) && (
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
