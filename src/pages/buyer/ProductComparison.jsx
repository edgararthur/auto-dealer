import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiX, FiShoppingCart, FiHeart } from 'react-icons/fi';
import ProductService from '../../../shared/services/productService';
import { Breadcrumb, Button, EmptyState, Rating } from '../../components/common';
import { useComparison } from '../../contexts/ComparisonContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';

const ProductComparison = () => {
  const navigate = useNavigate();
  const { comparisonItems, removeFromComparison, clearComparison } = useComparison();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      if (comparisonItems.length === 0) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const productPromises = comparisonItems.map(id => 
          ProductService.getProductById(id)
        );
        
        const results = await Promise.all(productPromises);
        const fetchedProducts = results
          .filter(res => res.success && res.product)
          .map(res => res.product);
          
        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products for comparison:', err);
        setError('Failed to load products for comparison. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [comparisonItems]);

  // Collect all possible specification keys across all products
  const getSpecificationKeys = () => {
    const keys = new Set();
    products.forEach(product => {
      if (product.specifications) {
        product.specifications.forEach(spec => {
          keys.add(spec.name);
        });
      }
    });
    return Array.from(keys);
  };
  
  const specificationKeys = getSpecificationKeys();
  
  // Find specification value for a product
  const getSpecValue = (product, specName) => {
    if (!product.specifications) return '-';
    
    const spec = product.specifications.find(s => s.name === specName);
    return spec ? spec.value : '-';
  };
  
  // Handle removing a product from comparison
  const handleRemoveProduct = (productId) => {
    removeFromComparison(productId);
  };
  
  // Handle adding to cart
  const handleAddToCart = (productId) => {
    addToCart(productId, 1);
  };
  
  // Handle adding to wishlist
  const handleAddToWishlist = (productId) => {
    addToWishlist(productId);
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  // If comparison is empty
  if (comparisonItems.length === 0 || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="No Products to Compare"
          description="Add products to compare them side by side."
          actionText="Browse Products"
          actionLink="/products"
        />
      </div>
    );
  }

  // If error occurred
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
        <div className="mt-6 text-center">
          <Button onClick={() => window.location.reload()} variant="primary">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={[
            { name: 'Home', url: '/' },
            { name: 'Products', url: '/products' },
            { name: 'Compare', url: '#' }
          ]} />
        </div>
        
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center text-neutral-500 hover:text-primary-600 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          <span>Back</span>
        </button>
        
        {/* Comparison header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Product Comparison</h1>
          <Button onClick={clearComparison} variant="secondary" size="small">
            Clear All
          </Button>
        </div>
        
        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* Header row with product info */}
            <thead>
              <tr>
                <th className="w-48 p-4 bg-neutral-50 border"></th>
                {products.map(product => (
                  <th key={product.id} className="p-4 border text-left relative min-w-[250px]">
                    <button 
                      onClick={() => handleRemoveProduct(product.id)}
                      className="absolute top-2 right-2 p-1 text-neutral-400 hover:text-red-500"
                      aria-label="Remove from comparison"
                    >
                      <FiX />
                    </button>
                    <Link 
                      to={`/products/${product.id}`} 
                      className="block hover:text-primary-600"
                    >
                      <div className="flex justify-center mb-4">
                        <img 
                          src={product.image || 'https://via.placeholder.com/150'}
                          alt={product.name}
                          className="h-32 w-32 object-contain"
                        />
                      </div>
                      <h2 className="font-medium text-lg mb-2">{product.name}</h2>
                    </Link>
                    {product.reviews && product.reviews.length > 0 && (
                      <div className="flex items-center mb-2">
                        <Rating 
                          value={product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length} 
                          size="small" 
                        />
                        <span className="text-sm text-neutral-500 ml-2">
                          ({product.reviews.length})
                        </span>
                      </div>
                    )}
                    <div className="mb-4 text-lg font-bold text-primary-700">
                      ${product.price.toFixed(2)}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleAddToCart(product.id)}
                        variant="primary"
                        size="small"
                        className="flex-1"
                      >
                        <FiShoppingCart className="mr-1" size={14} />
                        Add
                      </Button>
                      <Button
                        onClick={() => handleAddToWishlist(product.id)}
                        variant="outline"
                        size="small"
                        className={`${isInWishlist(product.id) ? 'text-accent-500' : ''}`}
                      >
                        <FiHeart className={`${isInWishlist(product.id) ? 'fill-accent-500' : ''}`} />
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Description row */}
              <tr>
                <td className="p-4 bg-neutral-50 border font-medium">Description</td>
                {products.map(product => (
                  <td key={product.id} className="p-4 border text-sm">
                    {product.short_description || product.description?.substring(0, 150) + '...'}
                  </td>
                ))}
              </tr>
              
              {/* Brand row */}
              <tr>
                <td className="p-4 bg-neutral-50 border font-medium">Brand</td>
                {products.map(product => (
                  <td key={product.id} className="p-4 border">
                    {product.brand?.name || '-'}
                  </td>
                ))}
              </tr>
              
              {/* Features row */}
              <tr>
                <td className="p-4 bg-neutral-50 border font-medium">Features</td>
                {products.map(product => (
                  <td key={product.id} className="p-4 border">
                    {product.features && product.features.length > 0 ? (
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        {product.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    ) : (
                      '-'
                    )}
                  </td>
                ))}
              </tr>
              
              {/* Availability row */}
              <tr>
                <td className="p-4 bg-neutral-50 border font-medium">Availability</td>
                {products.map(product => (
                  <td key={product.id} className="p-4 border">
                    {product.inStock !== false ? (
                      <span className="text-emerald-600 font-medium">In Stock</span>
                    ) : (
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    )}
                  </td>
                ))}
              </tr>
              
              {/* Specifications rows */}
              {specificationKeys.length > 0 && (
                <>
                  <tr>
                    <td colSpan={products.length + 1} className="p-4 bg-neutral-100 border font-bold">
                      Specifications
                    </td>
                  </tr>
                  {specificationKeys.map(specKey => (
                    <tr key={specKey}>
                      <td className="p-4 bg-neutral-50 border font-medium">{specKey}</td>
                      {products.map(product => (
                        <td key={product.id} className="p-4 border">
                          {getSpecValue(product, specKey)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison; 