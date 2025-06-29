import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  FiMapPin, 
  FiStar, 
  FiPhone, 
  FiMail, 
  FiGlobe, 
  FiFilter,
  FiSearch,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiTruck,
  FiAward
} from 'react-icons/fi';
import { Spinner } from '../../components/common';
import DealerService from '../../../shared/services/dealerService';

const DealersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDealers, setTotalDealers] = useState(0);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedState, setSelectedState] = useState(searchParams.get('state') || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || '');
  const [minRating, setMinRating] = useState(parseFloat(searchParams.get('minRating')) || 0);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'rating');
  const [userLocation, setUserLocation] = useState(null);
  
  const dealersPerPage = 12;

  // Get user's location for nearby dealers
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied:', error);
        }
      );
    }
  }, []);

  // Load dealers
  useEffect(() => {
    loadDealers();
  }, [currentPage, sortBy, selectedCity, selectedState, selectedSpecialty, minRating, searchQuery]);

  const loadDealers = async () => {
    try {
      setLoading(true);
      
      const filters = {
        page: currentPage,
        limit: dealersPerPage,
        sortBy,
        city: selectedCity || null,
        state: selectedState || null,
        specialty: selectedSpecialty || null,
        minRating: minRating > 0 ? minRating : null
      };

      // Add location-based search if available
      if (userLocation && sortBy === 'distance') {
        filters.latitude = userLocation.latitude;
        filters.longitude = userLocation.longitude;
        filters.radius = 100; // 100km radius
      }

      // Add search query
      if (searchQuery.trim()) {
        // For now, we'll search by city/business name
        filters.city = searchQuery;
      }

      const result = await DealerService.getDealers(filters);
      
      if (result.success) {
        setDealers(result.dealers || []);
        setTotalDealers(result.count || 0);
      } else {
        console.error('Error loading dealers:', result.error);
        setDealers([]);
        setTotalDealers(0);
      }
    } catch (error) {
      console.error('Error loading dealers:', error);
      setDealers([]);
      setTotalDealers(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadDealers();
  };

  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'city':
        setSelectedCity(value);
        break;
      case 'state':
        setSelectedState(value);
        break;
      case 'specialty':
        setSelectedSpecialty(value);
        break;
      case 'minRating':
        setMinRating(value);
        break;
      case 'sortBy':
        setSortBy(value);
        break;
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCity('');
    setSelectedState('');
    setSelectedSpecialty('');
    setMinRating(0);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalDealers / dealersPerPage);

  const DealerCard = ({ dealer }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Dealer Header */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600">
        {dealer.banner_url && (
          <img 
            src={dealer.banner_url} 
            alt={dealer.displayName}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Verification Badge */}
        {dealer.isVerified && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                                <FiCheckCircle className="w-3 h-3" />
            Verified
          </div>
        )}
      </div>

      {/* Dealer Avatar */}
      <div className="relative px-6 pb-6">
        <div className="flex items-start -mt-8 mb-4">
          <div className="w-16 h-16 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
            {dealer.logo_url ? (
              <img 
                src={dealer.logo_url} 
                alt={dealer.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">
                  {dealer.displayName.charAt(0)}
                </span>
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {dealer.displayName}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{dealer.ownerName}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar 
                    key={i} 
                    className={`w-4 h-4 ${
                      i < Math.floor(dealer.rating || 0) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {dealer.rating ? dealer.rating.toFixed(1) : '0.0'} ({dealer.total_reviews || 0})
              </span>
            </div>
          </div>
        </div>

        {/* Location */}
        {dealer.fullAddress && (
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <FiMapPin className="w-4 h-4 mr-2" />
            {dealer.fullAddress}
          </div>
        )}

        {/* Specialties */}
        {dealer.specialties && dealer.specialties.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {dealer.specialties.slice(0, 3).map((specialty, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                >
                  {specialty}
                </span>
              ))}
              {dealer.specialties.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                  +{dealer.specialties.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
          <div className="text-center">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <FiPackage className="w-4 h-4" />
            </div>
            <div className="text-xs text-gray-500">Products</div>
            <div className="text-sm font-semibold">-</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 mb-1">
              <FiTruck className="w-4 h-4" />
            </div>
            <div className="text-xs text-gray-500">Orders</div>
            <div className="text-sm font-semibold">{dealer.total_sales || 0}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-orange-600 mb-1">
              <FiAward className="w-4 h-4" />
            </div>
            <div className="text-xs text-gray-500">Since</div>
            <div className="text-sm font-semibold">
              {new Date(dealer.created_at).getFullYear()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3">
          <Link 
            to={`/dealers/${dealer.id}`}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded text-center text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            View Store
          </Link>
          <Link 
            to={`/dealers/${dealer.id}/products`}
            className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded text-center text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );

  const DealerListItem = ({ dealer }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-6">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {dealer.logo_url ? (
            <img 
              src={dealer.logo_url} 
              alt={dealer.displayName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xl">
                {dealer.displayName.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {dealer.displayName}
                {dealer.isVerified && (
                                      <FiCheckCircle className="inline w-5 h-5 text-green-500 ml-2" />
                )}
              </h3>
              <p className="text-gray-600">{dealer.ownerName}</p>
            </div>
            
            {/* Rating */}
            <div className="text-right">
              <div className="flex items-center gap-1 mb-1">
                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-semibold">
                  {dealer.rating ? dealer.rating.toFixed(1) : '0.0'}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {dealer.total_reviews || 0} reviews
              </p>
            </div>
          </div>

          {/* Location */}
          {dealer.fullAddress && (
            <div className="flex items-center text-gray-600 mb-3">
              <FiMapPin className="w-4 h-4 mr-2" />
              {dealer.fullAddress}
            </div>
          )}

          {/* Description */}
          {dealer.description && (
            <p className="text-gray-600 mb-3 line-clamp-2">
              {dealer.description}
            </p>
          )}

          {/* Specialties */}
          {dealer.specialties && dealer.specialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {dealer.specialties.slice(0, 5).map((specialty, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Link 
              to={`/dealers/${dealer.id}`}
              className="bg-blue-600 text-white py-2 px-6 rounded font-medium hover:bg-blue-700 transition-colors"
            >
              View Store
            </Link>
            <Link 
              to={`/dealers/${dealer.id}/products`}
              className="border border-blue-600 text-blue-600 py-2 px-6 rounded font-medium hover:bg-blue-50 transition-colors"
            >
              Browse Products
            </Link>
            {dealer.contactInfo?.phone && (
              <button className="border border-gray-300 text-gray-600 py-2 px-4 rounded hover:bg-gray-50 transition-colors">
                <FiPhone className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Auto Parts Dealers</h1>
              <p className="text-gray-600 mt-2">
                Discover trusted dealers in your area with quality auto parts and excellent service
              </p>
            </div>
            
            {/* View Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button 
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear All
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Location
                </label>
                <form onSubmit={handleSearch} className="flex">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="City, State"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
                  >
                    <FiSearch className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>Any Rating</option>
                  <option value={4}>4+ Stars</option>
                  <option value={4.5}>4.5+ Stars</option>
                  <option value={5}>5 Stars</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="rating">Highest Rated</option>
                  <option value="reviews">Most Reviews</option>
                  <option value="sales">Most Sales</option>
                  <option value="name">Name A-Z</option>
                  {userLocation && <option value="distance">Nearest</option>}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <p className="text-gray-600">
                  {loading ? 'Loading...' : `${totalDealers} dealers found`}
                </p>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <FiFilter className="w-4 h-4" />
                  Filters
                </button>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            )}

            {/* Dealers Grid/List */}
            {!loading && dealers.length > 0 && (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-6'
              }>
                {dealers.map((dealer) => (
                  viewMode === 'grid' ? (
                    <DealerCard key={dealer.id} dealer={dealer} />
                  ) : (
                    <DealerListItem key={dealer.id} dealer={dealer} />
                  )
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && dealers.length === 0 && (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiMapPin className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No dealers found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or expanding your search area.
                </p>
                <button 
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 border rounded text-sm ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealersPage; 