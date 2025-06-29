import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiShoppingCart, FiSearch, FiPackage, FiHeart, FiFilter, FiTruck, FiWifi, FiRefreshCw, FiPlus, FiStar, FiMapPin } from 'react-icons/fi';

/**
 * EmptyState Component - Displays a message when no content is available
 * 
 * @param {String} type - Type of empty state (product, cart, wishlist, order, search, filter)
 * @param {String} title - Title text to display
 * @param {String} message - Message text to display
 * @param {String} actionText - Text for the primary action button
 * @param {String} actionLink - Link for the primary action button
 * @param {Function} onAction - Callback for the primary action button (alternative to actionLink)
 * @param {Boolean} showImage - Whether to show an illustration
 */
const EmptyState = ({ 
  type = 'default',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  showIcon = true,
  className = '',
  children
}) => {
  const getEmptyStateConfig = () => {
    switch (type) {
      case 'search':
        return {
          icon: FiSearch,
          title: title || 'No results found',
          description: description || 'Try adjusting your search criteria or browse our categories.',
          actionLabel: actionLabel || 'Browse Categories',
          actionHref: actionHref || '/categories',
          iconColor: 'text-blue-400',
          bgColor: 'bg-blue-50'
        };

      case 'cart':
        return {
          icon: FiShoppingCart,
          title: title || 'Your cart is empty',
          description: description || 'Looks like you haven\'t added anything to your cart yet.',
          actionLabel: actionLabel || 'Start Shopping',
          actionHref: actionHref || '/shop',
          iconColor: 'text-green-400',
          bgColor: 'bg-green-50'
        };

      case 'wishlist':
        return {
          icon: FiHeart,
          title: title || 'Your wishlist is empty',
          description: description || 'Save your favorite products here for quick access.',
          actionLabel: actionLabel || 'Explore Products',
          actionHref: actionHref || '/shop',
          iconColor: 'text-red-400',
          bgColor: 'bg-red-50'
        };

      case 'orders':
        return {
          icon: FiPackage,
          title: title || 'No orders yet',
          description: description || 'Your order history will appear here once you make your first purchase.',
          actionLabel: actionLabel || 'Start Shopping',
          actionHref: actionHref || '/shop',
          iconColor: 'text-purple-400',
          bgColor: 'bg-purple-50'
        };

      case 'products':
        return {
          icon: FiPackage,
          title: title || 'No products found',
          description: description || 'We couldn\'t find any products matching your criteria.',
          actionLabel: actionLabel || 'Clear Filters',
          actionHref: actionHref,
          iconColor: 'text-orange-400',
          bgColor: 'bg-orange-50'
        };

      case 'dealers':
        return {
          icon: FiMapPin,
          title: title || 'No dealers found',
          description: description || 'We couldn\'t find any dealers in your area.',
          actionLabel: actionLabel || 'Search All Areas',
          actionHref: actionHref || '/dealers',
          iconColor: 'text-indigo-400',
          bgColor: 'bg-indigo-50'
        };

      case 'reviews':
        return {
          icon: FiStar,
          title: title || 'No reviews yet',
          description: description || 'Be the first to review this product.',
          actionLabel: actionLabel || 'Write Review',
          actionHref: actionHref,
          iconColor: 'text-yellow-400',
          bgColor: 'bg-yellow-50'
        };

      case 'shipping':
        return {
          icon: FiTruck,
          title: title || 'No shipments',
          description: description || 'Your shipment tracking information will appear here.',
          actionLabel: actionLabel || 'Track Order',
          actionHref: actionHref || '/orders',
          iconColor: 'text-blue-400',
          bgColor: 'bg-blue-50'
        };

      case 'error':
        return {
          icon: FiAlertCircle,
          title: title || 'Something went wrong',
          description: description || 'We encountered an error loading this content.',
          actionLabel: actionLabel || 'Try Again',
          actionHref: actionHref,
          iconColor: 'text-red-400',
          bgColor: 'bg-red-50'
        };

      case 'offline':
        return {
          icon: FiWifi,
          title: title || 'You\'re offline',
          description: description || 'Check your internet connection and try again.',
          actionLabel: actionLabel || 'Retry',
          actionHref: actionHref,
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-50'
        };

      case 'loading-error':
        return {
          icon: FiRefreshCw,
          title: title || 'Failed to load',
          description: description || 'We couldn\'t load the content. Please try again.',
          actionLabel: actionLabel || 'Retry',
          actionHref: actionHref,
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-50'
        };

      default:
        return {
          icon: FiSearch,
          title: title || 'Nothing here yet',
          description: description || 'Content will appear here when available.',
          actionLabel: actionLabel || 'Go Back',
          actionHref: actionHref || '/',
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-50'
        };
    }
  };

  const config = getEmptyStateConfig();
  const IconComponent = config.icon;

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {/* Animated Background */}
      <div className="relative mb-8">
        {showIcon && (
          <>
            {/* Background Circle */}
            <div className={`w-24 h-24 ${config.bgColor} rounded-full flex items-center justify-center relative overflow-hidden`}>
              {/* Animated Pulse */}
              <div className={`absolute inset-0 ${config.bgColor} rounded-full animate-ping opacity-30`}></div>
              
              {/* Icon */}
              <IconComponent className={`w-8 h-8 ${config.iconColor} relative z-10`} />
            </div>
            
            {/* Floating Particles */}
            <div className="absolute -top-2 -right-2 w-3 h-3 bg-blue-200 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-purple-200 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/2 -right-4 w-1.5 h-1.5 bg-green-200 rounded-full animate-bounce" style={{ animationDelay: '1.5s' }}></div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="max-w-md space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {config.title}
        </h3>
        
        <p className="text-gray-600 leading-relaxed">
          {config.description}
        </p>

        {/* Custom Children */}
        {children && (
          <div className="mt-6">
            {children}
          </div>
        )}

        {/* Action Button */}
        {(config.actionLabel && (config.actionHref || onAction)) && (
          <div className="mt-8">
            {config.actionHref ? (
              <Link
                to={config.actionHref}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                {config.actionLabel}
              </Link>
            ) : (
              <button
                onClick={handleAction}
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                {config.actionLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

EmptyState.propTypes = {
  type: PropTypes.oneOf(['generic', 'product', 'cart', 'search', 'order', 'wishlist', 'filter']),
  title: PropTypes.string,
  message: PropTypes.string,
  actionText: PropTypes.string,
  actionLink: PropTypes.string,
  onAction: PropTypes.func,
  showImage: PropTypes.bool
};

// Specialized Empty State Components
export const SearchEmptyState = ({ query, onClearFilters }) => (
  <EmptyState
    type="search"
    title={`No results for "${query}"`}
    description="Try adjusting your search terms or clearing filters to see more results."
    actionLabel="Clear Filters"
    onAction={onClearFilters}
  >
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
        Check spelling
      </span>
      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
        Use fewer words
      </span>
      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
        Try synonyms
      </span>
    </div>
  </EmptyState>
);

export const CartEmptyState = () => (
  <EmptyState
    type="cart"
    title="Your cart is empty"
    description="Add some auto parts to get started with your order."
  >
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 text-sm">
      <div className="flex items-center justify-center space-x-2">
        <FiTruck className="w-4 h-4 text-green-500" />
        <span className="text-gray-600">Free shipping over $50</span>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <FiStar className="w-4 h-4 text-yellow-500" />
        <span className="text-gray-600">Expert support</span>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <FiRefreshCw className="w-4 h-4 text-blue-500" />
        <span className="text-gray-600">Easy returns</span>
      </div>
    </div>
  </EmptyState>
);

export const WishlistEmptyState = () => (
  <EmptyState
    type="wishlist"
    title="Your wishlist is empty"
    description="Save products you love for later. Click the heart icon on any product to add it here."
  />
);

export const OrdersEmptyState = () => (
  <EmptyState
    type="orders"
    title="No orders yet"
    description="Your order history will appear here once you make your first purchase."
  >
    <div className="bg-blue-50 rounded-lg p-4 mt-6">
      <h4 className="font-medium text-blue-900 mb-2">Why shop with us?</h4>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• Quality guaranteed auto parts</li>
        <li>• Fast and reliable shipping</li>
        <li>• Expert customer support</li>
        <li>• Easy returns and exchanges</li>
      </ul>
    </div>
  </EmptyState>
);

export const ProductsEmptyState = ({ hasFilters = false, onClearFilters }) => (
  <EmptyState
    type="products"
    title={hasFilters ? "No products match your filters" : "No products found"}
    description={hasFilters ? "Try adjusting your filters to see more results." : "We couldn't find any products in this category."}
    actionLabel={hasFilters ? "Clear Filters" : "Browse All Categories"}
    actionHref={hasFilters ? undefined : "/categories"}
    onAction={hasFilters ? onClearFilters : undefined}
  />
);

export const LoadingErrorState = ({ onRetry }) => (
  <EmptyState
    type="loading-error"
    title="Failed to load content"
    description="Something went wrong while loading this page. Please try again."
    actionLabel="Try Again"
    onAction={onRetry}
  />
);

export default EmptyState; 