import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FiX, FiStar, FiShoppingCart, FiTruck, FiShield, FiCheck } from 'react-icons/fi';
import ProductService from '../../../shared/services/productService';
import { useCart } from '../../contexts/CartContext';
import { formatPrice } from '../../utils/priceFormatter';

const ProductComparison = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productIds = searchParams.get('products')?.split(',') || [];
        
        if (productIds.length === 0) {
          setError('No products selected for comparison');
          setLoading(false);
          return;
        }

        const productPromises = productIds.map(id => 
          ProductService.getProductById(id)
        );

        const results = await Promise.all(productPromises);
        const validProducts = results
          .filter(result => result.success)
          .map(result => result.product);

        setProducts(validProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products for comparison:', error);
        setError('Failed to load products for comparison');
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  const removeProduct = (productId) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    
    // Update URL
    const newProductIds = updatedProducts.map(p => p.id).join(',');
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('products', newProductIds);
    window.history.replaceState({}, '', newUrl);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading product comparison...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <Link
            to="/shop"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-medium mb-4">No products to compare</p>
          <Link
            to="/shop"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Comparison</h1>
          <p className="text-gray-600">Compare prices and features from different dealers</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider w-48">
                    Product
                  </th>
                  {products.map((product) => (
                    <th key={product.id} className="px-6 py-4 text-center min-w-80">
                      <div className="relative">
                        <button
                          onClick={() => removeProduct(product.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <FiX size={12} />
                        </button>
                        <div className="h-48 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-contain p-4"
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x300/f8f9fa/6c757d?text=Auto+Part';
                            }}
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          by {product.dealer?.business_name || 'Verified Dealer'}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Price Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Price
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {product.price ? formatPrice(product.price) : 'N/A'}
                      </div>
                      {product.discount_price && (
                        <div className="text-sm text-gray-400 line-through">
                          {formatPrice(product.discount_price)}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Stock Status Row */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Stock Status
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        product.inStock 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.inStock ? (
                          <>
                            <FiCheck className="mr-1" size={12} />
                            In Stock
                          </>
                        ) : (
                          'Out of Stock'
                        )}
                      </span>
                    </td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rating
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center mb-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={16}
                            className={i < Math.floor(product.rating || 4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-600">
                        {product.rating?.toFixed(1) || '4.5'} ({product.reviewCount || 0} reviews)
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Dealer Row */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Dealer
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-gray-900">
                        {product.dealer?.business_name || 'Verified Dealer'}
                      </div>
                      <div className="flex items-center justify-center mt-1">
                        <FiStar size={12} className="text-yellow-400 fill-current mr-1" />
                        <span className="text-xs text-gray-600">
                          {product.dealer?.rating?.toFixed(1) || '4.5'}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Shipping Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Shipping
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center mb-1">
                        <FiTruck className="mr-2 text-blue-500" size={16} />
                        <span className="text-sm text-gray-900">
                          {product.shipping_cost ? `$${product.shipping_cost.toFixed(2)}` : 'Free'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {product.estimated_delivery || '2-3 business days'}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Warranty Row */}
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Warranty
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center">
                        <FiShield className="mr-2 text-green-500" size={16} />
                        <span className="text-sm text-gray-900">
                          {product.warranty || '1 Year'}
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Action
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`inline-flex items-center px-4 py-2 rounded-lg font-semibold transition-colors ${
                          product.inStock
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <FiShoppingCart className="mr-2" size={16} />
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparison Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Comparison Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                1
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Check Total Cost</h4>
                <p className="text-sm text-blue-700">Consider shipping costs when comparing prices</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                2
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Dealer Reputation</h4>
                <p className="text-sm text-blue-700">Higher-rated dealers often provide better service</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                3
              </div>
              <div>
                <h4 className="font-medium text-blue-900">Warranty Coverage</h4>
                <p className="text-sm text-blue-700">Longer warranties provide better protection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison; 