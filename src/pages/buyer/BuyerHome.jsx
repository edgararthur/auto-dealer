import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch, 
  FiShoppingCart,
  FiStar,
  FiChevronRight,
  FiArrowRight,
  FiTruck,
  FiShield,
  FiHeadphones,
  FiTag,
  FiClock,
  FiHeart,
  FiEye
} from 'react-icons/fi';

import ProductService from '../../../shared/services/productService';
import { useCart } from '../../contexts/CartContext';
import ProductCard from '../../components/common/ProductCard';
import { ProductImage } from '../../components/common/OptimizedImage';
import { ProductGridSkeleton } from '../../components/common/LoadingStates';
import { formatPrice } from '../../utils/priceFormatter';

const BuyerHome = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [todaysDeals, setTodaysDeals] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [loading, setLoading] = useState(true);

  // Auto parts focused categories
  const autoCategories = [
    { id: 1, name: 'Engine Parts', icon: '🔧', href: '/categories/engine-parts' },
    { id: 2, name: 'Brake System', icon: '🛑', href: '/categories/brake-system' },
    { id: 3, name: 'Suspension', icon: '⚙️', href: '/categories/suspension' },
    { id: 4, name: 'Electrical', icon: '⚡', href: '/categories/electrical' },
    { id: 5, name: 'Body & Exterior', icon: '🚗', href: '/categories/body-exterior' },
    { id: 6, name: 'Interior', icon: '🪑', href: '/categories/interior' },
    { id: 7, name: 'Tools & Equipment', icon: '🔨', href: '/categories/tools' },
    { id: 8, name: 'Fluids & Filters', icon: '🛢️', href: '/categories/fluids-filters' }
  ];

  // Vehicle types for hero section
  const vehicleTypes = [
    { name: 'Cars', icon: '🚗', description: 'Passenger vehicles' },
    { name: 'Trucks', icon: '🚛', description: 'Light & heavy trucks' },
    { name: 'Motorcycles', icon: '🏍️', description: 'Bikes & scooters' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch featured products and deals
        const [featuredResponse, dealsResponse] = await Promise.all([
          ProductService.getProducts({ limit: 6, featured: true }),
          ProductService.getProducts({ limit: 4, onSale: true })
        ]);

        if (featuredResponse.success) setFeaturedProducts(featuredResponse.products || []);
        if (dealsResponse.success) setTodaysDeals(dealsResponse.products || []);

        // Load recently viewed from localStorage
        const viewed = JSON.parse(localStorage.getItem('recentlyViewedProducts') || '[]').slice(0, 6);
        setRecentlyViewed(viewed);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ProductGridSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Auto Parts Focused */}
      <section className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Find the Perfect Auto Parts for Your Vehicle
              </h1>
              <p className="text-xl text-blue-100 leading-relaxed">
                Over 2 million quality auto parts from trusted brands. Fast shipping, expert support, and guaranteed compatibility.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Shop Auto Parts
              </Link>
            </div>
            <div className="hidden lg:flex justify-center space-x-8">
              {vehicleTypes.map((vehicle, index) => (
                <div key={index} className="text-center">
                  <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-6xl">{vehicle.icon}</span>
                  </div>
                  <h3 className="font-semibold text-lg">{vehicle.name}</h3>
                  <p className="text-sm text-blue-200">{vehicle.description}</p>
                  <FiChevronRight className="w-5 h-5 mx-auto mt-2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quality Guarantee Section */}
      <section className="bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quality Auto Parts Guaranteed</h2>
              <p className="text-gray-600">OEM and aftermarket parts with free shipping, expert support, and easy returns.</p>
            </div>
            <Link
              to="/quality-guarantee"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="bg-white py-8 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Your recently viewed parts</h2>
              <Link to="/history" className="text-blue-600 hover:underline text-sm">
                See all
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentlyViewed.map((product, index) => (
                <div key={index} className="group cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                    <ProductImage
                      src={product.image || product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      fallbackSrc="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
                      width={300}
                      height={300}
                    />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2">{product.name}</h3>
                  
                  {/* Dealer Information */}
                  {(product.dealer?.company_name || product.dealer?.business_name || product.dealer?.name) && (
                    <p className="text-xs text-gray-500 mt-1">
                      by {product.dealer.company_name || product.dealer.business_name || product.dealer.name}
                    </p>
                  )}
                  
                  <p className="text-lg font-bold text-gray-900 mt-1">{formatPrice(product.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Auto Parts Categories */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Shop by Auto Parts Category</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-6">
            {autoCategories.map((category) => (
              <Link
                key={category.id}
                to={category.href}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-50 group-hover:border-2 group-hover:border-blue-200 transition-colors border-2 border-transparent">
                  <span className="text-3xl">{category.icon}</span>
                </div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Today's Auto Parts Deals */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-600 text-white rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Today's Auto Parts Deals</h2>
                <p className="text-red-100">Save big on quality auto parts with free shipping</p>
              </div>
              <Link
                to="/deals"
                className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Shop Deals
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* Navigation Arrows */}
            <button 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 -ml-6"
              onClick={() => {
                const container = document.getElementById('todays-deals-container');
                container.scrollBy({ left: -300, behavior: 'smooth' });
              }}
            >
              <FiChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
            </button>
            <button 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 -mr-6"
              onClick={() => {
                const container = document.getElementById('todays-deals-container');
                container.scrollBy({ left: 300, behavior: 'smooth' });
              }}
            >
              <FiChevronRight className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Horizontal Scrolling Container */}
            <div 
              id="todays-deals-container"
              className="flex overflow-x-auto scrollbar-hide gap-6 pb-4 -mx-4 px-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {todaysDeals.map((product) => (
                <div 
                  key={product.id} 
                  className="flex-shrink-0 w-72 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-gray-200" 
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="relative aspect-square bg-gray-100 rounded-t-xl overflow-hidden">
                    <ProductImage
                      src={product.image || product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      fallbackSrc="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80"
                      width={400}
                      height={400}
                    />
                    {product.discount_percentage && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        {product.discount_percentage}% OFF
                      </div>
                    )}
                    <button 
                      className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add to wishlist logic here
                      }}
                    >
                      <FiHeart className="w-4 h-4 text-gray-600 hover:text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    {/* Dealer Information */}
                    {(product.dealer?.company_name || product.dealer?.business_name || product.dealer?.name) && (
                      <p className="text-xs text-gray-600 mb-2">
                        Sold by <span className="font-medium text-gray-800">{product.dealer.company_name || product.dealer.business_name || product.dealer.name}</span>
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex items-center mr-1">
                          {[...Array(5)].map((_, i) => (
                            <FiStar
                              key={i}
                              className={`w-3 h-3 ${i < (product.rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">({product.review_count || 0})</span>
                      </div>
                      <button 
                        className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                      >
                        <FiShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Performance & Upgrade Parts */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-4">Performance & Upgrade Parts</h2>
              <p className="text-xl text-gray-300 mb-6">Transform your vehicle with high-performance auto parts and accessories.</p>
              <Link
                to="/categories/performance"
                className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Shop Performance Parts
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white bg-opacity-10 rounded-lg p-4 aspect-square flex items-center justify-center">
                <span className="text-4xl">🏁</span>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4 aspect-square flex items-center justify-center">
                <span className="text-4xl">⚡</span>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4 aspect-square flex items-center justify-center">
                <span className="text-4xl">🔧</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auto Parts */}
      {featuredProducts.length > 0 && (
        <section className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Auto Parts</h2>
              <Link to="/shop" className="text-blue-600 hover:underline text-sm">
                See all parts
              </Link>
            </div>
            
            <div className="relative">
              {/* Navigation Arrows */}
              <button 
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 -ml-6"
                onClick={() => {
                  const container = document.getElementById('featured-products-container');
                  container.scrollBy({ left: -300, behavior: 'smooth' });
                }}
              >
                <FiChevronRight className="w-5 h-5 text-gray-600 rotate-180" />
              </button>
              <button 
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 hover:border-gray-300 -mr-6"
                onClick={() => {
                  const container = document.getElementById('featured-products-container');
                  container.scrollBy({ left: 300, behavior: 'smooth' });
                }}
              >
                <FiChevronRight className="w-5 h-5 text-gray-600" />
              </button>
              
              {/* Horizontal Scrolling Container */}
              <div 
                id="featured-products-container"
                className="flex overflow-x-auto scrollbar-hide gap-4 pb-4 -mx-4 px-4"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {featuredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="flex-shrink-0 w-60 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer border border-gray-100 hover:border-gray-200" 
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <div className="relative aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                      <ProductImage
                        src={product.image || product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        fallbackSrc="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80"
                        width={400}
                        height={400}
                      />
                      <div className="absolute top-2 left-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      </div>
                      <button 
                        className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to wishlist logic here
                        }}
                      >
                        <FiHeart className="w-3 h-3 text-gray-600 hover:text-red-500" />
                      </button>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Dealer Information */}
                      {(product.dealer?.company_name || product.dealer?.business_name || product.dealer?.name) && (
                        <p className="text-xs text-gray-600 mb-2">
                          Sold by <span className="font-medium text-gray-800">{product.dealer.company_name || product.dealer.business_name || product.dealer.name}</span>
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-lg font-bold text-gray-900">{formatPrice(product.price)}</p>
                          <p className="text-xs text-green-600 font-medium">Free shipping</p>
                        </div>
                        <button 
                          className="flex items-center justify-center w-7 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(product);
                          }}
                        >
                          <FiShoppingCart className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Vehicle Compatibility Section */}
      <section className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Parts for Your Vehicle</h2>
          <p className="text-xl text-gray-600 mb-8">Enter your vehicle details to find compatible auto parts</p>
          <div className="flex justify-center space-x-4 mb-8">
            <input
              type="text"
              placeholder="Year (e.g., 2020)"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Make (e.g., Toyota)"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Model (e.g., Camry)"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Find Parts
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Browse over 2 million auto parts compatible with your vehicle
          </p>
        </div>
      </section>
    </div>
  );
};

export default BuyerHome; 
