import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2, FiShare2, FiBarChart, FiEye } from 'react-icons/fi';
import ProductService from '../../../shared/services/productService';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      // This would be replaced with actual wishlist service call
      const response = await ProductService.getUserWishlist(user.id);
      if (response.success) {
        setWishlistItems(response.wishlist || []);
      } else {
        // Fallback to localStorage for demo
        const savedWishlist = JSON.parse(localStorage.getItem('autora_wishlist') || '[]');
        if (savedWishlist.length > 0) {
          const productPromises = savedWishlist.map(id => ProductService.getProductById(id));
          const results = await Promise.all(productPromises);
          const products = results
            .filter(result => result.success)
            .map(result => result.product);
          setWishlistItems(products);
        }
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      setError('Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      // Update UI immediately
      setWishlistItems(prev => prev.filter(item => item.id !== productId));
      
      // Update backend/localStorage
      if (user) {
        // This would be replaced with actual API call
        console.log('Removing from wishlist:', productId);
      } else {
        const savedWishlist = JSON.parse(localStorage.getItem('autora_wishlist') || '[]');
        const updatedWishlist = savedWishlist.filter(id => id !== productId);
        localStorage.setItem('autora_wishlist', JSON.stringify(updatedWishlist));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      // Revert UI change on error
      fetchWishlist();
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleSelectItem = (productId) => {
    setSelectedItems(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.id));
    }
  };

  const handleBulkRemove = () => {
    selectedItems.forEach(productId => {
      removeFromWishlist(productId);
    });
    setSelectedItems([]);
  };

  const handleBulkAddToCart = () => {
    const selectedProducts = wishlistItems.filter(item => selectedItems.includes(item.id));
    selectedProducts.forEach(product => {
      addToCart(product);
    });
    setSelectedItems([]);
  };

  const handleCompareSelected = () => {
    if (selectedItems.length < 2) {
      alert('Please select at least 2 products to compare');
      return;
    }
    if (selectedItems.length > 4) {
      alert('You can compare up to 4 products at a time');
      return;
    }
    
    const compareUrl = `/compare?products=${selectedItems.join(',')}`;
    window.open(compareUrl, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiHeart size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view your wishlist</h2>
          <p className="text-gray-600 mb-6">Save your favorite products and access them anywhere</p>
          <Link
            to="/auth/login"
            className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-6 text-gray-600 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error}</p>
          <button
            onClick={fetchWishlist}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <FiHeart size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Save products you love to buy them later</p>
            <Link
              to="/shop"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'product' : 'products'} saved
          </p>
        </div>

        {/* Bulk Actions */}
        {wishlistItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === wishlistItems.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Select all ({wishlistItems.length})
                  </span>
                </label>
                {selectedItems.length > 0 && (
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedItems.length} selected
                  </span>
                )}
              </div>

              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBulkAddToCart}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <FiShoppingCart className="mr-1" size={14} />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleCompareSelected}
                    disabled={selectedItems.length < 2}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiBarChart className="mr-1" size={14} />
                    Compare
                  </button>
          <button 
                    onClick={handleBulkRemove}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 transition-colors"
          >
                    <FiTrash2 className="mr-1" size={14} />
                    Remove
          </button>
                </div>
              )}
            </div>
        </div>
      )}

        {/* Wishlist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
              {/* Selection Checkbox */}
              <div className="absolute top-3 left-3 z-10">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(product.id)}
                  onChange={() => handleSelectItem(product.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              {/* Remove Button */}
              <button
                onClick={() => removeFromWishlist(product.id)}
                className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors group"
              >
                <FiHeart size={16} className="text-red-500 fill-current group-hover:text-red-600" />
              </button>

              {/* Product Image */}
              <div className="relative">
                <div className="h-64 bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-4 hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300/f8f9fa/6c757d?text=Auto+Part';
                    }}
                  />
                </div>
                
                {/* Quick Actions Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <FiEye size={16} className="text-gray-600" />
                        </Link>
                        <button
                      onClick={() => {
                        const compareUrl = `/compare?products=${product.id}`;
                        window.open(compareUrl, '_blank');
                      }}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <FiBarChart size={16} className="text-gray-600" />
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors">
                      <FiShare2 size={16} className="text-gray-600" />
                        </button>
                  </div>
                      </div>
                    </div>
                    
              {/* Product Info */}
              <div className="p-6">
                <Link to={`/products/${product.id}`}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                </Link>

                {/* Dealer Info */}
                <div className="flex items-center mb-3">
                  <div className="text-sm text-gray-600">
                    by {product.dealer?.business_name || 'Verified Dealer'}
                  </div>
                    </div>
                    
                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-green-600">
                        ${product.price?.toFixed(2) || '99.99'}
                      </span>
                      {product.oldPrice && (
                        <span className="text-gray-400 line-through text-sm">
                          ${product.oldPrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      product.inStock 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.inStock}
                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold transition-colors ${
                      product.inStock
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <FiShoppingCart className="mr-2" size={16} />
                    {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="mt-12 bg-white rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">You might also like</h3>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Discover more products based on your wishlist</p>
            <Link
              to="/shop"
              className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Browse Similar Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wishlist; 