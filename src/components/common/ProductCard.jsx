import React from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import PropTypes from 'prop-types';

/**
 * ProductCard Component - A reusable card component for displaying product information
 * Enhanced with modern ecommerce styling
 * 
 * @param {Object} product - The product data to display
 * @param {Function} onAddToCart - Optional function to handle adding to cart
 * @param {Function} onAddToWishlist - Optional function to handle adding to wishlist
 * @param {Function} onQuickView - Optional function to handle quick view
 * @param {Boolean} showQuickActions - Whether to show quick action buttons (Add to cart, wishlist)
 * @param {Boolean} compact - Whether to show a compact version of the card
 * @param {String} className - Additional CSS classes
 * @param {Array} tags - Array of tags to display (e.g. ["free shipping", "top rated"])
 */
const ProductCard = ({ 
  product, 
  onAddToCart, 
  onAddToWishlist,
  onQuickView,
  showQuickActions = true,
  compact = false,
  className = '',
  tags = []
}) => {
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart(product.id);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWishlist) onAddToWishlist(product.id);
  };
  
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) onQuickView(product.id);
  };

  // Determine if product is out of stock
  const isOutOfStock = product.inStock === false;

  // Helper function to render badges
  const renderBadge = () => {
    if (isOutOfStock) {
      return <div className="absolute top-0 right-0 z-10 bg-neutral-700 text-white text-xs font-bold px-2 py-1">OUT OF STOCK</div>;
    }
    if (product.isNew) {
      return <div className="absolute top-0 right-0 z-10 bg-accent-500 text-white text-xs font-bold px-2 py-1">NEW</div>;
    }
    if (product.oldPrice && !product.isNew) {
      const discountPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
      return <div className="absolute top-0 right-0 z-10 bg-accent-500 text-white text-xs font-bold px-2 py-1">-{discountPercent}%</div>;
    }
    return null;
  };

  return (
    <div className={`product-card ${className} ${isOutOfStock ? 'opacity-75' : ''} animate-fade-in`}>
      {/* Badges */}
      {renderBadge()}
      
      {/* Tags */}
      {tags.length > 0 && (
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          {tags.map((tag, index) => (
            <span 
              key={index} 
              className="text-xs px-2 py-1 bg-white/90 text-primary-600 font-medium shadow-sm rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {/* Product image */}
      <div className={`product-card-image ${compact ? 'h-36' : 'h-48'} p-2`}>
        <Link to={`/products/${product.id}`}>
          <img 
            src={product.image} 
            alt={product.name} 
            className={`w-full h-full object-contain transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'grayscale' : ''}`} 
          />
        </Link>
        
        {/* Quick action buttons */}
        {showQuickActions && !isOutOfStock && (
          <div className="absolute bottom-0 left-0 right-0 p-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={handleAddToWishlist}
              className="p-2 mx-1 bg-white rounded-full shadow-md text-neutral-500 hover:text-primary-600 hover:shadow-lg transition-all duration-200"
              aria-label="Add to wishlist"
            >
              <FiHeart size={16} />
            </button>
            {onQuickView && (
              <button 
                onClick={handleQuickView}
                className="p-2 mx-1 bg-white rounded-full shadow-md text-neutral-500 hover:text-primary-600 hover:shadow-lg transition-all duration-200"
                aria-label="Quick view"
              >
                <FiEye size={16} />
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Product info */}
      <div className="product-card-body border-t border-neutral-100">
        {/* Product name */}
        <Link to={`/products/${product.id}`} className="block mb-2">
          <h3 className="product-card-title">
            {product.name}
          </h3>
        </Link>
        
        {/* Price section */}
        <div className="mt-auto">
          {product.oldPrice ? (
            <div className="flex flex-col">
              <span className="product-card-price">
                ${product.price.toFixed(2)}
              </span>
              <div className="flex items-center mt-1">
                <span className="product-card-old-price mr-2">
                  ${product.oldPrice.toFixed(2)}
                </span>
                <span className="product-card-discount">
                  {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                </span>
              </div>
            </div>
          ) : (
            <span className="product-card-price">
              ${product.price.toFixed(2)}
            </span>
          )}
        </div>
        
        {/* Rating */}
        {product.rating && (
          <div className="product-card-rating">
            <div className="flex text-primary-600">
              {[...Array(5)].map((_, i) => (
                <svg 
                  key={i} 
                  className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-primary-600' : 'text-neutral-300'}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {product.reviewCount && <span className="ml-1 text-xs text-neutral-500">({product.reviewCount})</span>}
          </div>
        )}

        {/* Dealer info */}
        {product.dealer && (
          <div className="flex items-center mt-2 text-xs text-neutral-500">
            <span>Sold by: </span>
            <span className="ml-1 font-medium text-primary-600">{product.dealer.name}</span>
          </div>
        )}
      </div>
      
      {/* Add to cart button */}
      {showQuickActions && !isOutOfStock && (
        <div className="product-card-action">
          <button 
            onClick={handleAddToCart}
            className="w-full py-2 bg-primary-600 text-white hover:bg-primary-700 transition-colors rounded-b-lg flex items-center justify-center"
          >
            <FiShoppingCart size={16} className="mr-2" />
            <span className="text-sm font-medium">ADD TO CART</span>
          </button>
        </div>
      )}
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    oldPrice: PropTypes.number,
    image: PropTypes.string.isRequired,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    isNew: PropTypes.bool,
    inStock: PropTypes.bool,
    dealer: PropTypes.shape({
      name: PropTypes.string,
      logo: PropTypes.string
    })
  }).isRequired,
  onAddToCart: PropTypes.func,
  onAddToWishlist: PropTypes.func,
  onQuickView: PropTypes.func,
  showQuickActions: PropTypes.bool,
  compact: PropTypes.bool,
  className: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string)
};

export default ProductCard; 