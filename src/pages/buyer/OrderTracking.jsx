import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiAlertCircle, FiMapPin } from 'react-icons/fi';

const OrderTracking = () => {
  const { id: orderId } = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate API call to fetch order tracking details
    setLoading(true);
    setTimeout(() => {
      // Mock data for different orders
      const orderData = {
        'ORD-1234': {
          id: 'ORD-1234',
          date: '2023-04-10',
          status: 'delivered',
          estimatedDelivery: '2023-04-15',
          actualDelivery: '2023-04-15',
          trackingNumber: 'TRK4567891234',
          carrier: 'Ghana Post Express',
          shippingAddress: {
            fullName: 'Alex Johnson',
            street: '123 Main St, Apt 4B',
            city: 'Accra',
            region: 'Greater Accra',
            postalCode: 'GA-456',
            country: 'Ghana'
          },
          timeline: [
            { date: '2023-04-10 09:15', status: 'ordered', description: 'Order placed' },
            { date: '2023-04-11 14:22', status: 'processing', description: 'Payment confirmed' },
            { date: '2023-04-12 10:45', status: 'processing', description: 'Order processed at warehouse' },
            { date: '2023-04-13 08:30', status: 'shipped', description: 'Package picked up by carrier' },
            { date: '2023-04-14 12:15', status: 'shipped', description: 'Package in transit to delivery location' },
            { date: '2023-04-15 09:45', status: 'delivered', description: 'Package delivered' }
          ]
        },
        'ORD-1185': {
          id: 'ORD-1185',
          date: '2023-03-22',
          status: 'shipped',
          estimatedDelivery: '2023-03-26',
          trackingNumber: 'TRK3456789012',
          carrier: 'FastTrack Logistics',
          shippingAddress: {
            fullName: 'Alex Johnson',
            street: '123 Main St, Apt 4B',
            city: 'Accra',
            region: 'Greater Accra',
            postalCode: 'GA-456',
            country: 'Ghana'
          },
          timeline: [
            { date: '2023-03-22 11:30', status: 'ordered', description: 'Order placed' },
            { date: '2023-03-23 09:15', status: 'processing', description: 'Payment confirmed' },
            { date: '2023-03-24 15:40', status: 'processing', description: 'Order processed at warehouse' },
            { date: '2023-03-25 10:20', status: 'shipped', description: 'Package picked up by carrier' },
            { date: '2023-03-26 08:45', status: 'shipped', description: 'Package in transit to delivery location' }
          ]
        }
      };

      if (orderData[orderId]) {
        setOrder(orderData[orderId]);
        setLoading(false);
      } else {
        setError('Order not found');
        setLoading(false);
      }
    }, 1000);
  }, [orderId]);

  // Format date time
  const formatDateTime = (dateTimeString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  // Calculate delivery progress percentage
  const calculateProgress = () => {
    if (!order) return 0;
    
    const totalSteps = order.timeline.length;
    const completedSteps = order.timeline.length;
    
    // If order is not delivered yet, subtract one step
    if (order.status !== 'delivered') {
      return ((completedSteps - 1) / totalSteps) * 100;
    }
    
    return 100;
  };

  if (loading) {
    return (
      <div className="text-center p-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4 text-neutral-500">Loading tracking information...</p>
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
          <p className="mt-2 text-neutral-500">We couldn't find the tracking information for this order.</p>
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
        <Link
          to={`/shop/orders/${orderId}`}
          className="inline-flex items-center text-primary-600 hover:text-primary-700"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" />
          Back to Order Details
        </Link>
      </div>
      
      {/* Tracking header */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Track Order {order.id}</h1>
              <p className="text-neutral-500">Ordered on {formatDate(order.date)}</p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize">
                <span className={`px-3 py-1 rounded-full ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
          
          {/* Delivery status */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-neutral-500">Delivery Progress</span>
              <span className="text-sm font-medium text-neutral-900">{Math.round(calculateProgress())}%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
          
          {/* Tracking information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">Tracking Number</h3>
              <p className="text-neutral-900 font-medium">{order.trackingNumber}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">Carrier</h3>
              <p className="text-neutral-900">{order.carrier}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-500 mb-1">Estimated Delivery</h3>
              <p className="text-neutral-900">{formatDate(order.estimatedDelivery)}</p>
            </div>
            <div>
              {order.status === 'delivered' ? (
                <>
                  <h3 className="text-sm font-medium text-neutral-500 mb-1">Delivered On</h3>
                  <p className="text-neutral-900">{formatDate(order.actualDelivery)}</p>
                </>
              ) : (
                <>
                  <h3 className="text-sm font-medium text-neutral-500 mb-1">Delivery Status</h3>
                  <p className="text-neutral-900 capitalize">{order.status}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tracking Timeline */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Shipment Timeline</h2>
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
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between">
                            <div>
                              <p className="text-sm font-medium text-neutral-900">{event.description}</p>
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-neutral-500">
                              {formatDateTime(event.date)}
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
        
        {/* Delivery Address */}
        <div>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900">Delivery Address</h2>
            </div>
            
            <div className="p-4">
              <div className="flex items-start mb-4">
                <FiMapPin className="mt-1 h-5 w-5 text-neutral-400 mr-3" />
                <address className="not-italic text-neutral-900">
                  <p><span className="font-medium">{order.shippingAddress.fullName}</span></p>
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.region} {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </address>
              </div>
              
              {/* Maps placeholder - in a real app, this would be integrated with Google Maps or similar */}
              <div className="bg-neutral-100 rounded-lg h-40 flex items-center justify-center">
                <span className="text-neutral-500">Map view would be displayed here</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden mt-6">
            <div className="p-4">
              <a 
                href={`https://example.com/track?number=${order.trackingNumber}`}
                target="_blank"
                rel="noopener noreferrer" 
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiTruck className="mr-2 -ml-1 h-4 w-4" />
                Track on {order.carrier} Website
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking; 