import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FiFilter, FiGrid, FiList, FiChevronDown, FiX, FiSearch, FiRefreshCw,
  FiSliders, FiTag, FiStar, FiTruck, FiMapPin, FiDollarSign, FiPackage,
  FiClock, FiAward, FiZap, FiArrowRight, FiHeart, FiEye, FiShoppingCart,
  FiTrendingUp, FiShield, FiInfo, FiChevronLeft, FiChevronRight, FiCheck,
  FiPercent, FiUsers, FiThumbsUp, FiAlertTriangle, FiBell, FiShare
} from 'react-icons/fi';

import ProductService from '../../../shared/services/productService';
import BrandService from '../../../shared/services/brandService';
import CategoryService from '../../../shared/services/categoryService';

import ProductCard from '../../components/common/ProductCard';
import LiveSearch from '../../components/search/LiveSearch';
import Pagination from '../../components/common/Pagination';
import { ProductGridSkeleton } from '../../components/common/LoadingStates';
import EmptyState from '../../components/common/EmptyState';

const EnhancedShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Core state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // UI state
  const [viewMode, setViewMode] = useState('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set(['quickFilters', 'price', 'rating']));
  
  // Advanced features state
  const [compareProducts, setCompareProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showCompareBar, setShowCompareBar] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showPriceAlert, setShowPriceAlert] = useState(null);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [wishlistItems, setWishlistItems] = useState(new Set());
  const [notifications, setNotifications] = useState([]);

  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [], brands: [], priceMin: '', priceMax: '', rating: '',
    inStock: false, freeShipping: false, onSale: false, newArrivals: false,
    warranty: false, bestSellers: false
  });

  // Search and pagination
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const searchQuery = searchParams.get('q') || '';
  const sortBy = searchParams.get('sort') || 'relevance';
  const categoryFilter = searchParams.get('category') || '';
  const brandFilter = searchParams.get('brand') || '';

  const sortOptions = [
    { value: 'relevance', label: 'Best Match' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Customer Rating' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'discount', label: 'Best Deals' },
    { value: 'delivery', label: 'Fastest Delivery' }
  ];

  const quickFilters = [
    { key: 'inStock', label: 'In Stock', count: '12,450+', icon: FiPackage, color: 'green' },
    { key: 'freeShipping', label: 'Free Shipping', count: '8,230+', icon: FiTruck, color: 'blue' },
    { key: 'onSale', label: 'On Sale', count: '3,120+', icon: FiTag, color: 'red' },
    { key: 'newArrivals', label: 'New Arrivals', count: '892+', icon: FiClock, color: 'purple' },
    { key: 'warranty', label: 'With Warranty', count: '5,600+', icon: FiShield, color: 'green' },
    { key: 'bestSellers', label: 'Best Sellers', count: '1,250+', icon: FiTrendingUp, color: 'orange' }
  ];

  // Advanced E-commerce Functions
  const addToCompare = useCallback((product) => {
    if (compareProducts.length < 4 && !compareProducts.find(p => p.id === product.id)) {
      setCompareProducts(prev => [...prev, product]);
      setShowCompareBar(true);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        message: `${product.name} added to comparison`,
        type: 'success'
      }]);
    }
  }, [compareProducts]);

  const removeFromCompare = useCallback((productId) => {
    setCompareProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      if (updated.length === 0) setShowCompareBar(false);
      return updated;
    });
  }, []);

  const toggleProductSelection = useCallback((productId) => {
    setSelectedProducts(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(productId)) {
        newSelected.delete(productId);
      } else {
        newSelected.add(productId);
      }
      return newSelected;
    });
  }, []);

  const addToRecentlyViewed = useCallback((product) => {
    setRecentlyViewed(prev => {
      const updated = [product, ...prev.filter(p => p.id !== product.id)].slice(0, 12);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlistItems(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  }, []);

  const bulkAddToCart = useCallback(() => {
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    setNotifications(prev => [...prev, {
      id: Date.now(),
      message: `${selectedProductsList.length} items added to cart`,
      type: 'success'
    }]);
    setSelectedProducts(new Set());
    setBulkActionMode(false);
  }, [products, selectedProducts]);

  const bulkAddToWishlist = useCallback(() => {
    selectedProducts.forEach(id => setWishlistItems(prev => new Set(prev).add(id)));
    setNotifications(prev => [...prev, {
      id: Date.now(),
      message: `${selectedProducts.size} items added to wishlist`,
      type: 'success'
    }]);
    setSelectedProducts(new Set());
    setBulkActionMode(false);
  }, [selectedProducts]);

  // Load data functions
  const loadFiltersData = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        BrandService.getBrands(),
        CategoryService.getCategories()
      ]);
      if (brandsRes.success) setBrands(brandsRes.brands || []);
      if (categoriesRes.success) setCategories(categoriesRes.categories || []);
    } catch (error) {
      console.error('Error loading filters:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage, limit: 24, sortBy, search: searchQuery,
        category: categoryFilter, brand: brandFilter, ...selectedFilters
      };

      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await ProductService.getProducts(params);
      
      if (response.success) {
        setProducts(response.products || []);
        setTotalCount(response.totalCount || 0);
      } else {
        setError(response.message || 'Failed to load products');
        setProducts([]);
        setTotalCount(0);
      }
    } catch (error) {
      setError('Failed to load products. Please try again.');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Event handlers
  const handleFilterChange = useCallback((filterType, value) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      if (Array.isArray(newFilters[filterType])) {
        const currentValues = newFilters[filterType];
        if (currentValues.includes(value)) {
          newFilters[filterType] = currentValues.filter(v => v !== value);
        } else {
          newFilters[filterType] = [...currentValues, value];
        }
      } else {
        newFilters[filterType] = value;
      }
      return newFilters;
    });
  }, []);

  const handleClearFilters = useCallback(() => {
    setSelectedFilters({
      categories: [], brands: [], priceMin: '', priceMax: '', rating: '',
      inStock: false, freeShipping: false, onSale: false, newArrivals: false,
      warranty: false, bestSellers: false
    });
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      ['category', 'brand', 'page'].forEach(key => newParams.delete(key));
      return newParams;
    });
  }, [setSearchParams]);

  const handleSortChange = useCallback((newSort) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('sort', newSort);
      newParams.delete('page');
      return newParams;
    });
  }, [setSearchParams]);

  const handlePageChange = useCallback((page) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', page.toString());
      return newParams;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSearchParams]);

  // Computed values
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) count += value.length;
      else if (typeof value === 'boolean' && value) count += 1;
      else if (typeof value === 'string' && value) count += 1;
    });
    return count;
  }, [selectedFilters]);

  const totalPages = Math.ceil(totalCount / 24);

  // Effects
  useEffect(() => {
    loadFiltersData();
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) setRecentlyViewed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    loadProducts();
  }, [searchParams, selectedFilters]);

  // Auto-dismiss notifications
  useEffect(() => {
    notifications.forEach(notification => {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 3000);
    });
  }, [notifications]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {notifications.length > 0 && (
        <div className="fixed top-24 right-4 z-50 space-y-2">
          {notifications.map(notification => (
            <div key={notification.id} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slideInRight">
              {notification.message}
            </div>
          ))}
        </div>
      )}

      {/* Prime Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex items-center justify-center space-x-6 text-sm font-medium">
            <div className="flex items-center space-x-2">
              <FiTruck className="w-4 h-4" />
              <span>FREE shipping on orders GHS 500+</span>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <FiClock className="w-4 h-4" />
              <span>Same-day delivery in Accra</span>
            </div>
            <div className="hidden lg:flex items-center space-x-2">
              <FiShield className="w-4 h-4" />
              <span>30-day returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-3 text-sm">
            <nav className="flex items-center space-x-2 text-gray-600">
              <button onClick={() => navigate('/')} className="hover:text-blue-600 hover:underline">
                Home
              </button>
              <FiChevronRight className="w-3 h-3" />
              <span className="text-blue-600 font-medium">Auto Parts</span>
              {categoryFilter && (
                <>
                  <FiChevronRight className="w-3 h-3" />
                  <span className="text-gray-900">{categoryFilter}</span>
                </>
              )}
            </nav>
          </div>

          {/* Search and Controls */}
          <div className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search Bar */}
              <div className="flex-1 max-w-3xl">
                <div className="flex">
                  <div className="relative flex-1">
                    <LiveSearch
                      onSearch={(query, results) => setProducts(results)}
                      placeholder="Search auto parts, brands, vehicles..."
                      className="w-full h-10 pl-4 pr-12 border-2 border-orange-400 rounded-l-md focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <button className="h-10 px-6 bg-orange-400 hover:bg-orange-500 text-white font-medium rounded-r-md transition-colors flex items-center">
                    <FiSearch className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-1 focus:ring-blue-500"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex bg-white border border-gray-300 rounded">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 border-l ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <FiList className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className="lg:hidden flex items-center px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  <FiSliders className="w-4 h-4 mr-1" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Results Info */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="text-gray-600">
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  <span>
                    <span className="font-semibold">{totalCount.toLocaleString()}</span> results
                    {searchQuery && <span> for "<span className="font-medium">{searchQuery}</span>"</span>}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-blue-600 hover:text-blue-700 hover:underline text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className={`w-64 flex-shrink-0 ${isFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-4">
              {/* Quick Filters */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Quick Filters</h3>
                </div>
                <div className="p-4 space-y-3">
                  {quickFilters.map(filter => (
                    <label key={filter.key} className="flex items-center justify-between cursor-pointer group">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFilters[filter.key]}
                          onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 flex items-center">
                          <filter.icon className={`w-4 h-4 mr-2 text-${filter.color}-500`} />
                          {filter.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{filter.count}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Price Range</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <input
                      type="number"
                      placeholder="Min"
                      value={selectedFilters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={selectedFilters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors">
                    Apply
                  </button>
                </div>
              </div>

              {/* Customer Rating */}
              <div className="bg-white border border-gray-200 rounded-lg">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">Customer Rating</h3>
                </div>
                <div className="p-4 space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={selectedFilters.rating === rating.toString()}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <div className="ml-3 flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-gray-600">& Up</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Area */}
          <main className="flex-1">
            {loading ? (
              <ProductGridSkeleton count={24} />
            ) : error ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12">
                <EmptyState
                  title="Something went wrong"
                  description={error}
                  action={{ label: "Try Again", onClick: loadProducts, icon: FiRefreshCw }}
                />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12">
                <EmptyState
                  title="No products found"
                  description="Try adjusting your search terms or filters."
                  action={{ label: "Clear Filters", onClick: handleClearFilters, icon: FiX }}
                />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bulk Actions Bar */}
                {bulkActionMode && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900">
                          {selectedProducts.size} items selected
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={bulkAddToCart}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center"
                          >
                            <FiShoppingCart className="w-4 h-4 mr-1" />
                            Add to Cart
                          </button>
                          <button
                            onClick={bulkAddToWishlist}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center"
                          >
                            <FiHeart className="w-4 h-4 mr-1" />
                            Save for Later
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBulkActionMode(false);
                          setSelectedProducts(new Set());
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {((currentPage - 1) * 24) + 1}-{Math.min(currentPage * 24, totalCount)} of {totalCount.toLocaleString()} results
                    </span>
                    <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                      <FiUsers className="w-4 h-4" />
                      <span>Trusted by 25,000+ customers</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setBulkActionMode(!bulkActionMode)}
                      className={`px-3 py-1 rounded text-sm border transition-colors ${
                        bulkActionMode 
                          ? 'bg-blue-100 border-blue-300 text-blue-700' 
                          : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {bulkActionMode ? 'Cancel Selection' : 'Select Multiple'}
                    </button>
                    {compareProducts.length > 0 && (
                      <button
                        onClick={() => setShowCompareBar(!showCompareBar)}
                        className="px-3 py-1 bg-green-100 border border-green-300 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                      >
                        Compare ({compareProducts.length})
                      </button>
                    )}
                  </div>
                </div>

                {/* Products Grid */}
                <div className={
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                    : 'space-y-4'
                }>
                  {products.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 relative group"
                    >
                      {/* Selection checkbox */}
                      {bulkActionMode && (
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Badges */}
                      {index % 7 === 0 && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg z-10">
                          Popular
                        </div>
                      )}

                      {/* Social proof */}
                      {index % 5 === 0 && (
                        <div className="absolute top-8 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
                          {Math.floor(Math.random() * 50) + 10} bought today
                        </div>
                      )}

                      <ProductCard
                        product={product}
                        layout={viewMode}
                        showQuickView={true}
                        showBestSeller={product.is_bestseller}
                        showDiscount={product.discount_price > 0}
                        className="h-full border-0 shadow-none rounded-lg"
                        onClick={() => addToRecentlyViewed(product)}
                      />

                      {/* Quick Actions Overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-white bg-opacity-95 backdrop-blur-sm p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 rounded-b-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => addToCompare(product)}
                              disabled={compareProducts.length >= 4}
                              className="flex items-center text-xs text-gray-600 hover:text-blue-600 disabled:opacity-50"
                            >
                              <FiEye className="w-4 h-4 mr-1" />
                              Compare
                            </button>
                            <button
                              onClick={() => setShowPriceAlert(product.id)}
                              className="flex items-center text-xs text-gray-600 hover:text-green-600"
                            >
                              <FiBell className="w-4 h-4 mr-1" />
                              Price Alert
                            </button>
                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className={`flex items-center text-xs transition-colors ${
                                wishlistItems.has(product.id) 
                                  ? 'text-red-600' 
                                  : 'text-gray-600 hover:text-red-600'
                              }`}
                            >
                              <FiHeart className="w-4 h-4 mr-1" />
                              {wishlistItems.has(product.id) ? 'Saved' : 'Save'}
                            </button>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FiAlertTriangle className="w-3 h-3 text-orange-500" />
                            <span className="text-xs text-orange-600 font-medium">
                              {Math.floor(Math.random() * 20) + 5} left
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
                      <div className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages} pages
                      </div>
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        showFirstLast={true}
                        showPageNumbers={7}
                      />
                    </div>
                  </div>
                )}

                {/* Recently Viewed */}
                {recentlyViewed.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <FiClock className="w-5 h-5 mr-2 text-gray-600" />
                        Recently Viewed
                      </h3>
                      <button 
                        onClick={() => setRecentlyViewed([])}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Clear History
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                      {recentlyViewed.slice(0, 6).map((product) => (
                        <div key={product.id} className="border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow cursor-pointer">
                          <img 
                            src={product.image_url || '/api/placeholder/150/150'} 
                            alt={product.name}
                            className="w-full h-20 object-cover rounded mb-2"
                          />
                          <p className="text-xs text-gray-700 line-clamp-2">{product.name}</p>
                          <p className="text-sm font-semibold text-gray-900">
                            GHS {product.price?.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Comparison Bar */}
      {showCompareBar && compareProducts.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-lg z-50">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <FiEye className="w-5 h-5 mr-2" />
                  Compare Products ({compareProducts.length}/4)
                </h3>
                <div className="flex items-center space-x-3">
                  {compareProducts.map((product) => (
                    <div key={product.id} className="relative bg-gray-50 rounded-lg p-2">
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                      <img 
                        src={product.image_url || '/api/placeholder/60/60'} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <p className="text-xs mt-1 text-center w-12 truncate">{product.name}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => console.log('Compare products:', compareProducts)}
                  disabled={compareProducts.length < 2}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  Compare Now
                </button>
                <button
                  onClick={() => {
                    setCompareProducts([]);
                    setShowCompareBar(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Alert Modal */}
      {showPriceAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FiBell className="w-5 h-5 mr-2 text-green-500" />
                Set Price Alert
              </h3>
              <button
                onClick={() => setShowPriceAlert(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Get notified when the price drops below your target price.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Price (GHS)
                </label>
                <input
                  type="number"
                  placeholder="Enter your target price"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={() => setShowPriceAlert(null)}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Set Alert
                </button>
                <button
                  onClick={() => setShowPriceAlert(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Compare Button */}
      {compareProducts.length > 0 && (
        <button
          onClick={() => setShowCompareBar(!showCompareBar)}
          className="lg:hidden fixed bottom-4 right-4 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors z-40"
        >
          <div className="relative">
            <FiEye className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {compareProducts.length}
            </span>
          </div>
        </button>
      )}
    </div>
  );
};

export default EnhancedShopPage; 