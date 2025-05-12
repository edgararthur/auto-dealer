import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiFilter, FiChevronDown, FiCheckCircle, FiAward, FiLayers } from 'react-icons/fi';
import Breadcrumb from '../../components/common/Breadcrumb';

// Mock data for best selling products
const bestSellingProducts = [
  {
    id: 101,
    name: 'OEM Replacement Brake Pads',
    category: 'Brakes',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 328,
    salesCount: 1245,
    brand: 'Bosch'
  },
  {
    id: 102,
    name: 'High Performance Oil Filter',
    category: 'Engine',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 256,
    salesCount: 982,
    brand: 'K&N'
  },
  {
    id: 103,
    name: 'Spark Plug Set (Set of 4)',
    category: 'Engine',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1563299796-17596ed6b017?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 189,
    salesCount: 876,
    brand: 'NGK'
  },
  {
    id: 104,
    name: 'Premium Car Battery',
    category: 'Electrical',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1565689157206-0fddef7589a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 324,
    salesCount: 856,
    brand: 'AC Delco'
  },
  {
    id: 105,
    name: 'Synthetic Motor Oil (5 Quarts)',
    category: 'Engine',
    price: 32.99,
    image: 'https://images.unsplash.com/photo-1635270364846-5e3190b48026?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 278,
    salesCount: 845,
    brand: 'Mobil'
  },
  {
    id: 106,
    name: 'Wiper Blade Set',
    category: 'Exterior',
    price: 22.99,
    image: 'https://images.unsplash.com/photo-1594641976603-c8344661c8fc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.6,
    reviewCount: 187,
    salesCount: 812,
    brand: 'Bosch'
  },
  {
    id: 107,
    name: 'Cabin Air Filter',
    category: 'HVAC',
    price: 16.99,
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 204,
    salesCount: 798,
    brand: 'Denso'
  },
  {
    id: 108,
    name: 'Wheel Bearing Kit',
    category: 'Suspension',
    price: 54.99,
    image: 'https://images.unsplash.com/photo-1562426508-a52ab956ae2c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 156,
    salesCount: 753,
    brand: 'Moog'
  },
  {
    id: 109,
    name: 'Headlight Bulb Set',
    category: 'Lighting',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.6,
    reviewCount: 183,
    salesCount: 742,
    brand: 'Philips'
  },
  {
    id: 110,
    name: 'All-Weather Floor Mats',
    category: 'Interior',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1582639510494-c80b5de9f148?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 315,
    salesCount: 735,
    brand: 'WeatherTech'
  },
  {
    id: 111,
    name: 'Brake Rotors (Pair)',
    category: 'Brakes',
    price: 69.99,
    image: 'https://images.unsplash.com/photo-1588169770457-8bfc2de92556?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 197,
    salesCount: 721,
    brand: 'Brembo'
  },
  {
    id: 112,
    name: 'Alternator',
    category: 'Electrical',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 176,
    salesCount: 698,
    brand: 'Denso'
  }
];

// Available categories for filtering
const categories = [
  'All',
  'Engine',
  'Brakes',
  'Electrical',
  'Suspension',
  'Interior',
  'Exterior',
  'Lighting',
  'HVAC'
];

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-card hover:shadow-luxury transition-all duration-300 overflow-hidden relative group border border-neutral-100">
      {product.salesCount > 1000 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-gradient-gold text-neutral-900 text-xs font-bold shadow-gold">
            <FiAward className="mr-1" size={12} /> Top Seller
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
      
      {/* Sales count badge */}
      <div className="absolute bottom-[160px] right-3">
        <span className="inline-flex items-center px-2 py-1 rounded-md bg-neutral-800/80 text-white text-xs backdrop-blur-sm">
          {product.salesCount.toLocaleString()} sold
        </span>
      </div>
      
      {/* Product info */}
      <div className="p-5 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-success-50/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
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
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-neutral-900">${product.price.toFixed(2)}</span>
          
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

const BestSellers = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('sales');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const handleAddToCart = (productId) => {
    // In a real implementation, this would add the item to the cart
    console.log(`Added product ${productId} to cart`);
  };
  
  // Filter products by category
  const filteredProducts = activeCategory === 'All' 
    ? bestSellingProducts 
    : bestSellingProducts.filter(product => product.category === activeCategory);
  
  // Sort products based on selected option
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'sales') return b.salesCount - a.salesCount;
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });
  
  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Page header */}
      <div className="bg-gradient-luxury pt-10 pb-12 px-4 sm:px-6 lg:px-8 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80')] bg-no-repeat bg-cover bg-center"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-900/40 via-primary-800/20 to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-radial from-success-500/20 to-transparent opacity-70"></div>
        
        <div className="absolute bottom-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto opacity-10">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L34.3,106.7C68.6,117,137,139,206,149.3C274.3,160,343,160,411,149.3C480,139,549,117,617,112C685.7,107,754,117,823,138.7C891.4,160,960,192,1029,197.3C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <Breadcrumb
            items={[
              { label: 'Best Sellers', path: '/best-sellers' }
            ]}
          />
          
          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3">Best <span className="text-gold-300">Selling Products</span></h1>
            <p className="text-neutral-200 max-w-2xl">
              Discover our most popular auto parts trusted by mechanics and car enthusiasts alike.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Filters and sorting */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-success-600 to-success-500 text-white shadow-md transform scale-105'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 hover:border-success-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Sort options */}
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 bg-white border border-neutral-200 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:border-gold-300 transition-colors"
            >
              <FiFilter size={16} className="text-gold-500" />
              <span>Sort By: </span>
              <span className="font-semibold">
                {sortBy === 'sales' && 'Most Popular'}
                {sortBy === 'rating' && 'Highest Rated'}
                {sortBy === 'price-low' && 'Price: Low to High'}
                {sortBy === 'price-high' && 'Price: High to Low'}
              </span>
              <FiChevronDown size={16} className={`transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-luxury z-10 py-2 animate-fade-in border border-neutral-100">
                <button
                  onClick={() => {
                    setSortBy('sales');
                    setIsFilterOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-left text-neutral-700 hover:bg-neutral-50"
                >
                  {sortBy === 'sales' && <FiCheckCircle className="mr-2 text-success-600" size={16} />}
                  <span className={sortBy === 'sales' ? 'ml-6 font-medium text-success-700' : ''}>Most Popular</span>
                </button>
                
                <button
                  onClick={() => {
                    setSortBy('rating');
                    setIsFilterOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-left text-neutral-700 hover:bg-neutral-50"
                >
                  {sortBy === 'rating' && <FiCheckCircle className="mr-2 text-success-600" size={16} />}
                  <span className={sortBy === 'rating' ? 'ml-6 font-medium text-success-700' : ''}>Highest Rated</span>
                </button>
                
                <button
                  onClick={() => {
                    setSortBy('price-low');
                    setIsFilterOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-left text-neutral-700 hover:bg-neutral-50"
                >
                  {sortBy === 'price-low' && <FiCheckCircle className="mr-2 text-success-600" size={16} />}
                  <span className={sortBy === 'price-low' ? 'ml-6 font-medium text-success-700' : ''}>Price: Low to High</span>
                </button>
                
                <button
                  onClick={() => {
                    setSortBy('price-high');
                    setIsFilterOpen(false);
                  }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-left text-neutral-700 hover:bg-neutral-50"
                >
                  {sortBy === 'price-high' && <FiCheckCircle className="mr-2 text-success-600" size={16} />}
                  <span className={sortBy === 'price-high' ? 'ml-6 font-medium text-success-700' : ''}>Price: High to Low</span>
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Results count */}
        <div className="mb-6 flex items-center text-sm text-neutral-600 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-neutral-200">
          <FiLayers className="mr-2 text-gold-500" size={16} />
          <span>Showing <span className="font-semibold text-primary-700">{sortedProducts.length}</span> products</span>
        </div>
        
        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
        
        {/* Product rankings info banner */}
        <div className="mt-16 bg-gradient-to-r from-neutral-50 to-white rounded-xl p-8 border border-neutral-200 shadow-luxury relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-success-50 to-transparent opacity-50"></div>
          
          <div className="flex items-start md:items-center mb-4 relative">
            <div className="w-12 h-12 rounded-full bg-gradient-gold flex items-center justify-center text-neutral-900 mr-4 shadow-gold">
              <FiAward size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900 font-display">How We <span className="text-success-600">Rank</span> Best Sellers</h3>
              <p className="text-neutral-600 mt-2">
                Our best sellers are determined by sales volume, customer ratings, and repeat purchase rates. 
                This ranking is updated weekly to ensure you're always seeing the most current top products.
                Products labeled as "Top Seller" have sold more than 1,000 units in the past month.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestSellers; 