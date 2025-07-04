import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiCheck, FiInfo, FiTruck } from 'react-icons/fi';
import PropTypes from 'prop-types';

/**
 * VehicleCompatibility Component - Displays vehicle compatibility information for products
 * 
 * @param {Array} compatibility - Array of vehicle compatibility objects
 * @param {Boolean} compact - Whether to show a compact version
 * @param {String} className - Additional CSS classes
 */
const VehicleCompatibility = ({ compatibility = [], compact = false, className = '' }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedMake, setSelectedMake] = useState('all');

  // Filter out incomplete compatibility entries - only show entries with meaningful vehicle information
  const validCompatibility = compatibility.filter(compat => {
    // Must have at least year and make to be meaningful
    if (!compat.year || !compat.make) return false;
    
    // Skip universal entries without specific vehicle info
    if (compat.matchType === 'universal' && !compat.model) return false;
    
    return true;
  });

  if (!validCompatibility || validCompatibility.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="flex items-center text-gray-600">
          <FiInfo className="mr-2" />
          <span className="text-sm">Vehicle compatibility information is being updated for this product</span>
        </div>
      </div>
    );
  }

  // Group compatibility by make and model using valid compatibility only
  const groupedCompatibility = validCompatibility.reduce((acc, compat) => {
    const key = compat.make;
    if (!acc[key]) {
      acc[key] = {};
    }
    
    const modelKey = compat.model || 'All Models';
    if (!acc[key][modelKey]) {
      acc[key][modelKey] = [];
    }
    
    acc[key][modelKey].push(compat);
    return acc;
  }, {});

  // Get unique years, makes for filtering from valid compatibility
  const allYears = [...new Set(validCompatibility.filter(c => c.year).map(c => c.year))].sort();
  const allMakes = [...new Set(validCompatibility.filter(c => c.make).map(c => c.make))].sort();

  // Filter compatibility based on selections
  const filteredCompatibility = validCompatibility.filter(compat => {
    if (selectedYear !== 'all' && compat.year !== selectedYear) return false;
    if (selectedMake !== 'all' && compat.make !== selectedMake) return false;
    return true;
  });

  const displayCompatibility = compact && !expanded 
    ? filteredCompatibility.slice(0, 3) 
    : filteredCompatibility;

  // Render compatibility item
  const renderCompatibilityItem = (compat, index) => {
    const getMatchTypeColor = (matchType) => {
      switch (matchType) {
        case 'specific': return 'text-green-600 bg-green-50';
        case 'model': return 'text-blue-600 bg-blue-50';
        case 'make_year': return 'text-orange-600 bg-orange-50';
        case 'make': return 'text-purple-600 bg-purple-50';
        case 'year': return 'text-gray-600 bg-gray-50';
        default: return 'text-gray-600 bg-gray-50';
      }
    };

    const getMatchTypeText = (matchType) => {
      switch (matchType) {
        case 'specific': return 'Exact Match';
        case 'model': return 'Model Compatible';
        case 'make_year': return 'Make & Year';
        case 'make': return 'Make Compatible';
        case 'year': return 'Year Compatible';
        default: return 'Compatible';
      }
    };

    return (
      <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:shadow-sm transition-shadow">
        <div className="flex items-center">
          <FiTruck className="text-gray-400 mr-3" />
          <div>
            <div className="font-medium text-gray-900">
              {compat.year && <span>{compat.year} </span>}
              {compat.make && <span className="capitalize">{compat.make} </span>}
              {compat.model && <span className="capitalize">{compat.model}</span>}
              {!compat.model && compat.make && <span>(All Models)</span>}
            </div>
            {compat.matchType && (
              <div className="text-xs mt-1">
                <span className={`px-2 py-1 rounded-full ${getMatchTypeColor(compat.matchType)}`}>
                  {getMatchTypeText(compat.matchType)}
                </span>
              </div>
            )}
          </div>
        </div>
        <FiCheck className="text-green-500" />
      </div>
    );
  };

  return (
    <div className={`vehicle-compatibility ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <FiTruck className="mr-2" />
          Compatible Vehicles
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({validCompatibility.length} vehicle{validCompatibility.length !== 1 ? 's' : ''})
          </span>
        </h3>
        {compact && validCompatibility.length > 3 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
          >
            {expanded ? 'Show Less' : 'Show All'}
            {expanded ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
        )}
      </div>

      {/* Filters */}
      {!compact && (allYears.length > 1 || allMakes.length > 1) && (
        <div className="mb-4 flex flex-wrap gap-4">
          {allYears.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              >
                <option value="all">All Years</option>
                {allYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}
          
          {allMakes.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm capitalize"
              >
                <option value="all">All Makes</option>
                {allMakes.map(make => (
                  <option key={make} value={make} className="capitalize">{make}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Compatibility List */}
      <div className="space-y-2">
        {displayCompatibility.length > 0 ? (
          displayCompatibility.map(renderCompatibilityItem)
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FiInfo className="mx-auto mb-2" size={24} />
            <p>No compatible vehicles found with selected filters</p>
          </div>
        )}
      </div>

      {/* Summary for compact view */}
      {compact && !expanded && validCompatibility.length > 3 && (
        <div className="mt-3 text-sm text-gray-600 text-center">
          and {validCompatibility.length - 3} more vehicles...
        </div>
      )}

      {/* Grouped view toggle for non-compact */}
      {!compact && Object.keys(groupedCompatibility).length > 1 && (
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-md font-medium text-gray-900 mb-3">By Vehicle Make</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedCompatibility).map(([make, models]) => (
              <div key={make} className="bg-gray-50 rounded-lg p-3">
                <h5 className="font-medium text-gray-900 capitalize mb-2">{make}</h5>
                <div className="space-y-1">
                  {Object.entries(models).map(([model, compats]) => (
                    <div key={model} className="text-sm text-gray-700">
                      <span className="capitalize">{model}</span>
                      {compats.length > 1 && (
                        <span className="text-gray-500 ml-1">
                          ({compats.map(c => c.year).filter(Boolean).join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

VehicleCompatibility.propTypes = {
  compatibility: PropTypes.arrayOf(PropTypes.shape({
    year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    make: PropTypes.string,
    model: PropTypes.string,
    matchType: PropTypes.oneOf(['specific', 'model', 'make_year', 'make', 'year'])
  })),
  compact: PropTypes.bool,
  className: PropTypes.string
};

export default VehicleCompatibility; 