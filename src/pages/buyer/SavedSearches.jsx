import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiBookmark, 
  FiHeart, 
  FiClock,
  FiFilter,
  FiTrash2,
  FiEdit,
  FiEye,
  FiStar,
  FiTrendingUp,
  FiCalendar,
  FiUser,
  FiSettings,
  FiRefreshCw,
  FiBell,
  FiTag,
  FiPackage,
  FiDollarSign,
  FiMapPin,
  FiTruck,
  FiShare2,
  FiDownload,
  FiCopy,
  FiPlay
} from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';

const SavedSearches = () => {
  const [savedSearches, setSavedSearches] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [selectedSearches, setSelectedSearches] = useState([]);
  const { showToast } = useToast();

  // Mock saved searches data
  const mockSavedSearches = [
    {
      id: 1,
      name: 'Brake Pads for Toyota Corolla 2017',
      query: 'brake pads',
      vehicle: { year: 2017, make: 'Toyota', model: 'Corolla' },
      filters: {
        priceRange: [50, 150],
        brands: ['Bosch', 'Wagner'],
        dealer: 'any',
        inStock: true
      },
      createdAt: '2024-01-15T10:30:00Z',
      lastRun: '2024-01-20T14:20:00Z',
      resultsCount: 24,
      newResults: 3,
      alertsEnabled: true,
      priceAlertEnabled: true,
      maxPrice: 120,
      frequency: 'daily',
      category: 'Brake System'
    },
    {
      id: 2,
      name: 'LED Headlights H11',
      query: 'LED headlight H11',
      vehicle: null,
      filters: {
        priceRange: [80, 200],
        brands: ['Philips', 'SEALIGHT'],
        dealer: 'any',
        inStock: true
      },
      createdAt: '2024-01-10T16:45:00Z',
      lastRun: '2024-01-19T09:15:00Z',
      resultsCount: 18,
      newResults: 0,
      alertsEnabled: true,
      priceAlertEnabled: false,
      maxPrice: null,
      frequency: 'weekly',
      category: 'Lighting'
    },
    {
      id: 3,
      name: 'Performance Air Filters',
      query: 'performance air filter',
      vehicle: { year: 2020, make: 'Honda', model: 'Civic' },
      filters: {
        priceRange: [30, 100],
        brands: ['K&N', 'AEM'],
        dealer: 'any',
        inStock: false
      },
      createdAt: '2024-01-08T11:20:00Z',
      lastRun: '2024-01-18T13:30:00Z',
      resultsCount: 12,
      newResults: 1,
      alertsEnabled: false,
      priceAlertEnabled: true,
      maxPrice: 75,
      frequency: 'monthly',
      category: 'Engine'
    },
    {
      id: 4,
      name: 'Winter Tires 225/65R17',
      query: 'winter tires 225/65R17',
      vehicle: { year: 2019, make: 'Ford', model: 'Escape' },
      filters: {
        priceRange: [100, 300],
        brands: ['Michelin', 'Bridgestone', 'Continental'],
        dealer: 'any',
        inStock: true
      },
      createdAt: '2024-01-05T08:15:00Z',
      lastRun: '2024-01-17T12:00:00Z',
      resultsCount: 36,
      newResults: 5,
      alertsEnabled: true,
      priceAlertEnabled: true,
      maxPrice: 250,
      frequency: 'weekly',
      category: 'Tires & Wheels'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSavedSearches(mockSavedSearches);
      setLoading(false);
    }, 1000);
  }, []);

  const filterOptions = [
    { value: 'all', label: 'All Searches', count: savedSearches.length },
    { value: 'with_alerts', label: 'With Alerts', count: savedSearches.filter(s => s.alertsEnabled).length },
    { value: 'price_alerts', label: 'Price Alerts', count: savedSearches.filter(s => s.priceAlertEnabled).length },
    { value: 'new_results', label: 'New Results', count: savedSearches.filter(s => s.newResults > 0).length },
    { value: 'recent', label: 'Recent Activity', count: savedSearches.filter(s => {
      const lastRun = new Date(s.lastRun);
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      return lastRun > threeDaysAgo;
    }).length }
  ];

  const filteredSearches = savedSearches
    .filter(search => {
      if (filter === 'all') return true;
      if (filter === 'with_alerts') return search.alertsEnabled;
      if (filter === 'price_alerts') return search.priceAlertEnabled;
      if (filter === 'new_results') return search.newResults > 0;
      if (filter === 'recent') {
        const lastRun = new Date(search.lastRun);
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        return lastRun > threeDaysAgo;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastRun) - new Date(a.lastRun);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'results':
          return b.resultsCount - a.resultsCount;
        case 'new_results':
          return b.newResults - a.newResults;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const handleRunSearch = (search) => {
    // In real app, this would execute the search and navigate to results
    showToast(`Running search: "${search.name}"`, 'success');
    // Update last run time
    setSavedSearches(searches => 
      searches.map(s => s.id === search.id ? { ...s, lastRun: new Date().toISOString() } : s)
    );
  };

  const handleDeleteSearch = (searchId) => {
    if (window.confirm('Are you sure you want to delete this saved search?')) {
      setSavedSearches(searches => searches.filter(s => s.id !== searchId));
      showToast('Saved search deleted', 'success');
    }
  };

  const handleToggleAlert = (searchId, alertType) => {
    setSavedSearches(searches => 
      searches.map(s => 
        s.id === searchId 
          ? { ...s, [alertType]: !s[alertType] }
          : s
      )
    );
    showToast('Alert settings updated', 'success');
  };

  const handleBulkDelete = () => {
    if (selectedSearches.length === 0) return;
    
    setSavedSearches(searches => searches.filter(s => !selectedSearches.includes(s.id)));
    setSelectedSearches([]);
    showToast(`${selectedSearches.length} searches deleted`, 'success');
  };

  const handleSelectSearch = (searchId) => {
    setSelectedSearches(prev => 
      prev.includes(searchId)
        ? prev.filter(id => id !== searchId)
        : [...prev, searchId]
    );
  };

  const handleSelectAll = () => {
    const allIds = filteredSearches.map(s => s.id);
    setSelectedSearches(
      selectedSearches.length === allIds.length ? [] : allIds
    );
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const totalNewResults = savedSearches.reduce((sum, s) => sum + s.newResults, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Saved Searches</h1>
          <p className="text-gray-600">
            Manage your saved product searches and get notified of new results
            {totalNewResults > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {totalNewResults} new results
              </span>
            )}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiBookmark className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Searches</p>
                <p className="text-2xl font-bold text-gray-900">{savedSearches.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <FiTrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Results</p>
                <p className="text-2xl font-bold text-gray-900">{totalNewResults}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FiBell className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedSearches.filter(s => s.alertsEnabled).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Price Alerts</p>
                <p className="text-2xl font-bold text-gray-900">
                  {savedSearches.filter(s => s.priceAlertEnabled).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="results">Most Results</option>
                <option value="new_results">New Results</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              {selectedSearches.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedSearches.length})
                </button>
              )}
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSearch className="w-5 h-5 mr-2" />
                New Search
              </Link>
            </div>
          </div>

          {filteredSearches.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedSearches.length === filteredSearches.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Select all</span>
              </label>
            </div>
          )}
        </div>

        {/* Saved Searches List */}
        <div className="space-y-6">
          {filteredSearches.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
              <FiBookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved searches found</h3>
              <p className="text-gray-600 mb-6">
                Save your frequently used searches to get notified of new results and price changes
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiSearch className="w-5 h-5 mr-2" />
                Start Searching
              </Link>
            </div>
          ) : (
            filteredSearches.map(search => (
              <div key={search.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Search Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedSearches.includes(search.id)}
                        onChange={() => handleSelectSearch(search.id)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {search.name}
                          </h3>
                          {search.newResults > 0 && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              {search.newResults} new
                            </span>
                          )}
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                            {search.category}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p><strong>Query:</strong> "{search.query}"</p>
                          {search.vehicle && (
                            <p><strong>Vehicle:</strong> {search.vehicle.year} {search.vehicle.make} {search.vehicle.model}</p>
                          )}
                          <p><strong>Price Range:</strong> ${search.filters.priceRange[0]} - ${search.filters.priceRange[1]}</p>
                          {search.filters.brands.length > 0 && (
                            <p><strong>Brands:</strong> {search.filters.brands.join(', ')}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRunSearch(search)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <FiPlay className="w-4 h-4 mr-2" />
                        Run Search
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <FiEdit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSearch(search.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-900">{search.resultsCount}</p>
                      <p className="text-sm text-gray-600">Total Results</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{search.newResults}</p>
                      <p className="text-sm text-gray-600">New Results</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900">{getTimeAgo(search.lastRun)}</p>
                      <p className="text-sm text-gray-600">Last Run</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 capitalize">{search.frequency}</p>
                      <p className="text-sm text-gray-600">Frequency</p>
                    </div>
                  </div>

                  {/* Alert Settings */}
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-6">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={search.alertsEnabled}
                          onChange={() => handleToggleAlert(search.id, 'alertsEnabled')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          New Results Alerts
                        </span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={search.priceAlertEnabled}
                          onChange={() => handleToggleAlert(search.id, 'priceAlertEnabled')}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          Price Alerts
                        </span>
                        {search.priceAlertEnabled && search.maxPrice && (
                          <span className="ml-1 text-sm text-gray-600">
                            (under ${search.maxPrice})
                          </span>
                        )}
                      </label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FiBell className={`w-4 h-4 ${search.alertsEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className="text-sm text-gray-600">
                        {search.alertsEnabled ? 'Alerts On' : 'Alerts Off'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Pro Tips for Saved Searches</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Set Price Alerts</h3>
              <p className="text-blue-100 text-sm">
                Get notified when items drop below your target price
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Use Vehicle Filters</h3>
              <p className="text-blue-100 text-sm">
                Save searches specific to your vehicles for better results
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Adjust Frequency</h3>
              <p className="text-blue-100 text-sm">
                Control how often you want to check for new results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedSearches; 