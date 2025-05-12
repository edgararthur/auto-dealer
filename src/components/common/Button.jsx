import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Button Component - A versatile button component with multiple variants
 * 
 * @param {Object} props - Component props
 * @param {String} props.variant - Button variant (primary, secondary, outline, ghost)
 * @param {String} props.size - Button size (small, medium, large)
 * @param {Boolean} props.disabled - Whether the button is disabled
 * @param {String} props.className - Additional CSS classes
 * @param {String} props.to - If provided, button renders as a Link
 * @param {Function} props.onClick - Click handler
 * @param {Boolean} props.fullWidth - Whether the button should take full width
 * @param {React.ReactNode} props.children - Button content
 */
const Button = ({ 
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  to,
  onClick,
  fullWidth = false,
  children,
  ...rest
}) => {
  // Base styles for all button variants
  const baseStyles = `
    inline-flex items-center justify-center 
    font-medium rounded-md transition-all 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
  `;
  
  // Variant-specific styles
  const variantStyles = {
    primary: `
      bg-primary-600 text-white 
      hover:bg-primary-700 
      active:bg-primary-800
      border border-transparent
    `,
    secondary: `
      bg-accent-500 text-white 
      hover:bg-accent-600 
      active:bg-accent-700
      border border-transparent
    `,
    outline: `
      bg-white text-primary-600 
      hover:bg-primary-50 
      active:bg-primary-100
      border border-primary-300
    `,
    ghost: `
      bg-transparent text-primary-600 
      hover:bg-primary-50 
      active:bg-primary-100
      border border-transparent
    `,
  };
  
  // Size-specific styles
  const sizeStyles = {
    small: 'text-xs px-3 py-1.5',
    medium: 'text-sm px-4 py-2',
    large: 'text-base px-6 py-3',
  };
  
  // Combined styles
  const buttonClasses = `
    ${baseStyles} 
    ${variantStyles[variant]} 
    ${sizeStyles[size]} 
    ${className}
  `;
  
  // Render as Link if 'to' prop is provided
  if (to) {
    return (
      <Link
        to={to}
        className={buttonClasses}
        {...rest}
      >
        {children}
      </Link>
    );
  }
  
  // Otherwise render as button
  return (
    <button
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'ghost']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  className: PropTypes.string,
  to: PropTypes.string,
  onClick: PropTypes.func,
  fullWidth: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

// Export the component wrapped in React.memo for performance
export default React.memo(Button); 