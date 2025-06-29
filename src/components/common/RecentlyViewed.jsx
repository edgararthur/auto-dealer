import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiX, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useToast } from '../../contexts/ToastContext';
import { formatPrice } from '../../utils/priceFormatter';

const RECENTLY_VIEWED_KEY = 'recentlyViewed';
const MAX_RECENT_ITEMS = 10;

const RecentlyViewed = ({ className = '' }) => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isMinimized, setIsMinimized] = useState(false);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { showSuccess } = useToast();

  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = useCallback(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed);
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  }, []);

  const addToRecentlyViewed = useCallback((product) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      let recentItems = stored ? JSON.parse(stored) : [];

      // Remove if already exists
      recentItems = recentItems.filter(item => item.id !== product.id);

      // Add to beginning
      recentItems.unshift({
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        brand: product.brand,
        dealer: product.dealer,
        viewedAt: new Date().toISOString()
      });

      // Keep only max items
      recentItems = recentItems.slice(0, MAX_RECENT_ITEMS);

      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentItems));
      setRecentlyViewed(recentItems);
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
  }, []);

  const removeFromRecentlyViewed = useCallback((productId) => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        let recentItems = JSON.parse(stored);
        recentItems = recentItems.filter(item => item.id !== productId);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentItems));
        setRecentlyViewed(recentItems);
      }
    } catch (error) {
      console.error('Error removing from recently viewed:', error);
    }
  }, []);

  const clearRecentlyViewed = useCallback(() => {
    try {
      localStorage.removeItem(RECENTLY_VIEWED_KEY);
      setRecentlyViewed([]);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  }, []);

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    showSuccess(`Added ${product.name} to cart`);
  };

  const handleToggleWishlist = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInWishlist(product.id)) {
      // Can't remove from wishlist without the full context
      showSuccess('Already in wishlist');
    } else {
      addToWishlist(product);
      showSuccess('Added to wishlist');
    }
  };

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <div className={`bg-white rounded-lg shadow-lg border border-gray-200 transition-all duration-300 ${
        isMinimized ? 'w-12 h-12' : 'w-80 max-h-96'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <FiEye className="w-4 h-4 text-gray-600" />
            {!isMinimized && (
              <h3 className="text-sm font-medium text-gray-900">
                Recently Viewed ({recentlyViewed.length})
              </h3>
            )}
          </div>
          <div className="flex items-center space-x-1">
            {!isMinimized && (
              <button
                onClick={clearRecentlyViewed}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                title="Clear all"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="max-h-80 overflow-y-auto">
            <div className="p-2 space-y-2">
              {recentlyViewed.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {/* Product Image */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiEye className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-semibold text-blue-600">
                        {formatPrice(product.price)}
                      </span>
                      {product.brand && (
                        <span className="text-xs text-gray-500 truncate ml-2">
                          {typeof product.brand === 'string' ? product.brand : product.brand.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleAddToCart(product, e)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Add to cart"
                    >
                      <FiShoppingCart className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => handleToggleWishlist(product, e)}
                      className={`p-1.5 transition-colors ${
                        isInWishlist(product.id)
                          ? 'text-red-500 hover:text-red-600'
                          : 'text-gray-400 hover:text-red-500'
                      }`}
                      title={isInWishlist(product.id) ? 'In wishlist' : 'Add to wishlist'}
                    >
                      <FiHeart className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromRecentlyViewed(product.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove from recently viewed"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Export the component and the helper function for adding items
export default RecentlyViewed;
export { RecentlyViewed };

// Helper function to add items to recently viewed (can be used from product pages)
export const addToRecentlyViewed = (product) => {
  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let recentItems = stored ? JSON.parse(stored) : [];

    // Remove if already exists
    recentItems = recentItems.filter(item => item.id !== product.id);

    // Add to beginning
    recentItems.unshift({
      id: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      brand: product.brand,
      dealer: product.dealer,
      viewedAt: new Date().toISOString()
    });

    // Keep only max items
    recentItems = recentItems.slice(0, MAX_RECENT_ITEMS);

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentItems));
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('recentlyViewedUpdated', {
      detail: { recentItems }
    }));
  } catch (error) {
    console.error('Error saving recently viewed:', error);
  }
};