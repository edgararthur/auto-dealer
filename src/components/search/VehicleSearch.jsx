import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronDown, FiX, FiTruck } from 'react-icons/fi';
import { vehicleData } from '../../data/vehicleData';
import VehicleService from '../../../shared/services/vehicleService';

/**
 * Advanced Vehicle Search Component with cascading dropdowns
 * Allows users to filter products by vehicle make, model, year, and type
 */
const VehicleSearch = ({ onSearch, className = '', compact = false }) => {
  const navigate = useNavigate();
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedType, setSelectedType] = useState('');
  
  const [availableModels, setAvailableModels] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  
  const [isOpen, setIsOpen] = useState(false);
  const [searchByVin, setSearchByVin] = useState(false);
  const [vinNumber, setVinNumber] = useState('');
  const [searchMode, setSearchMode] = useState('structured'); // 'structured' or 'text'
  const [textSearch, setTextSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);

  // Generate year range (current year + 1 down to 1990)
  const currentYear = new Date().getFullYear();
  const yearRange = useMemo(() => 
    Array.from({ length: currentYear - 1989 }, (_, i) => currentYear + 1 - i), 
    [currentYear]
  );

  // Load makes on component mount
  useEffect(() => {
    const loadMakes = async () => {
      try {
        const result = await VehicleService.getMakes();
        if (result.success) {
          setMakes(result.makes || []);
        }
      } catch (error) {
        console.error('Error loading makes:', error);
      }
    };
    loadMakes();
  }, []);

  // Load models when make changes
  useEffect(() => {
    const loadModels = async () => {
      if (selectedMake) {
        try {
          const result = await VehicleService.getModels(selectedMake);
          if (result.success) {
            setModels(result.models || []);
          }
        } catch (error) {
          console.error('Error loading models:', error);
          setModels([]);
        }
      } else {
        setModels([]);
      }
    };
    loadModels();
  }, [selectedMake]);

  // Update available models when make changes
  useEffect(() => {
    if (selectedMake && models.length > 0) {
      setAvailableModels(models);
      setSelectedModel('');
      setSelectedYear('');
    } else {
      setAvailableModels([]);
      setSelectedModel('');
      setSelectedYear('');
    }
  }, [selectedMake, models]);

  // Update available years when model changes
  useEffect(() => {
    if (selectedMake && selectedModel) {
      setAvailableYears(yearRange);
      setSelectedYear('');
    } else {
      setAvailableYears([]);
      setSelectedYear('');
    }
  }, [selectedMake, selectedModel, yearRange]);

  // Handle vehicle data changes
  const handleVehicleChange = useCallback((field, value) => {
    switch (field) {
      case 'make':
        setSelectedMake(value);
        setSelectedModel('');
        setSelectedYear('');
        break;
      case 'model':
        setSelectedModel(value);
        setSelectedYear('');
        break;
      case 'year':
        setSelectedYear(value);
        break;
      default:
        break;
    }
  }, []);

  // Smart text search parser
  const parseSearchText = (text) => {
    const parsed = {
      year: '',
      make: '',
      model: '',
      productTerms: []
    };

    const words = text.toLowerCase().split(/\s+/);
    const remainingWords = [...words];

    // Extract year (4-digit number between 1990 and current year + 1)
    const currentYear = new Date().getFullYear();
    const yearMatch = words.find(word => {
      const year = parseInt(word);
      return year >= 1990 && year <= currentYear + 1;
    });
    if (yearMatch) {
      parsed.year = yearMatch;
      remainingWords.splice(remainingWords.indexOf(yearMatch), 1);
    }

    // Extract make (check against known makes)
    const makesList = makes.map(m => m.name.toLowerCase());
    const makeMatch = remainingWords.find(word => 
      makesList.some(make => make.includes(word) || word.includes(make))
    );
    if (makeMatch) {
      const fullMake = makesList.find(make => make.includes(makeMatch) || makeMatch.includes(make));
      parsed.make = makes.find(m => m.name.toLowerCase() === fullMake)?.name || makeMatch;
      remainingWords.splice(remainingWords.indexOf(makeMatch), 1);
    }

    // Extract model (if make is found, check models for that make)
    if (parsed.make && models.length > 0) {
      const modelsList = models.map(m => m.name.toLowerCase());
      const modelMatch = remainingWords.find(word => 
        modelsList.some(model => model.includes(word) || word.includes(model))
      );
      if (modelMatch) {
        const fullModel = modelsList.find(model => model.includes(modelMatch) || modelMatch.includes(model));
        parsed.model = models.find(m => m.name.toLowerCase() === fullModel)?.name || modelMatch;
        remainingWords.splice(remainingWords.indexOf(modelMatch), 1);
      }
    }

    // Remaining words are product terms
    parsed.productTerms = remainingWords.filter(word => word.length > 0);

    return parsed;
  };

  // Generate search suggestions
  const generateSuggestions = (text) => {
    if (!text || text.length < 2) {
      setSuggestions([]);
      return;
    }

    const parsed = parseSearchText(text);
    const suggestions = [];

    // Add vehicle-based suggestions
    if (parsed.year || parsed.make || parsed.model) {
      const vehicleStr = [parsed.year, parsed.make, parsed.model].filter(Boolean).join(' ');
      
      // Common auto parts
      const commonParts = [
        'battery', 'brake pads', 'oil filter', 'air filter', 'spark plugs',
        'alternator', 'starter', 'radiator', 'headlight', 'taillight',
        'tire', 'wheel', 'engine oil', 'transmission fluid', 'coolant'
      ];

      commonParts.forEach(part => {
        if (!parsed.productTerms.includes(part.toLowerCase())) {
          suggestions.push(`${vehicleStr} ${part}`);
        }
      });
    }

    // Add make/model suggestions if only partial info
    if (parsed.year && !parsed.make) {
      makes.slice(0, 5).forEach(make => {
        suggestions.push(`${parsed.year} ${make.name}`);
      });
    }

    setSuggestions(suggestions.slice(0, 8));
  };

  // Handle text search input
  const handleTextSearchChange = (value) => {
    setTextSearch(value);
    generateSuggestions(value);
  };

  // Execute search
  const executeSearch = (searchData) => {
    let searchQuery = '';
    let filters = {};

    if (searchMode === 'text') {
      const parsed = parseSearchText(searchData.text || textSearch);
      
      // Build search query
      const queryParts = [];
      if (parsed.year) queryParts.push(parsed.year);
      if (parsed.make) queryParts.push(parsed.make);
      if (parsed.model) queryParts.push(parsed.model);
      if (parsed.productTerms.length > 0) queryParts.push(...parsed.productTerms);
      
      searchQuery = queryParts.join(' ');
      
      // Set filters for structured search
      filters = {
        year: parsed.year,
        make: parsed.make,
        model: parsed.model
      };
    } else {
      // Structured search
      const queryParts = [];
      if (selectedYear) queryParts.push(selectedYear);
      if (selectedMake) queryParts.push(selectedMake);
      if (selectedModel) queryParts.push(selectedModel);
      
      searchQuery = queryParts.join(' ');
      filters = { selectedYear, selectedMake, selectedModel };
    }

    // Call onSearch callback if provided
    if (onSearch) {
      onSearch({ query: searchQuery, filters });
    }

    // Navigate to shop page with search parameters
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (filters.make) params.set('make', filters.make);
    if (filters.model) params.set('model', filters.model);
    if (filters.year) params.set('year', filters.year);

    navigate(`/shop?${params.toString()}`);
    
    // Clear suggestions
    setSuggestions([]);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch({});
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (searchMode === 'text') {
      setTextSearch(suggestion);
      executeSearch({ text: suggestion });
    }
  };

  // Clear search
  const clearSearch = () => {
    setSelectedMake('');
    setSelectedModel('');
    setSelectedYear('');
    setSelectedType('');
    setVinNumber('');
    setTextSearch('');
    onSearch(null);
  };

  const hasSelection = selectedMake || selectedModel || selectedYear || selectedType || vinNumber;

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:border-primary-500 transition-colors"
        >
          <FiTruck className="mr-2" size={16} />
          <span className="text-sm">Vehicle Search</span>
          <FiChevronDown className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={14} />
        </button>
        
        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-lg shadow-luxury border border-neutral-200 z-50 p-4">
            <VehicleSearchForm
              selectedMake={selectedMake}
              setSelectedMake={setSelectedMake}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              availableModels={availableModels}
              availableYears={availableYears}
              searchByVin={searchByVin}
              setSearchByVin={setSearchByVin}
              vinNumber={vinNumber}
              setVinNumber={setVinNumber}
              onSearch={executeSearch}
              onClear={clearSearch}
              hasSelection={hasSelection}
              onClose={() => setIsOpen(false)}
              searchMode={searchMode}
              setSearchMode={setSearchMode}
              textSearch={textSearch}
              handleTextSearchChange={handleTextSearchChange}
              suggestions={suggestions}
              handleSuggestionClick={handleSuggestionClick}
              makes={makes}
              models={models}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-card border border-neutral-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 flex items-center">
          <FiTruck className="mr-2 text-primary-600" size={20} />
          Find Parts for Your Vehicle
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSearchMode('text')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              searchMode === 'text'
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <FiSearch className="mr-2" size={16} />
            Smart Search
          </button>
          <button
            onClick={() => setSearchMode('structured')}
            className={`px-3 py-1 text-xs rounded-full transition-colors ${
              searchMode === 'structured'
                ? 'bg-primary-100 text-primary-700' 
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <FiTruck className="mr-2" size={16} />
            Vehicle Search
          </button>
          {hasSelection && (
            <button
              onClick={clearSearch}
              className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
              title="Clear selection"
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>

      <VehicleSearchForm
        selectedMake={selectedMake}
        setSelectedMake={setSelectedMake}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        availableModels={availableModels}
        availableYears={availableYears}
        searchByVin={searchByVin}
        setSearchByVin={setSearchByVin}
        vinNumber={vinNumber}
        setVinNumber={setVinNumber}
        onSearch={executeSearch}
        onClear={clearSearch}
        hasSelection={hasSelection}
        onClose={() => setIsOpen(false)}
        searchMode={searchMode}
        setSearchMode={setSearchMode}
        textSearch={textSearch}
        handleTextSearchChange={handleTextSearchChange}
        suggestions={suggestions}
        handleSuggestionClick={handleSuggestionClick}
        makes={makes}
        models={models}
      />
    </div>
  );
};

// Separate form component for reusability
const VehicleSearchForm = ({
  selectedMake, setSelectedMake,
  selectedModel, setSelectedModel,
  selectedYear, setSelectedYear,
  selectedType, setSelectedType,
  availableModels, availableYears,
  searchByVin, setSearchByVin,
  vinNumber, setVinNumber,
  onSearch, onClear, hasSelection,
  onClose, searchMode, setSearchMode,
  textSearch, handleTextSearchChange,
  suggestions, handleSuggestionClick,
  makes, models
}) => {
  if (searchMode === 'text') {
    return (
      <div className="space-y-4">
        <div className="relative">
          <div className="relative">
            <input
              type="text"
              value={textSearch}
              onChange={(e) => handleTextSearchChange(e.target.value)}
              placeholder="Search: e.g., '2017 Toyota Corolla battery' or 'Honda Civic brake pads'"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
            />
            {textSearch && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 hover:text-blue-700"
            >
              <FiSearch size={20} />
            </button>
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 flex items-center"
                >
                  <FiSearch className="mr-3 text-gray-400" size={16} />
                  <span className="text-gray-900">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 text-sm text-gray-600">
            <p><strong>Examples:</strong></p>
            <p>• "2017 Toyota Corolla battery"</p>
            <p>• "Honda Civic brake pads"</p>
            <p>• "2020 BMW X5 headlight"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Make Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Make</label>
          <select
            value={selectedMake}
            onChange={(e) => setSelectedMake(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select Make</option>
            {makes.map((make) => (
              <option key={make.id} value={make.name}>
                {make.name}
              </option>
            ))}
          </select>
        </div>

        {/* Model Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Model</label>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={!selectedMake}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Model</option>
            {models.map((model) => (
              <option key={model.id} value={model.name}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            disabled={!selectedModel}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Select Year</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Type Selection */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Any Type</option>
            {vehicleData.types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex space-x-2">
        <button
          onClick={onSearch}
          disabled={!hasSelection}
          className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <FiSearch className="mr-2" size={16} />
          Search Compatible Parts
        </button>
        {hasSelection && (
          <button
            onClick={onClear}
            className="px-4 py-2 text-neutral-600 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
          >
            Clear
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            <FiX size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default VehicleSearch;
