import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  FiFilter, FiGrid, FiList, FiChevronDown, FiArrowLeft, FiArrowRight,
  FiHeart, FiRefreshCw, FiEye, FiStar, FiShoppingCart, FiCheckCircle
} from 'react-icons/fi';

// Services
import ProductService from '../../../shared/services/productService';
import BrandService from '../../../shared/services/brandService';
import CategoryService from '../../../shared/services/categoryService';

// Contexts
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Optimized ProductCard component
const ProductCard = React.memo(({ product, addToCart, addToWishlist }) => (
  <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 group">
    <div className="relative">
      <img 
        src={product.image || `https://via.placeholder.com/300x250?text=${encodeURIComponent(product.name)}`} 
        alt={product.name}
        className="w-full h-56 object-cover rounded-t-lg"
        loading="lazy"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/300x250?text=Auto+Part';
        }}
      />
      <div className="absolute top-3 left-3 flex gap-2">
        {product.oldPrice && (
          <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded font-medium">Sale</span>
        )}
        {product.isNew && (
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded font-medium">New!</span>
        )}
      </div>
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => addToWishlist(product)}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          title="Add to Wishlist"
        >
          <FiHeart className="w-4 h-4" />
        </button>
        <Link 
          to={`/products/${product.id}`}
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          title="View Product"
        >
          <FiEye className="w-4 h-4" />
        </Link>
      </div>
    </div>
    <div className="p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-3 line-clamp-2 min-h-[2.5rem]">
        {product.name}
      </h3>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          {product.oldPrice && (
            <span className="text-sm text-gray-500 line-through mb-1">
              GHS {product.oldPrice.toFixed(2)}
            </span>
          )}
          <span className="text-xl font-bold text-blue-600">
            GHS {product.price.toFixed(2)}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 mb-1">Stock</div>
          <div className={`text-sm font-medium ${
            product.stock_quantity > 10 ? 'text-green-600' : 
            product.stock_quantity > 0 ? 'text-orange-600' : 'text-red-600'
          }`}>
            {product.stock_quantity} units
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => addToCart(product)}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-gray-400"
        disabled={!product.inStock}
      >
        {product.inStock ? (
          <>
            <FiShoppingCart className="w-4 h-4" />
            Add to Cart
          </>
        ) : (
          'Out of Stock'
        )}
      </button>
    </div>
  </div>
));

const OptimizedShopPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 12;

  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  // Debounce price range
  const debouncedPriceRange = useDebounce(priceRange, 500);

  // Memoized filters
  const filters = useMemo(() => ({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || null,
    brand: searchParams.get('brand') || null,
    page: currentPage,
    limit: productsPerPage,
    sortBy: sortBy === 'relevance' ? 'newest' : sortBy,
    minPrice: debouncedPriceRange[0] > 0 ? debouncedPriceRange[0] : null,
    maxPrice: debouncedPriceRange[1] < 5000 ? debouncedPriceRange[1] : null,
    inStock: true,
    ...(selectedBrands.length > 0 && { brand: selectedBrands[0] }),
    ...(selectedCategories.length > 0 && { category: selectedCategories[0] })
  }), [searchParams, currentPage, sortBy, debouncedPriceRange, selectedBrands, selectedCategories]);

  // Load products
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const result = await ProductService.getProducts(filters);
      
      if (result.success !== false) {
        setProducts(result.products || []);
        setTotalProducts(result.count || 0);
      } else {
        setProducts([]);
        setTotalProducts(0);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
      setTotalProducts(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Load filters once
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [brandsResult, categoriesResult] = await Promise.all([
          BrandService.getBrands(),
          CategoryService.getCategories()
        ]);
        
        setBrands(brandsResult?.brands || []);
        setCategories(categoriesResult?.categories || []);
      } catch (error) {
        console.error('Error loading filters:', error);
      }
    };

    loadFilters();
  }, []);

  // Handlers
  const handleBrandChange = useCallback((brandId) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(b => b !== brandId)
        : [...prev, brandId]
    );
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Calculations
  const totalPages = useMemo(() => Math.ceil(totalProducts / productsPerPage), [totalProducts]);
  
  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-blue-600 hover:text-blue-700">Home</Link>
            <span className="text-gray-500">›</span>
            <span className="text-gray-900">Shop</span>
          </nav>
        </div>
      </div>

      {/* Simplified Hero */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Find Quality Auto Parts</h1>
          <p className="text-xl">Search from thousands of parts from trusted dealers across Ghana.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Simplified Sidebar */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Categories */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <div className="bg-gray-800 text-white p-4 rounded-t-lg">
                <h3 className="font-semibold">Categories</h3>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryChange(category.id)}
                      className="mr-3 rounded border-gray-300 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brands */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4">
                <h3 className="font-semibold mb-4">Brands</h3>
                <div className="max-h-64 overflow-y-auto">
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.id)}
                        onChange={() => handleBrandChange(brand.id)}
                        className="mr-2 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{brand.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <FiFilter className="mr-2" size={16} />
                    Filters
                  </button>
                  <span className="text-gray-600">
                    Showing {((currentPage - 1) * productsPerPage) + 1}-{Math.min(((currentPage - 1) * productsPerPage) + products.length, totalProducts)} of {totalProducts} results
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Sort by latest</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>

                  <div className="flex border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <FiGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <FiList size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-300 h-56 rounded-t-lg"></div>
                    <div className="bg-white p-4 rounded-b-lg">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-1'
              }`}>
                {products.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    addToCart={addToCart}
                    addToWishlist={addToWishlist}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiArrowLeft size={16} />
                  </button>
                  
                  {pageNumbers.map((page, index) => (
                    page === '...' ? (
                      <span key={index} className="px-4 py-2 text-gray-500">...</span>
                    ) : (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        className={`px-4 py-2 border rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <FiArrowRight size={16} />
                  </button>
                </div>
                
                <div className="text-center mt-4 text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalProducts} total results)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OptimizedShopPage; 