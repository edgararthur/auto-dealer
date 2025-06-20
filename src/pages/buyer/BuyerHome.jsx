import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiShoppingCart, 
  FiSearch, 
  FiTrendingUp, 
  FiPackage, 
  FiUsers, 
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiStar
} from 'react-icons/fi';
import ProductService from '../../../shared/services/productService';
import RecommendationService from '../../../shared/services/recommendationService';
import { ProductGrid } from '../../components/common';
import { useCart } from '../../contexts/CartContext';

// Main component
const BuyerHome = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const { addToCart } = useCart();

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch featured products
        const productsResponse = await ProductService.getProducts({
          sortBy: 'created_at',
          sortOrder: 'desc',
          limit: 8 // Get featured products
        });
        
        if (productsResponse.success) {
          // Add mock data for display since we don't have sales/featured flags
          const productsWithMockData = (productsResponse.products || []).map((product, index) => ({
            ...product,
            rating: 4.0 + Math.random() * 1, // Mock rating between 4-5
            reviewCount: Math.floor(Math.random() * 200) + 10, // Mock review count
            isNew: index < 3, // Mark first 3 as new
            isFeatured: index < 4, // Mark first 4 as featured
            oldPrice: Math.random() > 0.5 ? product.price * 1.2 : null // Random old price for sales
          }));
          
          setFeaturedProducts(productsWithMockData);
        } else {
          setError(productsResponse.error || 'Failed to fetch products');
        }
        
        // Fetch categories
        const categoriesResponse = await ProductService.getCategories();
        
        if (categoriesResponse.success) {
          // Transform categories for display
          const transformedCategories = (categoriesResponse.categories || []).slice(0, 8).map((cat, index) => ({
            id: cat.id,
            name: cat.name,
            count: Math.floor(Math.random() * 500) + 50, // Mock count
            image: `https://images.unsplash.com/photo-${1486262715619 + index}?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80`,
            icon: ['🔧', '🛑', '💡', '🛋️', '🚗', '🔄', '🏎️', '🧴'][index] || '🔧'
          }));
          
          setCategories(transformedCategories);
        } else {
          setCategories([]); // Fallback
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

  // Handle adding items to cart
  const handleAddToCart = (productId) => {
    const product = featuredProducts.find(p => p.id === productId);
    if (product) {
      addToCart(productId, 1, { 
        dealerId: product.dealer?.id,
        price: product.price 
      });
    }
  };

  // Handle adding to wishlist
  const handleAddToWishlist = (productId) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Added product ${productId} to wishlist`);
  }
    // Note: This would be implemented with useWishlist hook when that's ready
  };
  
  // Carousel navigation
  const nextSlide = () => {
    setActiveSlide((prev) => (prev === bannerSlides.length - 1 ? 0 : prev + 1));
  };
  
  const prevSlide = () => {
    setActiveSlide((prev) => (prev === 0 ? bannerSlides.length - 1 : prev - 1));
  };
  
  // Auto rotate carousel
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(timer);
  }, [activeSlide]);

  // Hero banner slides
  const bannerSlides = [
    {
      id: 1,
      title: 'Premium Auto Parts',
      subtitle: 'Save up to 40% on quality parts from verified dealers',
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
      cta: 'Shop Now',
      url: '/products',
      color: 'from-blue-600 to-blue-800'
    },
    {
      id: 2,
      title: 'Flash Sale',
      subtitle: 'Limited time offers on brake systems from top dealers',
      image: 'https://images.unsplash.com/photo-1599256860237-5e943d633290?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
      cta: 'Shop Deals',
      url: '/deals',
      color: 'from-red-600 to-red-800'
    },
    {
      id: 3,
      title: 'New Arrivals',
      subtitle: 'Just landed performance upgrades from certified dealers',
      image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
      cta: 'Discover',
      url: '/new-arrivals',
      color: 'from-green-600 to-green-800'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-jumia-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-6 text-neutral-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-jumia-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Promotional Banners */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Batteries Banner */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block bg-red-500 text-white text-xs font-bold px-2 py-1 rounded mb-4">
                Top brands
              </span>
              <h2 className="text-3xl font-bold mb-2">BATTERIES</h2>
              <p className="text-lg mb-6">Stay charged up!</p>
                  <Link 
                to="/categories/batteries"
                className="inline-flex items-center bg-white text-orange-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                Shop now <FiArrowRight className="ml-2" />
                  </Link>
                </div>
            <div className="absolute right-0 top-0 h-full w-1/2 bg-contain bg-no-repeat bg-right opacity-20"
                 style={{backgroundImage: "url('https://images.pexels.com/photos/4480523/pexels-photo-4480523.jpeg?auto=compress&cs=tinysrgb&w=300')"}}></div>
              </div>

          {/* Tires Banner */}
          <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-8 text-gray-800 relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block bg-green-500 text-white text-xs font-bold px-2 py-1 rounded mb-4">
                Buy 3 Get 1 For Free
              </span>
              <h2 className="text-3xl font-bold mb-2">TIRES & WHEELS</h2>
              <p className="text-lg mb-6">Stay safe on road!</p>
              <Link
                to="/categories/tires"
                className="inline-flex items-center bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Shop now <FiArrowRight className="ml-2" />
              </Link>
            </div>
            <div className="absolute right-0 top-0 h-full w-1/2 bg-contain bg-no-repeat bg-right opacity-20"
                 style={{backgroundImage: "url('https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg?auto=compress&cs=tinysrgb&w=300')"}}></div>
        </div>
        </div>
      </div>
      {/* Featured Manufacturers */}
      <div className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured manufacturers</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-8">
            {[
              { name: 'Toyota', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Toyota-Logo.png' },
              { name: 'Honda', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Honda-Logo.png' },
              { name: 'Ford', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Ford-Logo.png' },
              { name: 'BMW', logo: 'https://logos-world.net/wp-content/uploads/2020/04/BMW-Logo.png' },
              { name: 'Mercedes', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Mercedes-Logo.png' },
              { name: 'Audi', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Audi-Logo.png' },
              { name: 'Nissan', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nissan-Logo.png' },
              { name: 'Hyundai', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Hyundai-Logo.png' }
            ].map((brand, index) => (
              <Link 
                key={index}
                to={`/brands/${brand.name.toLowerCase()}`}
                className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-center justify-center"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-8 w-auto object-contain"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/120x60/666/fff?text=${brand.name}`;
                  }}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8">
      
        {/* Featured Products Section */}
        <div className="mb-12">
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Featured products in</h2>
            <div className="flex items-center justify-center space-x-8 mb-8">
              <button className="px-6 py-2 border-b-2 border-blue-500 text-blue-500 font-semibold">
                Engine parts
              </button>
              <button className="px-6 py-2 text-gray-500 hover:text-gray-700">
                Oil & Fluids
              </button>
              <button className="px-6 py-2 text-gray-500 hover:text-gray-700">
                Suspension
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            {featuredProducts.slice(0, 6).map((product, index) => (
              <div key={product.id || index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                <div className="relative">
                  {/* Sale Badge */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Sale
                    </span>
                  </div>
                  
                  {/* Product Image */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <img
                      src={product.image || 'https://via.placeholder.com/200x200/eee/666?text=Product'}
                      alt={product.name}
                      className="h-full w-full object-contain p-4"
                    />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.name || `Sample Product ${index + 1}`}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          size={12}
                          className={i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">(4.5)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-red-600 font-bold">
                        GH₵{product.price?.toFixed(2) || '99.99'}
                      </span>
                      {product.oldPrice && (
                        <span className="text-gray-400 line-through text-sm ml-2">
                          GH₵{product.oldPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    Add to cart <FiArrowRight className="ml-1" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Large Promotional Banner */}
        <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-xl p-12 text-white mb-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-black text-white text-sm font-bold px-3 py-1 rounded mb-4">
              ONE TIME SPECIAL
            </span>
            <h2 className="text-4xl font-bold mb-4">BUYS</h2>
            <p className="text-xl mb-6">Good Values. Always.</p>
            <Link 
              to="/deals"
              className="inline-flex items-center bg-black text-white px-8 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Shop now <FiArrowRight className="ml-2" />
            </Link>
          </div>
          <div className="absolute right-0 top-0 h-full w-1/2 bg-contain bg-no-repeat bg-right opacity-30"
               style={{backgroundImage: "url('https://images.pexels.com/photos/3752169/pexels-photo-3752169.jpeg?auto=compress&cs=tinysrgb&w=400')"}}></div>
        </div>

        {/* More to Love Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">More to love!</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(6, 10).map((product, index) => (
              <div key={product.id || index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                <div className="relative">
                  {/* Badges */}
                  <div className="absolute top-2 left-2 z-10 flex gap-1">
                    <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                      New!
                    </span>
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Sale
                    </span>
          </div>
          
                  {/* Product Image */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <img
                      src={product.image || 'https://via.placeholder.com/200x200/eee/666?text=Product'}
                      alt={product.name}
                      className="h-full w-full object-contain p-4"
            />
          </div>
        </div>

                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
                    {product.name || `Quality Auto Part ${index + 1}`}
                  </h3>
                  
                  {/* Rating */}
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          size={12}
                          className={i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
              </div>

                  {/* Price */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">
                        GH₵{((product.price || 99) * 1.3).toFixed(2)}
                      </span>
                      <span className="text-red-600 font-bold">
                        GH₵{product.price?.toFixed(2) || '99.99'}
                      </span>
            </div>
              </div>

                  {/* Add to Cart */}
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center"
                  >
                    Add to cart <FiArrowRight className="ml-1" size={12} />
                  </button>
            </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerHome; 