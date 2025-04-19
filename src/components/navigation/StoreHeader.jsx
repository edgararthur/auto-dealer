import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiShoppingCart, 
  FiHeart, 
  FiUser, 
  FiSearch, 
  FiMenu, 
  FiX, 
  FiChevronDown,
  FiLogOut,
  FiSettings,
  FiPackage,
  FiBookmark,
  FiBox,
  FiPhone,
  FiMail,
  FiMap,
  FiHelpCircle
} from 'react-icons/fi';

// Note: In a real implementation, these would come from the cart context/service
const CART_ITEMS_COUNT = 5;
const WISHLIST_ITEMS_COUNT = 3;

const StoreHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);

  // Mock categories - These would come from an API in a real implementation
  const categories = [
    {
      name: 'Engine Parts',
      icon: <FiBox />,
      subcategories: ['Oil Filters', 'Air Filters', 'Spark Plugs', 'Fuel Pumps']
    },
    {
      name: 'Brakes & Suspension',
      icon: <FiBox />,
      subcategories: ['Brake Pads', 'Shock Absorbers', 'Coil Springs', 'Struts']
    },
    {
      name: 'Lighting & Electrical',
      icon: <FiBox />,
      subcategories: ['Headlights', 'Taillights', 'Batteries', 'Alternators']
    },
    {
      name: 'Interior Accessories',
      icon: <FiBox />,
      subcategories: ['Floor Mats', 'Seat Covers', 'Steering Wheels', 'Dashboard Accessories']
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isAccountMenuOpen && !event.target.closest('.account-menu-container')) {
        setIsAccountMenuOpen(false);
      }
      if (isCategoriesOpen && !event.target.closest('.categories-menu-container')) {
        setIsCategoriesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAccountMenuOpen, isCategoriesOpen]);

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top bar with contact info and account links */}
      <div className="bg-neutral-800 text-white px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <a href="tel:+233509999999" className="hover:text-primary-500 transition-colors duration-200">
              <FiPhone className="inline mr-1" size={12} /> +233 50 999 9999
            </a>
            <a href="mailto:support@autoplus.com" className="hidden sm:inline-flex items-center hover:text-primary-500 transition-colors duration-200">
              <FiMail className="inline mr-1" size={12} /> support@autoplus.com
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/track-order" className="hover:text-primary-500 transition-colors duration-200 flex items-center">
              <FiPackage className="inline mr-1" size={12} /> Track Order
            </Link>
            <Link to="/dealers" className="hidden sm:inline-flex items-center hover:text-primary-500 transition-colors duration-200">
              <FiMap className="inline mr-1" size={12} /> Find Dealers
            </Link>
            <Link to="/help" className="hidden sm:inline-flex items-center hover:text-primary-500 transition-colors duration-200">
              <FiHelpCircle className="inline mr-1" size={12} /> Help
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main header with logo, search and cart */}
      <div className="bg-primary-600 px-4 py-3 shadow-inner">
        <div className="max-w-7xl mx-auto flex items-center">
          {/* Mobile menu button */}
          <button
            className="lg:hidden mr-3 text-white hover:text-white/80 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">Open main menu</span>
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
          
          {/* Logo */}
          <div className="flex-shrink-0 mr-8">
            <Link to="/" className="flex items-center">
              <span className="text-3xl font-bold text-white">AutoPlus</span>
            </Link>
          </div>
          
          {/* Search bar - Takes most of the space */}
          <div className="flex-1 max-w-3xl">
            <form onSubmit={handleSearchSubmit} className="flex">
              <div className="relative w-full">
                <input
                  type="text"
                  className="block w-full py-2 pl-4 pr-10 text-sm rounded-l-md border-0 shadow-inner focus:outline-none focus:ring-1 focus:ring-primary-300 placeholder-neutral-400"
                  placeholder="Search products, brands and categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  className="absolute inset-y-0 right-0 px-3 bg-neutral-800 text-white rounded-r-md hover:bg-neutral-700 transition-colors duration-200"
                >
                  <FiSearch size={20} />
                </button>
              </div>
            </form>
          </div>
          
          {/* User actions */}
          <div className="flex items-center ml-4 space-x-6">
            {/* Wishlist icon with counter */}
            <Link to="/wishlist" className="relative text-white transition-transform hover:scale-110 duration-200">
              <FiHeart size={22} />
              {WISHLIST_ITEMS_COUNT > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-secondary-600 rounded-full">
                  {WISHLIST_ITEMS_COUNT}
                </span>
              )}
            </Link>
            
            {/* Cart icon with counter */}
            <Link to="/cart" className="relative text-white transition-transform hover:scale-110 duration-200">
              <FiShoppingCart size={22} />
              {CART_ITEMS_COUNT > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-accent-500 rounded-full animate-pulse-slow">
                  {CART_ITEMS_COUNT}
                </span>
              )}
            </Link>
            
            {/* Account dropdown */}
            <div className="relative account-menu-container">
              <button
                className="flex items-center text-white transition-transform hover:scale-105 duration-200"
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                aria-expanded={isAccountMenuOpen}
              >
                <FiUser size={22} className="mr-1" />
                <span className="hidden md:inline text-sm font-medium">
                  {user ? 'Account' : 'Sign In'}
                </span>
                <FiChevronDown size={16} className={`ml-1 transition-transform duration-200 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Account dropdown menu */}
              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-card-hover z-50 animate-fade-in">
                  {user ? (
                    <div>
                      <div className="p-4 border-b border-neutral-200 bg-neutral-50 rounded-t-md">
                        <p className="text-sm font-medium text-neutral-900">Hello, {user.profile?.name || user.email}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          to="/account"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 transition-colors duration-200"
                        >
                          <FiUser className="mr-3 text-primary-500" size={16} />
                          My Account
                        </Link>
                        
                        <Link
                          to="/orders"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 transition-colors duration-200"
                        >
                          <FiPackage className="mr-3 text-primary-500" size={16} />
                          My Orders
                        </Link>
                        
                        <Link
                          to="/wishlist"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 transition-colors duration-200"
                        >
                          <FiHeart className="mr-3 text-primary-500" size={16} />
                          Saved Items
                        </Link>
                        
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 transition-colors duration-200"
                        >
                          <FiSettings className="mr-3 text-primary-500" size={16} />
                          Settings
                        </Link>
                        
                        <div className="border-t border-neutral-100 my-1"></div>
                        
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600 transition-colors duration-200"
                        >
                          <FiLogOut className="mr-3 text-primary-500" size={16} />
                          Logout
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="p-4">
                        <Link
                          to="/auth/login"
                          className="w-full mb-2 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
                        >
                          Login
                        </Link>
                        <Link
                          to="/auth/register"
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md shadow-sm text-neutral-700 bg-white hover:bg-neutral-50 transition-colors duration-200"
                        >
                          Register
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Categories bar - Only visible on desktop */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center">
            {/* All Categories dropdown */}
            <div className="relative categories-menu-container">
              <button
                className="flex items-center py-3 px-4 text-sm font-medium text-neutral-800 hover:text-primary-600 transition-colors duration-200"
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                aria-expanded={isCategoriesOpen}
                onMouseEnter={() => setIsCategoriesOpen(true)}
              >
                <FiMenu className="mr-2" size={18} />
                All Categories
                <FiChevronDown className={`ml-2 transition-transform duration-200 ${isCategoriesOpen ? 'rotate-180' : ''}`} size={16} />
              </button>
              
              {/* Mega menu for categories */}
              {isCategoriesOpen && (
                <div 
                  className="absolute left-0 mt-0 w-full bg-white shadow-lg z-40 animate-fade-in"
                  style={{ width: '700px' }}
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                >
                  <div className="flex h-96">
                    {/* Categories sidebar */}
                    <div className="w-1/3 bg-neutral-50 border-r border-neutral-100">
                      <ul className="py-2">
                        {categories.map((category, idx) => (
                          <li key={idx}>
                            <button
                              className={`flex items-center w-full text-left px-4 py-3 text-sm hover:bg-neutral-100 transition-colors duration-200 ${activeCategory === idx ? 'bg-neutral-100 text-primary-600 font-medium' : 'text-neutral-800'}`}
                              onMouseEnter={() => setActiveCategory(idx)}
                              onClick={() => navigate(`/category/${category.name.toLowerCase().replace(/ /g, '-')}`)}
                            >
                              <span className="mr-3 text-neutral-400">{category.icon}</span>
                              {category.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Subcategories content */}
                    <div className="w-2/3 p-6">
                      {activeCategory !== null && (
                        <div>
                          <h3 className="text-lg font-medium text-neutral-900 mb-4">
                            {categories[activeCategory].name}
                          </h3>
                          <div className="grid grid-cols-2 gap-y-4">
                            {categories[activeCategory].subcategories.map((subcat, idx) => (
                              <Link
                                key={idx}
                                to={`/category/${categories[activeCategory].name.toLowerCase().replace(/ /g, '-')}/${subcat.toLowerCase().replace(/ /g, '-')}`}
                                className="text-sm text-neutral-700 hover:text-primary-600 transition-colors duration-200"
                              >
                                {subcat}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Featured categories links */}
            <div className="hidden lg:flex space-x-8 ml-8">
              <Link to="/products" className="py-3 text-sm font-medium text-accent-600 hover:text-accent-700 transition-colors duration-200">
                Products
              </Link>
              <Link to="/deals" className="py-3 text-sm font-medium text-neutral-800 hover:text-primary-600 transition-colors duration-200">
                Today's Deals
              </Link>
              <Link to="/new-arrivals" className="py-3 text-sm font-medium text-neutral-800 hover:text-primary-600 transition-colors duration-200">
                New Arrivals
              </Link>
              <Link to="/best-sellers" className="py-3 text-sm font-medium text-neutral-800 hover:text-primary-600 transition-colors duration-200">
                Best Sellers
              </Link>
              <Link to="/brands" className="py-3 text-sm font-medium text-neutral-800 hover:text-primary-600 transition-colors duration-200">
                Brands
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/deals"
              className="block px-3 py-2 rounded-md text-base font-medium text-accent-600 hover:bg-neutral-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Today's Deals
            </Link>
            
            {categories.map((category, idx) => (
              <div key={idx}>
                <Link
                  to={`/category/${category.name.toLowerCase().replace(/ /g, '-')}`}
                  className="block px-3 py-2 rounded-md text-base font-medium text-neutral-800 hover:bg-neutral-50 hover:text-primary-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {category.name}
                </Link>
              </div>
            ))}
            
            <div className="border-t border-neutral-200 pt-2 mt-2">
              <Link
                to="/track-order"
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-800 hover:bg-neutral-50 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Track Order
              </Link>
              <Link
                to="/help"
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-800 hover:bg-neutral-50 hover:text-primary-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Help Center
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default StoreHeader;