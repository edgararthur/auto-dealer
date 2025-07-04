import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingCart, FiArrowRight, FiArrowLeft, FiClock, FiSave } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { Button, Breadcrumb } from '../../components/common';
import SavedCarts from '../../components/cart/SavedCarts';
import MultiDealerCart from '../../components/cart/MultiDealerCart';
import { formatPrice } from '../../utils/priceFormatter';

// Shipping options
const shippingOptions = [
  { id: 'standard', name: 'Standard Shipping (3-5 days)', price: 15.99 },
  { id: 'express', name: 'Express Shipping (1-2 days)', price: 32.99 },
  { id: 'free', name: 'Free Shipping (5-7 days)', price: 0, threshold: 299 }
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
  const handleQuantityChange = (id, newQuantity) => {
    updateQuantity(id, newQuantity);
  };
  
  // Handle item removal
  const handleRemoveItem = (id) => {
    removeFromCart(id);
  };

  // Handle checkout
  const handleCheckout = (groupedItems) => {
    navigate('/checkout');
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
  
  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Shopping Cart', path: '/cart' }
  ];

  return (
    <div className="bg-neutral-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            {/* Multi-Dealer Cart */}
            <MultiDealerCart
              cartItems={cartItems}
              onUpdateQuantity={handleQuantityChange}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
            />
            
            {/* Saved Carts */}
            {!isCartEmpty && (!savedCarts || savedCarts.length === 0) && (
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
            {savedCarts && savedCarts.length > 0 && (
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
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                
                {promoApplied && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(promoDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-medium">{formatPrice(calculateShipping())}</span>
                </div>
                
                <div className="pt-4 border-t border-neutral-200 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(calculateTotal())}</span>
                </div>
              </div>
              
              {/* Free shipping progress */}
              {!isFreeShippingEligible && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Add {formatPrice(amountToFreeShipping)} more for free shipping</span>
                    <span>{formatPrice(freeShippingOption.threshold)}</span>
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
                            : formatPrice(option.price)
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
                      Promo code applied! You saved {formatPrice(promoDiscount)}
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