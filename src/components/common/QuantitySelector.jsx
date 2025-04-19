import React from 'react';
import PropTypes from 'prop-types';
import { FiMinus, FiPlus } from 'react-icons/fi';

/**
 * QuantitySelector Component - Allows users to increment/decrement quantity
 * 
 * @param {Number} value - Current quantity value
 * @param {Function} onChange - Callback when quantity changes
 * @param {Number} min - Minimum allowed quantity
 * @param {Number} max - Maximum allowed quantity
 * @param {Boolean} small - Use smaller size variant
 * @param {Boolean} disabled - Disable the selector
 */
const QuantitySelector = ({ 
  value = 1, 
  onChange, 
  min = 1, 
  max = 99,
  small = false,
  disabled = false
}) => {
  const decrementDisabled = value <= min || disabled;
  const incrementDisabled = value >= max || disabled;

  // Handle increment button click
  const handleIncrement = () => {
    if (!incrementDisabled) {
      onChange(value + 1);
    }
  };

  // Handle decrement button click
  const handleDecrement = () => {
    if (!decrementDisabled) {
      onChange(value - 1);
    }
  };

  // Handle direct input changes
  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  // Button and input styles based on size
  const buttonSize = small ? 'w-8 h-8' : 'w-10 h-10';
  const buttonIconSize = small ? 16 : 20;
  const inputSize = small ? 'w-10 h-8 text-sm' : 'w-14 h-10 text-base';

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleDecrement}
        disabled={decrementDisabled}
        className={`${buttonSize} flex items-center justify-center rounded-l-md border ${
          decrementDisabled
            ? 'border-neutral-200 bg-neutral-50 text-neutral-300 cursor-not-allowed'
            : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50'
        }`}
        aria-label="Decrease quantity"
      >
        <FiMinus size={buttonIconSize} />
      </button>
      
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        className={`${inputSize} border-y border-neutral-300 text-center focus:outline-none focus:ring-0 focus:border-primary-500 ${
          disabled ? 'bg-neutral-50 text-neutral-400' : 'bg-white text-neutral-900'
        }`}
        aria-label="Quantity"
      />
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={incrementDisabled}
        className={`${buttonSize} flex items-center justify-center rounded-r-md border ${
          incrementDisabled
            ? 'border-neutral-200 bg-neutral-50 text-neutral-300 cursor-not-allowed'
            : 'border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50'
        }`}
        aria-label="Increase quantity"
      >
        <FiPlus size={buttonIconSize} />
      </button>
    </div>
  );
};

QuantitySelector.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  small: PropTypes.bool,
  disabled: PropTypes.bool
};

export default QuantitySelector; 