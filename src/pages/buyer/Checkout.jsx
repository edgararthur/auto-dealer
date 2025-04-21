import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSmartphone, FiTruck, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { PaymentService, CartService, OrderService } from 'autoplus-shared';
import { useAuth } from '../../contexts/AuthContext';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState({ 
    processing: false, 
    success: false, 
    error: null,
    message: '' 
  });
  const [formData, setFormData] = useState({
    // Contact info
    email: user?.email || '',
    phone: user?.profile?.phone || '',
    
    // Shipping info
    firstName: user?.profile?.name?.split(' ')[0] || '',
    lastName: user?.profile?.name?.split(' ')[1] || '',
    address: '',
    city: '',
    region: '',
    zip: '',
    country: 'Ghana',
    
    // Payment info - only MTN Mobile Money
    mobileNumber: user?.profile?.phone || '',
    
    // Additional
    saveInfo: false,
    shippingMethod: 'standard',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  
  // Shipping methods
  const shippingMethods = [
    { id: 'standard', name: 'Standard Shipping (3-5 days)', price: 15.00 },
    { id: 'express', name: 'Express Shipping (1-2 days)', price: 30.00 },
    { id: 'free', name: 'Free Shipping (5-7 days)', price: 0, threshold: 500 }
  ];

  // Fetch cart data
  useEffect(() => {
    if (!user) {
      navigate('/auth/login', { state: { returnUrl: '/checkout' } });
      return;
    }
    
    fetchCartItems();
  }, [user, navigate]);
  
  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const result = await CartService.getCartItems(user.id);
      if (result.success) {
        setCartItems(result.cartItems);
        setCartTotal(result.cartTotal);
        
        if (result.cartItems.length === 0) {
          // Redirect if cart is empty
          navigate('/cart');
          return;
        }
      } else {
        setErrors({ form: 'Failed to load cart items: ' + result.error });
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setErrors({ form: 'An error occurred while loading cart items' });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle shipping method change
  const handleShippingChange = (e) => {
    setFormData(prev => ({ ...prev, shippingMethod: e.target.value }));
  };

  // Validate mobile number format for Ghana
  const validateMobileNumber = (number) => {
    // Ghana mobile number format: 024XXXXXXX, 054XXXXXXX, 055XXXXXXX, etc.
    const ghanaNumberRegex = /^0(20|23|24|26|27|54|55|59)\d{7}$/;
    return ghanaNumberRegex.test(number);
  };
  
  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    // Contact validation
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    
    // Shipping validation
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.region) newErrors.region = 'Region is required';
    if (!formData.zip) newErrors.zip = 'Postal code is required';
    
    // Payment validation
    if (!formData.mobileNumber) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!validateMobileNumber(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Enter a valid 10-digit Ghana mobile number (e.g., 0241234567)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Calculate order summary
  const calculateSubtotal = () => {
    return cartTotal || 0;
  };
  
  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    const selectedShipping = shippingMethods.find(option => option.id === formData.shippingMethod);
    
    // Check if order qualifies for free shipping
    if (selectedShipping.id === 'free' && subtotal < selectedShipping.threshold) {
      return shippingMethods[0].price; // Fall back to standard shipping
    }
    
    return selectedShipping.price;
  };
  
  const calculateTax = () => {
    return calculateSubtotal() * 0.03; // Ghana VAT rate (simplified for example)
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping() + calculateTax();
  };
  
  // Process MTN Mobile Money payment
  const processMomoPayment = async (orderId, amount, phoneNumber) => {
    setPaymentStatus({
      processing: true,
      success: false,
      error: null,
      message: 'Initializing MTN Mobile Money payment...'
    });
    
    try {
      // You would typically call your payment service here
      // For now, we'll simulate a payment response
      const paymentResult = {
        success: true,
        transactionId: 'MOMO-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
        message: 'Payment initiated. You will receive a prompt on your phone to confirm.'
      };
      
      // In a real implementation, you would call an actual payment service:
      // const paymentResult = await PaymentService.processMomoPayment({
      //   orderId,
      //   amount,
      //   phoneNumber,
      //   description: `Payment for order #${orderId}`
      // });
      
      if (paymentResult.success) {
        setPaymentStatus({
          processing: true,
          success: false,
          error: null,
          message: paymentResult.message
        });
        
        // Simulate waiting for payment confirmation
        // In a real implementation, you would use webhooks or polling
        setTimeout(() => {
          setPaymentStatus({
            processing: false,
            success: true,
            error: null,
            message: 'Payment successful!'
          });
          
          // Update order status and redirect to confirmation page
          setTimeout(() => {
            navigate(`/order-confirmation/${orderId}`, { 
              state: { 
                orderId: orderId,
                total: amount,
                paymentMethod: 'MTN Mobile Money',
                transactionId: paymentResult.transactionId
              } 
            });
          }, 1000);
        }, 3000);
        
      } else {
        throw new Error(paymentResult.message || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus({
        processing: false,
        success: false,
        error: true,
        message: error.message || 'Payment processing failed. Please try again.'
      });
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector('.text-error-600');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setProcessing(true);
    
    try {
      // Create order with shipping information
      const orderData = {
        shipping_address: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          city: formData.city,
          region: formData.region,
          postal_code: formData.zip,
          country: formData.country || 'Ghana',
          phone: formData.phone
        },
        payment_method: 'momo', // Only using MTN Mobile Money
        shipping_method: formData.shippingMethod,
        order_notes: formData.notes || '',
        // Don't auto-process payment - we'll handle it manually
        process_payment: false
      };
      
      // Call OrderService to create the order
      const { success, order, error } = await OrderService.createOrder(user.id, orderData);
      
      if (!success) {
        throw new Error(error || 'Failed to create order');
      }
      
      // Process payment
      await processMomoPayment(
        order.id, 
        calculateTotal(), 
        formData.mobileNumber
      );
      
    } catch (error) {
      console.error('Checkout error:', error);
      setErrors({ form: error.message || 'An error occurred during checkout. Please try again.' });
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]"></div>
        <p className="mt-4 text-neutral-500">Loading checkout...</p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Checkout</h1>
        <p className="mt-2 text-neutral-600">
          Complete your order by providing your shipping and payment details.
        </p>
      </div>

      {errors.form && (
        <div className="mb-6 p-4 bg-error-50 border border-error-200 rounded-md text-error-700">
          {errors.form}
        </div>
      )}
      
      {paymentStatus.message && (
        <div className={`mb-6 p-4 rounded-md ${
          paymentStatus.error 
            ? 'bg-error-50 border border-error-200 text-error-700' 
            : paymentStatus.success 
              ? 'bg-success-50 border border-success-200 text-success-700'
              : 'bg-info-50 border border-info-200 text-info-700'
        }`}>
          <div className="flex items-start">
            {paymentStatus.error ? (
              <FiAlertCircle className="mt-0.5 mr-3 h-5 w-5 text-error-500" />
            ) : paymentStatus.success ? (
              <FiCheckCircle className="mt-0.5 mr-3 h-5 w-5 text-success-500" />
            ) : (
              <div className="mt-0.5 mr-3 h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent text-info-500"></div>
            )}
            <p>{paymentStatus.message}</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmit}>
            {/* Contact information */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="p-6 bg-neutral-50 border-b border-neutral-200">
                <h2 className="flex items-center text-lg font-medium text-neutral-900">
                  <FiUser className="mr-2 h-5 w-5 text-primary-600" />
                  Contact Information
                </h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.email ? 'border-error-300' : 'border-neutral-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                  {errors.email && <p className="mt-1 text-sm text-error-600">{errors.email}</p>}
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.phone ? 'border-error-300' : 'border-neutral-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                  {errors.phone && <p className="mt-1 text-sm text-error-600">{errors.phone}</p>}
                </div>
              </div>
            </div>
            
            {/* Shipping information */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="p-6 bg-neutral-50 border-b border-neutral-200">
                <h2 className="flex items-center text-lg font-medium text-neutral-900">
                  <FiTruck className="mr-2 h-5 w-5 text-primary-600" />
                  Shipping Information
                </h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-neutral-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.firstName ? 'border-error-300' : 'border-neutral-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                  {errors.firstName && <p className="mt-1 text-sm text-error-600">{errors.firstName}</p>}
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-neutral-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.lastName ? 'border-error-300' : 'border-neutral-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                  {errors.lastName && <p className="mt-1 text-sm text-error-600">{errors.lastName}</p>}
                </div>
                
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.address ? 'border-error-300' : 'border-neutral-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                  {errors.address && <p className="mt-1 text-sm text-error-600">{errors.address}</p>}
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-neutral-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.city ? 'border-error-300' : 'border-neutral-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                  />
                  {errors.city && <p className="mt-1 text-sm text-error-600">{errors.city}</p>}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-neutral-700 mb-1">
                      Region
                    </label>
                    <select
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.region ? 'border-error-300' : 'border-neutral-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    >
                      <option value="">Select...</option>
                      <option value="Greater Accra">Greater Accra</option>
                      <option value="Ashanti">Ashanti</option>
                      <option value="Western">Western</option>
                      <option value="Eastern">Eastern</option>
                      <option value="Central">Central</option>
                      <option value="Volta">Volta</option>
                      <option value="Northern">Northern</option>
                      <option value="Upper East">Upper East</option>
                      <option value="Upper West">Upper West</option>
                      <option value="North East">North East</option>
                      <option value="Savannah">Savannah</option>
                      <option value="Bono">Bono</option>
                      <option value="Bono East">Bono East</option>
                      <option value="Ahafo">Ahafo</option>
                      <option value="Western North">Western North</option>
                      <option value="Oti">Oti</option>
                    </select>
                    {errors.region && <p className="mt-1 text-sm text-error-600">{errors.region}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-neutral-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="zip"
                      name="zip"
                      value={formData.zip}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border ${errors.zip ? 'border-error-300' : 'border-neutral-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    />
                    {errors.zip && <p className="mt-1 text-sm text-error-600">{errors.zip}</p>}
                  </div>
                </div>
                
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Shipping Method
                  </label>
                  <div className="mt-2 space-y-3">
                    {shippingMethods.map((method) => (
                      <div key={method.id} className="flex items-center">
                        <input
                          id={`shipping-${method.id}`}
                          name="shippingMethod"
                          type="radio"
                          value={method.id}
                          checked={formData.shippingMethod === method.id}
                          onChange={handleShippingChange}
                          disabled={method.id === 'free' && calculateSubtotal() < method.threshold}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                        />
                        <label 
                          htmlFor={`shipping-${method.id}`} 
                          className={`ml-3 flex flex-1 justify-between ${
                            method.id === 'free' && calculateSubtotal() < method.threshold
                              ? 'text-neutral-400'
                              : 'text-neutral-700'
                          }`}
                        >
                          <span>{method.name}</span>
                          <span>
                            {method.price === 0
                              ? 'Free'
                              : `GH₵${method.price.toFixed(2)}`
                            }
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  {formData.shippingMethod === 'free' && calculateSubtotal() < shippingMethods.find(m => m.id === 'free').threshold && (
                    <p className="mt-2 text-sm text-neutral-500">
                      Add GH₵{(shippingMethods.find(m => m.id === 'free').threshold - calculateSubtotal()).toFixed(2)} more to qualify for free shipping.
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Special instructions for delivery"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>
              </div>
            </div>
            
            {/* Payment information - MTN Mobile Money only */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 bg-neutral-50 border-b border-neutral-200">
                <h2 className="flex items-center text-lg font-medium text-neutral-900">
                  <FiSmartphone className="mr-2 h-5 w-5 text-primary-600" />
                  Payment Method: MTN Mobile Money
                </h2>
              </div>
              
              <div className="p-6 grid grid-cols-1 gap-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="payment-momo"
                      name="paymentMethod"
                      type="radio"
                      checked={true}
                      readOnly
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
                    />
                  </div>
                  <div className="ml-3">
                    <label htmlFor="payment-momo" className="text-sm font-medium text-neutral-700">
                      MTN Mobile Money (MoMo)
                    </label>
                    <p className="text-xs text-neutral-500 mt-1">
                      Pay with your MTN Mobile Money account
                    </p>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="mobileNumber" className="block text-sm font-medium text-neutral-700 mb-1">
                    MTN Mobile Money Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      placeholder="0241234567"
                      className={`w-full px-3 py-2 border ${errors.mobileNumber ? 'border-error-300' : 'border-neutral-300'} rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                    />
                  </div>
                  {errors.mobileNumber && <p className="mt-1 text-sm text-error-600">{errors.mobileNumber}</p>}
                  <p className="mt-2 text-xs text-neutral-500">
                    Enter the MTN mobile number registered with your Mobile Money account
                  </p>
                </div>

                <div className="bg-orange-50 border border-orange-100 rounded-md p-4 text-sm text-neutral-700">
                  <div className="flex">
                    <FiAlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-800">Payment Information</p>
                      <ul className="mt-2 text-orange-700 space-y-1 list-disc list-inside pl-1">
                        <li>You will receive a prompt on your phone to confirm the payment</li>
                        <li>Complete the payment by entering your Mobile Money PIN</li>
                        <li>Your order will be confirmed once payment is complete</li>
                        <li>The payment prompt will expire after 5 minutes</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <input
                    id="saveInfo"
                    name="saveInfo"
                    type="checkbox"
                    checked={formData.saveInfo}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded mt-1"
                  />
                  <label htmlFor="saveInfo" className="ml-2 text-sm text-neutral-700">
                    Save this information for next time
                  </label>
                </div>
              </div>
            </div>
          </form>
        </div>
        
        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-8">
            <div className="p-6 bg-neutral-50 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Order Summary</h2>
            </div>
            
            <div className="p-6">
              <div className="flow-root">
                <ul className="-my-6 divide-y divide-neutral-200">
                  {cartItems.map((item) => (
                    <li key={item.id} className="py-6 flex">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200">
                        <img
                          src={item.product.primaryImage || item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex-1 flex flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-neutral-900">
                            <h3>{item.product.name}</h3>
                            <p className="ml-4">GH₵{(item.total).toFixed(2)}</p>
                          </div>
                          <p className="mt-1 text-sm text-neutral-500">{item.product.brand} {item.product.model}</p>
                        </div>
                        <div className="flex-1 flex items-end justify-between text-sm">
                          <p className="text-neutral-500">Qty {item.quantity}</p>
                          <Link
                            to="/cart"
                            className="font-medium text-primary-600 hover:text-primary-500"
                          >
                            Edit
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8 border-t border-neutral-200 pt-6 space-y-4">
                <div className="flex justify-between text-base text-neutral-700">
                  <p>Subtotal</p>
                  <p>GH₵{calculateSubtotal().toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-base text-neutral-700">
                  <p>Shipping</p>
                  <p>
                    {calculateShipping() === 0
                      ? 'Free'
                      : `GH₵${calculateShipping().toFixed(2)}`
                    }
                  </p>
                </div>
                <div className="flex justify-between text-base text-neutral-700">
                  <p>Tax</p>
                  <p>GH₵{calculateTax().toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-lg font-medium text-neutral-900">
                  <p>Total</p>
                  <p>GH₵{calculateTotal().toFixed(2)}</p>
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={processing || paymentStatus.processing}
                  className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 ${
                    (processing || paymentStatus.processing) ? 'opacity-70 cursor-not-allowed' : 'hover:bg-primary-700'
                  }`}
                >
                  {processing || paymentStatus.processing ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                      {paymentStatus.processing ? 'Processing Payment...' : 'Processing...'}
                    </>
                  ) : (
                    <>Pay GH₵{calculateTotal().toFixed(2)}</>
                  )}
                </button>
              </div>
              
              <div className="mt-4 text-center">
                <Link
                  to="/cart"
                  className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  <FiArrowLeft className="mr-1 h-4 w-4" />
                  Return to cart
                </Link>
              </div>
              
              <div className="mt-8 border-t border-neutral-200 pt-6">
                <div className="flex items-center">
                  <FiCheckCircle className="h-5 w-5 text-success-500" />
                  <p className="ml-2 text-sm text-neutral-600">All transactions are secure and encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout; 