import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { 
  FiFilter, 
  FiX, 
  FiChevronDown, 
  FiChevronUp, 
  FiCheck, 
  FiSearch,
  FiSliders
} from 'react-icons/fi';

/**
 * AdvancedFilter Component for filtering product listings
 * 
 * @param {Object} options - Filter options configuration
 * @param {Object} selectedFilters - Currently selected filters
 * @param {Function} onFilterChange - Function called when filters are changed
 * @param {Function} onClearFilters - Function to clear all filters
 * @param {Boolean} isMobile - Whether the component is rendered in mobile view
 */
const AdvancedFilter = ({ 
  options = {}, 
  selectedFilters = {}, 
  onFilterChange, 
  onClearFilters,
  isMobile = false
}) => {
  // State for collapsible sections
  const [openSections, setOpenSections] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Toggle a filter section
  const toggleSection = (section) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section]
    });
  };
  
  // Check if a section is open
  const isSectionOpen = (section) => {
    return openSections[section] === undefined ? true : openSections[section];
  };
  
  // Handle checkbox filter changes
  const handleCheckboxChange = (filterType, value) => {
    const currentValues = selectedFilters[filterType] || [];
    let newValues;
    
    if (currentValues.includes(value)) {
      // Remove value if already selected
      newValues = currentValues.filter(v => v !== value);
    } else {
      // Add value if not selected
      newValues = [...currentValues, value];
    }
    
    onFilterChange(filterType, newValues);
  };
  
  // Handle range filter changes
  const handleRangeChange = (filterType, min, max) => {
    onFilterChange(filterType, { min, max });
  };
  
  // Handle radio filter changes
  const handleRadioChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };
  
  // Count active filters
  const countActiveFilters = () => {
    return Object.values(selectedFilters).filter(value => {
      if (Array.isArray(value) && value.length > 0) return true;
      if (typeof value === 'object' && value !== null) return true;
      if (value) return true;
      return false;
    }).length;
  };
  
  // Render checkbox filters
  const renderCheckboxFilter = (title, filterType, options) => {
    return (
      <div className="mb-4">
        <div 
          className="flex justify-between items-center py-2 cursor-pointer"
          onClick={() => toggleSection(filterType)}
        >
          <h3 className="font-medium text-neutral-800">{title}</h3>
          {isSectionOpen(filterType) ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {isSectionOpen(filterType) && (
          <div className="mt-2 space-y-2">
            {options.map((option, idx) => (
              <label key={idx} className="flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="form-checkbox h-4 w-4 text-primary-600 rounded"
                  checked={(selectedFilters[filterType] || []).includes(option.value)}
                  onChange={() => handleCheckboxChange(filterType, option.value)}
                />
                <span className="ml-2 text-neutral-700">{option.label}</span>
                {option.count !== undefined && (
                  <span className="ml-1 text-neutral-500 text-sm">({option.count})</span>
                )}
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render range filters
  const renderRangeFilter = (title, filterType, config) => {
    const { min: globalMin, max: globalMax, step = 1 } = config;
    const currentRange = selectedFilters[filterType] || { min: globalMin, max: globalMax };
    
    return (
      <div className="mb-4">
        <div 
          className="flex justify-between items-center py-2 cursor-pointer"
          onClick={() => toggleSection(filterType)}
        >
          <h3 className="font-medium text-neutral-800">{title}</h3>
          {isSectionOpen(filterType) ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {isSectionOpen(filterType) && (
          <div className="mt-4">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600">Min: ${currentRange.min}</span>
              <span className="text-sm text-neutral-600">Max: ${currentRange.max}</span>
            </div>
            
            <div className="mt-2 flex space-x-4">
              <div className="flex-1">
                <input 
                  type="range" 
                  min={globalMin} 
                  max={globalMax} 
                  step={step}
                  value={currentRange.min}
                  onChange={(e) => handleRangeChange(filterType, parseInt(e.target.value), currentRange.max)}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <input 
                  type="range" 
                  min={globalMin} 
                  max={globalMax} 
                  step={step}
                  value={currentRange.max}
                  onChange={(e) => handleRangeChange(filterType, currentRange.min, parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Manual input fields */}
            <div className="mt-2 flex space-x-4">
              <div className="flex-1">
                <input 
                  type="number" 
                  min={globalMin} 
                  max={globalMax} 
                  value={currentRange.min}
                  onChange={(e) => handleRangeChange(filterType, parseInt(e.target.value), currentRange.max)}
                  className="w-full px-2 py-1 border border-neutral-300 rounded"
                />
              </div>
              <div className="flex-1">
                <input 
                  type="number" 
                  min={globalMin} 
                  max={globalMax} 
                  value={currentRange.max}
                  onChange={(e) => handleRangeChange(filterType, currentRange.min, parseInt(e.target.value))}
                  className="w-full px-2 py-1 border border-neutral-300 rounded"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // Render radio filters
  const renderRadioFilter = (title, filterType, options) => {
    return (
      <div className="mb-4">
        <div 
          className="flex justify-between items-center py-2 cursor-pointer"
          onClick={() => toggleSection(filterType)}
        >
          <h3 className="font-medium text-neutral-800">{title}</h3>
          {isSectionOpen(filterType) ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {isSectionOpen(filterType) && (
          <div className="mt-2 space-y-2">
            {options.map((option, idx) => (
              <label key={idx} className="flex items-center cursor-pointer">
                <input 
                  type="radio" 
                  className="form-radio h-4 w-4 text-primary-600"
                  name={filterType}
                  value={option.value}
                  checked={selectedFilters[filterType] === option.value}
                  onChange={() => handleRadioChange(filterType, option.value)}
                />
                <span className="ml-2 text-neutral-700">{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render search filter
  const renderSearchFilter = (title, filterType) => {
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center py-2">
          <h3 className="font-medium text-neutral-800">{title}</h3>
        </div>
        
        <div className="mt-2 relative">
          <input 
            type="text" 
            placeholder="Search..."
            value={selectedFilters[filterType] || ''}
            onChange={(e) => onFilterChange(filterType, e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
          {selectedFilters[filterType] && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              onClick={() => onFilterChange(filterType, '')}
            >
              <FiX size={16} />
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // Render star rating filter
  const renderRatingFilter = (title, filterType, count = 5) => {
    const selectedRating = selectedFilters[filterType] || 0;
    
    return (
      <div className="mb-4">
        <div 
          className="flex justify-between items-center py-2 cursor-pointer"
          onClick={() => toggleSection(filterType)}
        >
          <h3 className="font-medium text-neutral-800">{title}</h3>
          {isSectionOpen(filterType) ? <FiChevronUp /> : <FiChevronDown />}
        </div>
        
        {isSectionOpen(filterType) && (
          <div className="mt-2 space-y-2">
            {[...Array(count)].map((_, i) => {
              const ratingValue = count - i;
              return (
                <label key={i} className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    className="form-radio h-4 w-4 text-primary-600 hidden"
                    name={filterType}
                    value={ratingValue}
                    checked={selectedRating === ratingValue}
                    onChange={() => handleRadioChange(filterType, ratingValue)}
                  />
                  <div className="flex items-center">
                    {[...Array(count)].map((_, j) => (
                      <span 
                        key={j} 
                        className={`text-xl ${j < ratingValue ? 'text-primary-500' : 'text-neutral-300'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-neutral-700">& Up</span>
                    <div 
                      className={`ml-2 ${selectedRating === ratingValue ? 'text-primary-600' : 'text-transparent'}`}
                    >
                      <FiCheck size={16} />
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  
  // Render filters based on type
  const renderFilter = (title, filterType, filterConfig) => {
    switch (filterConfig.type) {
      case 'checkbox':
        return renderCheckboxFilter(title, filterType, filterConfig.options);
      case 'range':
        return renderRangeFilter(title, filterType, filterConfig);
      case 'radio':
        return renderRadioFilter(title, filterType, filterConfig.options);
      case 'search':
        return renderSearchFilter(title, filterType);
      case 'rating':
        return renderRatingFilter(title, filterType, filterConfig.count);
      default:
        return null;
    }
  };
  
  // Mobile filter toggle button
  const renderMobileToggle = () => {
    const activeFilterCount = countActiveFilters();
    
    return (
      <div className="mb-4">
        <button 
          className="w-full flex items-center justify-center px-4 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-neutral-700"
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
        >
          <FiFilter className="mr-2" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-2 bg-primary-100 text-primary-800 px-2 py-0.5 rounded-full text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>
    );
  };
  
  // Render filters
  const renderFilters = () => {
    return Object.entries(options).map(([filterType, filterConfig]) => {
      const { title } = filterConfig;
      return (
        <div key={filterType} className="border-b border-neutral-200 pb-3">
          {renderFilter(title, filterType, filterConfig)}
        </div>
      );
    });
  };
  
  // If mobile, show toggle button and overlay
  if (isMobile) {
    return (
      <>
        {renderMobileToggle()}
        
        {mobileFiltersOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-25 z-50 flex justify-end">
            <div className="w-80 bg-white h-full overflow-y-auto p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold">Filters</h2>
                <button 
                  className="text-neutral-500 hover:text-neutral-700"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  <FiX size={20} />
                </button>
              </div>
              
              {renderFilters()}
              
              <div className="mt-6 flex space-x-2">
                <button 
                  className="flex-1 px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md"
                  onClick={() => {
                    onClearFilters();
                    setMobileFiltersOpen(false);
                  }}
                >
                  Clear All
                </button>
                <button 
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md"
                  onClick={() => setMobileFiltersOpen(false)}
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  
  // Desktop view
  return (
    <div className="bg-white p-4 rounded-lg border border-neutral-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Filters</h2>
        {countActiveFilters() > 0 && (
          <button 
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
            onClick={onClearFilters}
          >
            <FiX size={14} className="mr-1" />
            Clear All
          </button>
        )}
      </div>
      
      {renderFilters()}
    </div>
  );
};

AdvancedFilter.propTypes = {
  options: PropTypes.object,
  selectedFilters: PropTypes.object,
  onFilterChange: PropTypes.func.isRequired,
  onClearFilters: PropTypes.func.isRequired,
  isMobile: PropTypes.bool
};

export default AdvancedFilter; 