import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiClock, FiArrowRight, FiPackage, FiCalendar, FiAlertCircle, FiBell } from 'react-icons/fi';
import Breadcrumb from '../../components/common/Breadcrumb';

// Mock data for new arrival products
const newArrivals = [
  {
    id: 201,
    name: 'Next-Gen Electric Water Pump',
    category: 'Engine',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 12,
    brand: 'GermanTech',
    daysNew: 3
  },
  {
    id: 202,
    name: 'Ceramic Brake Pads (Set of 4)',
    category: 'Brakes',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1588169770457-8bfc2de92556?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 5.0,
    reviewCount: 8,
    brand: 'BrakeMaster',
    daysNew: 5
  },
  {
    id: 203,
    name: 'Smart Battery Monitor',
    category: 'Electronics',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1617886322168-72b886573c6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 15,
    brand: 'AutoTech',
    daysNew: 2
  },
  {
    id: 204,
    name: 'Carbon Fiber Hood Vent',
    category: 'Exterior',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 7,
    brand: 'RaceTech',
    daysNew: 1
  },
  {
    id: 205,
    name: 'Advanced TPMS Sensors (Set of 4)',
    category: 'Electronics',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1586610724347-e8be08b96264?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.6,
    reviewCount: 11,
    brand: 'PressurePro',
    daysNew: 7
  },
  {
    id: 206,
    name: 'Eco-Friendly Cabin Air Filter',
    category: 'Interior',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 9,
    brand: 'GreenAir',
    daysNew: 4
  },
  {
    id: 207,
    name: 'Ultra-Bright LED Conversion Kit',
    category: 'Lighting',
    price: 149.99,
    image: 'https://images.unsplash.com/photo-1519566657253-e37fbaa3bad6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 5.0,
    reviewCount: 14,
    brand: 'LumaTech',
    daysNew: 6
  },
  {
    id: 208,
    name: 'Smartphone Car Mount with Wireless Charging',
    category: 'Accessories',
    price: 44.99,
    image: 'https://images.unsplash.com/photo-1583811459920-1c68b59321e5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 18,
    brand: 'DriveCharge',
    daysNew: 2
  }
];

// Coming soon products
const comingSoonProducts = [
  {
    id: 301,
    name: 'AI-Powered Engine Diagnostic Tool',
    category: 'Tools',
    expectedPrice: 299.99,
    image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    brand: 'SmartDiag',
    daysUntilRelease: 14
  },
  {
    id: 302,
    name: 'Solar-Powered Car Ventilation System',
    category: 'Electronics',
    expectedPrice: 79.99,
    image: 'https://images.unsplash.com/photo-1553260168-69b041873e53?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    brand: 'EcoVent',
    daysUntilRelease: 7
  },
  {
    id: 303,
    name: 'Advanced Ceramic Coating Kit',
    category: 'Detailing',
    expectedPrice: 149.99,
    image: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    brand: 'ShieldPro',
    daysUntilRelease: 21
  },
  {
    id: 304,
    name: 'Graphene Battery Booster',
    category: 'Electrical',
    expectedPrice: 89.99,
    image: 'https://images.unsplash.com/photo-1573346544140-d9823a0c3d33?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    brand: 'PowerGraph',
    daysUntilRelease: 30
  }
];

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-card hover:shadow-luxury transition-all duration-300 overflow-hidden relative group border border-neutral-100">
      {/* New badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-gradient-to-r from-secondary-600 to-secondary-500 text-white text-xs font-bold shadow-md">
          NEW
        </span>
      </div>
      
      {/* Days new badge */}
      {product.daysNew && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-neutral-800 text-white text-xs font-bold shadow-md backdrop-blur-sm">
            <FiClock className="mr-1" size={12} />
            {product.daysNew === 1 ? 'Today' : `${product.daysNew}d ago`}
          </span>
        </div>
      )}
      
      {/* Product image */}
      <Link to={`/products/${product.id}`} className="block overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>
      
      {/* Product info */}
      <div className="p-5 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-secondary-50/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="text-xs text-neutral-500 mb-2 flex items-center">
          <span className="font-medium text-primary-600">{product.category}</span>
          <span className="mx-2 text-neutral-300">•</span>
          <span className="font-medium text-neutral-700">{product.brand}</span>
        </div>
        
        <Link to={`/products/${product.id}`} className="block mb-3">
          <h3 className="text-sm font-bold text-neutral-800 hover:text-primary-600 line-clamp-2 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-gold-400' : 'text-neutral-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1.5 text-xs text-neutral-500">({product.reviewCount})</span>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          {product.price ? (
            <span className="text-xl font-bold text-neutral-900">${product.price.toFixed(2)}</span>
          ) : (
            <span className="text-sm font-medium text-neutral-500">Coming Soon</span>
          )}
          
          <button
            onClick={() => onAddToCart(product.id)}
            className="p-2.5 rounded-full bg-neutral-100 text-primary-600 hover:bg-primary-100 transition-colors duration-200 hover:shadow-inner"
            aria-label="Add to cart"
          >
            <FiShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ComingSoonCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-card hover:shadow-luxury transition-all duration-300 overflow-hidden relative group border border-neutral-100">
      {/* Coming Soon badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-gradient-gold text-neutral-900 text-xs font-bold shadow-gold">
          Coming Soon
        </span>
      </div>
      
      {/* Days until release badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-neutral-800 text-white text-xs font-bold shadow-md backdrop-blur-sm">
          <FiCalendar className="mr-1" size={12} />
          {product.daysUntilRelease} days
        </span>
      </div>
      
      {/* Product image with overlay */}
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-52 object-cover filter grayscale-[40%] group-hover:grayscale-0 transition-all duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-800/40 to-transparent"></div>
      </div>
      
      {/* Product info */}
      <div className="p-5 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-primary-50/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="text-xs text-neutral-500 mb-2 flex items-center">
          <span className="font-medium text-primary-600">{product.category}</span>
          <span className="mx-2 text-neutral-300">•</span>
          <span className="font-medium text-neutral-700">{product.brand}</span>
        </div>
        
        <h3 className="text-sm font-bold text-neutral-800 mb-4 line-clamp-2">
          {product.name}
        </h3>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xs text-neutral-500 block mb-1">Expected Price</span>
            <span className="text-lg font-bold text-neutral-700">${product.expectedPrice.toFixed(2)}</span>
          </div>
          
          <button
            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary-50 to-primary-100 text-primary-600 rounded-full text-xs font-medium hover:from-primary-100 hover:to-primary-200 transition-colors duration-200"
          >
            <FiBell className="mr-1" size={12} />
            Notify Me
          </button>
        </div>
      </div>
    </div>
  );
};

const NewArrivals = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const handleAddToCart = (productId) => {
    // In a real implementation, this would add the item to the cart
    console.log(`Added product ${productId} to cart`);
  };
  
  // Filter products based on selected category
  const filteredProducts = selectedCategory === 'All'
    ? newArrivals
    : newArrivals.filter(product => product.category === selectedCategory);
  
  // Get unique categories from products
  const categories = ['All', ...new Set(newArrivals.map(product => product.category))];
  
  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Page header */}
      <div className="bg-gradient-luxury pt-10 pb-12 px-4 sm:px-6 lg:px-8 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80')] bg-no-repeat bg-cover bg-center"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-secondary-900/40 via-secondary-800/20 to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="absolute -top-24 left-1/3 w-64 h-64 rounded-full bg-gradient-radial from-secondary-500/20 to-transparent opacity-70"></div>
        
        <div className="absolute -bottom-10 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto opacity-10">
            <path fill="#ffffff" fillOpacity="1" d="M0,192L48,165.3C96,139,192,85,288,80C384,75,480,117,576,154.7C672,192,768,224,864,213.3C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <Breadcrumb
            items={[
              { label: 'New Arrivals', path: '/new-arrivals' }
            ]}
          />
          
          <div className="mt-6 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3"><span className="text-gold-300">New</span> Arrivals</h1>
            <p className="text-neutral-200 max-w-2xl">
              Discover our latest additions to keep your vehicle running at peak performance with cutting-edge automotive technology.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category filters */}
        <div className="mb-8 flex flex-wrap gap-2 bg-white p-4 rounded-lg shadow-sm border border-neutral-100">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-secondary-600 to-secondary-500 text-white shadow-md transform scale-105'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 hover:border-secondary-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Featured new arrivals section */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <FiPackage className="text-secondary-600 mr-2" size={22} />
            <h2 className="text-2xl font-bold text-neutral-900 font-display">Latest <span className="text-secondary-600">Arrivals</span></h2>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-luxury p-8 text-center border border-neutral-100">
              <FiAlertCircle className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No products found</h3>
              <p className="text-neutral-600">There are no new arrivals in this category yet.</p>
            </div>
          )}
        </section>
        
        {/* Coming soon section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FiCalendar className="text-primary-600 mr-2" size={22} />
              <h2 className="text-2xl font-bold text-neutral-900 font-display">Coming <span className="text-gold-500">Soon</span></h2>
            </div>
            
            <Link to="/upcoming-releases" className="text-primary-600 hover:text-primary-700 flex items-center font-medium group">
              View All <FiArrowRight className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoonProducts.map(product => (
              <ComingSoonCard key={product.id} product={product} />
            ))}
          </div>
        </section>
        
        {/* Notification sign-up */}
        <div className="bg-gradient-to-r from-secondary-900 to-secondary-800 rounded-xl p-8 shadow-luxury overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-secondary-300/20 to-transparent opacity-60"></div>
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-primary-500/10 backdrop-blur-xl"></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 rounded-full bg-gold-400/30 backdrop-blur-sm"></div>
          <div className="absolute bottom-1/4 left-1/3 w-4 h-4 rounded-full bg-secondary-400/20 backdrop-blur-sm"></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:max-w-md">
              <h3 className="text-xl font-bold text-white mb-3 font-display">Never Miss <span className="text-gold-300">New Products</span></h3>
              <p className="text-neutral-200 mb-0">
                Sign up for notifications about new arrivals and upcoming releases. Be the first to know when exciting products are available.
              </p>
            </div>
            
            <form className="w-full md:w-auto">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-3 rounded-l-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-secondary-300"
                />
                <button
                  type="submit"
                  className="bg-gradient-gold text-neutral-900 px-4 py-3 rounded-r-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap shadow-gold"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewArrivals; 