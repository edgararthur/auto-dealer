import React from 'react';
import PropTypes from 'prop-types';
import ProductCard from './ProductCard';
import { FiAlertCircle } from 'react-icons/fi';

/**
 * ProductGrid Component - Displays a grid of products with responsive layout
 * 
 * @param {Array} products - Array of product objects to display
 * @param {Boolean} loading - Whether products are loading
 * @param {Function} onAddToCart - Function to handle adding to cart
 * @param {Function} onAddToWishlist - Function to handle adding to wishlist
 * @param {Function} onQuickView - Function to handle quick view modal
 * @param {Boolean} showQuickActions - Whether to show quick action buttons on cards
 * @param {String} emptyMessage - Message to display when no products are available
 * @param {Number} columns - Number of columns on large screens
 * @param {Boolean} compact - Whether to show compact product cards
 * @param {Function} getProductTags - Function that receives a product and returns an array of tags
 */
const ProductGrid = ({ 
  products = [], 
  loading = false,
  onAddToCart,
  onAddToWishlist,
  onQuickView,
  showQuickActions = true,
  emptyMessage = "No products found",
  columns = 4,
  compact = false,
  getProductTags = () => []
}) => {
  // Generate column class based on columns prop
  const getColumnClass = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 5:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      case 6:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
      case 4:
      default:
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
    }
  };

  // If compact mode, use tighter grid with more columns
  const getCompactColumnClass = () => {
    switch (columns) {
      case 2:
        return "grid-cols-2 sm:grid-cols-3";
      case 3: 
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
      case 4:
      default:
        return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
    }
  };

  const columnClass = compact ? getCompactColumnClass() : getColumnClass();

  // Render loading skeleton
  if (loading) {
    return (
      <div className={`grid ${columnClass} gap-${compact ? '2' : '4'}`}>
        {[...Array(compact ? 12 : 8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
            <div className={`h-${compact ? '28' : '48'} bg-gray-200`}></div>
            <div className="p-4 flex-grow">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              {!compact && <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>}
              {!compact && <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>}
              <div className="flex justify-between items-center">
                <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render empty state
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <FiAlertCircle className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-lg text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // Render product grid
  return (
    <div className={`grid ${columnClass} gap-${compact ? '2' : '4'}`}>
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onAddToWishlist={onAddToWishlist}
          onQuickView={onQuickView}
          showQuickActions={showQuickActions}
          compact={compact}
          tags={getProductTags(product)}
        />
      ))}
    </div>
  );
};

ProductGrid.propTypes = {
  products: PropTypes.array,
  loading: PropTypes.bool,
  onAddToCart: PropTypes.func,
  onAddToWishlist: PropTypes.func,
  onQuickView: PropTypes.func,
  showQuickActions: PropTypes.bool,
  emptyMessage: PropTypes.string,
  columns: PropTypes.number,
  compact: PropTypes.bool,
  getProductTags: PropTypes.func
};

export default ProductGrid; 