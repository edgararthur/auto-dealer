import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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
  FiSliders,
  FiBarChart2
} from 'react-icons/fi';
import { 
  ProductGrid, 
  Breadcrumb, 
  Pagination, 
  EmptyState,
  Button
} from '../../components/common';
import { useComparison } from '../../contexts/ComparisonContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import AdvancedFilter from '../../components/common/AdvancedFilter';

// Mock product data (this would come from an API in a real app)
const products = [
  {
    id: 1,
    name: 'Sports car racing leather steering wheel',
    category: 'Car & Motor Care',
    price: 249.99,
    oldPrice: 419.99,
    image: 'https://images.unsplash.com/photo-1546424176-9591db981a7c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 23,
    isNew: false,
    dealer: {
      id: 1,
      name: 'Grand Auto',
      logo: 'https://via.placeholder.com/40x40?text=GA'
    }
  },
  {
    id: 2,
    name: 'Rear LED lights for auto tuning',
    category: 'Optics and lighting',
    price: 89.99,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1621839673705-6617adf9e890?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.6,
    reviewCount: 12,
    isNew: true,
    dealer: {
      id: 2,
      name: 'TurboTech',
      logo: 'https://via.placeholder.com/40x40?text=TT'
    }
  },
  {
    id: 3,
    name: 'Device for diagnosing car errors',
    category: 'Tools & Equipment',
    price: 275.00,
    oldPrice: 440.00,
    image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 34,
    isNew: false,
    dealer: {
      id: 3,
      name: 'DiagnosticPro',
      logo: 'https://via.placeholder.com/40x40?text=DP'
    }
  },
  {
    id: 4,
    name: 'Super strong brake disc for sports car',
    category: 'Brake parts',
    price: 149.99,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1580542698782-ce3ac3a5f99c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 19,
    isNew: false,
    dealer: {
      id: 1,
      name: 'Grand Auto',
      logo: 'https://via.placeholder.com/40x40?text=GA'
    }
  },
  {
    id: 5,
    name: 'LED bulbs for dipped and main beam car',
    category: 'Optics and lighting',
    price: 34.99,
    oldPrice: 94.99,
    image: 'https://images.unsplash.com/photo-1566826062324-a52ccd350ca2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.5,
    reviewCount: 42,
    isNew: true,
    dealer: {
      id: 4,
      name: 'AutoLumens',
      logo: 'https://via.placeholder.com/40x40?text=AL'
    }
  },
  {
    id: 6,
    name: 'LED car headlights for Mercedes cars',
    category: 'Optics and lighting',
    price: 129.99,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1536076357146-f96b19d59e1c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 16,
    isNew: false,
    dealer: {
      id: 4,
      name: 'AutoLumens',
      logo: 'https://via.placeholder.com/40x40?text=AL'
    }
  },
  {
    id: 7,
    name: 'Fuel turbine to increase vehicle power',
    category: 'Fuel system and motors',
    price: 339.99,
    oldPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 28,
    isNew: true,
    dealer: {
      id: 2,
      name: 'TurboTech',
      logo: 'https://via.placeholder.com/40x40?text=TT'
    }
  },
  {
    id: 8,
    name: 'NRO Innovations Fiber wort consumer',
    category: 'Fuel system and motors',
    price: 110.00,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.4,
    reviewCount: 8,
    isNew: true,
    dealer: {
      id: 3,
      name: 'DiagnosticPro',
      logo: 'https://via.placeholder.com/40x40?text=DP'
    }
  },
  {
    id: 9,
    name: 'Batteries RedTop starting car Battery',
    category: 'Car batteries',
    price: 249.99,
    oldPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1612883861559-2dd4610f4290?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 31,
    isNew: false,
    dealer: {
      id: 5,
      name: 'PowerStart',
      logo: 'https://via.placeholder.com/40x40?text=PS'
    }
  },
  {
    id: 10,
    name: 'Performance universal clamp on air filter',
    category: 'Fuel system and motors',
    price: 79.99,
    oldPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1590759668628-05b0fc3b8cbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.5,
    reviewCount: 27,
    isNew: false,
    dealer: {
      id: 6,
      name: 'AutoPerformance',
      logo: 'https://via.placeholder.com/40x40?text=AP'
    }
  }
];

// Mock categories data
const categories = [
  { id: 1, name: 'Autoparts & analog', count: 225 },
  { id: 2, name: 'Car & Motor Care', count: 115 },
  { id: 3, name: 'Parking tools', count: 83 },
  { id: 4, name: 'Organizer', count: 69 },
  { id: 5, name: 'Seat covers', count: 54 },
  { id: 6, name: 'Gifts & Merchandise', count: 93 },
  { id: 7, name: 'Navigation Devices', count: 46 },
  { id: 8, name: 'Tools & Equipment', count: 105 },
  { id: 9, name: 'Tires and wheels', count: 71 },
  { id: 10, name: 'Oils & Fluids', count: 109 }
];

const ProductListing = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [displayedProducts, setDisplayedProducts] = useState(products);
  const [viewMode, setViewMode] = useState('grid');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(true);
  const [expandedFilter, setExpandedFilter] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;

  // Filters
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [onlyOriginalParts, setOnlyOriginalParts] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [sortOption, setSortOption] = useState('relevance');

  // Dealers for filter
  const dealers = [...new Set(products.map(p => p.dealer.name))];

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

  useEffect(() => {
    // Get category from URL
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const category = categories.find(c => 
        c.name.toLowerCase() === categoryParam.toLowerCase()
      );
      if (category) {
        setSelectedCategory(category.id);
      }
    }
    
    // Filter products by search query
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedProducts(filtered);
    }

    // Get page from URL
    const pageParam = searchParams.get('page');
    if (pageParam) {
      setCurrentPage(parseInt(pageParam, 10));
    }

    // Get sort from URL
    const sortParam = searchParams.get('sort');
    if (sortParam) {
      setSortOption(sortParam);
    }
  }, [searchParams]);

  // Filter products based on selected filters
  useEffect(() => {
    setIsLoading(true);
    let filtered = [...products];
    
    // Filter by category
    if (selectedCategory) {
      const category = categories.find(c => c.id === selectedCategory);
      if (category) {
        filtered = filtered.filter(product => 
          product.category.toLowerCase().includes(category.name.toLowerCase())
        );
      }
    }
    
    // Filter by price
    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Filter by brands/dealers
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => 
        selectedBrands.includes(product.dealer.name)
      );
    }

    // Filter by rating
    if (selectedRating > 0) {
      filtered = filtered.filter(product => product.rating >= selectedRating);
    }

    // Sort products
    switch (sortOption) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.isNew ? 1 : -1);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'relevance':
      default:
        // Keep default order
        break;
    }

    setDisplayedProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    
    // Simulate loading delay
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [selectedCategory, priceRange, selectedBrands, selectedRating, sortOption, onlyOriginalParts]);

  // Get current page of products
  const getCurrentPageProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return displayedProducts.slice(startIndex, endIndex);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    // Update URL with new page
    searchParams.set('page', newPage.toString());
    setSearchParams(searchParams);
    // Scroll to top
    window.scrollTo(0, 0);
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    setCurrentPage(1);
  };

  const handleBrandToggle = (brand) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    } else {
      setSelectedBrands([...selectedBrands, brand]);
    }
    setCurrentPage(1);
  };

  const handleRatingChange = (rating) => {
    setSelectedRating(rating === selectedRating ? 0 : rating);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    const newSortOption = e.target.value;
    setSortOption(newSortOption);
    // Update URL with new sort option
    searchParams.set('sort', newSortOption);
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange([0, 500]);
    setSelectedBrands([]);
    setOnlyOriginalParts(false);
    setSelectedRating(0);
    setCurrentPage(1);
  };

  const handleAddToCart = (productId) => {
    console.log(`Added product ${productId} to cart`);
    addToCart(productId, 1);
  };

  const handleAddToWishlist = (productId) => {
    console.log(`Added product ${productId} to wishlist`);
    addToWishlist(productId);
  };

  const handleQuickView = (productId) => {
    console.log(`Quick view for product ${productId}`);
    console.log('Quick view product:', productId);
  };

  const handleAddToComparison = (productId) => {
    if (isInComparison(productId)) {
      removeFromComparison(productId);
    } else {
      addToComparison(productId);
    }
  };
  
  const handleViewComparison = () => {
    navigate('/comparison');
  };

  // Function to generate product tags
  const getProductTags = (product) => {
    const tags = [];
    
    if (product.dealer && product.dealer.name === 'Grand Auto') {
      tags.push('Official Dealer');
    }
    
    if (product.price < 50) {
      tags.push('Budget');
    } else if (product.price > 300) {
      tags.push('Premium');
    }
    
    if (product.oldPrice && (product.oldPrice - product.price) / product.oldPrice > 0.3) {
      tags.push('Great Deal');
    }
    
    return tags;
  };
  
  // Build breadcrumb items
  const breadcrumbItems = [];
  if (selectedCategory) {
    const category = categories.find(c => c.id === selectedCategory);
    if (category) {
      breadcrumbItems.push({
        label: 'Shop',
        path: '/products'
      });
      breadcrumbItems.push({
        label: category.name,
        path: `/products?category=${encodeURIComponent(category.name)}`
      });
    }
  } else {
    breadcrumbItems.push({
      label: 'Shop',
      path: '/products'
    });
  }

  const searchQuery = searchParams.get('search');
  if (searchQuery) {
    breadcrumbItems.push({
      label: `Search: "${searchQuery}"`,
      path: `/products?search=${encodeURIComponent(searchQuery)}`
    });
  }
  
  // Filter options for the AdvancedFilter component
  const filterOptions = {
    category: {
      title: 'Categories',
      type: 'checkbox',
      options: categories.map(cat => ({
        value: cat.id,
        label: cat.name,
        count: cat.count
      }))
    },
    price: {
      title: 'Price',
      type: 'range',
      min: 0,
      max: 1000,
      step: 10
    },
    brand: {
      title: 'Brands',
      type: 'checkbox',
      options: dealers.map(dealer => ({
        value: dealer,
        label: dealer
      }))
    },
    rating: {
      title: 'Rating',
      type: 'rating',
      count: 5
    },
    search: {
      title: 'Search Products',
      type: 'search'
    },
    inStock: {
      title: 'Availability',
      type: 'radio',
      options: [
        { value: 'all', label: 'All Products' },
        { value: 'inStock', label: 'In Stock Only' }
      ]
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setSelectedFilters({
      ...selectedFilters,
      [filterType]: value
    });
    setCurrentPage(1); // Reset to first page when filtering
  };

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
              {searchQuery ? (
                <>Search Results: "{searchQuery}"</>
              ) : selectedCategory ? (
                categories.find(c => c.id === selectedCategory)?.name.toUpperCase()
              ) : (
                'ALL PRODUCTS'
              )}
            </h1>
            <p className="text-neutral-500 mt-1">
              {`Showing ${displayedProducts.length} products`}
            </p>
          </div>
            
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden">
              <button
                className={`p-2 ${viewMode === 'grid' ? 'bg-neutral-100 text-primary-600' : 'bg-white'}`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <FiGrid size={20} />
              </button>
              <button
                className={`p-2 ${viewMode === 'list' ? 'bg-neutral-100 text-primary-600' : 'bg-white'}`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <FiList size={20} />
              </button>
            </div>
            
            <div className="hidden sm:block">
              <select 
                className="border border-neutral-200 rounded-md px-3 py-2 bg-white text-sm"
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="relevance">Sort by: relevance</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="newest">Newest first</option>
                <option value="rating">Top rated</option>
              </select>
            </div>
            
            <button 
              className="sm:hidden flex items-center space-x-1 bg-primary-600 text-white px-3 py-2 rounded-md"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              aria-expanded={isMobileFilterOpen}
              aria-controls="mobile-filters"
            >
              <FiFilter size={16} />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Mobile sort option - only visible on small screens */}
        <div className="mt-4 sm:hidden">
          <select 
            className="w-full border border-neutral-200 rounded-md px-3 py-2 bg-white text-sm"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="relevance">Sort by: relevance</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="newest">Newest first</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </div>
        
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar filters - desktop */}
          <div 
            id="mobile-filters"
            className={`w-full lg:w-64 flex-shrink-0 bg-white rounded-lg shadow-sm p-4 lg:block ${
              isMobileFilterOpen ? 'block' : 'hidden'
            } lg:sticky lg:top-20 lg:h-screen lg:overflow-y-auto`}
          >
            {/* Mobile filter header */}
            <div className="flex justify-between items-center lg:hidden mb-4 pb-2 border-b">
              <h3 className="font-medium">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-2 rounded-full hover:bg-neutral-100"
                aria-label="Close filters"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {/* Active filters */}
            {(selectedCategory || selectedBrands.length > 0 || selectedRating > 0 || onlyOriginalParts) && (
              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                    Active Filters
                  </h3>
                  <button 
                    onClick={clearFilters}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Clear all
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCategory && (
                    <div className="inline-flex items-center bg-primary-50 text-primary-700 rounded-full pl-3 pr-2 py-1 text-xs">
                      {categories.find(c => c.id === selectedCategory)?.name}
                      <button 
                        onClick={() => setSelectedCategory(null)}
                        className="ml-1 p-1 rounded-full hover:bg-primary-100"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  )}
                  
                  {selectedBrands.map(brand => (
                    <div key={brand} className="inline-flex items-center bg-primary-50 text-primary-700 rounded-full pl-3 pr-2 py-1 text-xs">
                      {brand}
                      <button 
                        onClick={() => handleBrandToggle(brand)}
                        className="ml-1 p-1 rounded-full hover:bg-primary-100"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  ))}
                  
                  {selectedRating > 0 && (
                    <div className="inline-flex items-center bg-primary-50 text-primary-700 rounded-full pl-3 pr-2 py-1 text-xs">
                      {selectedRating}+ Stars
                      <button 
                        onClick={() => setSelectedRating(0)}
                        className="ml-1 p-1 rounded-full hover:bg-primary-100"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  )}
                  
                  {onlyOriginalParts && (
                    <div className="inline-flex items-center bg-primary-50 text-primary-700 rounded-full pl-3 pr-2 py-1 text-xs">
                      Original Parts Only
                      <button 
                        onClick={() => setOnlyOriginalParts(false)}
                        className="ml-1 p-1 rounded-full hover:bg-primary-100"
                      >
                        <FiX size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Categories */}
            <div className="mb-6">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedCategories(!expandedCategories)}
              >
                <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                  Categories
                </h3>
                {expandedCategories ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
              </div>
              
              {expandedCategories && (
                <ul className="mt-4 space-y-2">
                  {categories.map(category => (
                    <li key={category.id}>
                      <button
                        className={`flex justify-between w-full text-left py-1 px-2 rounded-md text-sm ${
                          selectedCategory === category.id 
                            ? 'bg-primary-50 text-primary-700 font-medium' 
                            : 'hover:bg-neutral-50'
                        }`}
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        <span>{category.name}</span>
                        <span className="text-neutral-400 text-xs">{category.count}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          
            {/* Filters */}
            <div className="mb-6">
              <div 
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpandedFilter(!expandedFilter)}
              >
                <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">
                  Filters
                </h3>
                {expandedFilter ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
              </div>
              
              {expandedFilter && (
                <div className="mt-4 space-y-6">
                  {/* Price range */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-2">Price</h4>
                    <div className="flex items-center">
                      <input 
                        type="range" 
                        min="0" 
                        max="500" 
                        step="10"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-2 bg-primary-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-neutral-500">${priceRange[0]}</span>
                      <span className="text-xs font-medium text-neutral-900">${priceRange[1]}</span>
                    </div>
                  </div>
                  
                  {/* Rating filter */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-2">Customer Rating</h4>
                    <ul className="space-y-1">
                      {[4, 3, 2, 1].map((rating) => (
                        <li key={rating}>
                          <button
                            onClick={() => handleRatingChange(rating)}
                            className={`flex items-center w-full text-left py-1 px-2 rounded-md ${
                              selectedRating === rating ? 'bg-primary-50' : 'hover:bg-neutral-50'
                            }`}
                          >
                            <div className="flex text-yellow-400">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={i < rating ? 'text-yellow-400' : 'text-neutral-300'}
                                  fill={i < rating ? 'currentColor' : 'none'}
                                  size={16}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-neutral-600">& Up</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Dealers */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 mb-2">Dealers</h4>
                    <ul className="space-y-1">
                      {dealers.map((dealer, idx) => (
                        <li key={idx} className="flex items-center">
                          <input 
                            type="checkbox" 
                            id={`brand-${idx}`}
                            checked={selectedBrands.includes(dealer)}
                            onChange={() => handleBrandToggle(dealer)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                          />
                          <label htmlFor={`brand-${idx}`} className="ml-2 text-sm text-neutral-600">
                            {dealer}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                    
                  {/* Original parts only */}
                  <div>
                    <div className="flex items-center">
                      <input 
                        type="checkbox" 
                        id="original-parts"
                        checked={onlyOriginalParts}
                        onChange={() => setOnlyOriginalParts(!onlyOriginalParts)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                      />
                      <label htmlFor="original-parts" className="ml-2 text-sm text-neutral-600">
                        Only original parts
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
      
            {/* Clear filters button */}
            <button
              onClick={clearFilters}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
            
          {/* Product grid */}
          <div className="w-full lg:ml-8 mt-6 lg:mt-0">
            {displayedProducts.length === 0 ? (
              <EmptyState 
                type="filter" 
                onAction={clearFilters}
              />
            ) : (
              <>
                <div className="flex-1">
                  <ProductGrid 
                    products={getCurrentPageProducts()}
                    loading={isLoading}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                    onQuickView={handleQuickView}
                    onAddToComparison={handleAddToComparison}
                    isInComparison={isInComparison}
                    getProductTags={getProductTags}
                  />
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination 
                      currentPage={currentPage} 
                      totalPages={totalPages} 
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter button - fixed at bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-200 z-10">
        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="w-full flex items-center justify-center space-x-2 bg-primary-600 text-white px-4 py-3 rounded-md font-medium"
        >
          <FiSliders size={16} />
          <span>Filter & Sort</span>
        </button>
      </div>

      {/* Comparison floating button */}
      {comparisonItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="flex flex-col items-end space-y-2">
            <Button
              onClick={handleViewComparison}
              variant="primary"
              className="px-4 py-3 rounded-full shadow-lg"
            >
              <div className="flex items-center">
                <FiBarChart2 size={20} className="mr-2" />
                <span>Compare ({comparisonItems.length})</span>
              </div>
            </Button>
            
            {comparisonItems.length > 1 && (
              <button
                onClick={clearComparison}
                className="text-sm text-neutral-600 hover:text-neutral-800 bg-white px-2 py-1 rounded-full shadow-md"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Left sidebar - Filters */}
      <div className="md:w-64 flex-shrink-0">
        {/* Mobile filter button - only visible on small screens */}
        <div className="md:hidden">
          <AdvancedFilter
            options={filterOptions}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            isMobile={true}
          />
        </div>
        
        {/* Desktop filters - hidden on small screens */}
        <div className="hidden md:block">
          <AdvancedFilter
            options={filterOptions}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductListing; 