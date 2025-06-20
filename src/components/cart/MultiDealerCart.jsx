import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiTruck, FiMapPin, FiStar, FiX, FiPlus, FiMinus, FiCheck } from 'react-icons/fi';
import PropTypes from 'prop-types';

/**
 * MultiDealerCart Component - Cart that groups items by dealer
 * Shows separate shipping calculations per dealer
 * 
 * @param {Array} cartItems - Array of cart items
 * @param {Function} onUpdateQuantity - Function to update item quantity
 * @param {Function} onRemoveItem - Function to remove item from cart
 * @param {Function} onCheckout - Function to proceed to checkout
 * @param {Boolean} isCheckout - Whether this is being used in checkout flow
 */
const MultiDealerCart = ({ 
  cartItems = [], 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout,
  isCheckout = false 
}) => {
  const [groupedItems, setGroupedItems] = useState({});
  const [totalsByDealer, setTotalsByDealer] = useState({});
  const [grandTotal, setGrandTotal] = useState(0);

  useEffect(() => {
    // Group items by dealer
    const grouped = cartItems.reduce((groups, item) => {
      const dealerId = item.dealer?.id || 'unknown';
      const dealerKey = `${dealerId}-${item.dealer?.company_name || 'Unknown Dealer'}`;
      
      if (!groups[dealerKey]) {
        groups[dealerKey] = {
          dealer: item.dealer || {
            id: 'unknown',
            company_name: 'Unknown Dealer',
            location: 'Unknown Location',
            rating: 0,
            verified: false
          },
          items: [],
          subtotal: 0,
          shipping: 0,
          total: 0
        };
      }
      
      groups[dealerKey].items.push(item);
      return groups;
    }, {});

    // Calculate totals for each dealer
    const totals = {};
    let overallTotal = 0;

    Object.keys(grouped).forEach(dealerKey => {
      const group = grouped[dealerKey];
      let subtotal = 0;
      
      group.items.forEach(item => {
        subtotal += (item.price || 0) * (item.quantity || 1);
      });
      
      // Calculate shipping per dealer
      const shipping = calculateShipping(group.dealer, subtotal);
      const total = subtotal + shipping;
      
      group.subtotal = subtotal;
      group.shipping = shipping;
      group.total = total;
      
      totals[dealerKey] = {
        subtotal,
        shipping,
        total
      };
      
      overallTotal += total;
    });

    setGroupedItems(grouped);
    setTotalsByDealer(totals);
    setGrandTotal(overallTotal);
  }, [cartItems]);

  const calculateShipping = (dealer, subtotal) => {
    // Mock shipping calculation - in real app, would use dealer's shipping rates
    if (subtotal >= 100) return 0; // Free shipping over $100
    
    // Different dealers have different shipping rates
    const baseRate = dealer?.shippingRate || 9.99;
    return baseRate;
  };

  const handleQuantityUpdate = (item, newQuantity) => {
    if (newQuantity <= 0) {
      onRemoveItem(item.id);
    } else {
      onUpdateQuantity(item.id, newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(price);
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <FiShoppingCart size={48} className="mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link 
          to="/products" 
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  // Debug: Log cart items to console
  if (process.env.NODE_ENV === 'development') {
    console.log('MultiDealerCart received items:', cartItems);
  }

  return (
    <div className="space-y-6">
      {/* Cart Items grouped by dealer */}
      {Object.entries(groupedItems).map(([dealerKey, group]) => (
        <div key={dealerKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Dealer Header */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                  {group.dealer.logo ? (
                    <img 
                      src={group.dealer.logo} 
                      alt={group.dealer.company_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-600">
                      {group.dealer.company_name.substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{group.dealer.company_name}</h3>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <FiMapPin size={14} />
                      <span>{group.dealer.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            size={14}
                            className={i < Math.floor(group.dealer.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                      <span>({group.dealer.rating || '0.0'})</span>
                    </div>
                    {group.dealer.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        <FiCheck size={10} className="mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {group.items.length} item{group.items.length !== 1 ? 's' : ''}
                </div>
                <div className="font-semibold text-gray-900">
                  {formatPrice(group.total)}
                </div>
              </div>
            </div>
          </div>

          {/* Items from this dealer */}
          <div className="divide-y divide-gray-200">
            {group.items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="p-6">
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image || item.product_images?.[0]?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/products/${item.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.category?.name || 'Auto Parts'}
                    </p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-lg font-semibold text-gray-900">
                        {formatPrice(item.price || 0)}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(item.originalPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={() => handleQuantityUpdate(item, (item.quantity || 1) - 1)}
                        className="p-2 hover:bg-gray-100 rounded-l-lg transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus size={16} />
                      </button>
                      <span className="px-4 py-2 text-center min-w-[3rem]">
                        {item.quantity || 1}
                      </span>
                      <button
                        onClick={() => handleQuantityUpdate(item, (item.quantity || 1) + 1)}
                        className="p-2 hover:bg-gray-100 rounded-r-lg transition-colors"
                      >
                        <FiPlus size={16} />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatPrice((item.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <FiX size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dealer Totals */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatPrice(group.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <FiTruck size={14} />
                  <span className="text-gray-600">Shipping:</span>
                </div>
                <span className="font-medium">
                  {group.shipping === 0 ? 'Free' : formatPrice(group.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                <span>Total from {group.dealer.company_name}:</span>
                <span>{formatPrice(group.total)}</span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Grand Total */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Order Total</h3>
            <p className="text-sm text-gray-500">
              Items from {Object.keys(groupedItems).length} dealer{Object.keys(groupedItems).length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(grandTotal)}
            </div>
            <p className="text-sm text-gray-500">
              Shipping calculated per dealer
            </p>
          </div>
        </div>

        {!isCheckout && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => onCheckout(groupedItems)}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/products"
              className="block text-center text-primary-600 hover:text-primary-700 mt-3 text-sm"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

MultiDealerCart.propTypes = {
  cartItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    quantity: PropTypes.number,
    image: PropTypes.string,
    product_images: PropTypes.array,
    category: PropTypes.object,
    dealer: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      company_name: PropTypes.string,
      location: PropTypes.string,
      rating: PropTypes.number,
      verified: PropTypes.bool,
      logo: PropTypes.string,
      shippingRate: PropTypes.number
    })
  })),
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onCheckout: PropTypes.func,
  isCheckout: PropTypes.bool
};

export default MultiDealerCart; 