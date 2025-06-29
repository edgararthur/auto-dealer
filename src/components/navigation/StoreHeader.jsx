import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiBell,
  FiMapPin,
  FiHelpCircle,
  FiArrowRight
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { LiveSearchDropdown } from '../common';
import CurrencySelector from '../common/CurrencySelector';
import { getUserLocation, formatShippingText } from '../../utils/locationUtils';

const StoreHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isShopMegaMenuOpen, setIsShopMegaMenuOpen] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const location = useLocation();
  const navigate = useNavigate();
  
  const userMenuRef = useRef(null);
  const categoriesRef = useRef(null);
  const shopMegaMenuRef = useRef(null);

  // Calculate total cart items
  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;
  const wishlistItemCount = wishlistItems?.length || 0;

  // Fetch user location on component mount
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const location = await getUserLocation();
        setUserLocation(location);
      } catch (error) {
        console.error('Failed to get user location:', error);
        // Set default location if detection fails
        setUserLocation({
          countryCode: 'US',
          countryName: 'United States',
          flag: '🇺🇸',
          detected: false
        });
      }
    };

    fetchLocation();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(event.target)) {
        setIsCategoriesOpen(false);
      }
      if (shopMegaMenuRef.current && !shopMegaMenuRef.current.contains(event.target)) {
        setIsShopMegaMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/auth/login');
  };

  const mainCategories = [
    { name: 'Engine Parts', href: '/categories/engine-parts' },
    { name: 'Brake System', href: '/categories/brake-system' },
    { name: 'Suspension', href: '/categories/suspension' },
    { name: 'Electrical', href: '/categories/electrical' },
    { name: 'Body & Exterior', href: '/categories/body-exterior' },
    { name: 'Interior', href: '/categories/interior' },
    { name: 'Fluids & Filters', href: '/categories/fluids-filters' },
    { name: 'Tools & Equipment', href: '/categories/tools' }
  ];

  // Mega Menu Categories - Auto Parts focused
  const megaMenuData = {
    car: {
      title: 'Car',
      categories: [
        { name: 'Auto and truck parts', href: '/categories/auto-truck-parts' },
        { name: 'Tools and supplies', href: '/categories/tools-supplies' },
        { name: 'Turbo chargers', href: '/categories/turbo-chargers' },
        { name: 'Clothing and merchandise', href: '/categories/clothing-merchandise' },
        { name: 'Shock absorbers', href: '/categories/shock-absorbers' },
        { name: 'Electronic and GPS', href: '/categories/electronic-gps' },
        { name: 'Air intake', href: '/categories/air-intake' },
        { name: 'Deals', href: '/deals' },
        { name: 'Sell on Autora', href: '/sell' }
      ]
    },
    motorcycle: {
      title: 'Motorcycle and more',
      categories: [
        { name: 'Motorcycle parts', href: '/categories/motorcycle-parts' },
        { name: 'Body and frame', href: '/categories/body-frame' },
        { name: 'Engines and parts', href: '/categories/engines-parts' },
        { name: 'Accessories', href: '/categories/accessories' },
        { name: 'Exhausts and systems', href: '/categories/exhausts-systems' },
        { name: 'Rims', href: '/categories/rims' },
        { name: 'Deals', href: '/deals' },
        { name: 'Sell on Autora', href: '/sell' }
      ]
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-8 text-xs">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                Hi {user?.full_name || user?.name || user?.email?.split('@')[0] || 'Guest'}!
              </span>
              <Link to="/help" className="text-gray-600 hover:text-blue-600">Help & Contact</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                {formatShippingText(userLocation)}
              </span>
              <Link to="/sell" className="text-gray-600 hover:text-blue-600">Sell</Link>
              <Link to="/watchlist" className="text-gray-600 hover:text-blue-600">Watchlist</Link>
              <Link to="/account" className="text-gray-600 hover:text-blue-600">My Account</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">
              <span className="text-red-500">Aut</span>
              <span className="text-blue-500">ora</span>
            </div>
          </Link>

          {/* Categories Dropdown */}
          <div className="relative" ref={categoriesRef}>
            <button
              onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Shop by category
              <FiChevronDown className="ml-1 w-4 h-4" />
            </button>
            
            {isCategoriesOpen && (
              <div className="absolute left-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                {mainCategories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsCategoriesOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Search Bar - Live Search */}
          <div className="flex-1 max-w-2xl mx-6">
            <LiveSearchDropdown className="w-full" />
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            {/* Advanced Search */}
            <Link to="/search/advanced" className="text-xs text-blue-600 hover:underline">
              Advanced
            </Link>

            {/* Watchlist */}
            <Link to="/watchlist" className="flex items-center text-sm text-gray-700 hover:text-gray-900">
              <FiHeart className="w-4 h-4 mr-1" />
              Watchlist
              {wishlistItemCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {wishlistItemCount}
                </span>
              )}
            </Link>

            {/* My Account */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center text-sm text-gray-700 hover:text-gray-900"
              >
                My Account
                <FiChevronDown className="ml-1 w-4 h-4" />
              </button>
              
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  {user ? (
                    <>
                      <Link to="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        My Account
                      </Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Purchase History
                      </Link>
                      <Link to="/selling" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Selling
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/auth/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Sign In
                      </Link>
                      <Link to="/auth/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart */}
            <Link to="/cart" className="flex items-center text-sm text-gray-700 hover:text-gray-900">
              <FiShoppingCart className="w-4 h-4 mr-1" />
              Cart
              {cartItemCount > 0 && (
                <span className="ml-1 bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-8 h-10 text-sm relative">
            <Link to="/" className="text-gray-600 hover:text-gray-900">Home</Link>
            
            {/* Shop Link with Mega Menu */}
            <div 
              className="relative"
              ref={shopMegaMenuRef}
              onMouseEnter={() => setIsShopMegaMenuOpen(true)}
              onMouseLeave={() => setIsShopMegaMenuOpen(false)}
            >
              <Link 
                to="/shop" 
                className="text-gray-600 hover:text-gray-900 py-2 px-1"
              >
                Shop
              </Link>
              
              {/* Mega Menu Dropdown */}
              {isShopMegaMenuOpen && (
                <div className="absolute left-0 top-full mt-0 w-screen max-w-4xl bg-white border border-gray-200 shadow-xl z-50 rounded-b-lg">
                  <div className="grid grid-cols-3 gap-0">
                    {/* Left Column - Car Categories */}
                    <div className="p-6 border-r border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4 text-base">
                        {megaMenuData.car.title}
                      </h3>
                      <ul className="space-y-2">
                        {megaMenuData.car.categories.map((category, index) => (
                          <li key={index}>
                            <Link
                              to={category.href}
                              className="text-sm text-gray-600 hover:text-blue-600 hover:underline block py-1"
                              onClick={() => setIsShopMegaMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Middle Column - Motorcycle Categories */}
                    <div className="p-6 border-r border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-4 text-base">
                        {megaMenuData.motorcycle.title}
                      </h3>
                      <ul className="space-y-2">
                        {megaMenuData.motorcycle.categories.map((category, index) => (
                          <li key={index}>
                            <Link
                              to={category.href}
                              className="text-sm text-gray-600 hover:text-blue-600 hover:underline block py-1"
                              onClick={() => setIsShopMegaMenuOpen(false)}
                            >
                              {category.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right Column - Promotional Banner */}
                    <div className="p-6 relative rounded-br-lg overflow-hidden min-h-[300px]">
                      {/* Multiple Background Images with Blue Overlay */}
                      <div className="absolute inset-0">
                        {/* Primary automotive parts background */}
                        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-60"
                             style={{
                               backgroundImage: `url('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2072&q=80')`
                             }}>
                        </div>
                        
                        {/* Secondary engine parts overlay */}
                        <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-cover bg-center bg-no-repeat opacity-40"
                             style={{
                               backgroundImage: `url('https://images.unsplash.com/photo-1580273916550-e323be2ae537?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`
                             }}>
                        </div>
                        
                        {/* Car maintenance background accent */}
                        <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-cover bg-center bg-no-repeat opacity-30"
                             style={{
                               backgroundImage: `url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80')`
                             }}>
                        </div>
                        
                        {/* Blue Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/85 via-blue-700/90 to-blue-800/95"></div>
                        
                        {/* Subtle Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10" 
                             style={{
                               backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="7" cy="7" r="1"/%3E%3Ccircle cx="13" cy="13" r="1"/%3E%3Ccircle cx="19" cy="19" r="1"/%3E%3Ccircle cx="25" cy="25" r="1"/%3E%3Ccircle cx="31" cy="31" r="1"/%3E%3Ccircle cx="37" cy="37" r="1"/%3E%3Ccircle cx="43" cy="43" r="1"/%3E%3Ccircle cx="49" cy="49" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
                             }}>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="relative z-10 h-full flex flex-col justify-between text-white">
                        <div>
                          <div className="flex items-center mb-2">
                            <h3 className="font-bold text-xl">Auto Parts</h3>
                            <span className="ml-2 bg-yellow-400 text-blue-900 text-xs px-2 py-1 rounded-full font-semibold">
                              HOT DEALS
                            </span>
                          </div>
                          <p className="text-blue-100 text-sm mb-4 font-medium">
                            Premium quality at unbeatable prices
                          </p>
                          <div className="text-sm text-blue-100 mb-6 space-y-1">
                            <div className="flex items-center">
                              <span className="w-5 h-5 mr-2">⭐</span>
                              <span>OEM & aftermarket parts</span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-5 h-5 mr-2">🚚</span>
                              <span>Same day shipping</span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-5 h-5 mr-2">💰</span>
                              <span>Up to 40% off select items</span>
                            </div>
                            <div className="flex items-center">
                              <span className="w-5 h-5 mr-2">🔧</span>
                              <span>Expert installation guides</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Link
                            to="/shop"
                            className="inline-flex items-center justify-center bg-white text-blue-600 px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full"
                            onClick={() => setIsShopMegaMenuOpen(false)}
                          >
                            Shop All Parts
                            <FiArrowRight className="ml-2 w-4 h-4" />
                          </Link>
                          
                          <Link
                            to="/deals"
                            className="inline-flex items-center justify-center border-2 border-white text-white px-6 py-2 rounded-lg text-xs font-medium hover:bg-white hover:text-blue-600 transition-all duration-200 w-full"
                            onClick={() => setIsShopMegaMenuOpen(false)}
                          >
                            View Today's Deals
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bottom Section - Popular Categories */}
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-xs">
                        <span className="text-gray-500">Popular:</span>
                        <Link to="/categories/brake-pads" className="text-blue-600 hover:underline">Brake Pads</Link>
                        <Link to="/categories/oil-filters" className="text-blue-600 hover:underline">Oil Filters</Link>
                        <Link to="/categories/spark-plugs" className="text-blue-600 hover:underline">Spark Plugs</Link>
                        <Link to="/categories/air-filters" className="text-blue-600 hover:underline">Air Filters</Link>
                        <Link to="/categories/batteries" className="text-blue-600 hover:underline">Batteries</Link>
                      </div>
                      <Link 
                        to="/categories" 
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => setIsShopMegaMenuOpen(false)}
                      >
                        View all categories →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/brands" className="text-gray-600 hover:text-gray-900">Brands</Link>
            <Link to="/deals" className="text-gray-600 hover:text-gray-900">Deals</Link>
            <Link to="/new-arrivals" className="text-gray-600 hover:text-gray-900">New Arrivals</Link>
            <Link to="/best-sellers" className="text-gray-600 hover:text-gray-900">Best Sellers</Link>
            <Link to="/help" className="text-gray-600 hover:text-gray-900">Help</Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {mainCategories.map((category) => (
              <Link
                key={category.name}
                to={category.href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default StoreHeader;