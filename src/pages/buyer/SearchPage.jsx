import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Breadcrumb, 
  LiveSearch,
  EmptyState,
  LoadingScreen 
} from '../../components/common';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

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

  // Initial search if query in URL
  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' }
  ];

  if (searchQuery) {
    breadcrumbItems.push({
      label: `"${searchQuery}"`,
      href: `/search?q=${encodeURIComponent(searchQuery)}`
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
            <h1 className="text-3xl font-bold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Search Products'}
            </h1>
          </div>
          
          <p className="text-gray-600">
            Find the perfect auto parts for your vehicle. Search by part name, vehicle model, or part number.
          </p>
        </div>

        {/* Live Search Component */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <LiveSearch
            onSearch={handleSearch}
            onProductSelect={handleProductSelect}
            showResults={true}
            placeholder="Search for auto parts, vehicles, part numbers..."
            className="w-full"
            filters={{
              // Default filters for search page
              limit: 24,
              sortBy: 'relevance'
            }}
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