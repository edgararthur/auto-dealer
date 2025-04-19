import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart, FiArrowRight, FiArrowLeft } from 'react-icons/fi';

// Mock cart data
const initialCartItems = [
  {
    id: 3,
    name: 'LED Headlight Kit',
    sku: 'LED-P-9006',
    price: 129.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80',
    inStock: true
  },
  {
    id: 2,
    name: 'High-Performance Oil Filter',
    sku: 'FIL-KN-103',
    price: 12.99,
    salePrice: 9.99,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80',
    inStock: true
  },
  {
    id: 4,
    name: 'All-Weather Floor Mats',
    sku: 'MAT-WT-221',
    price: 79.99,
    salePrice: 59.99,
    quantity: 1,
    image: 'https://images.unsplash.com/photo-1563299796-17596ed6b017?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&h=150&q=80',
    inStock: true
  }
];

// Shipping options
const shippingOptions = [
  { id: 'standard', name: 'Standard Shipping (3-5 days)', price: 5.99 },
  { id: 'express', name: 'Express Shipping (1-2 days)', price: 12.99 },
  { id: 'free', name: 'Free Shipping (5-7 days)', price: 0, threshold: 99 }
];

const ShoppingCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [shippingMethod, setShippingMethod] = useState('standard');
  
  // Load cart data
  useEffect(() => {
    // In a real app, this would fetch from an API or local storage
    setLoading(true);
    setTimeout(() => {
      setCartItems(initialCartItems);
      setLoading(false);
    }, 500);
  }, []);
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.salePrice || item.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  };
  
  // Calculate shipping cost
  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    const selectedShipping = shippingOptions.find(option => option.id === shippingMethod);
    
    // Check if order qualifies for free shipping
    if (selectedShipping.id === 'free' && subtotal < selectedShipping.threshold) {
      return shippingOptions[0].price; // Fall back to standard shipping
    }
    
    return selectedShipping.price;
  };
  
  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const shipping = calculateShipping();
    return subtotal + shipping - promoDiscount;
  };
  
  // Handle quantity change
  const handleQuantityChange = (id, change) => {
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          return {
            ...item,
            quantity: newQuantity >= 1 ? newQuantity : 1
          };
        }
        return item;
      })
    );
  };
  
  // Handle item removal
  const handleRemoveItem = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  // Handle promo code application
  const handleApplyPromo = (e) => {
    e.preventDefault();
    
    // In a real app, this would validate the promo code with an API
    if (promoCode.toUpperCase() === 'SAVE10') {
      const discount = calculateSubtotal() * 0.1; // 10% discount
      setPromoDiscount(discount);
      setPromoApplied(true);
    } else {
      alert('Invalid promo code');
    }
  };
  
  // Handle shipping method change
  const handleShippingChange = (e) => {
    setShippingMethod(e.target.value);
  };
  
  // Check if cart is empty
  const isCartEmpty = cartItems.length === 0;
  
  // Get subtotal and check if eligible for free shipping
  const subtotal = calculateSubtotal();
  const freeShippingOption = shippingOptions.find(option => option.id === 'free');
  const isFreeShippingEligible = subtotal >= freeShippingOption.threshold;
  const amountToFreeShipping = freeShippingOption.threshold - subtotal;
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]"></div>
        <p className="mt-4 text-neutral-500">Loading your cart...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-neutral-900">Shopping Cart</h1>
      
      {isCartEmpty ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100 text-neutral-500 mb-4">
            <FiShoppingCart className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Your cart is empty</h3>
          <p className="text-neutral-600 mb-6">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="hidden sm:grid sm:grid-cols-6 bg-neutral-50 p-4 border-b border-neutral-200">
                <div className="sm:col-span-3 font-medium text-neutral-900">Product</div>
                <div className="text-center font-medium text-neutral-900">Price</div>
                <div className="text-center font-medium text-neutral-900">Quantity</div>
                <div className="text-right font-medium text-neutral-900">Subtotal</div>
              </div>
              
              <div className="divide-y divide-neutral-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 sm:py-6 sm:grid sm:grid-cols-6 sm:gap-4 sm:items-center">
                    {/* Product info */}
                    <div className="sm:col-span-3 flex items-center">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <Link 
                          to={`/products/${item.id}`}
                          className="font-medium text-neutral-900 hover:text-primary-600"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-sm text-neutral-500">SKU: {item.sku}</p>
                        <button
                          type="button"
                          className="mt-2 flex items-center text-sm text-error-600 hover:text-error-500 sm:hidden"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <FiTrash2 className="h-4 w-4 mr-1" />
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="mt-4 sm:mt-0 text-center">
                      {item.salePrice ? (
                        <div>
                          <span className="font-medium text-neutral-900">${item.salePrice.toFixed(2)}</span>
                          <span className="block text-sm text-neutral-500 line-through">${item.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-medium text-neutral-900">${item.price.toFixed(2)}</span>
                      )}
                    </div>
                    
                    {/* Quantity */}
                    <div className="mt-4 sm:mt-0 flex items-center justify-center">
                      <div className="flex border border-neutral-300 rounded-md">
                        <button
                          type="button"
                          className="p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none"
                          onClick={() => handleQuantityChange(item.id, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <FiMinus className="h-4 w-4" />
                        </button>
                        <span className="w-10 text-center py-2 text-neutral-900">{item.quantity}</span>
                        <button
                          type="button"
                          className="p-2 text-neutral-600 hover:text-neutral-900 focus:outline-none"
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <FiPlus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Subtotal + Remove */}
                    <div className="mt-4 sm:mt-0 flex items-center justify-between sm:block sm:text-right">
                      <span className="sm:hidden font-medium text-neutral-900">Subtotal:</span>
                      <span className="font-medium text-neutral-900">
                        ${((item.salePrice || item.price) * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        className="hidden sm:inline-flex items-center ml-4 text-sm text-error-600 hover:text-error-500"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <FiTrash2 className="h-4 w-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="px-4 py-5 sm:px-6 bg-neutral-50 flex flex-wrap justify-between items-center border-t border-neutral-200">
                <Link
                  to="/shop/products"
                  className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <FiArrowLeft className="mr-2 h-4 w-4" />
                  Continue Shopping
                </Link>
                
                <button
                  type="button"
                  className="mt-4 sm:mt-0 w-full sm:w-auto px-6 py-3 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm"
                  onClick={() => {
                    // In a real app, this would refresh prices/availability
                    setLoading(true);
                    setTimeout(() => setLoading(false), 500);
                  }}
                >
                  Update Cart
                </button>
              </div>
            </div>
          </div>
          
          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-4 py-5 sm:px-6 border-b border-neutral-200">
                <h3 className="text-lg font-medium text-neutral-900">Order Summary</h3>
              </div>
              
              <div className="px-4 py-5 sm:px-6 space-y-4">
                {/* Free shipping progress */}
                {!isFreeShippingEligible && (
                  <div className="bg-neutral-50 p-3 rounded-md">
                    <p className="text-sm text-neutral-700">
                      Add <span className="font-medium">${amountToFreeShipping.toFixed(2)}</span> more to qualify for FREE shipping
                    </p>
                    <div className="mt-2 w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600" 
                        style={{ width: `${(subtotal / freeShippingOption.threshold) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {/* Subtotal */}
                <div className="flex justify-between text-base">
                  <span className="text-neutral-700">Subtotal</span>
                  <span className="font-medium text-neutral-900">${subtotal.toFixed(2)}</span>
                </div>
                
                {/* Shipping method */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Shipping
                  </label>
                  <div className="space-y-3">
                    {shippingOptions.map((option) => (
                      <div key={option.id} className="flex items-center">
                        <input
                          id={`shipping-${option.id}`}
                          name="shipping-method"
                          type="radio"
                          value={option.id}
                          checked={shippingMethod === option.id}
                          onChange={handleShippingChange}
                          disabled={option.id === 'free' && !isFreeShippingEligible}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                        />
                        <label 
                          htmlFor={`shipping-${option.id}`} 
                          className={`ml-3 flex flex-1 justify-between ${
                            option.id === 'free' && !isFreeShippingEligible
                              ? 'text-neutral-400'
                              : 'text-neutral-700'
                          }`}
                        >
                          <span>{option.name}</span>
                          <span>
                            {option.price === 0
                              ? 'Free'
                              : `$${option.price.toFixed(2)}`
                            }
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Promo code */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Promo Code
                  </label>
                  {promoApplied ? (
                    <div className="bg-success-50 border border-success-200 rounded-md p-3 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-success-700">
                          Promo code applied
                        </p>
                        <p className="text-xs text-success-600">
                          10% discount (-${promoDiscount.toFixed(2)})
                        </p>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-success-700 hover:text-success-800"
                        onClick={() => {
                          setPromoDiscount(0);
                          setPromoApplied(false);
                          setPromoCode('');
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="flex-1 min-w-0 block rounded-l-md border-neutral-300 focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter code"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        disabled={!promoCode}
                      >
                        Apply
                      </button>
                    </form>
                  )}
                </div>
                
                {/* Totals */}
                <div className="border-t border-neutral-200 pt-4 space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="text-neutral-700">Shipping</span>
                    <span className="font-medium text-neutral-900">
                      {calculateShipping() === 0
                        ? 'Free'
                        : `$${calculateShipping().toFixed(2)}`
                      }
                    </span>
                  </div>
                  
                  {promoApplied && (
                    <div className="flex justify-between text-base">
                      <span className="text-neutral-700">Discount</span>
                      <span className="font-medium text-error-600">-${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-neutral-900">Total</span>
                    <span className="text-neutral-900">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                
                {/* Checkout button */}
                <div className="mt-6">
                  <Link
                    to="/checkout"
                    className="w-full flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Proceed to Checkout
                    <FiArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart; 