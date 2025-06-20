import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiClock, FiArrowRight, FiPackage, FiCalendar, FiAlertCircle, FiBell, FiFilter } from 'react-icons/fi';
import Breadcrumb from '../../components/common/Breadcrumb';
import ProductService from '../../../shared/services/productService';
import { useCart } from '../../contexts/CartContext';
import { ProductCard } from '../../components/common';

const NewArrivals = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const { addToCart } = useCart();
  
  // Fetch new arrivals and categories from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch recent products (created within last 30 days)
        const productsResponse = await ProductService.getProducts({
          sortBy: 'newest',
          limit: 50,
          inStock: true
        });
        
        // Fetch categories
        const categoriesResponse = await ProductService.getCategories();
        
        if (productsResponse.success) {
          // Filter products to show only truly new ones (within last 30 days)
          const now = new Date();
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          const newProducts = (productsResponse.products || []).filter(product => {
            const createdDate = new Date(product.created_at);
            return createdDate >= thirtyDaysAgo;
          }).map(product => ({
            ...product,
            daysNew: Math.ceil((now - new Date(product.created_at)) / (1000 * 60 * 60 * 24)),
            rating: 4.0 + Math.random() * 1, // Mock rating until we have real reviews
            reviewCount: Math.floor(Math.random() * 50) + 5 // Mock review count for new products
          }));
          
          setProducts(newProducts);
          setFilteredProducts(newProducts);
        } else {
          setError(productsResponse.error || 'Failed to fetch products');
        }
        
        if (categoriesResponse.success) {
          // Get unique categories from products
          const productCategories = [...new Set((productsResponse.products || []).map(p => p.category?.name).filter(Boolean))];
          setCategories(['All', ...productCategories]);
        } else {
          setCategories(['All']);
        }
        
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
        setError('Failed to load new arrivals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Filter products by category
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category?.name === selectedCategory));
    }
  }, [selectedCategory, products]);
  
  // Handle adding items to cart
  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(productId, 1, { 
        dealerId: product.dealer?.id,
        price: product.price 
      });
    }
  };
  
  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]"></div>
            <p className="mt-6 text-neutral-600 font-medium">Loading new arrivals...</p>
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
          
          <div className="mt-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3">
              New <span className="text-secondary-300">Arrivals</span>
            </h1>
            <p className="text-neutral-200 max-w-2xl">
              Discover the latest auto parts and accessories that have just arrived in our inventory. 
              Stay ahead with cutting-edge products for your vehicle.
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{products.length}</div>
              <div className="text-sm text-neutral-200">New Products</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{categories.length - 1}</div>
              <div className="text-sm text-neutral-200">Categories</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {products.filter(p => p.daysNew <= 7).length}
              </div>
              <div className="text-sm text-neutral-200">This Week</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {products.filter(p => p.daysNew <= 1).length}
              </div>
              <div className="text-sm text-neutral-200">Today</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category filters */}
        {categories.length > 1 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <FiFilter className="text-secondary-600 mr-2" size={18} />
              <h3 className="text-lg font-medium text-neutral-900">Filter by Category</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-secondary-600 text-white shadow-md'
                      : 'bg-white text-neutral-700 hover:bg-secondary-50 hover:text-secondary-700 border border-neutral-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Products section */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <FiPackage className="text-secondary-600 mr-2" size={22} />
            <h2 className="text-2xl font-bold text-neutral-900 font-display">
              Latest <span className="text-secondary-600">Arrivals</span>
            </h2>
            {selectedCategory !== 'All' && (
              <span className="ml-3 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm">
                {filteredProducts.length} products in {selectedCategory}
              </span>
            )}
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    // Add "NEW" badge for products less than 7 days old
                    isNew: product.daysNew <= 7,
                    tags: product.daysNew <= 7 ? ['NEW'] : []
                  }}
                  onAddToCart={handleAddToCart}
                  showQuickActions={true}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-luxury p-8 text-center border border-neutral-100">
              <FiAlertCircle className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No products found</h3>
              <p className="text-neutral-600">
                {selectedCategory === 'All' 
                  ? 'No new arrivals at the moment. Check back soon for the latest products!'
                  : `No new arrivals in the ${selectedCategory} category yet.`
                }
              </p>
              {selectedCategory !== 'All' && (
                <button
                  onClick={() => setSelectedCategory('All')}
                  className="mt-4 px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors"
                >
                  View All New Arrivals
                </button>
              )}
            </div>
          )}
        </section>
        
        {/* Coming soon section - Dynamic placeholder */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <FiBell className="text-gold-500 mr-2" size={22} />
            <h2 className="text-2xl font-bold text-neutral-900 font-display">
              Coming <span className="text-gold-500">Soon</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder coming soon items */}
            {[1, 2, 3, 4].map((item, index) => (
              <div key={item} className="bg-white rounded-lg shadow-card border border-neutral-100 overflow-hidden">
                <div className="relative">
                  <img
                    src={`https://images.unsplash.com/photo-${1581092918056 + index}?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80`}
                    alt="Coming Soon"
                    className="w-full h-52 object-cover"
                  />
                  <div className="absolute inset-0 bg-neutral-900/60 flex items-center justify-center">
                    <div className="text-center">
                      <FiClock className="mx-auto text-white mb-2" size={24} />
                      <p className="text-white font-medium">Coming Soon</p>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-neutral-800 mb-2">New Product Category</h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    Exciting new auto parts are on their way. Stay tuned for updates!
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-500">Expected Soon</span>
                    <button className="px-3 py-1 bg-gold-100 text-gold-700 rounded-md text-sm font-medium">
                      Notify Me
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Newsletter signup */}
        <section className="bg-gradient-to-r from-secondary-800 to-secondary-900 rounded-xl p-6 md:p-8 shadow-luxury overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-secondary-300/20 to-transparent opacity-60"></div>
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-gold-400/10 backdrop-blur-xl"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between relative">
            <div className="mb-6 md:mb-0 md:max-w-md">
              <h3 className="text-xl font-bold text-white font-display mb-2">
                Be First to Know About <span className="text-secondary-300">New Arrivals</span>
              </h3>
              <p className="text-neutral-200">
                Subscribe to get notifications when new products arrive in our inventory.
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
                  className="bg-secondary-600 text-white px-4 py-3 rounded-r-lg font-medium hover:bg-secondary-700 transition-colors whitespace-nowrap"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default NewArrivals; 