import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiFilter, FiShoppingCart, FiChevronRight, FiBox, FiStar, FiLayers } from 'react-icons/fi';
import Breadcrumb from '../../components/common/Breadcrumb';
import ProductService from '../../../shared/services/productService';
import { useCart } from '../../contexts/CartContext';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-card hover:shadow-luxury transition-all duration-300 overflow-hidden group border border-neutral-100 relative">
      {/* Product image */}
      <Link to={`/products/${product.id}`} className="block overflow-hidden relative">
        <img
          src={product.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80'}
          alt={product.name}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>
      
      {/* Product info */}
      <div className="p-5 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-primary-50/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="text-xs text-neutral-500 mb-2 flex items-center">
          <span className="font-medium text-primary-600">{product.subcategory?.name || product.category?.name}</span>
          <span className="mx-2 text-neutral-300">•</span>
          <span className="font-medium text-neutral-700">{product.dealer?.company_name || product.dealer?.name || 'Unknown Brand'}</span>
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
                className={`w-3.5 h-3.5 ${i < 4 ? 'text-gold-400' : 'text-neutral-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-1.5 text-xs text-neutral-500">({product.reviews?.length || 0})</span>
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

const CategoryPage = () => {
  const { categorySlug } = useParams();
  const [selectedSubcategory, setSelectedSubcategory] = useState('All');
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // First, fetch all categories to find the matching one
        const categoriesResponse = await ProductService.getCategories();
        
        if (categoriesResponse.success) {
          // Find the category from the slug
          const formattedCategorySlug = categorySlug.replace(/-/g, ' ');
          const foundCategory = categoriesResponse.categories.find(
            cat => cat.name.toLowerCase().replace(/\s+/g, '-') === categorySlug.toLowerCase() ||
                   cat.name.toLowerCase() === formattedCategorySlug.toLowerCase()
          );

          if (foundCategory) {
            setCategory({
              ...foundCategory,
              image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80',
              description: `Discover high-quality ${foundCategory.name.toLowerCase()} designed for optimal performance and durability for your vehicle.`
            });
            
            // Set subcategories if available
            setSubcategories(foundCategory.subcategories || []);
            
            // Fetch products for this category
            const productsResponse = await ProductService.getProducts({
              categoryId: foundCategory.id,
              limit: 100
            });
            
            if (productsResponse.success) {
              setProducts(productsResponse.products || []);
            } else {
              setError(productsResponse.error || 'Failed to fetch products');
            }
          } else {
            setError('Category not found');
          }
        } else {
          setError(categoriesResponse.error || 'Failed to fetch categories');
        }
        
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Failed to load category data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      fetchCategoryData();
    }
  }, [categorySlug]);

  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      addToCart(productId, 1, { 
        dealerId: product.dealer?.id,
        price: product.price 
      });
    }
  };

  const handleSubcategorySelect = (subcategory) => {
    setSelectedSubcategory(subcategory);
  };

  // Filter products based on selected subcategory
  const filteredProducts = selectedSubcategory === 'All'
    ? products
    : products.filter(product => 
        product.subcategory?.name === selectedSubcategory ||
        product.subcategory?.id === selectedSubcategory
      );

  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]"></div>
            <p className="mt-6 text-neutral-600 font-medium">Loading category...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="bg-neutral-50 min-h-screen py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">
            {error || 'Category not found'}
          </h1>
          <p className="text-neutral-600 mb-6">
            {error === 'Category not found' 
              ? 'The category you are looking for does not exist.' 
              : 'There was an error loading the category.'}
          </p>
          <div className="space-x-4">
            <Link to="/" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
              Back to Home
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="inline-flex items-center px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors"
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
          <div className="absolute inset-0 bg-no-repeat bg-cover bg-center" style={{backgroundImage: `url(${category.image})`}}></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-900/40 via-primary-800/20 to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-radial from-primary-500/20 to-transparent opacity-70"></div>
        
        <div className="absolute bottom-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto opacity-10">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L34.3,106.7C68.6,117,137,139,206,149.3C274.3,160,343,160,411,149.3C480,139,549,117,617,112C685.7,107,754,117,823,138.7C891.4,160,960,192,1029,197.3C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: category.name, path: `/category/${categorySlug}` }
            ]}
          />
          
          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3">{category.name}</h1>
            <p className="text-neutral-200 max-w-2xl">
              {category.description}
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Subcategory filters */}
        {subcategories.length > 0 && (
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSubcategorySelect('All')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedSubcategory === 'All'
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md transform scale-105'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 hover:border-primary-300'
                }`}
              >
                All Items
              </button>
              
              {subcategories.map(subcategory => (
                <button
                  key={subcategory.id}
                  onClick={() => handleSubcategorySelect(subcategory.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    selectedSubcategory === subcategory.name
                      ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md transform scale-105'
                      : 'bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200 hover:border-primary-300'
                  }`}
                >
                  {subcategory.name}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Results count */}
        <div className="mb-6 flex items-center text-sm text-neutral-600 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-neutral-200">
          <FiLayers className="mr-2 text-gold-500" size={16} />
          <span>Showing <span className="font-semibold text-primary-700">{filteredProducts.length}</span> products</span>
        </div>
        
        {/* Product grid */}
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
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
              <FiBox className="text-neutral-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No products found</h3>
            <p className="text-neutral-600 mb-4">We couldn't find any products matching your criteria.</p>
            <button 
              onClick={() => setSelectedSubcategory('All')}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              View all products
            </button>
          </div>
        )}
        
        {/* Featured subcategories */}
        {subcategories.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-neutral-900 font-display mb-6">Shop by Subcategory</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {subcategories.map(subcategory => (
                <div 
                  key={subcategory.id}
                  className="bg-white rounded-lg shadow-card hover:shadow-luxury border border-neutral-100 overflow-hidden group relative"
                >
                  <div className="p-6 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-100 to-primary-50 flex items-center justify-center mb-4 text-primary-600 group-hover:scale-110 transition-transform duration-300">
                      <FiBox size={24} />
                    </div>
                    
                    <h3 className="text-lg font-bold text-neutral-800 mb-4 font-display">{subcategory.name}</h3>
                    
                    <button
                      onClick={() => handleSubcategorySelect(subcategory.name)}
                      className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 group-hover:underline transition-colors"
                    >
                      View Products
                      <FiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform duration-300" size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage; 