import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiShoppingCart, FiFilter, FiGrid, FiList, FiChevronDown, FiSearch, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import Breadcrumb from '../../components/common/Breadcrumb';
import ProductService from '../../../shared/services/productService';
import { useCart } from '../../contexts/CartContext';
import { ProductCard } from '../../components/common';

const SubcategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [selectedPriceRange, setSelectedPriceRange] = useState({ min: 0, max: 1000 });
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { addToCart } = useCart();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // For now, we'll fetch all products and filter by category/subcategory
        // In a real implementation, you'd pass categorySlug/subcategorySlug to the API
        const productsResponse = await ProductService.getProducts({
          sortBy: 'created_at',
          sortOrder: 'desc',
          limit: 100,
          inStock: true
        });
        
        if (productsResponse.success) {
          const allProducts = productsResponse.products || [];
          
          // Filter products by category slug (convert to readable name)
          const categoryName = categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const filteredProducts = allProducts.filter(product => {
            const productCategory = product.category?.name || '';
            return productCategory.toLowerCase().includes(categoryName.toLowerCase()) ||
                   productCategory.toLowerCase().includes(categorySlug.toLowerCase());
          });
          
          // Calculate price range from actual products
          if (filteredProducts.length > 0) {
            const prices = filteredProducts.map(p => p.price);
            const minPrice = Math.floor(Math.min(...prices));
            const maxPrice = Math.ceil(Math.max(...prices));
            setPriceRange({ min: minPrice, max: maxPrice });
            setSelectedPriceRange({ min: minPrice, max: maxPrice });
          }
          
          // Add additional product metadata
          const enhancedProducts = filteredProducts.map(product => ({
            ...product,
            rating: 3.5 + Math.random() * 1.5, // Random rating between 3.5-5.0
            reviewCount: Math.floor(Math.random() * 200) + 10,
            brand: product.dealer?.company_name || product.dealer?.name || 'Quality Brand',
            isNew: new Date(product.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // New if created within 30 days
          }));
          
          setProducts(enhancedProducts);
          
          // Set category and subcategory info
          setCategory({
            name: categoryName,
            slug: categorySlug
          });
          
          // For subcategory, we'll use the subcategorySlug if provided
          if (subcategorySlug) {
            const subcategoryName = subcategorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            setSubcategory({
              name: subcategoryName,
              slug: subcategorySlug
            });
          }
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [categorySlug, subcategorySlug]);
  
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
  
  // Filter and sort products
  const filteredAndSortedProducts = products
    .filter(product => {
      // Price filter
      if (product.price < selectedPriceRange.min || product.price > selectedPriceRange.max) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return product.name.toLowerCase().includes(searchLower) ||
               product.description?.toLowerCase().includes(searchLower) ||
               product.category?.name.toLowerCase().includes(searchLower);
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price - b.price;
        case 'price_high':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });
  
  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]"></div>
            <p className="mt-6 text-neutral-600 font-medium">Loading products...</p>
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
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80')] bg-no-repeat bg-cover bg-center"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-secondary-900/60 to-transparent opacity-60 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <Breadcrumb
            items={[
              { label: 'Categories', path: '/categories' },
              { label: category?.name || 'Category', path: `/categories/${categorySlug}` },
              ...(subcategory ? [{ label: subcategory.name, path: `/categories/${categorySlug}/${subcategorySlug}` }] : [])
            ]}
          />
          
          <div className="mt-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3">
              {subcategory ? subcategory.name : category?.name || 'Products'}
            </h1>
            <p className="text-neutral-200 max-w-2xl">
              {subcategory 
                ? `Browse our selection of ${subcategory.name.toLowerCase()} in the ${category?.name.toLowerCase()} category.`
                : `Explore all products in the ${category?.name.toLowerCase()} category.`
              } Find the perfect parts for your vehicle.
            </p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{filteredAndSortedProducts.length}</div>
              <div className="text-sm text-neutral-200">Products</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                ${Math.min(...products.map(p => p.price)).toFixed(0)}
              </div>
              <div className="text-sm text-neutral-200">Starting Price</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {Math.floor(products.reduce((sum, p) => sum + p.rating, 0) / products.length * 10) / 10}
              </div>
              <div className="text-sm text-neutral-200">Avg Rating</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {products.filter(p => p.isNew).length}
              </div>
              <div className="text-sm text-neutral-200">New Items</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and filters */}
        <div className="mb-8 bg-white rounded-lg shadow-sm border border-neutral-100 p-6">
          {/* Search bar */}
          <div className="mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Price range */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-700">Price:</span>
                <input
                  type="number"
                  placeholder="Min"
                  value={selectedPriceRange.min}
                  onChange={(e) => setSelectedPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                  className="w-20 px-2 py-1 border border-neutral-200 rounded text-sm"
                />
                <span className="text-neutral-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={selectedPriceRange.max}
                  onChange={(e) => setSelectedPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                  className="w-20 px-2 py-1 border border-neutral-200 rounded text-sm"
                />
              </div>
            </div>
            
            {/* Sort and view controls */}
            <div className="flex items-center gap-4">
              {/* Sort */}
              <div className="flex items-center">
                <span className="text-sm font-medium text-neutral-700 mr-3">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name A-Z</option>
                </select>
              </div>
              
              {/* View mode */}
              <div className="flex border border-neutral-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-white text-neutral-600 hover:bg-neutral-50'}`}
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-neutral-600">
            Showing {filteredAndSortedProducts.length} of {products.length} products
            {searchTerm && (
              <span className="ml-2">
                for "<span className="font-medium">{searchTerm}</span>"
              </span>
            )}
          </div>
        </div>
        
        {/* Products section */}
        <section>
          {filteredAndSortedProducts.length > 0 ? (
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredAndSortedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={{
                    ...product,
                    tags: product.isNew ? ['NEW'] : []
                  }}
                  onAddToCart={handleAddToCart}
                  showQuickActions={true}
                  layout={viewMode}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-luxury p-8 text-center border border-neutral-100">
              <FiAlertCircle className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No products found</h3>
              <p className="text-neutral-600 mb-6">
                {searchTerm 
                  ? `No products match your search for "${searchTerm}".`
                  : 'No products found in this category.'
                }
              </p>
              <div className="flex justify-center gap-4">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Clear Search
                  </button>
                )}
                <Link 
                  to="/products" 
                  className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  Browse All Products
                </Link>
              </div>
            </div>
          )}
        </section>
        
        {/* Category navigation */}
        {!subcategory && (
          <section className="mt-16 bg-white rounded-lg shadow-sm border border-neutral-100 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">
              Explore Related Categories
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Example related categories - would come from API in real implementation */}
              {['Engine', 'Brakes', 'Suspension', 'Electrical'].map(cat => (
                <Link
                  key={cat}
                  to={`/categories/${cat.toLowerCase()}`}
                  className="p-4 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 group"
                >
                  <h4 className="font-medium text-neutral-800 group-hover:text-primary-700">
                    {cat}
                  </h4>
                  <p className="text-sm text-neutral-500 mt-1">
                    Browse {cat.toLowerCase()} parts
                  </p>
                  <FiArrowRight className="mt-2 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all duration-200" size={16} />
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default SubcategoryPage; 