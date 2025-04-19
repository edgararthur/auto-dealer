import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiAlertCircle, FiDownload, FiMail, FiShield } from 'react-icons/fi';
import { OrderService } from 'autoplus-shared';
import { useAuth } from '../../contexts/AuthContext';

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);
      try {
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        
        const result = await OrderService.getOrderDetails(orderId, currentUser.id);
        
        if (result.success && result.order) {
          setOrder(result.order);
        } else {
          setError(result.error || 'Order not found');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, currentUser]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <FiPackage className="h-6 w-6 text-yellow-500" />;
      case 'shipped':
        return <FiTruck className="h-6 w-6 text-blue-500" />;
      case 'delivered':
        return <FiCheck className="h-6 w-6 text-green-500" />;
      case 'cancelled':
        return <FiAlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return <FiPackage className="h-6 w-6 text-gray-500" />;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ordered':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    if (!order) return 0;
    return order.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="text-center p-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4 text-neutral-500">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto h-24 w-24 text-neutral-400">
            <FiAlertCircle className="h-full w-full" />
          </div>
          <h2 className="mt-4 text-xl font-medium text-neutral-900">{error}</h2>
          <p className="mt-2 text-neutral-500">We couldn't find the order you're looking for.</p>
          <div className="mt-6">
            <Link 
              to="/shop/orders" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <FiArrowLeft className="mr-2 -ml-1 h-4 w-4" />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/shop/orders')}
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </button>
      </div>
      
      {/* Order header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-start md:items-center mb-4 md:mb-0">
            <div className="mr-4">
              {getStatusIcon(order.status)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">{order.id}</h1>
              <p className="text-neutral-500">Placed on {formatDate(order.date)}</p>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize mb-2 md:mb-0">
              <span className={`px-3 py-1 rounded-full ${getStatusBadgeClass(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="text-neutral-500">
              {order.status === 'delivered' && `Delivered on ${formatDate(order.deliveredDate)}`}
              {order.status === 'shipped' && 'Package in transit'}
              {order.status === 'processing' && 'Preparing your order'}
              {order.status === 'cancelled' && 'Order has been cancelled'}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order details (left column on desktop) */}
        <div className="md:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Order Items</h2>
            </div>
            
            <div className="divide-y divide-neutral-200">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex">
                  <div className="h-20 w-20 flex-shrink-0 bg-neutral-200 rounded-md overflow-hidden">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-base font-medium text-neutral-900">{item.name}</h3>
                        <p className="mt-1 text-sm text-neutral-500">SKU: {item.sku}</p>
                      </div>
                      <p className="text-base font-medium text-neutral-900">
                        GH₵{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                    <div className="mt-1 flex items-center text-sm text-neutral-500">
                      <span>Qty {item.quantity}</span>
                      <span className="mx-2">•</span>
                      <span>GH₵{item.price.toFixed(2)} each</span>
                    </div>
                    
                    {/* Warranty Claim button - only shown for delivered orders */}
                    {order.status === 'delivered' && (
                      <div className="mt-3">
                        <Link 
                          to={`/warranty-claim/${order.id}/${item.id}`}
                          className="inline-flex items-center px-3 py-1 border border-primary-300 rounded text-xs font-medium bg-primary-50 text-primary-700 hover:bg-primary-100"
                        >
                          <FiShield className="mr-1 h-3 w-3" />
                          Submit Warranty Claim
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Order timeline */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Order Timeline</h2>
            </div>
            
            <div className="p-4">
              <div className="flow-root">
                <ul className="-mb-8">
                  {order.timeline.map((event, eventIdx) => (
                    <li key={eventIdx}>
                      <div className="relative pb-8">
                        {eventIdx !== order.timeline.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-neutral-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getStatusBadgeClass(event.status)}`}>
                              {event.status === 'ordered' && <FiPackage className="h-4 w-4" />}
                              {event.status === 'processing' && <FiPackage className="h-4 w-4" />}
                              {event.status === 'shipped' && <FiTruck className="h-4 w-4" />}
                              {event.status === 'delivered' && <FiCheck className="h-4 w-4" />}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-neutral-900">{event.description}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-neutral-500">
                              {formatDate(event.date)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Order summary (right column on desktop) */}
        <div className="space-y-6">
          {/* Order summary */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Order Summary</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <div className="flex justify-between text-base text-neutral-600">
                <p>Subtotal</p>
                <p>GH₵{calculateSubtotal().toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-base text-neutral-600">
                <p>Shipping</p>
                <p>{order.shippingCost > 0 ? `GH₵${order.shippingCost.toFixed(2)}` : 'Free'}</p>
              </div>
              <div className="flex justify-between text-base text-neutral-600">
                <p>Tax</p>
                <p>GH₵{((calculateSubtotal() + order.shippingCost) * 0.03).toFixed(2)}</p>
              </div>
              <div className="border-t border-neutral-200 pt-4 flex justify-between text-lg font-medium">
                <p>Total</p>
                <p>GH₵{order.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          {/* Shipping info */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Shipping Information</h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Shipping Address</h3>
                  <address className="mt-1 not-italic text-neutral-900">
                    <p>{order.shippingAddress.fullName}</p>
                    <p>{order.shippingAddress.street}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postalCode}</p>
                    <p>{order.shippingAddress.country}</p>
                  </address>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Shipping Method</h3>
                  <p className="mt-1 text-neutral-900">{order.shippingMethod}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Payment info */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Payment Information</h2>
            </div>
            
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-neutral-500">Payment Method</h3>
                  <p className="mt-1 text-neutral-900">{order.paymentMethod}</p>
                  <p className="text-neutral-500">{order.paymentDetails}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Need Help?</h2>
            </div>
            
            <div className="p-4 space-y-4">
              <button 
                className="w-full flex items-center justify-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiDownload className="mr-2 -ml-1 h-4 w-4" />
                Download Invoice
              </button>
              <button 
                className="w-full flex items-center justify-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiMail className="mr-2 -ml-1 h-4 w-4" />
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail; 