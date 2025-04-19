import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFilter, FiSearch, FiChevronRight, FiPackage, FiTruck, FiCheck, FiAlertCircle } from 'react-icons/fi';

const OrderHistory = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch orders
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockOrders = [
        {
          id: 'ORD-1234',
          date: '2023-04-10',
          total: 342.99,
          status: 'delivered',
          items: [
            { id: 1, name: 'LED Headlight Kit', quantity: 1, price: 129.99 },
            { id: 2, name: 'Premium Brake Pads', quantity: 2, price: 89.50 },
            { id: 3, name: 'Oil Filter', quantity: 1, price: 34.00 }
          ]
        },
        {
          id: 'ORD-1185',
          date: '2023-03-22',
          total: 127.50,
          status: 'shipped',
          items: [
            { id: 4, name: 'Spark Plugs Set', quantity: 1, price: 45.00 },
            { id: 5, name: 'Air Filter', quantity: 1, price: 27.50 },
            { id: 6, name: 'Wiper Blades', quantity: 1, price: 55.00 }
          ]
        },
        {
          id: 'ORD-1089',
          date: '2023-02-15',
          total: 89.99,
          status: 'processing',
          items: [
            { id: 7, name: 'Car Battery', quantity: 1, price: 89.99 }
          ]
        },
        {
          id: 'ORD-987',
          date: '2023-01-30',
          total: 205.75,
          status: 'delivered',
          items: [
            { id: 8, name: 'Floor Mats', quantity: 1, price: 45.75 },
            { id: 9, name: 'Car Cover', quantity: 1, price: 160.00 }
          ]
        },
        {
          id: 'ORD-945',
          date: '2023-01-15',
          total: 78.50,
          status: 'cancelled',
          items: [
            { id: 10, name: 'Phone Mount', quantity: 1, price: 24.50 },
            { id: 11, name: 'Car Charger', quantity: 1, price: 19.00 },
            { id: 12, name: 'Steering Wheel Cover', quantity: 1, price: 35.00 }
          ]
        }
      ];
      
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter orders based on search and status filter
  useEffect(() => {
    if (orders.length > 0) {
      let filtered = orders;
      
      // Apply status filter
      if (filter !== 'all') {
        filtered = filtered.filter(order => order.status === filter);
      }
      
      // Apply search
      if (search.trim() !== '') {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(
          order => 
            order.id.toLowerCase().includes(searchLower) || 
            order.items.some(item => item.name.toLowerCase().includes(searchLower))
        );
      }
      
      setFilteredOrders(filtered);
    }
  }, [filter, search, orders]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <FiPackage className="h-5 w-5 text-yellow-500" />;
      case 'shipped':
        return <FiTruck className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <FiCheck className="h-5 w-5 text-green-500" />;
      case 'cancelled':
        return <FiAlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FiPackage className="h-5 w-5 text-gray-500" />;
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="text-center p-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
        <p className="mt-4 text-neutral-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900">Order History</h1>
        <p className="mt-2 text-neutral-600">View and track your orders</p>
      </div>
      
      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-grow">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="w-full sm:w-48">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="h-5 w-5 text-neutral-400" />
            </div>
            <select
              className="block w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-md appearance-none focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Orders</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <FiChevronRight className="h-5 w-5 text-neutral-400 transform rotate-90" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Orders list */}
      {filteredOrders.length > 0 ? (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center">
                    {getStatusIcon(order.status)}
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-neutral-900">{order.id}</h3>
                      <p className="text-sm text-neutral-500">{formatDate(order.date)}</p>
                    </div>
                  </div>
                  
                  <div className="sm:ml-6">
                    <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap mt-1 sm:mt-0 mr-2 sm:mr-0">
                      <span className={`px-2 py-1 rounded-full ${getStatusBadgeClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto">
                  <div className="sm:mr-8">
                    <p className="text-sm text-neutral-500">
                      <span className="font-medium text-neutral-900">GH₵{order.total.toFixed(2)}</span>
                      <span className="mx-1">•</span>
                      <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                    </p>
                  </div>
                  
                  <Link
                    to={`/shop/orders/${order.id}`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              
              {/* Order items */}
              <div className="border-t border-neutral-200 px-4 py-3 bg-neutral-50">
                <div className="text-sm text-neutral-500">
                  {order.items.slice(0, 2).map((item, index) => (
                    <span key={item.id} className="inline-block mr-2">
                      {item.name}
                      {index < Math.min(order.items.length, 2) - 1 && <span className="ml-2">•</span>}
                    </span>
                  ))}
                  {order.items.length > 2 && (
                    <span className="inline-block text-primary-600">
                      +{order.items.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="mx-auto h-24 w-24 text-neutral-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">No orders found</h3>
          <p className="mt-2 text-neutral-500">
            {search || filter !== 'all' 
              ? 'Try adjusting your search or filter to find what you are looking for.' 
              : 'You haven\'t placed any orders yet.'}
          </p>
          <div className="mt-6">
            <Link 
              to="/shop/products" 
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              Browse Products
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory; 