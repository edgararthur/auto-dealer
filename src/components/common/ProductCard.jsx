import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye, FiBarChart2, FiStar, FiMapPin, FiCheck, FiTrendingUp, FiZap, FiShield } from 'react-icons/fi';
import PropTypes from 'prop-types';
import ProductQuickView from '../product/ProductQuickView';

/**
 * ProductCard Component - A reusable card component for displaying product information
 * Enhanced with modern ecommerce styling and prominent dealer information
 * 
 * @param {Object} product - The product data to display
 * @param {Function} onAddToCart - Optional function to handle adding to cart
 * @param {Function} onAddToWishlist - Optional function to handle adding to wishlist
 * @param {Function} onQuickView - Optional function to handle quick view
 * @param {Function} onAddToComparison - Optional function to handle adding to comparison
 * @param {Boolean} isInComparison - Whether the product is in comparison
 * @param {Boolean} showQuickActions - Whether to show quick action buttons (Add to cart, wishlist)
 * @param {Boolean} compact - Whether to show a compact version of the card
 * @param {String} className - Additional CSS classes
 * @param {Array} tags - Array of tags to display (e.g. ["free shipping", "top rated"])
 * @param {Function} onPriceCompare - Optional function to handle price comparison
 */
const ProductCard = ({ 
  product, 
  onAddToCart, 
  onAddToWishlist,
  onQuickView,
  onAddToComparison,
  isInComparison = false,
  showQuickActions = true,
  compact = false,
  className = '',
  tags = [],
  onPriceCompare
}) => {
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
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
    if (onQuickView) {
      onQuickView(product.id);
    } else {
      setShowQuickViewModal(true);
    }
  };

  const handleAddToComparison = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToComparison) onAddToComparison(product.id);
  };

  const handlePriceCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onPriceCompare) onPriceCompare(product.id);
  };

  // Determine if product is out of stock
  const isOutOfStock = product.inStock === false;

  // Format price in Ghana Cedis
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(price);
  };

  // Real dealer data from the database (enhanced from ProductService)
  const dealerInfo = {
    name: product.dealer?.business_name || product.dealer?.company_name || product.dealer?.name || 'Unknown Dealer',
    location: product.dealer?.location || (product.dealer?.city && product.dealer?.state ? `${product.dealer.city}, ${product.dealer.state}` : 'Location not available'),
    rating: product.dealer?.rating || 0,
    logo: product.dealer?.logo,
    verified: product.dealer?.verified || false,
    fastShipping: product.dealer?.fastShipping !== false, // Default to true for better UX
    returnPolicy: product.dealer?.returnPolicy || '30-day returns',
    phone: product.dealer?.phone
  };

  // Helper function to render smart badges
  const renderBadges = () => {
    const badges = [];
    
    if (isOutOfStock) {
      badges.push(
        <div key="stock" className="absolute top-2 right-2 z-10 bg-neutral-700 text-white text-xs font-bold px-2 py-1 rounded">
          OUT OF STOCK
        </div>
      );
    } else {
      // New product badge
      if (product.isNew || product.created_at && new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        badges.push(
          <div key="new" className="absolute top-2 right-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
            <FiZap size={10} className="mr-1" />
            NEW
          </div>
        );
      }
      
      // Discount badge
      if (product.oldPrice && product.oldPrice > product.price) {
        const discountPercent = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
        badges.push(
          <div key="discount" className="absolute top-2 right-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{discountPercent}%
          </div>
        );
      }
      
      // Best seller badge (mock logic - in production this would come from analytics)
      if (product.sales_count && product.sales_count > 100) {
        badges.push(
          <div key="bestseller" className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
            🔥 BESTSELLER
          </div>
        );
      }
      
      // Fast shipping badge
      if (dealerInfo.fastShipping) {
        badges.push(
          <div key="fastship" className="absolute top-12 left-2 z-10 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center">
            ⚡ FAST SHIP
          </div>
        );
      }
    }
    
    return badges;
  };

  return (
    <div className={`product-card ${className} ${isOutOfStock ? 'opacity-75' : ''} animate-fade-in`}>
      {/* Smart Badges */}
      {renderBadges()}
      
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
            src={product.image || product.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80'} 
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
            
            {onAddToComparison && (
              <button 
                onClick={handleAddToComparison}
                className={`p-2 mx-1 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 ${
                  isInComparison ? 'text-primary-600' : 'text-neutral-500 hover:text-primary-600'
                }`}
                aria-label="Add to comparison"
              >
                <FiBarChart2 size={16} />
              </button>
            )}
            
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
        {/* Enhanced Dealer Info Header - New Section */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center overflow-hidden">
              {dealerInfo.logo ? (
                <img 
                  src={dealerInfo.logo} 
                  alt={dealerInfo.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-neutral-600">
                  {dealerInfo.name.substring(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-neutral-700 truncate max-w-[120px]">
                {dealerInfo.name}
              </span>
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={10}
                      className={i < Math.floor(dealerInfo.rating) ? 'text-yellow-400 fill-current' : 'text-neutral-300'}
                    />
                  ))}
                </div>
                <span className="text-xs text-neutral-500">({dealerInfo.rating})</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center text-xs text-neutral-500">
              <FiMapPin size={10} />
              <span className="ml-1 truncate max-w-[80px]">{dealerInfo.location}</span>
            </div>
          </div>
        </div>

        {/* Product name */}
        <Link to={`/products/${product.id}`} className="block mb-2">
          <h3 className="product-card-title">
            {product.name}
          </h3>
        </Link>
        
        {/* Enhanced Price section with comparison */}
        <div className="mt-auto">
          {product.oldPrice ? (
            <div className="flex flex-col">
              <span className="product-card-price">
                {formatPrice(product.price)}
              </span>
              <div className="flex items-center mt-1">
                <span className="product-card-old-price mr-2">
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="product-card-discount">
                  {Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)}% OFF
                </span>
              </div>
            </div>
          ) : (
            <span className="product-card-price">
              {formatPrice(product.price)}
            </span>
          )}
          
          {/* Price comparison button */}
          {onPriceCompare && (
            <button 
              onClick={handlePriceCompare}
              className="text-xs text-primary-600 hover:text-primary-700 mt-1 flex items-center"
            >
              <FiTrendingUp size={12} className="mr-1" />
              Compare prices from other dealers
            </button>
          )}
        </div>
        
        {/* Product Rating */}
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

        {/* Dealer-specific badges and shipping info */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-100">
          <div className="flex items-center space-x-1">
            {/* Verified dealer badge */}
            {dealerInfo.verified && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                <FiCheck size={8} className="mr-0.5" />
                Verified
              </span>
            )}
            {/* Fast shipping badge */}
            {dealerInfo.fastShipping && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                🚚 Fast Ship
              </span>
            )}
          </div>
          <span className="text-xs text-neutral-500">
            Ships in 2-3 days
          </span>
        </div>
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

      {/* Quick View Modal */}
      <ProductQuickView
        productId={product.id}
        isOpen={showQuickViewModal}
        onClose={() => setShowQuickViewModal(false)}
        onAddToCart={onAddToCart}
        onAddToWishlist={onAddToWishlist}
        onAddToComparison={onAddToComparison}
      />
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    oldPrice: PropTypes.number,
    image: PropTypes.string,
    product_images: PropTypes.array,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    isNew: PropTypes.bool,
    inStock: PropTypes.bool,
    dealer: PropTypes.shape({
      name: PropTypes.string,
      company_name: PropTypes.string,
      logo: PropTypes.string,
      location: PropTypes.string,
      city: PropTypes.string,
      rating: PropTypes.number,
      verified: PropTypes.bool,
      fastShipping: PropTypes.bool,
      returnPolicy: PropTypes.string
    })
  }).isRequired,
  onAddToCart: PropTypes.func,
  onAddToWishlist: PropTypes.func,
  onQuickView: PropTypes.func,
  onAddToComparison: PropTypes.func,
  onPriceCompare: PropTypes.func,
  isInComparison: PropTypes.bool,
  showQuickActions: PropTypes.bool,
  compact: PropTypes.bool,
  className: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string)
};

export default React.memo(ProductCard); 