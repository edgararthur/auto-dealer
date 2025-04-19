import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiShoppingCart, FiSearch, FiPackage, FiHeart, FiFilter } from 'react-icons/fi';

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
  type = 'generic',
  title = 'No items found',
  message = 'There are no items to display right now.',
  actionText,
  actionLink,
  onAction,
  showImage = true
}) => {
  // Get the appropriate icon based on type
  const renderIcon = () => {
    const iconSize = 48;
    const iconClasses = "text-neutral-400";
    
    switch (type) {
      case 'cart':
        return <FiShoppingCart className={iconClasses} size={iconSize} />;
      case 'search':
        return <FiSearch className={iconClasses} size={iconSize} />;
      case 'order':
        return <FiPackage className={iconClasses} size={iconSize} />;
      case 'wishlist':
        return <FiHeart className={iconClasses} size={iconSize} />;
      case 'filter':
        return <FiFilter className={iconClasses} size={iconSize} />;
      case 'product':
      case 'generic':
      default:
        return <FiAlertCircle className={iconClasses} size={iconSize} />;
    }
  };
  
  // Get default messages based on type
  const getDefaults = () => {
    switch (type) {
      case 'cart':
        return {
          title: 'Your cart is empty',
          message: 'Looks like you haven\'t added any items to your cart yet.',
          actionText: 'Continue Shopping',
          actionLink: '/products'
        };
      case 'search':
        return {
          title: 'No results found',
          message: 'We couldn\'t find any products matching your search. Try using different keywords or filters.',
          actionText: 'Clear Search',
          actionLink: '/products'
        };
      case 'order':
        return {
          title: 'No orders yet',
          message: 'You haven\'t placed any orders yet. Start shopping to see your orders here.',
          actionText: 'Browse Products',
          actionLink: '/products'
        };
      case 'wishlist':
        return {
          title: 'Your wishlist is empty',
          message: 'Add items to your wishlist to save them for later.',
          actionText: 'Browse Products',
          actionLink: '/products'
        };
      case 'filter':
        return {
          title: 'No matching products',
          message: 'No products match your current filters. Try changing or clearing your filters.',
          actionText: 'Clear Filters',
          actionLink: null
        };
      default:
        return {
          title: 'No items found',
          message: 'There are no items to display right now.',
          actionText: 'Go Home',
          actionLink: '/'
        };
    }
  };
  
  // Use provided props or defaults
  const defaults = getDefaults();
  const displayTitle = title || defaults.title;
  const displayMessage = message || defaults.message;
  const displayActionText = actionText || defaults.actionText;
  const displayActionLink = actionLink !== undefined ? actionLink : defaults.actionLink;
  
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {showImage && (
        <div className="mb-6">
          {renderIcon()}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-neutral-900 mb-2">{displayTitle}</h3>
      <p className="text-neutral-500 max-w-md mb-6">{displayMessage}</p>
      
      {(displayActionText && (displayActionLink || onAction)) && (
        <>
          {displayActionLink ? (
            <Link
              to={displayActionLink}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {displayActionText}
            </Link>
          ) : (
            <button
              onClick={onAction}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {displayActionText}
            </button>
          )}
        </>
      )}
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

export default EmptyState; 