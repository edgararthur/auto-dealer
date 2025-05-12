import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart, FiArrowRight, FiArrowLeft, FiClock, FiSave } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { Button } from '../../components/common';
import SavedCarts from '../../components/cart/SavedCarts';

// Shipping options
const shippingOptions = [
  { id: 'standard', name: 'Standard Shipping (3-5 days)', price: 5.99 },
  { id: 'express', name: 'Express Shipping (1-2 days)', price: 12.99 },
  { id: 'free', name: 'Free Shipping (5-7 days)', price: 0, threshold: 99 }
];

const ShoppingCart = () => {
  const navigate = useNavigate();
  const { 
    items: cartItems, 
    loading, 
    updateQuantity, 
    removeFromCart, 
    savedCarts,
    saveCartForLater,
    loadSavedCart,
    deleteSavedCart
  } = useCart();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [cartName, setCartName] = useState('');
  const [savingCart, setSavingCart] = useState(false);
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const itemPrice = item.product?.price || 0;
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
  const handleQuantityChange = (id, change, currentQuantity) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };
  
  // Handle item removal
  const handleRemoveItem = (id) => {
    removeFromCart(id);
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

  // Handle save cart for later
  const handleSaveCartForLater = async () => {
    setSavingCart(true);
    try {
      const result = await saveCartForLater(cartName || undefined);
      
      if (result.success) {
        setSaveModalOpen(false);
        setCartName('');
      } else {
        alert(result.error || 'Failed to save cart');
      }
    } finally {
      setSavingCart(false);
    }
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-4 text-neutral-500">Loading your cart...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Cart items */}
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
                          src={item.product?.image || 'https://via.placeholder.com/80'}
                          alt={item.product?.name || 'Product'}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <Link 
                          to={`/products/${item.product_id}`}
                          className="font-medium text-neutral-900 hover:text-primary-600"
                        >
                          {item.product?.name || `Product #${item.product_id}`}
                        </Link>
                        {item.product?.sku && (
                          <p className="mt-1 text-sm text-neutral-500">SKU: {item.product.sku}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Price */}
                    <div className="mt-4 sm:mt-0 text-center">
                      <div className="text-neutral-900 font-medium">
                        ${(item.product?.price || 0).toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Quantity */}
                    <div className="mt-4 sm:mt-0 flex justify-center">
                      <div className="flex border border-neutral-200 rounded">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1, item.quantity)}
                          className="p-2 text-neutral-600 hover:text-neutral-900"
                        >
                          <FiMinus size={16} />
                        </button>
                        <div className="w-10 text-center p-2">{item.quantity}</div>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1, item.quantity)}
                          className="p-2 text-neutral-600 hover:text-neutral-900"
                        >
                          <FiPlus size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="mt-4 sm:mt-0 text-right flex flex-col items-end">
                      <div className="text-neutral-900 font-medium">
                        ${((item.product?.price || 0) * item.quantity).toFixed(2)}
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="mt-1 flex items-center text-sm text-neutral-500 hover:text-red-500"
                      >
                        <FiTrash2 size={14} className="mr-1" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 sm:p-6 bg-neutral-50 border-t border-neutral-200 flex justify-between">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/products')}
                  >
                    <FiArrowLeft className="mr-2" /> Continue Shopping
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setSaveModalOpen(true)}
                  >
                    <FiSave className="mr-2" /> Save For Later
                  </Button>
                </div>
                
                <Button variant="primary" onClick={() => navigate('/checkout')}>
                  Proceed to Checkout <FiArrowRight className="ml-2" />
                </Button>
              </div>
            </div>
          )}
          
          {/* Saved Carts */}
          {!isCartEmpty && savedCarts.length === 0 && (
            <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm">
              <div className="flex items-center text-neutral-600 mb-2">
                <FiClock className="mr-2" />
                <h3 className="font-medium">Save your cart for later</h3>
              </div>
              <p className="text-sm text-neutral-500 mb-4">
                Need to finish your purchase later? Save your cart and come back anytime to complete your order.
              </p>
              <Button 
                variant="outline" 
                size="small"
                onClick={() => setSaveModalOpen(true)}
              >
                <FiSave className="mr-2" /> Save Cart for Later
              </Button>
            </div>
          )}
          
          {/* Saved Carts Component */}
          {savedCarts.length > 0 && (
            <SavedCarts
              savedCarts={savedCarts}
              onLoadCart={loadSavedCart}
              onDeleteCart={deleteSavedCart}
              loading={loading}
            />
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              
              {promoApplied && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${promoDiscount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-neutral-600">Shipping</span>
                <span className="font-medium">${calculateShipping().toFixed(2)}</span>
              </div>
              
              <div className="pt-4 border-t border-neutral-200 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
            
            {/* Free shipping progress */}
            {!isFreeShippingEligible && (
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span>Add ${amountToFreeShipping.toFixed(2)} more for free shipping</span>
                  <span>${freeShippingOption.threshold.toFixed(2)}</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full" 
                    style={{ width: `${(subtotal / freeShippingOption.threshold) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {/* Shipping options */}
            <div className="mb-6">
              <h3 className="font-medium text-neutral-900 mb-3">Shipping</h3>
              <div className="space-y-2">
                {shippingOptions.map(option => (
                  <label 
                    key={option.id} 
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      shippingMethod === option.id 
                        ? 'border-primary-500 bg-primary-50' 
                        : 'border-neutral-200 hover:border-neutral-300'
                    } ${option.id === 'free' && !isFreeShippingEligible ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      value={option.id}
                      checked={shippingMethod === option.id}
                      onChange={handleShippingChange}
                      disabled={option.id === 'free' && !isFreeShippingEligible}
                      className="form-radio h-4 w-4 text-primary-600"
                    />
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-neutral-900">{option.name}</div>
                      <div className="text-sm text-neutral-500">
                        {option.price === 0 
                          ? 'FREE' 
                          : `$${option.price.toFixed(2)}`
                        }
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Promo code */}
            <div className="mb-6">
              <h3 className="font-medium text-neutral-900 mb-3">Promo Code</h3>
              <div>
                <form onSubmit={handleApplyPromo} className="flex">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value)}
                    disabled={promoApplied}
                    placeholder="Enter promo code"
                    className="flex-1 border border-neutral-300 rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={promoApplied || !promoCode}
                    className={`bg-primary-600 text-white px-4 py-2 rounded-r-lg ${
                      promoApplied || !promoCode ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'
                    }`}
                  >
                    {promoApplied ? 'Applied' : 'Apply'}
                  </button>
                </form>
                {promoApplied && (
                  <div className="text-sm text-green-600 mt-2">
                    Promo code applied! You saved ${promoDiscount.toFixed(2)}
                  </div>
                )}
              </div>
            </div>
            
            <Button 
              variant="primary" 
              className="w-full"
              disabled={isCartEmpty}
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Save Cart Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Save Cart for Later</h2>
            <p className="text-neutral-600 mb-4">
              Give your cart a name so you can easily find it later.
            </p>
            <input
              type="text"
              value={cartName}
              onChange={e => setCartName(e.target.value)}
              placeholder="My Cart Name"
              className="w-full border border-neutral-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSaveModalOpen(false);
                  setCartName('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveCartForLater}
                disabled={savingCart}
              >
                {savingCart ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Cart'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart; 