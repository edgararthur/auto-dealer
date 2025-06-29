import React, { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiHeart, 
  FiShoppingCart, 
  FiStar, 
  FiTruck, 
  FiEye,
  FiCheck,
  FiClock,
  FiShield,
  FiZap,
  FiTag
} from 'react-icons/fi';
import { useWishlist } from '../../contexts/WishlistContext';
import { useCart } from '../../contexts/CartContext';
import { ProductImage } from './OptimizedImage';
import ProductQuickView from '../product/ProductQuickView';
import { formatPrice, formatDiscount, getCurrentCurrency } from '../../utils/priceFormatter';

/**
 * Amazon/eBay Style ProductCard Component
 * Ultra-clean, minimal design following industry standards
 */
const ProductCard = memo(({
  product,
  className = '',
  showQuickView = false,
  layout = 'grid' // 'grid' or 'list'
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const isWishlisted = isInWishlist(product.id);
  const currentCurrency = getCurrentCurrency();
  
  // Price calculations
  const finalPrice = product.discount_price || product.discountPrice || product.price;
  const hasDiscount = (product.discount_price && product.price > product.discount_price) || 
                     (product.discountPrice && product.price > product.discountPrice);
  const discountInfo = hasDiscount ? 
    formatDiscount(product.price, finalPrice) : null;

  // Handle wishlist toggle
  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Handle quick view
  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  // Product availability
  const inStock = product.inStock ?? 
    (product.stock_quantity > 0) ?? 
    (product.stockQuantity > 0) ?? 
    true;
  const stockQty = product.stock_quantity || product.stockQuantity || 0;
  const isLowStock = stockQty > 0 && stockQty <= 5;

  if (layout === 'list') {
    return (
      <>
        <div className={`group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 ${className}`}>
          <div className="flex p-4">
            {/* Product Image */}
            <div className="relative flex-shrink-0 w-32 h-32 bg-white border border-gray-100 rounded overflow-hidden">
              <Link to={`/products/${product.id}`} className="block w-full h-full">
                <ProductImage
                  src={product.image || product.image_url}
                  alt={product.name}
                  className="w-full h-full object-contain p-2"
                  onLoad={() => setImageLoaded(true)}
                  fallbackSrc="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&h=300&q=80"
                  width={300}
                  height={300}
                />
              </Link>
              
              {/* Wishlist - Amazon style */}
              <button
                onClick={handleWishlistToggle}
                className="absolute top-1 right-1 p-1 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
              >
                <FiHeart 
                  className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} 
                />
              </button>

              {/* Quick View */}
              {showQuickView && (
                <button
                  onClick={handleQuickView}
                  className="absolute bottom-1 right-1 p-1 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
                  title="Quick View"
                >
                  <FiEye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Product Details */}
            <div className="flex-1 ml-4 min-w-0">
              <Link to={`/products/${product.id}`} className="block">
                <h3 className="text-sm font-normal text-gray-900 hover:text-blue-600 line-clamp-2 mb-1">
                  {product.name}
                </h3>
              </Link>

              {/* Dealer Information */}
              {product.dealer && (product.dealer.business_name || product.dealer.company_name || product.dealer.name) && (
                <p className="text-xs text-gray-600 mb-2">
                  Sold by <span className="font-medium text-gray-800">
                    {product.dealer.business_name || product.dealer.company_name || product.dealer.name}
                  </span>
                </p>
              )}
              
              {/* Rating */}
              {product.rating && (
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-blue-600 ml-1 hover:underline">
                    {product.review_count || product.reviewCount || 0}
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-baseline space-x-2 mb-2">
                {hasDiscount && (
                  <span className="text-xs text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
                <div className="flex items-baseline">
                  <span className="text-xs text-gray-900 mr-1">{currentCurrency.symbol}</span>
                  <span className="text-lg text-gray-900 font-normal">
                    {Math.floor(finalPrice)}
                  </span>
                  <span className="text-sm text-gray-900">
                    .{String(Math.round((finalPrice % 1) * 100)).padStart(2, '0')}
                  </span>
                </div>
                {hasDiscount && discountInfo && (
                  <span className="text-xs text-red-600 font-medium">
                    {discountInfo.percentage} off
                  </span>
                )}
              </div>

              {/* Stock Status */}
              {inStock ? (
                <div className="flex items-center text-xs text-green-700 mb-2">
                  <FiCheck className="w-3 h-3 mr-1" />
                  {isLowStock ? `Only ${stockQty} left` : 'In Stock'}
                </div>
              ) : (
                <div className="flex items-center text-xs text-red-600 mb-2">
                  <FiClock className="w-3 h-3 mr-1" />
                  Out of Stock
                </div>
              )}

              {/* Add to Cart */}
              {inStock && (
                <button
                  onClick={handleAddToCart}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-medium px-3 py-1.5 rounded transition-colors"
                >
                  Add to Cart
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Quick View Modal */}
        {showQuickView && (
          <ProductQuickView
            productId={product.id}
            isOpen={quickViewOpen}
            onClose={() => setQuickViewOpen(false)}
          />
        )}
      </>
    );
  }

  // Grid layout (default)
  return (
    <>
      <div className={`group bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 ${className}`}>
        {/* Product Image */}
        <div className="relative bg-white p-4">
          <Link to={`/products/${product.id}`} className="block aspect-square">
            <ProductImage
              src={product.image || product.image_url}
              alt={product.name}
              className="w-full h-full object-contain"
              onLoad={() => setImageLoaded(true)}
              fallbackSrc="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80"
              width={400}
              height={400}
            />
          </Link>
          
          {/* Discount Badge - eBay style */}
          {hasDiscount && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                {discountInfo?.percentage} OFF
              </span>
            </div>
          )}

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-2 right-2 p-2 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
          >
            <FiHeart 
              className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`} 
            />
          </button>

          {/* Quick View - subtle */}
          {showQuickView && (
            <button
              onClick={handleQuickView}
              className="absolute bottom-2 right-2 p-2 rounded hover:bg-gray-100 transition-colors opacity-0 group-hover:opacity-100"
              title="Quick View"
            >
              <FiEye className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4 pt-2">
          {/* Product Title */}
          <Link to={`/products/${product.id}`} className="block mb-2">
            <h3 className="text-sm font-normal text-gray-900 hover:text-blue-600 line-clamp-2 leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Dealer Information */}
          {product.dealer && (product.dealer.business_name || product.dealer.company_name || product.dealer.name) && (
            <p className="text-xs text-gray-600 mb-2">
              Sold by <span className="font-medium text-gray-800">
                {product.dealer.business_name || product.dealer.company_name || product.dealer.name}
              </span>
            </p>
          )}
          
          {/* Rating - Amazon style compact */}
          {product.rating && (
            <div className="flex items-center mb-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`}
                  />
                ))}
              </div>
              <span className="text-xs text-blue-600 ml-1 hover:underline cursor-pointer">
                {product.review_count || product.reviewCount || 0}
              </span>
            </div>
          )}

          {/* Price - Amazon style with currency symbol */}
          <div className="flex items-baseline space-x-2 mb-2">
            {hasDiscount && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            )}
            <div className="flex items-baseline">
              <span className="text-xs text-gray-900 mr-1">{currentCurrency.symbol}</span>
              <span className="text-xl text-gray-900 font-normal">
                {Math.floor(finalPrice)}
              </span>
              <span className="text-sm text-gray-900">
                .{String(Math.round((finalPrice % 1) * 100)).padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Discount savings */}
          {hasDiscount && discountInfo && (
            <div className="text-xs text-red-600 font-medium mb-2">
              Save {discountInfo.percentage} ({discountInfo.amount})
            </div>
          )}

          {/* Stock Status */}
          <div className="mb-3">
            {inStock ? (
              <div className="flex items-center text-xs text-green-700">
                <FiCheck className="w-3 h-3 mr-1" />
                {isLowStock ? `Only ${stockQty} left in stock` : 'In Stock'}
              </div>
            ) : (
              <div className="flex items-center text-xs text-red-600">
                <FiClock className="w-3 h-3 mr-1" />
                Currently unavailable
              </div>
            )}
          </div>

          {/* Free shipping indicator */}
          {product.freeShipping !== false && (
            <div className="flex items-center text-xs text-gray-600 mb-3">
              <FiTruck className="w-3 h-3 mr-1" />
              FREE shipping
            </div>
          )}

          {/* Add to Cart Button - Amazon style */}
          {inStock && (
            <button
              onClick={handleAddToCart}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-medium py-2 px-4 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-300"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
      {showQuickView && (
        <ProductQuickView
          productId={product.id}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 