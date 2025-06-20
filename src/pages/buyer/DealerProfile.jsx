import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiStar, 
  FiMapPin, 
  FiTruck, 
  FiShield, 
  FiClock, 
  FiPhone, 
  FiMail, 
  FiGlobe,
  FiCheck,
  FiAward,
  FiPackage,
  FiUsers,
  FiFilter,
  FiGrid,
  FiList
} from 'react-icons/fi';
import { ProductGrid, Breadcrumb } from '../../components/common';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import ProductService from '../../../shared/services/productService';

const DealerProfile = () => {
  const { dealerId } = useParams();
  const [dealer, setDealer] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters and sorting
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  useEffect(() => {
    fetchDealerData();
  }, [dealerId]);

  const fetchDealerData = async () => {
    setLoading(true);
    try {
      // Fetch dealer information using the real backend service
      const dealerData = await ProductService.getDealerById(dealerId);
      
      // Format dealer data for display with fallback values
      const formattedDealer = {
        id: dealerData.id,
        company_name: dealerData.company_name || dealerData.business_name,
        location: dealerData.location || 'Location not specified',
        rating: dealerData.rating || 0,
        reviewCount: dealerData.reviewCount || 0,
        verified: dealerData.verification_status === 'verified',
        establishedYear: dealerData.created_at ? new Date(dealerData.created_at).getFullYear() : 2020,
        description: dealerData.metadata?.description || 'Professional automotive parts dealer committed to quality and customer service.',
        logo: dealerData.profile?.avatar_url,
        coverImage: dealerData.metadata?.coverImage || 'https://images.unsplash.com/photo-1486754735734-325b5831c3ad?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
        contact: {
          phone: dealerData.metadata?.phone || '(555) 123-4567',
          email: dealerData.profile?.email || 'contact@dealer.com',
          website: dealerData.metadata?.website || 'www.dealer.com'
        },
        policies: {
          returnPolicy: dealerData.metadata?.returnPolicy || '30-day returns',
          warranty: dealerData.metadata?.warranty || '12-month warranty',
          shippingPolicy: dealerData.metadata?.shippingPolicy || 'Free shipping on orders over $100'
        },
        stats: {
          totalProducts: 0, // Will be calculated from products
          totalSales: dealerData.metadata?.totalSales || 0,
          yearsInBusiness: new Date().getFullYear() - (dealerData.created_at ? new Date(dealerData.created_at).getFullYear() : 2020),
          responseTime: dealerData.metadata?.responseTime || '2 hours'
        },
        badges: [],
        specialties: dealerData.metadata?.specialties || ['Engine Parts', 'Brake Systems', 'Electrical Components', 'Body Parts']
      };

      // Add badges based on dealer status
      if (formattedDealer.verified) formattedDealer.badges.push('Verified Dealer');
      if (formattedDealer.rating >= 4.5) formattedDealer.badges.push('Top Rated');
      if (dealerData.metadata?.fastShipping) formattedDealer.badges.push('Fast Shipping');
      if (dealerData.metadata?.warrantyProvider) formattedDealer.badges.push('Warranty Provider');

      // Get all products from this dealer using the real backend service
      const dealerProducts = await ProductService.getProductsByDealer(dealerId);
      
      // Update dealer stats with actual product count
      formattedDealer.stats.totalProducts = dealerProducts.length;

      setDealer(formattedDealer);
      setProducts(dealerProducts);
    } catch (err) {
      setError('Failed to load dealer information');
      console.error('Error fetching dealer data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    addToCart(productId, 1, { 
      dealerId: dealer.id,
      price: product?.price 
    });
  };

  const handleAddToWishlist = (productId) => {
    addToWishlist(productId);
  };

  const getFilteredProducts = () => {
    let filtered = [...products];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.name === selectedCategory ||
        product.subcategory?.name === selectedCategory
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now()));
        break;
    }

    return filtered;
  };

  const getCategories = () => {
    const categories = new Set();
    products.forEach(product => {
      if (product.category?.name) categories.add(product.category.name);
      if (product.subcategory?.name) categories.add(product.subcategory.name);
    });
    return Array.from(categories);
  };

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Dealers', path: '/dealers' },
    { label: dealer?.company_name || 'Dealer Profile', path: `/dealers/${dealerId}` }
  ];

  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-6 text-neutral-600 font-medium">Loading dealer information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600 font-medium">{error || 'Dealer not found'}</p>
            <Link 
              to="/dealers" 
              className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              View All Dealers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredProducts = getFilteredProducts();
  const categories = getCategories();

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Dealer Header */}
      <div className="relative bg-white shadow-sm">
        {/* Cover Image */}
        <div className="h-64 bg-gradient-to-r from-primary-600 to-primary-800 overflow-hidden">
          {dealer.coverImage ? (
            <img 
              src={dealer.coverImage} 
              alt={dealer.company_name}
              className="w-full h-full object-cover opacity-30"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-primary-600 to-primary-800"></div>
          )}
        </div>

        {/* Dealer Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-20 pb-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
                {/* Logo */}
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                    {dealer.logo ? (
                      <img 
                        src={dealer.logo} 
                        alt={dealer.company_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-primary-600">
                        {dealer.company_name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 mt-6 lg:mt-0">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {dealer.company_name}
                      </h1>
                      
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        {/* Rating */}
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                size={20}
                                className={i < Math.floor(dealer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span className="text-lg font-semibold">{dealer.rating}</span>
                          <span className="text-gray-500">({dealer.reviewCount} reviews)</span>
                        </div>

                        {/* Location */}
                        <div className="flex items-center space-x-1 text-gray-600">
                          <FiMapPin size={18} />
                          <span>{dealer.location}</span>
                        </div>

                        {/* Established */}
                        <div className="flex items-center space-x-1 text-gray-600">
                          <FiClock size={18} />
                          <span>Est. {dealer.establishedYear}</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {dealer.badges.map((badge, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 font-medium"
                          >
                            <FiCheck size={14} className="mr-1" />
                            {badge}
                          </span>
                        ))}
                      </div>

                      <p className="text-gray-600 max-w-2xl">
                        {dealer.description}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="mt-6 lg:mt-0 lg:ml-8">
                      <div className="bg-gray-50 rounded-lg p-6 min-w-[280px]">
                        <h3 className="font-semibold text-gray-900 mb-4">Dealer Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary-600">
                              {dealer.stats.totalProducts.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Products</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary-600">
                              {dealer.stats.totalSales.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Sales</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary-600">
                              {dealer.stats.yearsInBusiness}
                            </div>
                            <div className="text-xs text-gray-500">Years</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary-600">
                              {dealer.stats.responseTime}
                            </div>
                            <div className="text-xs text-gray-500">Response</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Policies */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiPhone size={16} />
                      <span>{dealer.contact.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiMail size={16} />
                      <span>{dealer.contact.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiGlobe size={16} />
                      <span>{dealer.contact.website}</span>
                    </div>
                  </div>
                </div>

                {/* Policies */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Policies</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiTruck size={16} />
                      <span>{dealer.policies.shippingPolicy}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiShield size={16} />
                      <span>{dealer.policies.warranty}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FiPackage size={16} />
                      <span>{dealer.policies.returnPolicy}</span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {dealer.specialties.map((specialty, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Products from {dealer.company_name}
              </h2>
              <p className="text-gray-600">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>

            {/* Controls */}
            <div className="mt-4 lg:mt-0 flex items-center space-x-4">
              {/* View Mode */}
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100'}`}
                >
                  <FiList size={20} />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name">Name A-Z</option>
              </select>

              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <FiFilter size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  All Products
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <ProductGrid
            products={filteredProducts}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            columns={viewMode === 'list' ? 1 : 4}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <FiPackage size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {selectedCategory === 'all' 
                ? 'This dealer hasn\'t added any products yet.'
                : `No products found in the "${selectedCategory}" category.`
              }
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                View All Products
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DealerProfile; 