import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiStar } from 'react-icons/fi';

/**
 * Rating Component - Displays star ratings and optionally allows setting ratings
 * 
 * @param {Number} value - Current rating value (1-5)
 * @param {Function} onChange - Callback when rating changes (only used when interactive)
 * @param {Boolean} interactive - Whether the user can change the rating
 * @param {Number} size - Size of stars in pixels
 * @param {String} color - Color of filled stars
 * @param {Number} precision - Rating precision (0.5 or 1)
 * @param {Number} count - Number of reviews (optional)
 */
const Rating = ({ 
  value = 0, 
  onChange, 
  interactive = false,
  size = 20,
  color = 'text-yellow-400', 
  precision = 1,
  count = null
}) => {
  const [hoverValue, setHoverValue] = useState(-1);

  // Calculate the actual value to display (could be hover value or actual value)
  const displayValue = hoverValue >= 0 ? hoverValue : value;
  
  // Handle click on a star
  const handleClick = (newValue) => {
    if (interactive && onChange) {
      onChange(newValue);
    }
  };
  
  // Handle mouse enter on a star
  const handleMouseEnter = (newValue) => {
    if (interactive) {
      setHoverValue(newValue);
    }
  };
  
  // Handle mouse leave
  const handleMouseLeave = () => {
    if (interactive) {
      setHoverValue(-1);
    }
  };
  
  // Determine if a star should be filled
  const shouldFill = (starPosition) => {
    if (precision === 0.5) {
      return displayValue >= starPosition - 0.5;
    }
    return displayValue >= starPosition;
  };
  
  // Determine if a star should be half-filled
  const shouldHalfFill = (starPosition) => {
    if (precision !== 0.5) return false;
    return displayValue === starPosition - 0.5;
  };

  return (
    <div 
      className="flex items-center" 
      onMouseLeave={handleMouseLeave}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <div 
          key={star}
          onClick={() => handleClick(star)}
          onMouseEnter={() => handleMouseEnter(star)}
          className={`${interactive ? 'cursor-pointer' : ''}`}
          style={{ position: 'relative' }}
        >
          {/* Empty star (background) */}
          <FiStar 
            className="text-neutral-300"
            size={size} 
            strokeWidth={1.5}
            fill="transparent"
          />
          
          {/* Filled star (overlaid) */}
          {shouldFill(star) && (
            <FiStar 
              className={`absolute top-0 left-0 ${color}`}
              size={size} 
              strokeWidth={1.5}
              fill="currentColor"
              style={{
                clipPath: shouldHalfFill(star) ? 'inset(0 50% 0 0)' : 'none'
              }}
            />
          )}
        </div>
      ))}
      
      {/* Review count */}
      {count !== null && (
        <span className="ml-2 text-xs text-neutral-500">
          ({count})
        </span>
      )}
    </div>
  );
};

Rating.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  interactive: PropTypes.bool,
  size: PropTypes.number,
  color: PropTypes.string,
  precision: PropTypes.number,
  count: PropTypes.number
};

export default Rating; 