import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight, FiFileText, FiHome, FiShoppingBag } from 'react-icons/fi';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  
  useEffect(() => {
    // Check if we have order details from the location state
    if (location.state?.orderId) {
      setOrderDetails({
        orderId: location.state.orderId,
        total: location.state.total,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });
    } else {
      // If no order details, create mock data or redirect
      // For demo purposes, we'll create mock data
      setOrderDetails({
        orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        total: 149.97,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });
      
      // In a real app, might redirect if no valid order:
      // navigate('/shop');
    }
    
    // Clear cart in a real app
    // localStorage.removeItem('cart');
  }, [location, navigate]);
  
  if (!orderDetails) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]"></div>
        <p className="mt-4 text-neutral-500">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-success-100 text-success-600 mb-4">
          <FiCheckCircle className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Your order has been placed!</h1>
        <p className="text-lg text-neutral-600">
          Thank you for your purchase. We'll send you a confirmation email shortly.
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <div>
              <p className="text-sm text-neutral-500">Order Number</p>
              <p className="text-lg font-bold text-neutral-900">{orderDetails.orderId}</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <p className="text-sm text-neutral-500">Order Date</p>
              <p className="text-neutral-700">{orderDetails.date}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-neutral-900 mb-3">Order Summary</h3>
            <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="text-neutral-900">${(orderDetails.total * 0.85).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Shipping</span>
                <span className="text-neutral-900">${(orderDetails.total * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-600">Tax</span>
                <span className="text-neutral-900">${(orderDetails.total * 0.07).toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-neutral-200 flex justify-between font-medium">
                <span className="text-neutral-900">Total</span>
                <span className="text-neutral-900">${orderDetails.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-3">Shipping Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-neutral-700">Shipping Address</p>
                <p className="mt-1 text-neutral-600">John Doe</p>
                <p className="text-neutral-600">123 Main St</p>
                <p className="text-neutral-600">Anytown, CA 12345</p>
                <p className="text-neutral-600">United States</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700">Shipping Method</p>
                <p className="mt-1 text-neutral-600">Standard Shipping (3-5 business days)</p>
                <p className="mt-3 text-sm font-medium text-neutral-700">Estimated Delivery</p>
                <p className="mt-1 text-neutral-600">{orderDetails.estimatedDelivery}</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-lg font-medium text-neutral-900 mb-3">Payment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-neutral-700">Payment Method</p>
                <p className="mt-1 text-neutral-600">Credit Card (Visa ending in 1234)</p>
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-700">Billing Address</p>
                <p className="mt-1 text-neutral-600">Same as shipping address</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-neutral-200">
          <h3 className="text-lg font-medium text-neutral-900">What happens next?</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                1
              </div>
              <div className="ml-4">
                <p className="text-neutral-900 font-medium">Order processing</p>
                <p className="text-neutral-600">
                  We're preparing your order for shipment. You'll receive an email when your order ships.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                2
              </div>
              <div className="ml-4">
                <p className="text-neutral-900 font-medium">Shipping</p>
                <p className="text-neutral-600">
                  Your order will be shipped via the selected shipping method. 
                  You'll receive a tracking number to monitor your delivery.
                </p>
              </div>
            </div>
            
            <div className="flex">
              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                3
              </div>
              <div className="ml-4">
                <p className="text-neutral-900 font-medium">Delivery</p>
                <p className="text-neutral-600">
                  Estimated delivery date: {orderDetails.estimatedDelivery}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
        <Link
          to={`/shop/orders/${orderDetails.orderId}`}
          className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 w-full sm:w-auto justify-center"
        >
          <FiFileText className="mr-2 h-5 w-5" />
          View Order Details
        </Link>
        
        <Link
          to="/shop/products"
          className="inline-flex items-center px-6 py-3 border border-neutral-300 rounded-md shadow-sm text-base font-medium text-neutral-700 bg-white hover:bg-neutral-50 w-full sm:w-auto justify-center"
        >
          <FiShoppingBag className="mr-2 h-5 w-5" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation; 