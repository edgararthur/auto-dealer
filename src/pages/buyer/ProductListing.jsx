import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate, useParams } from 'react-router-dom';
import {
  FiFilter,
  FiX,
  FiGrid,
  FiList,
  FiChevronDown,
  FiChevronUp,
  FiShoppingCart,
  FiStar,
  FiHeart,
  FiBarChart2,
  FiSliders,
  FiMapPin,
  FiAward,
  FiTruck
} from 'react-icons/fi';
import {
  ProductGrid,
  Breadcrumb,
  Pagination,
  EmptyState,
  Button
} from '../../components/common';
import PriceComparison from '../../components/common/PriceComparison';
import VehicleSearch from '../../components/search/VehicleSearch';
import ProductModal from '../../components/product/ProductModal';
import { useComparison } from '../../contexts/ComparisonContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import ProductService from '../../../shared/services/productService';

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { productId: urlProductId } = useParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');

  // Filter state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState('category');
  const [filters, setFilters] = useState({
    category: null,
    priceRange: [0, 1000],
    brands: [],
    rating: 0,
    availability: 'all',
    condition: 'all',
    sortBy: 'relevance'
  });

  // Vehicle search state
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleSearchActive, setVehicleSearchActive] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);

  // Price comparison state
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [selectedProductForComparison, setSelectedProductForComparison] = useState(null);

  // Product modal state
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [dealerPrices, setDealerPrices] = useState([]);

  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { 
    comparisonItems, 
    addToComparison, 
    removeFromComparison, 
    isInComparison, 
    clearComparison 
  } = useComparison();

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch ALL products from database (no limit to ensure all products are displayed)
        const productsResponse = await ProductService.getProducts({
          sortBy: 'created_at',
          sortOrder: 'desc',
          // Removed limit to fetch ALL products
          page: 1,
          includeCount: true // Get total count for pagination
        });
        
        if (productsResponse.success) {
          const fetchedProducts = productsResponse.products || [];
          setProducts(fetchedProducts);
          setDisplayedProducts(fetchedProducts);
          setTotalProducts(productsResponse.count || fetchedProducts.length);
          setTotalPages(Math.ceil((productsResponse.count || fetchedProducts.length) / itemsPerPage));
          setHasMoreProducts(false); // We've fetched all products
        } else {
          setError(productsResponse.error || 'Failed to fetch products');
        }
        
        // Fetch categories
        const categoriesResponse = await ProductService.getCategories();
        
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.categories || []);
        } else {
          setCategories([]);
        }
        
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle URL-based modal opening
  useEffect(() => {
    if (urlProductId) {
      setSelectedProductId(urlProductId);
      setIsProductModalOpen(true);
    }
  }, [urlProductId]);

  // Get unique dealers/brands for filter
  const dealers = [...new Set(products.map(p => p.dealer?.company_name || p.dealer?.name).filter(Boolean))];

  // Handle URL parameters for initial filtering
  useEffect(() => {
    if (categories.length === 0) return; // Wait for categories to load
    
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    // Handle category parameter
    if (categoryParam && !filters.category) {
      // Try to find category by ID first (new format)
      let category = categories.find(c => c.id === categoryParam);
      
      // If not found by ID, try by name (legacy format)
      if (!category) {
        category = categories.find(c => 
          c.name.toLowerCase() === categoryParam.toLowerCase()
        );
      }
      
      if (category) {
        updateFilter('category', category.id);
      }
    }
    
    // Handle search parameter - this is already handled in the breadcrumb logic
    // but we ensure the products are filtered if there's a search term
    if (searchParam && displayedProducts.length > 0) {
      const searchFiltered = products.filter(product => 
        product.name.toLowerCase().includes(searchParam.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchParam.toLowerCase()) ||
        product.part_number?.toLowerCase().includes(searchParam.toLowerCase())
      );
      // Note: Search filtering is now handled by the main filter useEffect
    }
  }, [categories, searchParams]);

  // Apply filters whenever filter state changes
  useEffect(() => {
    let filtered = [...products];

    // Apply search filter from URL
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.part_number?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.category_id === filters.category || 
        product.category?.id === filters.category
      );
    }

    // Apply price filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Apply brand filter
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands.includes(product.dealer?.company_name) ||
        filters.brands.includes(product.dealer?.name)
      );
    }

    // Apply rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => {
        const avgRating = product.reviews?.length > 0 
          ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
          : 4.0 + Math.random() * 1;
        return avgRating >= filters.rating;
      });
    }

    // Apply availability filter
    if (filters.availability === 'inStock') {
      filtered = filtered.filter(product => product.stock_quantity > 0);
    }

    // Apply condition filter
    if (filters.condition !== 'all') {
      filtered = filtered.filter(product => product.condition === filters.condition);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = a.reviews?.length > 0 
            ? a.reviews.reduce((sum, review) => sum + review.rating, 0) / a.reviews.length
            : 4.0 + Math.random() * 1;
          const ratingB = b.reviews?.length > 0 
            ? b.reviews.reduce((sum, review) => sum + review.rating, 0) / b.reviews.length
            : 4.0 + Math.random() * 1;
          return ratingB - ratingA;
        });
        break;
      case 'dealer-reputation':
        filtered.sort((a, b) => {
          const ratingA = a.dealer?.rating || 0;
          const ratingB = b.dealer?.rating || 0;
          return ratingB - ratingA;
        });
        break;
      default:
        break;
    }

    setDisplayedProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1);
  }, [products, filters, searchParams]);

  // Handle filter changes
  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: null,
      priceRange: [0, 1000],
      brands: [],
      rating: 0,
      availability: 'all',
      condition: 'all',
      sortBy: 'relevance'
    });
  };

  const toggleBrand = (brand) => {
    const currentBrands = filters.brands;
    if (currentBrands.includes(brand)) {
      updateFilter('brands', currentBrands.filter(b => b !== brand));
    } else {
      updateFilter('brands', [...currentBrands, brand]);
    }
  };

  // Get current page products
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayedProducts.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo(0, 0);
  };

  // Load more products - Not needed anymore since we fetch all products initially
  const loadMoreProducts = async () => {
    // Since we now fetch ALL products initially, this function is no longer needed
    // All products are already loaded, pagination is handled client-side
    console.log('All products already loaded');
    return;
  };

  // Product actions
  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    addToCart(productId, 1, {
      dealerId: product?.dealer?.id,
      price: product?.price
    });
  };

  // Handle vehicle search
  const handleVehicleSearch = (vehicleData) => {
    if (vehicleData) {
      setSelectedVehicle(vehicleData);
      setVehicleSearchActive(true);

      // Update URL params to include vehicle search
      const newParams = new URLSearchParams(searchParams);
      if (vehicleData.type === 'vehicle') {
        if (vehicleData.make) newParams.set('make', vehicleData.make);
        if (vehicleData.model) newParams.set('model', vehicleData.model);
        if (vehicleData.year) newParams.set('year', vehicleData.year);
        if (vehicleData.vehicleType) newParams.set('vehicleType', vehicleData.vehicleType);
      } else if (vehicleData.type === 'vin') {
        newParams.set('vin', vehicleData.vin);
      }
      setSearchParams(newParams);
    } else {
      setSelectedVehicle(null);
      setVehicleSearchActive(false);

      // Remove vehicle params from URL
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('make');
      newParams.delete('model');
      newParams.delete('year');
      newParams.delete('vehicleType');
      newParams.delete('vin');
      setSearchParams(newParams);
    }
  };

  const handleAddToWishlist = (productId) => {
    addToWishlist(productId);
  };

  const handleAddToComparison = (productId) => {
    if (isInComparison(productId)) {
      removeFromComparison(productId);
    } else {
      addToComparison(productId);
    }
  };

  const handlePriceComparison = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setSelectedProductForComparison(product);
    
    // Mock dealer prices for demonstration
    const mockDealerPrices = [
      {
        dealer: {
          id: 1,
          company_name: 'AutoParts Express',
          location: 'New York, NY',
          rating: 4.8,
          verified: true
        },
        price: product.price * 0.95,
        originalPrice: product.price * 1.1,
        stock: 'In stock (15+ available)',
        distance: 2.3,
        shipping: { cost: 0, estimatedDays: '2-3' }
      }
    ];
    setDealerPrices(mockDealerPrices);
    setShowPriceComparison(true);
  };

  // Handle product click to open modal
  const handleProductClick = (productId) => {
    setSelectedProductId(productId);
    setIsProductModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsProductModalOpen(false);
    setSelectedProductId(null);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brands.length > 0) count += filters.brands.length;
    if (filters.rating > 0) count++;
    if (filters.availability !== 'all') count++;
    if (filters.condition !== 'all') count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    return count;
  };

  // Build breadcrumbs
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/products' }
  ];

  const searchQuery = searchParams.get('search');
  if (searchQuery) {
    breadcrumbItems.push({
      label: `Search: "${searchQuery}"`,
      path: `/products?search=${encodeURIComponent(searchQuery)}`
    });
  }

  // Filter tabs configuration
  const filterTabs = [
    { 
      id: 'category', 
      label: 'Category', 
      icon: <FiGrid size={16} />,
      count: filters.category ? 1 : 0
    },
    { 
      id: 'price', 
      label: 'Price', 
      icon: <span className="text-sm">$</span>,
      count: (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) ? 1 : 0
    },
    { 
      id: 'brands', 
      label: 'Dealers', 
      icon: <FiAward size={16} />,
      count: filters.brands.length
    },
    { 
      id: 'features', 
      label: 'Features', 
      icon: <FiStar size={16} />,
      count: (filters.rating > 0 ? 1 : 0) + (filters.availability !== 'all' ? 1 : 0) + (filters.condition !== 'all' ? 1 : 0)
    }
  ];

  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-6 text-neutral-600 font-medium">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-50 min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      {/* Header with title and controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {searchQuery ? `Search Results: "${searchQuery}"` : 'All Products'}
            </h1>
            <p className="text-neutral-500 mt-1">
              {`${displayedProducts.length} products found`}
              {totalProducts !== displayedProducts.length && ` (${totalProducts} total in database)`}
              {getActiveFilterCount() > 0 && ` with ${getActiveFilterCount()} filters applied`}
            </p>
          </div>
            
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            {/* View mode toggle */}
            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden">
              <button
                className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600'}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <FiGrid size={18} />
              </button>
              <button
                className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600'}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <FiList size={18} />
              </button>
            </div>
            
            {/* Items per page selector */}
            <select
              className="border border-neutral-200 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
            >
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
              <option value={100}>100 per page</option>
            </select>

            {/* Sort dropdown */}
            <select
              className="border border-neutral-200 rounded-lg px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="rating">Top Rated</option>
              <option value="dealer-reputation">Best Dealers</option>
            </select>
            
            {/* Filter toggle button */}
            <button 
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                isFilterOpen 
                  ? 'bg-primary-600 text-white border-primary-600' 
                  : 'bg-white text-neutral-700 border-neutral-200 hover:border-primary-300'
              }`}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <FiSliders size={18} />
              <span>Filters</span>
              {getActiveFilterCount() > 0 && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isFilterOpen ? 'bg-white text-primary-600' : 'bg-primary-600 text-white'
                }`}>
                  {getActiveFilterCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Vehicle Search */}
        <div className="mb-6">
          <VehicleSearch
            onSearch={handleVehicleSearch}
            className="w-full"
          />
        </div>

        {/* Active Vehicle Filter Display */}
        {vehicleSearchActive && selectedVehicle && (
          <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-sm font-medium text-primary-900">
                  Showing parts for:
                  <span className="ml-2 font-semibold">
                    {selectedVehicle.type === 'vin'
                      ? `VIN: ${selectedVehicle.vin}`
                      : `${selectedVehicle.year || ''} ${selectedVehicle.make || ''} ${selectedVehicle.model || ''} ${selectedVehicle.vehicleType || ''}`.trim()
                    }
                  </span>
                </div>
                <div className="text-xs text-primary-700 bg-primary-100 px-2 py-1 rounded-full">
                  {displayedProducts.length} compatible parts found
                </div>
              </div>
              <button
                onClick={() => handleVehicleSearch(null)}
                className="text-primary-600 hover:text-primary-800 transition-colors"
                title="Clear vehicle filter"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Filter Panel */}
        {isFilterOpen && (
          <div className="bg-white rounded-lg shadow-lg border border-neutral-200 mb-6 overflow-hidden">
            {/* Filter Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">Filter Products</h3>
              <div className="flex items-center space-x-3">
                {getActiveFilterCount() > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear All ({getActiveFilterCount()})
                  </button>
                )}
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600"
                >
                  <FiX size={20} />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="border-b border-neutral-200">
              <nav className="flex space-x-8 px-4" aria-label="Filter tabs">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilterTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeFilterTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activeFilterTab === tab.id
                          ? 'bg-primary-100 text-primary-600'
                          : 'bg-neutral-100 text-neutral-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            {/* Filter Content */}
            <div className="p-6">
              {/* Category Filter */}
              {activeFilterTab === 'category' && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-4">Select Category</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    <button
                      onClick={() => updateFilter('category', null)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        !filters.category
                          ? 'border-primary-600 bg-primary-50 text-primary-700'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="font-medium">All Categories</div>
                      <div className="text-xs text-neutral-500 mt-1">{products.length} products</div>
                    </button>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => updateFilter('category', category.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          filters.category === category.id
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-neutral-500 mt-1">
                          {products.filter(p => p.category_id === category.id || p.category?.id === category.id).length} products
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Filter */}
              {activeFilterTab === 'price' && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-4">Price Range</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-neutral-600 mb-2">
                        Price: ${filters.priceRange[0]} - ${filters.priceRange[1]}
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="10"
                          value={filters.priceRange[0]}
                          onChange={(e) => updateFilter('priceRange', [parseInt(e.target.value), filters.priceRange[1]])}
                          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                        <input
                          type="range"
                          min="0"
                          max="1000"
                          step="10"
                          value={filters.priceRange[1]}
                          onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                          className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {[
                        { label: 'Under $50', range: [0, 50] },
                        { label: '$50 - $100', range: [50, 100] },
                        { label: '$100 - $300', range: [100, 300] },
                        { label: 'Over $300', range: [300, 1000] }
                      ].map(preset => (
                        <button
                          key={preset.label}
                          onClick={() => updateFilter('priceRange', preset.range)}
                          className={`p-2 rounded-lg border text-sm transition-colors ${
                            filters.priceRange[0] === preset.range[0] && filters.priceRange[1] === preset.range[1]
                              ? 'border-primary-600 bg-primary-50 text-primary-700'
                              : 'border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Dealers Filter */}
              {activeFilterTab === 'brands' && (
                <div>
                  <h4 className="text-sm font-medium text-neutral-900 mb-4">Select Dealers</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {dealers.map(dealer => (
                      <label key={dealer} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-neutral-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.brands.includes(dealer)}
                          onChange={() => toggleBrand(dealer)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-neutral-900 truncate">{dealer}</div>
                          <div className="text-xs text-neutral-500">
                            {products.filter(p => p.dealer?.company_name === dealer || p.dealer?.name === dealer).length} products
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Features Filter */}
              {activeFilterTab === 'features' && (
                <div className="space-y-6">
                  {/* Rating */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-3">Customer Rating</h4>
                    <div className="space-y-2">
                      {[4, 3, 2, 1].map(rating => (
                        <button
                          key={rating}
                          onClick={() => updateFilter('rating', filters.rating === rating ? 0 : rating)}
                          className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                            filters.rating === rating
                              ? 'bg-primary-50 border border-primary-200'
                              : 'hover:bg-neutral-50'
                          }`}
                        >
                          <div className="flex text-yellow-400 mr-2">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                size={16}
                                className={i < rating ? 'text-yellow-400' : 'text-neutral-300'}
                                fill={i < rating ? 'currentColor' : 'none'}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-neutral-700">{rating}+ Stars</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-3">Availability</h4>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All Products', icon: <FiGrid size={16} /> },
                        { value: 'inStock', label: 'In Stock Only', icon: <FiTruck size={16} /> }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => updateFilter('availability', option.value)}
                          className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                            filters.availability === option.value
                              ? 'bg-primary-50 border border-primary-200'
                              : 'hover:bg-neutral-50'
                          }`}
                        >
                          <div className="mr-3 text-neutral-500">
                            {option.icon}
                          </div>
                          <span className="text-sm text-neutral-700">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Condition */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-3">Condition</h4>
                    <div className="space-y-2">
                      {[
                        { value: 'all', label: 'All Conditions' },
                        { value: 'new', label: 'New' },
                        { value: 'used', label: 'Used' },
                        { value: 'refurbished', label: 'Refurbished' }
                      ].map(option => (
                        <button
                          key={option.value}
                          onClick={() => updateFilter('condition', option.value)}
                          className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                            filters.condition === option.value
                              ? 'bg-primary-50 border border-primary-200'
                              : 'hover:bg-neutral-50'
                          }`}
                        >
                          <span className="text-sm text-neutral-700">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {getActiveFilterCount() > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm font-medium text-neutral-700">Active filters:</span>
            
            {filters.category && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {categories.find(c => c.id === filters.category)?.name}
                <button
                  onClick={() => updateFilter('category', null)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <FiX size={12} />
                </button>
              </span>
            )}
            
            {filters.brands.map(brand => (
              <span key={brand} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {brand}
                <button
                  onClick={() => toggleBrand(brand)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <FiX size={12} />
                </button>
              </span>
            ))}
            
            {filters.rating > 0 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {filters.rating}+ Stars
                <button
                  onClick={() => updateFilter('rating', 0)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <FiX size={12} />
                </button>
              </span>
            )}
            
            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                ${filters.priceRange[0]} - ${filters.priceRange[1]}
                <button
                  onClick={() => updateFilter('priceRange', [0, 1000])}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  <FiX size={12} />
                </button>
              </span>
            )}
            
            <button
              onClick={clearFilters}
              className="text-xs text-neutral-500 hover:text-neutral-700 underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Products Grid */}
        {displayedProducts.length === 0 ? (
          <EmptyState 
            title="No products found"
            description="Try adjusting your filters or search terms"
            actionText="Clear Filters"
            onAction={clearFilters}
          />
        ) : (
          <>
            <ProductGrid
              products={getCurrentPageProducts()}
              loading={loading}
              viewMode={viewMode}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onAddToComparison={handleAddToComparison}
              onPriceCompare={handlePriceComparison}
              onProductClick={handleProductClick}
              isInComparison={isInComparison}
              isInWishlist={isInWishlist}
            />
            
            {/* Pagination and Load More */}
            <div className="mt-12 space-y-6">
              {/* Load More Button */}
              {hasMoreProducts && (
                <div className="flex justify-center">
                  <button
                    onClick={loadMoreProducts}
                    disabled={loadingMore}
                    className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  >
                    {loadingMore ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Loading More...</span>
                      </>
                    ) : (
                      <span>Load More Products</span>
                    )}
                  </button>
                </div>
              )}

              {/* Traditional Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}

              {/* Products Count Info */}
              <div className="text-center text-sm text-neutral-600">
                Showing {getCurrentPageProducts().length} of {totalProducts} products
                {!hasMoreProducts && totalProducts > getCurrentPageProducts().length && (
                  <span className="ml-2 text-primary-600">• All products loaded</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Comparison floating button */}
      {comparisonItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => navigate('/comparison')}
            className="bg-primary-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center space-x-2">
              <FiBarChart2 size={20} />
              <span>Compare ({comparisonItems.length})</span>
            </div>
          </Button>
        </div>
      )}

      {/* Price Comparison Modal */}
      {showPriceComparison && selectedProductForComparison && (
        <PriceComparison
          product={selectedProductForComparison}
          dealerPrices={dealerPrices}
          onClose={() => setShowPriceComparison(false)}
          onAddToCart={(data) => {
            addToCart(data.productId, 1, { 
              dealerId: data.dealerId, 
              price: data.price 
            });
            setShowPriceComparison(false);
          }}
        />
      )}

      {/* Product Modal */}
      <ProductModal
        productId={selectedProductId}
        isOpen={isProductModalOpen}
        onClose={handleModalClose}
        selectedVehicle={selectedVehicle}
      />
    </div>
  );
};

export default ProductListing; 