import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FiChevronRight, FiHome } from 'react-icons/fi';

/**
 * Breadcrumb Component - Shows the navigation path for the current page
 * 
 * @param {Array} items - Array of breadcrumb items with label and path props
 * @param {Boolean} showHomeIcon - Whether to show home icon for the first item
 */
const Breadcrumb = ({ items = [], showHomeIcon = true }) => {
  return (
    <nav className="flex items-center text-sm text-neutral-500">
      <ol className="flex items-center flex-wrap">
        <li className="flex items-center">
          <Link 
            to="/" 
            className="flex items-center text-primary-600 hover:text-primary-700 transition-colors"
          >
            {showHomeIcon ? <FiHome className="mr-1" /> : 'Home'}
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <FiChevronRight className="mx-2 text-neutral-400" />
            {index === items.length - 1 ? (
              <span className="text-neutral-900 font-medium" aria-current="page">{item.label}</span>
            ) : (
              <Link 
                to={item.path} 
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

Breadcrumb.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string
    })
  ).isRequired,
  showHomeIcon: PropTypes.bool
};

export default Breadcrumb; 