import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Breadcrumb,
  LiveSearch,
  EmptyState,
  LoadingScreen
} from '../../components/common';
import { FiSearch, FiArrowLeft, FiTruck, FiX } from 'react-icons/fi';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Handle search results
  const handleSearch = ({ query, results, count, filters }) => {
    setSearchQuery(query);
    
    // Update URL with search query
    const params = new URLSearchParams();
    if (query) {
      params.set('q', query);
    }
    
    // Update URL without triggering navigation
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  };

  // Handle product selection
  const handleProductSelect = (productId) => {
    navigate(`/products/${productId}`);
  };

  // Initial search if query in URL and extract vehicle parameters
  useEffect(() => {
    const query = searchParams.get('q');
    const year = searchParams.get('year');
    const make = searchParams.get('make');
    const model = searchParams.get('model');

    console.log('🔍 SearchPage URL params:', { query, year, make, model });

    if (query) {
      setSearchQuery(query);
    }

    // Set vehicle if parameters are present
    if (year || make || model) {
      const vehicle = {
        year: year || '',
        make: make || '',
        model: model || ''
      };
      setSelectedVehicle(vehicle);
      console.log('🚗 SearchPage vehicle set:', vehicle);
    }
  }, [searchParams]);

  // Handle vehicle removal
  const handleRemoveVehicle = () => {
    setSelectedVehicle(null);

    // Update URL to remove vehicle parameters
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('q', searchQuery);
    }
    navigate(`/search?${params.toString()}`);
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' }
  ];

  if (searchQuery || selectedVehicle) {
    let label = '';
    if (searchQuery && selectedVehicle) {
      const vehicleStr = `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`.trim();
      label = `"${searchQuery}" for ${vehicleStr}`;
    } else if (searchQuery) {
      label = `"${searchQuery}"`;
    } else if (selectedVehicle) {
      label = `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`.trim();
    }

    breadcrumbItems.push({
      label,
      href: window.location.pathname + window.location.search
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {searchQuery && selectedVehicle ? (
                  <>Search results for "{searchQuery}"</>
                ) : searchQuery ? (
                  <>Search results for "{searchQuery}"</>
                ) : selectedVehicle ? (
                  <>Parts for {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}</>
                ) : (
                  'Search Products'
                )}
              </h1>

              {/* Vehicle Filter Display */}
              {selectedVehicle && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <FiTruck className="w-4 h-4 mr-2" />
                    <span>
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    </span>
                    <button
                      onClick={handleRemoveVehicle}
                      className="ml-2 hover:bg-blue-200 rounded-full p-1"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <p className="text-gray-600">
            {selectedVehicle ? (
              `Find compatible auto parts for your ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}. All results are filtered for compatibility.`
            ) : (
              'Find the perfect auto parts for your vehicle. Search by part name, vehicle model, or part number.'
            )}
          </p>
        </div>

        {/* Live Search Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <LiveSearch
            onSearch={handleSearch}
            onProductSelect={handleProductSelect}
            showResults={true}
            placeholder={selectedVehicle ?
              `Search parts for your ${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}...` :
              "Search for auto parts, vehicles, part numbers..."
            }
            className="w-full"
            filters={{
              // Default filters for search page
              limit: 24,
              sortBy: 'relevance',
              // Include vehicle filter if selected
              ...(selectedVehicle && {
                vehicle: selectedVehicle
              })
            }}
            initialQuery={searchQuery}
          />
        </div>

        {/* Search Tips */}
        {!searchQuery && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Search Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <h4 className="font-medium mb-2">Search by Vehicle:</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• "2017 Toyota Corolla battery"</li>
                  <li>• "Honda Civic brake pads"</li>
                  <li>• "Ford F-150 oil filter"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Search by Part:</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• "brake rotors"</li>
                  <li>• "spark plugs"</li>
                  <li>• "air filter"</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Search by Part Number:</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• "ACDelco 123456"</li>
                  <li>• "BP-BREMBO-456"</li>
                  <li>• Exact SKU or part numbers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Popular Searches:</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    'brake pads',
                    'oil filter',
                    'air filter', 
                  'spark plugs',
                    'battery'
                  ].map(term => (
                    <button
                      key={term}
                      onClick={() => {
                        // Trigger search for popular term
                        const params = new URLSearchParams();
                        params.set('q', term);
                        navigate(`/search?${params.toString()}`);
                      }}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-xs transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage; 