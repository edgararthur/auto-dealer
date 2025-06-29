import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome, FiShoppingBag, FiPackage, FiHeart, FiUser, FiSearch } from 'react-icons/fi';

/**
 * Breadcrumb Component - Shows the navigation path for the current page
 * 
 * @param {Array} customItems - Array of breadcrumb items with label, path, and icon props
 * @param {String} className - Additional CSS classes for the breadcrumb component
 */
const Breadcrumb = ({ customItems = null, className = '' }) => {
  const location = useLocation();

  // Generate breadcrumbs from URL if no custom items provided
  const generateBreadcrumbs = () => {
    if (customItems) return customItems;

    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [{ label: 'Home', path: '/', icon: FiHome }];

    // Route mappings for better labels
    const routeMap = {
      'shop': { label: 'Shop', icon: FiShoppingBag },
      'products': { label: 'Products', icon: FiPackage },
      'categories': { label: 'Categories', icon: FiShoppingBag },
      'brands': { label: 'Brands', icon: FiShoppingBag },
      'cart': { label: 'Shopping Cart', icon: FiShoppingBag },
      'checkout': { label: 'Checkout', icon: FiShoppingBag },
      'orders': { label: 'Orders', icon: FiPackage },
      'wishlist': { label: 'Wishlist', icon: FiHeart },
      'account': { label: 'Account', icon: FiUser },
      'profile': { label: 'Profile', icon: FiUser },
      'search': { label: 'Search Results', icon: FiSearch },
      'dealers': { label: 'Dealers', icon: FiShoppingBag },
      'garage': { label: 'My Garage', icon: FiPackage },
      'maintenance': { label: 'Maintenance', icon: FiPackage },
      'auth': { label: 'Authentication', icon: FiUser },
      'login': { label: 'Login', icon: FiUser },
      'register': { label: 'Register', icon: FiUser },
      'forgot-password': { label: 'Reset Password', icon: FiUser }
    };

    pathnames.forEach((pathname, index) => {
      const isLast = index === pathnames.length - 1;
      const path = `/${pathnames.slice(0, index + 1).join('/')}`;
      
      // Get route config or create default
      const routeConfig = routeMap[pathname] || {
        label: pathname.charAt(0).toUpperCase() + pathname.slice(1).replace(/-/g, ' '),
        icon: FiPackage
      };

      // Handle dynamic routes (IDs)
      if (pathname.match(/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i) || 
          pathname.match(/^\d+$/)) {
        // This is likely an ID, use more generic label
        const parentRoute = pathnames[index - 1];
        if (parentRoute === 'products') {
          routeConfig.label = 'Product Details';
        } else if (parentRoute === 'orders') {
          routeConfig.label = 'Order Details';
        } else if (parentRoute === 'categories') {
          routeConfig.label = 'Category';
        } else {
          routeConfig.label = 'Details';
        }
      }

      breadcrumbs.push({
        label: routeConfig.label,
        path: isLast ? null : path, // Don't make the last item clickable
        icon: routeConfig.icon,
        isActive: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Don't show breadcrumbs for home page or auth pages
  if (location.pathname === '/' || location.pathname.startsWith('/auth/')) {
    return null;
  }

  return (
    <nav className={`bg-gray-50 border-b border-gray-200 ${className}`} aria-label="Breadcrumb">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2 py-3 text-sm">
          {breadcrumbs.map((crumb, index) => {
            const IconComponent = crumb.icon;
            const isLast = index === breadcrumbs.length - 1;

            return (
              <React.Fragment key={index}>
                {/* Breadcrumb Item */}
                <div className="flex items-center">
                  {crumb.path ? (
                    <Link
                      to={crumb.path}
                      className="flex items-center space-x-1.5 text-gray-500 hover:text-gray-700 transition-colors duration-150 group"
                    >
                      {index === 0 && (
                        <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform duration-150" />
                      )}
                      <span className="hover:underline font-medium">
                        {crumb.label}
                      </span>
                    </Link>
                  ) : (
                    <div className="flex items-center space-x-1.5">
                      {index === 0 && (
                        <IconComponent className="w-4 h-4 text-gray-600" />
                      )}
                      <span className={`font-medium ${isLast ? 'text-gray-900' : 'text-gray-500'}`}>
                        {crumb.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Separator */}
                {!isLast && (
                  <FiChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

// Compact breadcrumb for smaller spaces
export const CompactBreadcrumb = ({ items, className = '' }) => {
  return (
    <nav className={`${className}`} aria-label="Breadcrumb">
      <div className="flex items-center space-x-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <React.Fragment key={index}>
              {item.path ? (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-150"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`${isLast ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <FiChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

// Rich breadcrumb with additional context
export const RichBreadcrumb = ({ items, showIcons = true, className = '' }) => {
  return (
    <nav className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`} aria-label="Breadcrumb">
      <div className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => {
          const IconComponent = item.icon;
          const isLast = index === items.length - 1;

          return (
            <React.Fragment key={index}>
              <div className="flex items-center">
                {item.path ? (
                  <Link
                    to={item.path}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-150 group"
                  >
                    {showIcons && IconComponent && (
                      <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform duration-150" />
                    )}
                    <span className="font-medium">
                      {item.label}
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center space-x-2 px-3 py-2">
                    {showIcons && IconComponent && (
                      <IconComponent className="w-4 h-4 text-blue-600" />
                    )}
                    <span className={`font-medium ${isLast ? 'text-gray-900' : 'text-gray-600'}`}>
                      {item.label}
                    </span>
                  </div>
                )}
              </div>

              {!isLast && (
                <FiChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

// Breadcrumb for mobile with collapsible items
export const MobileBreadcrumb = ({ items, className = '' }) => {
  const [showAll, setShowAll] = React.useState(false);
  const displayItems = showAll ? items : items.slice(-2); // Show only last 2 items by default

  if (items.length <= 2) {
    return <CompactBreadcrumb items={items} className={className} />;
  }

  return (
    <nav className={`${className}`} aria-label="Breadcrumb">
      <div className="flex items-center space-x-1 text-sm">
        {!showAll && (
          <>
            <button
              onClick={() => setShowAll(true)}
              className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors duration-150"
            >
              ...
            </button>
            <FiChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
          </>
        )}
        
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          
          return (
            <React.Fragment key={showAll ? index : items.length - displayItems.length + index}>
              {item.path ? (
                <Link
                  to={item.path}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-150 truncate max-w-32"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={`${isLast ? 'text-gray-900 font-medium' : 'text-gray-500'} truncate max-w-32`}>
                  {item.label}
                </span>
              )}
              
              {!isLast && (
                <FiChevronRight className="w-3 h-3 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumb; 