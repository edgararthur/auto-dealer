import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiPackage, 
  FiRefreshCw, 
  FiDollarSign, 
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiFileText,
  FiUpload,
  FiDownload,
  FiEye,
  FiMessageCircle,
  FiImage,
  FiCalendar,
  FiFilter,
  FiSearch,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiTag,
  FiInfo
} from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';

const ReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const { showToast } = useToast();

  // Mock returns data
  const mockReturns = [
    {
      id: 'RET-2024-001',
      orderId: 'ORD-2024-001',
      status: 'approved',
      type: 'refund',
      reason: 'defective',
      requestDate: '2024-01-20',
      processedDate: '2024-01-22',
      refundAmount: 89.99,
      trackingNumber: 'RET123456789',
      items: [
        {
          id: 1,
          name: 'Premium Brake Pads - Front Set',
          image: 'https://via.placeholder.com/80x80',
          quantity: 1,
          price: 89.99,
          reason: 'Product arrived damaged',
          condition: 'unopened'
        }
      ],
      returnAddress: {
        name: 'AutoParts Returns Center',
        address: '123 Return St, Warehouse District',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      },
      estimatedRefund: '3-5 business days'
    },
    {
      id: 'RET-2024-002',
      orderId: 'ORD-2024-002',
      status: 'in_transit',
      type: 'exchange',
      reason: 'wrong_item',
      requestDate: '2024-01-18',
      processedDate: null,
      refundAmount: 0,
      trackingNumber: 'RET987654321',
      items: [
        {
          id: 2,
          name: 'Air Filter - K&N Performance',
          image: 'https://via.placeholder.com/80x80',
          quantity: 1,
          price: 45.99,
          reason: 'Received wrong size',
          condition: 'unopened'
        }
      ],
      returnAddress: {
        name: 'AutoParts Returns Center',
        address: '123 Return St, Warehouse District',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      },
      estimatedProcessing: '2-3 business days'
    },
    {
      id: 'RET-2024-003',
      orderId: 'ORD-2024-003',
      status: 'pending',
      type: 'refund',
      reason: 'not_compatible',
      requestDate: '2024-01-15',
      processedDate: null,
      refundAmount: 129.99,
      trackingNumber: null,
      items: [
        {
          id: 3,
          name: 'LED Headlight Conversion Kit',
          image: 'https://via.placeholder.com/80x80',
          quantity: 1,
          price: 129.99,
          reason: 'Does not fit my vehicle model',
          condition: 'opened_unused'
        }
      ],
      returnAddress: {
        name: 'AutoParts Returns Center',
        address: '123 Return St, Warehouse District',
        city: 'San Francisco',
        state: 'CA',
        zip: '94105'
      },
      estimatedProcessing: 'Pending approval'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReturns(mockReturns);
      setLoading(false);
    }, 1000);
  }, []);

  const statusConfig = {
    pending: {
      label: 'Pending Approval',
      color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      icon: FiClock
    },
    approved: {
      label: 'Approved',
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      icon: FiCheckCircle
    },
    in_transit: {
      label: 'In Transit',
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      icon: FiTruck
    },
    completed: {
      label: 'Completed',
      color: 'text-green-600 bg-green-50 border-green-200',
      icon: FiCheckCircle
    },
    rejected: {
      label: 'Rejected',
      color: 'text-red-600 bg-red-50 border-red-200',
      icon: FiXCircle
    }
  };

  const filterOptions = [
    { value: 'all', label: 'All Returns', count: returns.length },
    { value: 'pending', label: 'Pending', count: returns.filter(r => r.status === 'pending').length },
    { value: 'approved', label: 'Approved', count: returns.filter(r => r.status === 'approved').length },
    { value: 'in_transit', label: 'In Transit', count: returns.filter(r => r.status === 'in_transit').length },
    { value: 'completed', label: 'Completed', count: returns.filter(r => r.status === 'completed').length }
  ];

  const filteredReturns = returns.filter(returnItem => {
    const matchesFilter = filter === 'all' || returnItem.status === filter;
    const matchesSearch = searchQuery === '' || 
      returnItem.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.items.some(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const handleViewReturn = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowReturnModal(true);
  };

  const handleTrackReturn = (trackingNumber) => {
    // In real app, this would open tracking page or modal
    showToast(`Tracking: ${trackingNumber}`, 'info');
  };

  const handleDownloadLabel = (returnId) => {
    // In real app, this would download return label
    showToast('Return label downloaded', 'success');
  };

  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'pending').length,
    approved: returns.filter(r => r.status === 'approved').length,
    completed: returns.filter(r => r.status === 'completed').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Returns & Refunds</h1>
          <p className="text-gray-600">
            Manage your return requests and track refund status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiRefreshCw className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Returns</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search returns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                />
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            </div>

            <Link
              to="/orders"
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiPackage className="w-5 h-5 mr-2" />
              New Return Request
            </Link>
          </div>
        </div>

        {/* Returns List */}
        <div className="space-y-6">
          {filteredReturns.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
              <FiRefreshCw className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No returns found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You haven\'t requested any returns yet'
                }
              </p>
              <Link
                to="/orders"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiPackage className="w-5 h-5 mr-2" />
                View Your Orders
              </Link>
            </div>
          ) : (
            filteredReturns.map(returnItem => {
              const StatusIcon = statusConfig[returnItem.status].icon;
              return (
                <div key={returnItem.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-6">
                    {/* Return Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Return #{returnItem.id}
                          </h3>
                          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${statusConfig[returnItem.status].color}`}>
                            <StatusIcon className="w-4 h-4 mr-1" />
                            {statusConfig[returnItem.status].label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span>Order: {returnItem.orderId}</span>
                          <span>Requested: {new Date(returnItem.requestDate).toLocaleDateString()}</span>
                          {returnItem.type === 'refund' && returnItem.refundAmount > 0 && (
                            <span className="font-medium text-green-600">
                              Refund: ${returnItem.refundAmount}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewReturn(returnItem)}
                          className="px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <FiEye className="w-4 h-4 mr-2 inline" />
                          View Details
                        </button>
                        {returnItem.trackingNumber && (
                          <button
                            onClick={() => handleTrackReturn(returnItem.trackingNumber)}
                            className="px-4 py-2 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
                          >
                            <FiTruck className="w-4 h-4 mr-2 inline" />
                            Track
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Return Items */}
                    <div className="space-y-3">
                      {returnItem.items.map(item => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              Reason: {item.reason}
                            </p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Qty: {item.quantity}</span>
                              <span>${item.price}</span>
                              <span className="capitalize">Condition: {item.condition.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Return Status Info */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-start space-x-3">
                        <FiInfo className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            {returnItem.status === 'pending' && 'Waiting for approval from our returns team'}
                            {returnItem.status === 'approved' && 'Return approved! Please ship your item back to us'}
                            {returnItem.status === 'in_transit' && 'We\'ve received your return and are processing it'}
                            {returnItem.status === 'completed' && 'Return completed successfully'}
                          </p>
                          {returnItem.estimatedRefund && (
                            <p className="text-sm text-blue-700 mt-1">
                              Estimated refund time: {returnItem.estimatedRefund}
                            </p>
                          )}
                          {returnItem.estimatedProcessing && (
                            <p className="text-sm text-blue-700 mt-1">
                              Estimated processing: {returnItem.estimatedProcessing}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {returnItem.status === 'approved' && !returnItem.trackingNumber && (
                      <div className="mt-4 flex items-center space-x-3">
                        <button
                          onClick={() => handleDownloadLabel(returnItem.id)}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <FiDownload className="w-4 h-4 mr-2" />
                          Download Return Label
                        </button>
                        <Link
                          to={`/help`}
                          className="inline-flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FiMessageCircle className="w-4 h-4 mr-2" />
                          Get Help
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Return Policy Info */}
        <div className="mt-12 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Return Policy</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">30-Day Returns</h3>
              <p className="text-gray-300 text-sm">
                Most items can be returned within 30 days of delivery for a full refund
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Free Return Shipping</h3>
              <p className="text-gray-300 text-sm">
                We provide prepaid return labels for eligible items
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Quick Processing</h3>
              <p className="text-gray-300 text-sm">
                Returns are typically processed within 3-5 business days
              </p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              to="/help"
              className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FiFileText className="w-5 h-5 mr-2" />
              View Full Return Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage; 