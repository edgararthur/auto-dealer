import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FiFilter, 
  FiGrid, 
  FiList, 
  FiChevronDown,
  FiX,
  FiSearch,
  FiRefreshCw,
  FiSliders,
  FiTag,
  FiStar,
  FiTruck,
  FiMapPin,
  FiDollarSign,
  FiPackage,
  FiClock,
  FiAward,
  FiZap,
  FiArrowRight,
  FiHeart,
  FiEye,
  FiShoppingCart,
  FiTrendingUp,
  FiShield,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
  FiCheck,
  FiPercent,
  FiUsers,
  FiThumbsUp
} from 'react-icons/fi';

import ProductService from '../../../shared/services/productService';
import BrandService from '../../../shared/services/brandService';
import CategoryService from '../../../shared/services/categoryService';
import supabase from '../../../shared/supabase/supabaseClient';

import ProductCard from '../../components/common/ProductCard';
import Pagination from '../../components/common/Pagination';
import { ProductGridSkeleton } from '../../components/common/LoadingStates';
import EmptyState from '../../components/common/EmptyState';
import ToastNotifications from '../../components/common/ToastNotifications';

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // UI State
  const [viewMode, setViewMode] = useState('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set(['quickFilters', 'price', 'rating']));
  
  // Advanced E-commerce Features
  const [compareProducts, setCompareProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [showCompareBar, setShowCompareBar] = useState(false);
  const [bulkActionMode, setBulkActionMode] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showPriceAlert, setShowPriceAlert] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [wishlistItems, setWishlistItems] = useState(new Set());
  
  // Filter states
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    brands: [],
    priceMin: '',
    priceMax: '',
    rating: '',
    inStock: false,
    freeShipping: false,
    onSale: false,
    newArrivals: false,
    warranty: false,
    bestSellers: false
  });

  // Search and pagination
  const currentPage = parseInt(searchParams.get('page')) || 1;
  const itemsPerPage = parseInt(searchParams.get('limit')) || 48; // Show more products by default
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
    { value: 'discount', label: 'Best Deals' }
  ];

  const quickFilters = [
    { key: 'inStock', label: 'In Stock', count: '12,450+', icon: FiPackage },
    { key: 'freeShipping', label: 'Free Shipping', count: '8,230+', icon: FiTruck },
    { key: 'onSale', label: 'On Sale', count: '3,120+', icon: FiTag },
    { key: 'newArrivals', label: 'New Arrivals', count: '892+', icon: FiClock },
    { key: 'warranty', label: 'With Warranty', count: '5,600+', icon: FiShield },
    { key: 'bestSellers', label: 'Best Sellers', count: '1,250+', icon: FiTrendingUp }
  ];

  // Load initial data
  useEffect(() => {
    loadFiltersData();
  }, []);

  // Load products when filters change
  useEffect(() => {
    loadProducts();
  }, [searchParams, selectedFilters]);

  const loadFiltersData = async () => {
    setFiltersLoading(true);
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        BrandService.getBrands(),
        CategoryService.getCategories()
      ]);

      if (brandsRes.success) setBrands(brandsRes.brands || []);
      if (categoriesRes.success) setCategories(categoriesRes.categories || []);
    } catch (error) {
      console.error('Error loading filters:', error);
    } finally {
      setFiltersLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        search: searchQuery,
        category: categoryFilter,
        brand: brandFilter,
        ...selectedFilters
      };

      // Clean up empty params
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === null || params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await ProductService.getProducts(params);

      if (response.success) {
        const products = response.products || [];

        // Fetch dealer information from profiles table for all products
        if (products.length > 0) {
          const dealerIds = [...new Set(products.map(p => p.dealer_id).filter(Boolean))];
          const dealersData = {};

          // Fetch dealer details from profiles table for each unique dealer
          await Promise.all(dealerIds.map(async (dealerId) => {
            try {
              // Query profiles table directly for dealer information
              const { data: dealer, error } = await supabase
                .from('profiles')
                .select(`
                  id,
                  company_name,
                  full_name,
                  email,
                  city,
                  state,
                  verification_status
                `)
                .eq('id', dealerId)
                .single();

              if (!error && dealer) {
                dealersData[dealerId] = dealer;
              }
            } catch (error) {
              console.log(`Failed to fetch dealer ${dealerId} from profiles:`, error);
            }
          }));

          // Enhance products with dealer information
          const enhancedProducts = products.map(product => {
            const dealerInfo = dealersData[product.dealer_id];
            return {
              ...product,
              dealer: dealerInfo ? {
                id: dealerInfo.id,
                company_name: dealerInfo.company_name,
                business_name: dealerInfo.company_name, // Use company_name as business_name
                name: dealerInfo.full_name,
                location: dealerInfo.city && dealerInfo.state ? `${dealerInfo.city}, ${dealerInfo.state}` : 'Location not specified',
                verified: dealerInfo.verification_status === 'verified'
              } : null
            };
          });

          setProducts(enhancedProducts);
        } else {
          setProducts(products);
        }

        setTotalCount(response.totalCount || 0);
        console.log(`📊 Shop Page: Loaded ${products.length} products, Total: ${response.totalCount || 0}, Page: ${currentPage}, Limit: ${itemsPerPage}`);
      } else {
        setError(response.message || 'Failed to load products');
        setProducts([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products. Please try again.');
      setProducts([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

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
      categories: [],
      brands: [],
      priceMin: '',
      priceMax: '',
      rating: '',
      inStock: false,
      freeShipping: false,
      onSale: false,
      newArrivals: false,
      warranty: false,
      bestSellers: false
    });
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('category');
      newParams.delete('brand');
      newParams.delete('page');
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

  const handleItemsPerPageChange = useCallback((newLimit) => {
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('limit', newLimit.toString());
      newParams.set('page', '1'); // Reset to first page when changing items per page
      return newParams;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [setSearchParams]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedFilters.categories.length > 0) count += selectedFilters.categories.length;
    if (selectedFilters.brands.length > 0) count += selectedFilters.brands.length;
    if (selectedFilters.priceMin || selectedFilters.priceMax) count += 1;
    if (selectedFilters.rating) count += 1;
    if (selectedFilters.inStock) count += 1;
    if (selectedFilters.freeShipping) count += 1;
    if (selectedFilters.onSale) count += 1;
    if (selectedFilters.newArrivals) count += 1;
    if (selectedFilters.warranty) count += 1;
    if (selectedFilters.bestSellers) count += 1;
    return count;
  }, [selectedFilters]);

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const toggleSection = (sectionId) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  // Advanced E-commerce Features
  const addToCompare = (product) => {
    if (compareProducts.length < 4 && !compareProducts.find(p => p.id === product.id)) {
      setCompareProducts([...compareProducts, product]);
      setShowCompareBar(true);
    }
  };

  const removeFromCompare = (productId) => {
    const updated = compareProducts.filter(p => p.id !== productId);
    setCompareProducts(updated);
    if (updated.length === 0) {
      setShowCompareBar(false);
    }
  };

  const toggleProductSelection = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const addToRecentlyViewed = (product) => {
    const updated = [product, ...recentlyViewed.filter(p => p.id !== product.id)].slice(0, 10);
    setRecentlyViewed(updated);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  };

  const bulkAddToCart = () => {
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    // Implement bulk add to cart logic
    console.log('Adding to cart:', selectedProductsList);
    setSelectedProducts(new Set());
    setBulkActionMode(false);
  };

  const bulkAddToWishlist = () => {
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
    // Implement bulk add to wishlist logic
    console.log('Adding to wishlist:', selectedProductsList);
    setSelectedProducts(new Set());
    setBulkActionMode(false);
  };

  // Load recently viewed from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentlyViewed');
    if (saved) {
      setRecentlyViewed(JSON.parse(saved));
    }
  }, []);

  // Notification helper function
  const showNotification = (type, message, title = null, action = null) => {
    const notification = {
      id: Date.now() + Math.random(),
      type,
      message,
      title,
      action,
      persistent: false
    };
    setNotifications(prev => [...prev, notification]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-24 right-4 z-50 space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden animate-slideInRight ${
                notification.type === 'success' ? 'bg-green-500' : 
                notification.type === 'error' ? 'bg-red-500' : 
                'bg-blue-500'
              }`}
            >
              <div className="p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {notification.type === 'success' && <FiCheck className="h-5 w-5 text-white" />}
                    {notification.type === 'error' && <FiX className="h-5 w-5 text-white" />}
                    {notification.type === 'info' && <FiInfo className="h-5 w-5 text-white" />}
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium text-white">
                      {notification.message}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex">
                    <button
                      onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                      className="rounded-md inline-flex text-white hover:text-gray-200 focus:outline-none"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Amazon-style Prime Banner */}
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

      {/* Amazon-style Navigation Header */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-40 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb - Amazon Style */}
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

          {/* Main Search and Controls */}
          <div className="pb-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Sort and View Controls - eBay Style */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                    title="Grid View"
                  >
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 border-l ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}
                    title="List View"
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

            {/* Results Info - Amazon Style */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <div className="text-gray-600">
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Loading...
                  </div>
                ) : (
                  <span>
                    {totalCount > 0 ? (
                      <>
                        <span className="font-semibold">{totalCount.toLocaleString()}</span> results
                        {searchQuery && <span> for "<span className="font-medium">{searchQuery}</span>"</span>}
                      </>
                    ) : (
                      'No results found'
                    )}
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

      {/* Main Content Area */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Amazon/eBay Style Filters */}
          <aside className={`w-64 flex-shrink-0 ${isFiltersOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="space-y-6">
              {/* Quick Filters */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('quickFilters')}
                  className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-100"
                >
                  <span>Quick Filters</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform ${expandedSections.has('quickFilters') ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.has('quickFilters') && (
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
                          <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                            {filter.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">{filter.count}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('price')}
                  className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-100"
                >
                  <span>Price</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform ${expandedSections.has('price') ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.has('price') && (
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          placeholder="Min"
                          value={selectedFilters.priceMin}
                          onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="number"
                          placeholder="Max"
                          value={selectedFilters.priceMax}
                          onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => {
                          // Apply price filter logic here
                        }}
                        className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Rating */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleSection('rating')}
                  className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-100"
                >
                  <span>Customer Rating</span>
                  <FiChevronDown className={`w-4 h-4 transition-transform ${expandedSections.has('rating') ? 'rotate-180' : ''}`} />
                </button>
                {expandedSections.has('rating') && (
                  <div className="p-4 space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center cursor-pointer group">
                        <input
                          type="radio"
                          name="rating"
                          value={rating}
                          checked={selectedFilters.rating === rating.toString()}
                          onChange={(e) => handleFilterChange('rating', e.target.value)}
                          className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="ml-3 flex items-center">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                className={`w-4 h-4 ${
                                  i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="ml-2 text-sm text-gray-600">& Up</span>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Categories */}
              {categories.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('categories')}
                    className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-100"
                  >
                    <span>Categories</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${expandedSections.has('categories') ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSections.has('categories') && (
                    <div className="p-4 max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {categories.slice(0, 15).map(category => (
                          <label key={category.id} className="flex items-center cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedFilters.categories.includes(category.id.toString())}
                              onChange={() => handleFilterChange('categories', category.id.toString())}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                              {category.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Brands */}
              {brands.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('brands')}
                    className="w-full px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-sm font-medium text-gray-900 hover:bg-gray-100"
                  >
                    <span>Brands</span>
                    <FiChevronDown className={`w-4 h-4 transition-transform ${expandedSections.has('brands') ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSections.has('brands') && (
                    <div className="p-4 max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {brands.slice(0, 15).map(brand => (
                          <label key={brand.id} className="flex items-center cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedFilters.brands.includes(brand.id.toString())}
                              onChange={() => handleFilterChange('brands', brand.id.toString())}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900">
                              {brand.name}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main Product Area */}
          <main className="flex-1">
            {loading ? (
              <ProductGridSkeleton count={24} />
            ) : error ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12">
                <EmptyState
                  title="Something went wrong"
                  description={error}
                  action={{
                    label: "Try Again",
                    onClick: loadProducts,
                    icon: FiRefreshCw
                  }}
                />
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12">
                <EmptyState
                  title="No products found"
                  description="Try adjusting your search terms or filters."
                  action={{
                    label: "Clear Filters",
                    onClick: handleClearFilters,
                    icon: FiX
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Bulk Actions Bar */}
                {bulkActionMode && selectedProducts.size > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 animate-slideInUp">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-900 flex items-center">
                          <FiPackage className="w-4 h-4 mr-2" />
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
                          <button
                            onClick={() => {
                              // Bulk compare action
                              const selectedProductsList = products.filter(p => selectedProducts.has(p.id));
                              selectedProductsList.slice(0, 4).forEach(product => addToCompare(product));
                              setSelectedProducts(new Set());
                              setBulkActionMode(false);
                            }}
                            disabled={selectedProducts.size > 4}
                            className="px-4 py-2 border border-green-300 bg-green-50 text-green-700 rounded-lg text-sm hover:bg-green-100 transition-colors flex items-center disabled:opacity-50"
                          >
                            <FiEye className="w-4 h-4 mr-1" />
                            Compare
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setBulkActionMode(false);
                          setSelectedProducts(new Set());
                        }}
                        className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                        title="Cancel selection"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {/* Quick stats */}
                    <div className="mt-3 pt-3 border-t border-blue-200 flex items-center justify-between text-sm text-gray-600">
                      <span>Total estimated value: GHS {products.filter(p => selectedProducts.has(p.id)).reduce((sum, p) => sum + (p.price || 0), 0).toFixed(2)}</span>
                      <span>Estimated savings: GHS {(products.filter(p => selectedProducts.has(p.id)).reduce((sum, p) => sum + (p.discount_price || 0), 0) * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Sponsored Products Banner */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <FiZap className="w-5 h-5 text-orange-500" />
                        <span className="font-semibold text-gray-900">Sponsored</span>
                      </div>
                      <span className="text-sm text-gray-600">Premium Auto Parts - Limited Time Offers</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <FiTag className="w-4 h-4" />
                      <span>Up to 40% off</span>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount.toLocaleString()} results
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
                <div className="relative">
                  {loading && (
                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <span className="text-sm text-gray-600">Loading products...</span>
                      </div>
                    </div>
                  )}

                  <div className={
                    viewMode === 'grid'
                      ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                      : 'space-y-4'
                  }>
                  {products.map((product, index) => (
                    <div 
                      key={product.id} 
                      className="bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-all duration-200 relative group"
                      style={{ 
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      {/* Enhanced Product Card with Advanced Features */}
                      <div className="relative">
                        {/* Bulk Selection Checkbox */}
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

                        {/* Popular Choice Badge */}
                        {index % 7 === 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg z-10">
                            Popular
                          </div>
                        )}

                        {/* Social Proof Badge */}
                        {index % 5 === 0 && (
                          <div className="absolute top-8 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg z-10">
                            {Math.floor(Math.random() * 50) + 10} bought today
                          </div>
                        )}

                        {/* Product Card */}
                        <ProductCard
                          product={product}
                          layout={viewMode}
                          showBestSeller={product.is_bestseller}
                          showDiscount={product.discount_price > 0}
                          className="h-full border-0 shadow-none rounded-lg"
                          onClick={() => addToRecentlyViewed(product)}
                        />

                        {/* Quick Action Overlay */}
                        <div className="absolute inset-x-0 bottom-0 bg-white bg-opacity-95 backdrop-blur-sm p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-200 rounded-b-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => addToCompare(product)}
                                disabled={compareProducts.length >= 4}
                                className="flex items-center text-xs text-gray-600 hover:text-blue-600 disabled:opacity-50"
                                title="Compare"
                              >
                                <FiEye className="w-4 h-4 mr-1" />
                                Compare
                              </button>
                              <button
                                onClick={() => setShowPriceAlert(product.id)}
                                className="flex items-center text-xs text-gray-600 hover:text-green-600"
                                title="Price Alert"
                              >
                                <FiCheck className="w-4 h-4 mr-1" />
                                Price Alert
                              </button>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-green-600 font-medium">
                                {Math.floor(Math.random() * 20) + 5} left
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  </div>
                </div>

                {/* Pagination and Product Info */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
                  <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                    {/* Product Count Info */}
                    <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} products
                      </div>

                      {/* Items per page selector */}
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Show:</span>
                        <select
                          value={itemsPerPage}
                          onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
                          className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value={12}>12</option>
                          <option value={24}>24</option>
                          <option value={48}>48</option>
                          <option value={96}>96</option>
                          <option value={200}>200</option>
                          {totalCount <= 500 && <option value={totalCount}>All ({totalCount})</option>}
                        </select>
                        <span className="text-sm text-gray-600">per page</span>
                      </div>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                        showFirstLast={true}
                        showPageNumbers={7}
                        className="flex items-center space-x-1"
                      />
                    )}
                  </div>
                </div>

                {/* Recently Viewed Section */}
                {recentlyViewed.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
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
                        <div key={product.id} className="border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow">
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

      {/* Enhanced Mobile Filter Overlay */}
      {isFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setIsFiltersOpen(false)}>
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl overflow-y-auto transform animate-slideInLeft" onClick={(e) => e.stopPropagation()}>
            {/* Mobile Filter Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
              <div className="flex items-center justify-between p-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FiSliders className="w-5 h-5 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </h2>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Filter Content */}
            <div className="p-4 space-y-6">
              {/* Quick Filters - Mobile */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Filters</h3>
                <div className="space-y-3">
                  {[
                    { key: 'inStock', label: 'In Stock', icon: FiPackage },
                    { key: 'freeShipping', label: 'Free Shipping', icon: FiTruck },
                    { key: 'onSale', label: 'On Sale', icon: FiTag },
                    { key: 'newArrivals', label: 'New Arrivals', icon: FiClock },
                    { key: 'warranty', label: 'With Warranty', icon: FiShield },
                    { key: 'bestSellers', label: 'Best Sellers', icon: FiTrendingUp }
                  ].map(filter => (
                    <label key={filter.key} className="flex items-center group cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedFilters[filter.key]}
                        onChange={(e) => handleFilterChange(filter.key, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="ml-3 flex items-center">
                        <filter.icon className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900">
                          {filter.label}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range - Mobile */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range (GHS)</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={selectedFilters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={selectedFilters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Rating - Mobile */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Rating</h3>
                <div className="space-y-2">
                  {[4, 3, 2, 1].map(rating => (
                    <label key={rating} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        value={rating}
                        checked={selectedFilters.rating === rating.toString()}
                        onChange={(e) => handleFilterChange('rating', e.target.value)}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <div className="ml-3 flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-4 h-4 ${
                                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
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

            {/* Mobile Filter Actions */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <button
                  onClick={handleClearFilters}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsFiltersOpen(false)}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply Filters ({activeFiltersCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Product Comparison Bar - Sticky Bottom */}
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
                  onClick={() => {
                    // Navigate to comparison page or open modal
                    console.log('Compare products:', compareProducts);
                  }}
                  disabled={compareProducts.length < 2}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                <FiCheck className="w-5 h-5 mr-2 text-green-500" />
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
                  onClick={() => {
                    // Implement price alert logic
                    setShowPriceAlert(null);
                  }}
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

      {/* Floating Action Button for Mobile Compare */}
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

export default ShopPage;
