import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiShoppingBag, 
  FiPackage, 
  FiTruck, 
  FiCheck, 
  FiAlertCircle, 
  FiSearch, 
  FiFilter, 
  FiCalendar, 
  FiChevronRight, 
  FiClock, 
  FiMoreHorizontal, 
  FiArrowRight 
} from 'react-icons/fi';
import { FaCreditCard } from 'react-icons/fa';
import OrderService from '../../../shared/services/orderService';
import { useAuth } from '../../contexts/AuthContext';

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        const response = await OrderService.getUserOrders(user.id, {
          limit: 50, // Get recent orders
          offset: 0
        });
        
        if (response.success) {
          setOrders(response.orders || []);
          setFilteredOrders(response.orders || []);
        } else {
          setError(response.error || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user?.id]);

  // Filter orders based on search, status filter, and time filter
  useEffect(() => {
    if (orders.length > 0) {
      let filtered = orders;
      
      // Apply status filter
      if (filter !== 'all') {
        filtered = filtered.filter(order => order.status === filter);
      }
      
      // Apply time filter
      if (timeFilter !== 'all') {
        const now = new Date();
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(now.getMonth() - 6);
        
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.created_at);
          if (timeFilter === 'last-month') {
            return orderDate >= monthAgo;
          } else if (timeFilter === 'last-3-months') {
            return orderDate >= threeMonthsAgo;
          } else if (timeFilter === 'last-6-months') {
            return orderDate >= sixMonthsAgo;
          }
          return true;
        });
      }
      
      // Apply search
      if (search.trim() !== '') {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          order => 
            order.order_number?.toLowerCase().includes(searchLower) || 
            order.id.toLowerCase().includes(searchLower) ||
            order.items?.some(item => item.product_name?.toLowerCase().includes(searchLower))
        );
      }
      
      setFilteredOrders(filtered);
    }
  }, [filter, timeFilter, search, orders]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return <FiPackage className="h-5 w-5 text-amber-500" />;
      case 'shipped':
      case 'in_transit':
        return <FiTruck className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <FiCheck className="h-5 w-5 text-emerald-500" />;
      case 'canceled':
      case 'cancelled':
        return <FiAlertCircle className="h-5 w-5 text-rose-500" />;
      default:
        return <FiPackage className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
      case 'confirmed':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'shipped':
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'canceled':
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    if (method?.toLowerCase().includes('credit') || method?.toLowerCase().includes('debit') || method?.toLowerCase().includes('card')) {
      return <FaCreditCard className="h-4 w-4 text-purple-500" />;
    }
    return <FiShoppingBag className="h-4 w-4 text-indigo-500" />;
  };

  // Toggle expanded order
  const toggleOrderExpand = (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]"></div>
          <p className="mt-6 text-neutral-600 font-medium">Loading your order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-neutral-600 font-medium">Please log in to view your order history.</p>
          <Link 
            to="/login" 
            className="mt-4 inline-block px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header with subtle animation */}
      <div className="mb-10 border-b border-gray-200 pb-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Order History</h1>
        <p className="text-gray-600 max-w-3xl">
          Track your purchases, view order status, and manage your premium automotive parts collection
        </p>
      </div>
      
      {/* Order summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-start">
            <div className="p-3 bg-blue-50 rounded-lg">
              <FiShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">{orders.length}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-start">
            <div className="p-3 bg-emerald-50 rounded-lg">
              <FiCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {orders.filter(o => o.status === 'delivered').length}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-start">
            <div className="p-3 bg-amber-50 rounded-lg">
              <FiTruck className="h-6 w-6 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Transit</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {orders.filter(o => ['shipped', 'in_transit', 'pending', 'confirmed'].includes(o.status)).length}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-start">
            <div className="p-3 bg-purple-50 rounded-lg">
              <FaCreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ${orders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toFixed(2)}
              </h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Advanced Filters & Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100 animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Orders</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Order ID or product name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          {/* Status filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="canceled">Cancelled</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiChevronRight className="h-5 w-5 text-gray-400 transform rotate-90" />
              </div>
            </div>
          </div>
          
          {/* Time filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="last-month">Last Month</option>
                <option value="last-3-months">Last 3 Months</option>
                <option value="last-6-months">Last 6 Months</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <FiChevronRight className="h-5 w-5 text-gray-400 transform rotate-90" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders list */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-md"
            >
              <div className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${
                    ['pending', 'confirmed'].includes(order.status) ? 'bg-amber-50' :
                    ['shipped', 'in_transit'].includes(order.status) ? 'bg-blue-50' :
                    order.status === 'delivered' ? 'bg-emerald-50' :
                    'bg-rose-50'
                  }`}>
                    {getStatusIcon(order.status)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{order.order_number || order.id}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <FiClock className="mr-1 h-3 w-3" />
                      <span>{formatDate(order.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="mr-6">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${getStatusBadgeClass(order.status)}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="mr-6 text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-bold text-gray-900">${order.total_amount?.toFixed(2) || '0.00'}</p>
                  </div>
                  
                  <button
                    onClick={() => toggleOrderExpand(order.id)}
                    className="flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FiMoreHorizontal className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Expanded order details */}
              <div className={`transition-all duration-300 overflow-hidden ${
                expandedOrder === order.id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
              }`}>
                <div className="border-t border-gray-100 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Payment Status</p>
                      <div className="flex items-center mt-1">
                        {getPaymentMethodIcon(order.payment_method)}
                        <span className="ml-2 font-medium text-gray-900 capitalize">
                          {order.payment_status || 'Pending'}
                        </span>
                      </div>
                    </div>
                    
                    {order.tracking_number && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Tracking Number</p>
                        <p className="font-medium text-gray-900 mt-1">{order.tracking_number}</p>
                      </div>
                    )}
                    
                    {order.shipping_status && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">Shipping Status</p>
                        <p className="font-medium text-gray-900 mt-1 capitalize">{order.shipping_status.replace('_', ' ')}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Items</p>
                      <p className="font-medium text-gray-900 mt-1">{order.items_count || order.items?.length || 0} product{(order.items_count || order.items?.length || 0) !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  
                  {/* Order items */}
                  {order.items && order.items.length > 0 && (
                    <>
                      <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img 
                                src={item.thumbnail || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'} 
                                alt={item.product_name} 
                                className="h-full w-full object-cover object-center" 
                              />
                            </div>
                            <div className="ml-4 flex-1">
                              <h5 className="font-medium text-gray-900">{item.product_name}</h5>
                              <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-gray-900">${item.unit_price?.toFixed(2) || '0.00'}</p>
                              <p className="mt-1 text-sm text-gray-500">
                                ${(item.total_price || (item.unit_price * item.quantity) || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  <div className="flex justify-end mt-6">
                    <Link
                      to={`/orders/${order.id}`}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                    >
                      View Complete Details
                      <FiArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* Order summary (non-expanded) */}
              <div className={`border-t border-gray-100 p-4 bg-gray-50 flex items-center justify-between transition-opacity duration-300 ${
                expandedOrder === order.id ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'
              }`}>
                <div className="flex items-center space-x-2">
                  {order.items && order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="h-8 w-8 rounded-full overflow-hidden border border-gray-200">
                      <img 
                        src={item.thumbnail || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&h=100&q=80'} 
                        alt={item.product_name} 
                        className="h-full w-full object-cover object-center" 
                      />
                    </div>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                      +{order.items.length - 3}
                    </div>
                  )}
                  <span className="text-sm text-gray-500 ml-2">
                    {order.items_count || order.items?.length || 0} item{(order.items_count || order.items?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <button
                  onClick={() => toggleOrderExpand(order.id)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg text-primary-700 hover:bg-primary-50 focus:outline-none focus:bg-primary-50 transition-colors"
                >
                  View Details
                  <FiChevronRight className="ml-1 h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center animate-fade-in border border-gray-100" style={{ animationDelay: '0.6s' }}>
          <div className="mx-auto h-24 w-24 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="mt-6 text-xl font-medium text-gray-900">No Orders Found</h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            {search || filter !== 'all' || timeFilter !== 'all'
              ? 'Try adjusting your search or filter to find what you are looking for.' 
              : 'You haven\'t placed any orders yet. Explore our premium automotive parts and accessories.'}
          </p>
          <div className="mt-8">
            <Link 
              to="/products" 
              className="inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Browse Premium Products
              <FiArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      )}

      {/* Add custom keyframe animations */}
      <style>
        {`
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default OrderHistory; 