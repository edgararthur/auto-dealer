import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMinus, 
  FiPlus, 
  FiTrash2, 
  FiTruck, 
  FiMapPin, 
  FiStar,
  FiCheckCircle,
  FiShoppingCart,
  FiArrowRight
} from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';

const MultiDealerCart = () => {
  const { 
    itemsByDealer, 
    totalItems, 
    totalAmount, 
    totalDealers,
    updateQuantity, 
    removeFromCart, 
    clearDealerCart,
    getDealerShippingCost,
    getTotalWithShipping
  } = useCart();

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Discover amazing auto parts from our trusted dealers
            </p>
            <div className="flex gap-4 justify-center">
        <Link 
                to="/shop"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </Link>
              <Link 
                to="/dealers"
                className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Browse Dealers
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {totalItems} items from {totalDealers} dealer{totalDealers !== 1 ? 's' : ''}
          </p>
                </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items by Dealer */}
          <div className="lg:col-span-2 space-y-6">
            {Object.values(itemsByDealer).map((dealerCart) => (
              <DealerCartSection 
                key={dealerCart.dealerId} 
                dealerCart={dealerCart}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                clearDealerCart={clearDealerCart}
                getDealerShippingCost={getDealerShippingCost}
                          />
                        ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Dealer Subtotals */}
              <div className="space-y-3 mb-4">
                {Object.values(itemsByDealer).map((dealerCart) => {
                  const shipping = getDealerShippingCost(dealerCart.dealerId);
                  return (
                    <div key={dealerCart.dealerId} className="text-sm">
                      <div className="flex justify-between text-gray-600 mb-1">
                        <span>{dealerCart.dealerName}</span>
                        <span>${dealerCart.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-500 text-xs">
                        <span className="flex items-center gap-1">
                          <FiTruck className="w-3 h-3" />
                          Shipping
                        </span>
                        <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                      </div>
                    </div>
                  );
                })}
                  </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Shipping</span>
                  <span>
                    ${(getTotalWithShipping() - totalAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold text-gray-900">
                  <span>Total</span>
                  <span>${getTotalWithShipping().toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors mt-6 flex items-center justify-center gap-2">
                Proceed to Checkout
                <FiArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 text-center">
                <Link 
                  to="/shop"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DealerCartSection = ({ 
  dealerCart, 
  updateQuantity, 
  removeFromCart, 
  clearDealerCart,
  getDealerShippingCost 
}) => {
  const shipping = getDealerShippingCost(dealerCart.dealerId);
  const total = dealerCart.subtotal + shipping;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Dealer Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Dealer Avatar */}
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              {dealerCart.dealerInfo?.logo_url ? (
                <img 
                  src={dealerCart.dealerInfo.logo_url} 
                  alt={dealerCart.dealerName}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-blue-600 font-bold text-lg">
                  {dealerCart.dealerName.charAt(0)}
                </span>
              )}
                  </div>

            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                {dealerCart.dealerName}
                {dealerCart.dealerInfo?.isVerified && (
                                      <FiCheckCircle className="w-4 h-4 text-green-500" />
                )}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                {dealerCart.dealerInfo?.location && (
                  <span className="flex items-center gap-1">
                    <FiMapPin className="w-3 h-3" />
                    {dealerCart.dealerInfo.location}
                      </span>
                )}
                {dealerCart.dealerInfo?.rating && (
                  <span className="flex items-center gap-1">
                    <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                    {dealerCart.dealerInfo.rating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                    </div>

                    <div className="text-right">
            <p className="text-sm text-gray-600">{dealerCart.itemCount} items</p>
                    <button
              onClick={() => clearDealerCart(dealerCart.dealerId)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
              Clear all
                    </button>
                  </div>
                </div>
              </div>

      {/* Cart Items */}
      <div className="divide-y divide-gray-200">
        {dealerCart.items.map((item) => (
          <CartItem 
            key={item.product_id} 
            item={item}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
          />
            ))}
          </div>

      {/* Dealer Cart Summary */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="flex justify-between mb-1">
                <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${dealerCart.subtotal.toFixed(2)}</span>
              </div>
            <div className="flex justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <FiTruck className="w-3 h-3" />
                Shipping:
              </span>
                <span className="font-medium">
                {shipping === 0 ? (
                  <span className="text-green-600">FREE</span>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
                </span>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-semibold text-gray-900">
              ${total.toFixed(2)}
            </p>
            {shipping === 0 && dealerCart.subtotal < 100 && (
              <p className="text-xs text-gray-500">
                Free shipping on orders over $100
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CartItem = ({ item, updateQuantity, removeFromCart }) => {
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(item.product_id);
    } else {
      updateQuantity(item.product_id, newQuantity);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-start gap-4">
        {/* Product Image */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img 
            src={item.image || 'https://via.placeholder.com/80x80?text=Auto+Part'} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 mb-1">{item.name}</h4>
          <p className="text-sm text-gray-600 mb-2">SKU: {item.sku || 'N/A'}</p>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {item.originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ${item.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="font-semibold text-gray-900">
                ${item.price.toFixed(2)}
              </span>
            </div>

            {item.stock_quantity <= 5 && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                Only {item.stock_quantity} left
              </span>
            )}
          </div>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className="p-2 hover:bg-gray-50 transition-colors"
              disabled={item.quantity <= 1}
            >
              <FiMinus className="w-4 h-4" />
            </button>
            <span className="px-3 py-2 min-w-[3rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              className="p-2 hover:bg-gray-50 transition-colors"
              disabled={item.quantity >= item.stock_quantity}
            >
              <FiPlus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => removeFromCart(item.product_id)}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiDealerCart; 