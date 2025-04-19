import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiTag, 
  FiShield, 
  FiTruck, 
  FiSearch, 
  FiChevronRight,
  FiStar,
  FiClock,
  FiThumbsUp,
  FiShoppingCart,
  FiChevronLeft
} from 'react-icons/fi';

// Mock data for featured products
const featuredProducts = [
  {
    id: 1,
    name: 'Premium Brake Pads',
    category: 'Brakes',
    price: 49.99,
    oldPrice: 69.99,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 156,
    isNew: false,
    isFeatured: true
  },
  {
    id: 2,
    name: 'High-Performance Oil Filter',
    category: 'Engine',
    price: 12.99,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.5,
    reviewCount: 89,
    isNew: true,
    isFeatured: false
  },
  {
    id: 3,
    name: 'LED Headlight Kit',
    category: 'Lighting',
    price: 129.99,
    oldPrice: 149.99,
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 207,
    isNew: true,
    isFeatured: true
  },
  {
    id: 4,
    name: 'All-Weather Floor Mats',
    category: 'Interior',
    price: 79.99,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1563299796-17596ed6b017?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 132,
    isNew: false,
    isFeatured: false
  },
  {
    id: 5,
    name: 'Performance Air Intake System',
    category: 'Engine',
    price: 199.99,
    oldPrice: 249.99,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.6,
    reviewCount: 78,
    isNew: false,
    isFeatured: true
  },
  {
    id: 6,
    name: 'Heavy Duty Alternator',
    category: 'Electrical',
    price: 159.99,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1565689157206-0fddef7589a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 42,
    isNew: true,
    isFeatured: false
  },
  {
    id: 7,
    name: 'Suspension Lowering Kit',
    category: 'Suspension',
    price: 299.99,
    oldPrice: 349.99,
    image: 'https://images.unsplash.com/photo-1562426508-a52ab956ae2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 65,
    isNew: false,
    isFeatured: true
  },
  {
    id: 8,
    name: 'Power Steering Pump',
    category: 'Steering',
    price: 129.99,
    oldPrice: null,
    image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.4,
    reviewCount: 36,
    isNew: false,
    isFeatured: false
  }
];

// Flash deals (time-limited offers)
const flashDeals = [
  {
    id: 10,
    name: 'Synthetic Motor Oil (5L)',
    category: 'Engine',
    price: 29.99,
    oldPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1635270364846-5e3190b48026?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 212,
    discount: 50, // Percent off
    endsIn: 12 * 60 * 60, // 12 hours in seconds
  },
  {
    id: 11,
    name: 'Performance Exhaust System',
    category: 'Exhaust',
    price: 249.99,
    oldPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1596994836684-85ca30e8179b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 98,
    discount: 38,
    endsIn: 6 * 60 * 60, // 6 hours in seconds
  },
  {
    id: 12,
    name: 'Car Battery (60Ah)',
    category: 'Electrical',
    price: 89.99,
    oldPrice: 149.99,
    image: 'https://images.unsplash.com/photo-1617886322168-72b886573c6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 156,
    discount: 40,
    endsIn: 9 * 60 * 60, // 9 hours in seconds
  },
  {
    id: 13,
    name: 'Brake Rotor Set',
    category: 'Brakes',
    price: 69.99,
    oldPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1588169770457-8bfc2de92556?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.6,
    reviewCount: 68,
    discount: 30,
    endsIn: 15 * 60 * 60, // 15 hours in seconds
  }
];

// Popular brands
const brands = [
  { id: 1, name: 'Bosch', logo: 'https://via.placeholder.com/150x80?text=Bosch' },
  { id: 2, name: 'Denso', logo: 'https://via.placeholder.com/150x80?text=Denso' },
  { id: 3, name: 'NGK', logo: 'https://via.placeholder.com/150x80?text=NGK' },
  { id: 4, name: 'AC Delco', logo: 'https://via.placeholder.com/150x80?text=AC+Delco' },
  { id: 5, name: 'Moog', logo: 'https://via.placeholder.com/150x80?text=Moog' },
  { id: 6, name: 'K&N', logo: 'https://via.placeholder.com/150x80?text=K%26N' },
];

// Mock data for product categories
const categories = [
  { 
    id: 1, 
    name: 'Engine Parts', 
    count: 487, 
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80',
    icon: '🔧' 
  },
  { 
    id: 2, 
    name: 'Brakes & Suspension', 
    count: 329, 
    image: 'https://images.unsplash.com/photo-1482575832494-771f74bf6857?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80',
    icon: '🛑' 
  },
  { 
    id: 3, 
    name: 'Lighting & Electrical', 
    count: 254, 
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80',
    icon: '💡' 
  },
  { 
    id: 4, 
    name: 'Interior Accessories', 
    count: 198, 
    image: 'https://images.unsplash.com/photo-1547038577-da80abbc4f19?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80',
    icon: '🛋️' 
  },
  { 
    id: 5, 
    name: 'Exterior Accessories', 
    count: 176, 
    image: 'https://images.unsplash.com/photo-1553358961-434eadba29d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80',
    icon: '🚗' 
  },
  { 
    id: 6, 
    name: 'Wheels & Tires', 
    count: 143, 
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80',
    icon: '🔄' 
  },
  { 
    id: 7, 
    name: 'Performance Parts', 
    count: 109, 
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80',
    icon: '🏎️' 
  },
  { 
    id: 8, 
    name: 'Oils & Fluids', 
    count: 85, 
    image: 'https://images.unsplash.com/photo-1563299796-17596ed6b017?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=300&q=80',
    icon: '🧴' 
  }
];

// Hero banner slides
const bannerSlides = [
  {
    id: 1,
    title: 'Premium Auto Parts',
    subtitle: 'Save up to 40% on quality parts',
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
    cta: 'Shop Now',
    url: '/products',
    color: 'from-blue-600 to-blue-800'
  },
  {
    id: 2,
    title: 'Flash Sale',
    subtitle: 'Limited time offers on brake systems',
    image: 'https://images.unsplash.com/photo-1599256860237-5e943d633290?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
    cta: 'Shop Deals',
    url: '/deals',
    color: 'from-red-600 to-red-800'
  },
  {
    id: 3,
    title: 'New Arrivals',
    subtitle: 'Just landed performance upgrades',
    image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&h=400&q=80',
    cta: 'Discover',
    url: '/new-arrivals',
    color: 'from-green-600 to-green-800'
  }
];

// Format time for countdown display
const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: secs.toString().padStart(2, '0')
  };
};

// Product card component styled like Jumia
const ProductCard = ({ product, onAddToCart }) => {
  const isOnSale = product.oldPrice !== null;
  const discountPercent = isOnSale ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0;
  
  return (
    <div className="bg-white group border border-transparent hover:border-jumia-orange transition-all duration-200">
      {/* Sale or New badge */}
      {product.isNew && (
        <div className="absolute top-0 right-0 z-10 bg-jumia-orange text-white text-xs font-bold px-2 py-1">NEW</div>
      )}
      {isOnSale && !product.isNew && (
        <div className="absolute top-0 right-0 z-10 bg-jumia-orange text-white text-xs font-bold px-2 py-1">-{discountPercent}%</div>
      )}
      
      {/* Product image */}
      <div className="relative h-48 p-2">
        <Link to={`/products/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105" 
          />
        </Link>
      </div>
      
      {/* Product info */}
      <div className="p-3 border-t border-jumia-lightGray">
        {/* Product name */}
        <Link to={`/products/${product.id}`} className="block mb-2">
          <h3 className="text-sm font-normal text-neutral-700 line-clamp-2 group-hover:text-jumia-orange transition-colors">
            {product.name}
          </h3>
        </Link>
        
        {/* Pricing */}
        <div className="mt-auto">
          {isOnSale ? (
            <div className="flex flex-col">
              <span className="text-base font-bold text-jumia-orange">${product.price.toFixed(2)}</span>
              <div className="flex items-center mt-1">
                <span className="text-xs text-neutral-500 line-through mr-2">${product.oldPrice.toFixed(2)}</span>
                <span className="text-xs bg-jumia-orange text-white px-1 py-0.5">{discountPercent}% OFF</span>
              </div>
            </div>
          ) : (
            <span className="text-base font-bold text-jumia-orange">${product.price.toFixed(2)}</span>
          )}
        </div>
        
        {/* Rating */}
        <div className="flex items-center mt-2">
          <div className="flex text-jumia-orange">
            {[...Array(5)].map((_, i) => (
              <svg 
                key={i} 
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-jumia-orange' : 'text-neutral-300'}`} 
                fill="currentColor" 
                viewBox="0 0 20 20" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-1 text-xs text-neutral-500">({product.reviewCount})</span>
        </div>
      </div>
      
      {/* Add to cart button */}
      <button 
        onClick={() => onAddToCart(product.id)}
        className="w-full py-2 bg-jumia-orange text-white hover:bg-jumia-orangeDark transition-colors flex items-center justify-center"
      >
        <FiShoppingCart size={16} className="mr-2" />
        <span className="text-sm font-medium">ADD TO CART</span>
      </button>
    </div>
  );
};

// Main component
const BuyerHome = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [countdown, setCountdown] = useState(flashDeals.map(deal => deal.endsIn));
  
  // Handle adding items to cart
  const handleAddToCart = (productId) => {
    console.log(`Added product ${productId} to cart`);
    // In a real app, this would dispatch to your cart state management
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
  
  // Countdown timer for flash deals
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => 
        prev.map(time => (time > 0 ? time - 1 : 0))
      );
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-jumia-background">
      {/* Hero Banner Carousel */}
      <div className="relative overflow-hidden mb-4">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {bannerSlides.map((slide) => (
            <div key={slide.id} className="min-w-full relative">
              <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} opacity-60 z-10`}></div>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-center z-20 px-8 md:px-16">
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{slide.title}</h1>
                  <p className="text-lg md:text-xl text-white mb-4">{slide.subtitle}</p>
                  <Link 
                    to={slide.url}
                    className="inline-block bg-jumia-orange text-white px-6 py-2 rounded-sm text-lg font-medium hover:bg-jumia-orangeDark transition-colors w-max"
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Carousel Controls */}
        <button 
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full z-30"
          onClick={prevSlide}
        >
          <FiChevronLeft size={24} />
        </button>
        <button 
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full z-30"
          onClick={nextSlide}
        >
          <FiChevronRight size={24} />
        </button>
        
        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-30">
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full ${activeSlide === index ? 'bg-white' : 'bg-white bg-opacity-50'}`}
              onClick={() => setActiveSlide(index)}
            />
          ))}
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4">
        {/* Category Grid - Jumia Style */}
        <div className="mb-8">
          <div className="bg-white p-4 rounded-sm mb-2">
            <h2 className="text-lg font-medium text-neutral-800">Shop by Category</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
            {categories.map((category) => (
              <Link 
                key={category.id}
                to={`/products?category=${encodeURIComponent(category.name)}`}
                className="flex flex-col items-center bg-white p-4 rounded-sm hover:shadow-md transition-shadow text-center"
              >
                <span className="text-3xl mb-2">{category.icon}</span>
                <h3 className="text-sm font-medium text-neutral-700">{category.name}</h3>
                <span className="text-xs text-neutral-500">{category.count} products</span>
              </Link>
            ))}
          </div>
        </div>
      
        {/* Flash Deals Section - Jumia Style */}
        <div className="mb-8">
          <div className="bg-white p-4 rounded-sm mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <FiClock className="text-jumia-orange mr-2" size={20} />
              <h2 className="text-lg font-medium text-neutral-800">Flash Deals</h2>
            </div>
            <Link 
              to="/deals" 
              className="text-jumia-orange text-sm font-medium flex items-center"
            >
              See All <FiChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {flashDeals.map((deal, index) => (
              <div key={deal.id} className="bg-white rounded-sm">
                <div className="relative">
                  <div className="absolute top-0 left-0 bg-jumia-orange text-white font-bold px-2 py-1 z-10">
                    -{deal.discount}%
                  </div>
                  <img 
                    src={deal.image} 
                    alt={deal.name} 
                    className="w-full h-40 object-contain p-2" 
                  />
                </div>
                <div className="p-3 border-t border-jumia-lightGray">
                  {/* Title */}
                  <h3 className="text-sm font-normal text-neutral-700 line-clamp-2 mb-2">
                    {deal.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-jumia-orange font-bold">${deal.price.toFixed(2)}</span>
                    <span className="text-xs text-neutral-500 line-through ml-1">${deal.oldPrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Countdown */}
                  <div className="flex items-center mb-2">
                    <span className="text-xs text-neutral-600 mr-2">Ends in:</span>
                    <div className="flex space-x-1">
                      <div className="bg-neutral-800 text-white text-xs font-medium px-1 py-0.5">{formatTime(countdown[index]).hours}</div>
                      <span className="text-xs">:</span>
                      <div className="bg-neutral-800 text-white text-xs font-medium px-1 py-0.5">{formatTime(countdown[index]).minutes}</div>
                      <span className="text-xs">:</span>
                      <div className="bg-neutral-800 text-white text-xs font-medium px-1 py-0.5">{formatTime(countdown[index]).seconds}</div>
                    </div>
                  </div>
                </div>
                {/* Add to cart button */}
                <button 
                  onClick={() => handleAddToCart(deal.id)}
                  className="w-full py-2 bg-jumia-orange text-white hover:bg-jumia-orangeDark transition-colors flex items-center justify-center"
                >
                  <FiShoppingCart size={16} className="mr-2" />
                  <span className="text-sm font-medium">ADD TO CART</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      
        {/* Top Selling Products Section */}
        <div className="mb-8">
          <div className="bg-white p-4 rounded-sm mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <FiThumbsUp className="text-jumia-orange mr-2" size={20} />
              <h2 className="text-lg font-medium text-neutral-800">Top Selling Products</h2>
            </div>
            <Link 
              to="/products?sort=popular" 
              className="text-jumia-orange text-sm font-medium flex items-center"
            >
              See All <FiChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {featuredProducts.slice(0, 5).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      
        {/* Popular Brands Section */}
        <div className="mb-8">
          <div className="bg-white p-4 rounded-sm mb-2">
            <h2 className="text-lg font-medium text-neutral-800">Popular Brands</h2>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {brands.map((brand) => (
              <Link 
                key={brand.id}
                to={`/products?brand=${encodeURIComponent(brand.name)}`}
                className="bg-white p-4 rounded-sm hover:shadow-md transition-shadow flex items-center justify-center"
              >
                <img 
                  src={brand.logo} 
                  alt={brand.name} 
                  className="max-h-12" 
                />
              </Link>
            ))}
          </div>
        </div>
      
        {/* Featured Products Section */}
        <div className="mb-8">
          <div className="bg-white p-4 rounded-sm mb-2 flex items-center justify-between">
            <div className="flex items-center">
              <FiStar className="text-jumia-orange mr-2" size={20} />
              <h2 className="text-lg font-medium text-neutral-800">New Arrivals</h2>
            </div>
            <Link 
              to="/new-arrivals" 
              className="text-jumia-orange text-sm font-medium flex items-center"
            >
              See All <FiChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {featuredProducts.filter(p => p.isNew).map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
        
        {/* Benefits Section */}
        <div className="mb-8 bg-white p-4 rounded-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="bg-jumia-orange/10 p-3 rounded-full mr-4">
                <FiShield className="text-jumia-orange" size={24} />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">Warranty Protection</h3>
                <p className="text-sm text-neutral-600">Quality guaranteed with every purchase</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-jumia-orange/10 p-3 rounded-full mr-4">
                <FiTruck className="text-jumia-orange" size={24} />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">Fast Shipping</h3>
                <p className="text-sm text-neutral-600">Free delivery nationwide on orders over $50</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-jumia-orange/10 p-3 rounded-full mr-4">
                <FiTag className="text-jumia-orange" size={24} />
              </div>
              <div>
                <h3 className="font-medium text-neutral-800">Best Prices</h3>
                <p className="text-sm text-neutral-600">Competitive prices on 10,000+ products</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerHome; 