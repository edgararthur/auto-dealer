import React from 'react';
import PropTypes from 'prop-types';

/**
 * ProductSkeleton Component - Displays a loading skeleton for products
 * 
 * @param {Boolean} compact - Whether to show a compact version
 * @param {Number} count - Number of skeletons to display
 * @param {String} className - Additional classes to apply
 */
const ProductSkeleton = ({ compact = false, count = 1, className = '' }) => {
  const skeletons = [];
  
  for (let i = 0; i < count; i++) {
    skeletons.push(
      <div 
        key={i} 
        className={`bg-white rounded-lg shadow-sm overflow-hidden flex flex-col animate-pulse ${className}`}
      >
        {/* Image */}
        <div className={`${compact ? 'h-36' : 'h-48'} bg-neutral-200`}></div>
        
        {/* Content */}
        <div className={`p-${compact ? '3' : '4'} flex-grow`}>
          {/* Dealer info (only in non-compact) */}
          {!compact && (
            <div className="flex items-center mb-2">
              <div className="h-4 w-4 bg-neutral-200 rounded-full mr-1"></div>
              <div className="h-3 bg-neutral-200 rounded w-24"></div>
            </div>
          )}
          
          {/* Product name */}
          <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
          {!compact && <div className="h-4 bg-neutral-200 rounded w-1/2 mb-3"></div>}
          
          {/* Rating (only in non-compact) */}
          {!compact && (
            <div className="flex items-center mb-3">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-3 w-3 bg-neutral-200 rounded"></div>
                ))}
              </div>
              <div className="h-3 bg-neutral-200 rounded w-6 ml-1"></div>
            </div>
          )}
          
          {/* Price and action */}
          <div className="flex justify-between items-center">
            <div className="h-5 bg-neutral-200 rounded w-16"></div>
            <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {count === 1 ? skeletons[0] : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-${compact ? '2' : '4'}`}>
          {skeletons}
        </div>
      )}
    </>
  );
};

ProductSkeleton.propTypes = {
  compact: PropTypes.bool,
  count: PropTypes.number,
  className: PropTypes.string
};

export default ProductSkeleton; 