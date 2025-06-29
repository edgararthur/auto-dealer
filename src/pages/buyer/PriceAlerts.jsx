import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiDollarSign, 
  FiTrendingDown, 
  FiTrendingUp, 
  FiBell,
  FiEye,
  FiTrash2,
  FiEdit,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFilter,
  FiSearch,
  FiTag,
  FiStar,
  FiHeart,
  FiShoppingCart,
  FiAlertCircle,
  FiInfo,
  FiSettings,
  FiPercent,
  FiBarChart3,
  FiCalendar,
  FiPackage
} from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';

const PriceAlerts = () => {
  const [priceAlerts, setPriceAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAlerts, setSelectedAlerts] = useState([]);
  const { showToast } = useToast();

  // Mock price alerts data
  const mockPriceAlerts = [
    {
      id: 1,
      productId: 'prod-001',
      productName: 'Premium Brake Pads - Front Set',
      productImage: 'https://via.placeholder.com/80x80',
      brand: 'Bosch',
      currentPrice: 89.99,
      targetPrice: 75.00,
      originalPrice: 89.99,
      highestPrice: 95.99,
      lowestPrice: 72.99,
      priceHistory: [
        { date: '2024-01-01', price: 89.99 },
        { date: '2024-01-05', price: 92.99 },
        { date: '2024-01-10', price: 89.99 },
        { date: '2024-01-15', price: 84.99 },
        { date: '2024-01-20', price: 89.99 }
      ],
      createdAt: '2024-01-10T10:30:00Z',
      lastTriggered: null,
      isActive: true,
      alertType: 'price_drop',
      percentage: false,
      thresholdValue: 75.00,
      dealerName: 'AutoParts Pro',
      inStock: true,
      rating: 4.5,
      reviewCount: 156,
      category: 'Brake System'
    },
    {
      id: 2,
      productId: 'prod-002',
      productName: 'LED Headlight Bulbs H11',
      productImage: 'https://via.placeholder.com/80x80',
      brand: 'Philips',
      currentPrice: 129.99,
      targetPrice: 20, // 20% off
      originalPrice: 129.99,
      highestPrice: 149.99,
      lowestPrice: 99.99,
      priceHistory: [
        { date: '2024-01-01', price: 129.99 },
        { date: '2024-01-05', price: 139.99 },
        { date: '2024-01-10', price: 129.99 },
        { date: '2024-01-15', price: 119.99 },
        { date: '2024-01-18', price: 99.99 },
        { date: '2024-01-20', price: 129.99 }
      ],
      createdAt: '2024-01-08T15:45:00Z',
      lastTriggered: '2024-01-18T14:20:00Z',
      isActive: true,
      alertType: 'percentage_drop',
      percentage: true,
      thresholdValue: 20,
      dealerName: 'Bright Lights Co',
      inStock: true,
      rating: 4.8,
      reviewCount: 89,
      category: 'Lighting'
    },
    {
      id: 3,
      productId: 'prod-003',
      productName: 'Performance Air Filter',
      productImage: 'https://via.placeholder.com/80x80',
      brand: 'K&N',
      currentPrice: 45.99,
      targetPrice: 40.00,
      originalPrice: 49.99,
      highestPrice: 52.99,
      lowestPrice: 38.99,
      priceHistory: [
        { date: '2024-01-01', price: 49.99 },
        { date: '2024-01-05', price: 47.99 },
        { date: '2024-01-10', price: 45.99 },
        { date: '2024-01-15', price: 45.99 },
        { date: '2024-01-20', price: 45.99 }
      ],
      createdAt: '2024-01-05T11:20:00Z',
      lastTriggered: null,
      isActive: false,
      alertType: 'price_drop',
      percentage: false,
      thresholdValue: 40.00,
      dealerName: 'Performance Parts Hub',
      inStock: false,
      rating: 4.3,
      reviewCount: 234,
      category: 'Engine'
    },
    {
      id: 4,
      productId: 'prod-004',
      productName: 'Winter Tire Set 225/65R17',
      productImage: 'https://via.placeholder.com/80x80',
      brand: 'Michelin',
      currentPrice: 599.99,
      targetPrice: 15, // 15% off
      originalPrice: 649.99,
      highestPrice: 699.99,
      lowestPrice: 549.99,
      priceHistory: [
        { date: '2024-01-01', price: 649.99 },
        { date: '2024-01-05', price: 629.99 },
        { date: '2024-01-10', price: 599.99 },
        { date: '2024-01-12', price: 549.99 },
        { date: '2024-01-15', price: 579.99 },
        { date: '2024-01-20', price: 599.99 }
      ],
      createdAt: '2024-01-03T09:15:00Z',
      lastTriggered: '2024-01-12T08:30:00Z',
      isActive: true,
      alertType: 'percentage_drop',
      percentage: true,
      thresholdValue: 15,
      dealerName: 'Tire World',
      inStock: true,
      rating: 4.7,
      reviewCount: 432,
      category: 'Tires & Wheels'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPriceAlerts(mockPriceAlerts);
      setLoading(false);
    }, 1000);
  }, []);

  const filterOptions = [
    { value: 'all', label: 'All Alerts', count: priceAlerts.length },
    { value: 'active', label: 'Active', count: priceAlerts.filter(a => a.isActive).length },
    { value: 'triggered', label: 'Recently Triggered', count: priceAlerts.filter(a => a.lastTriggered).length },
    { value: 'in_stock', label: 'In Stock', count: priceAlerts.filter(a => a.inStock).length },
    { value: 'price_drop', label: 'Price Drops', count: priceAlerts.filter(a => a.alertType === 'price_drop').length },
    { value: 'percentage_drop', label: 'Percentage Drops', count: priceAlerts.filter(a => a.alertType === 'percentage_drop').length }
  ];

  const filteredAlerts = priceAlerts
    .filter(alert => {
      const matchesFilter = filter === 'all' || 
        (filter === 'active' && alert.isActive) ||
        (filter === 'triggered' && alert.lastTriggered) ||
        (filter === 'in_stock' && alert.inStock) ||
        alert.alertType === filter;
      
      const matchesSearch = searchQuery === '' || 
        alert.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'price_high':
          return b.currentPrice - a.currentPrice;
        case 'price_low':
          return a.currentPrice - b.currentPrice;
        case 'closest':
          const aDiff = Math.abs(a.currentPrice - a.targetPrice);
          const bDiff = Math.abs(b.currentPrice - b.targetPrice);
          return aDiff - bDiff;
        case 'name':
          return a.productName.localeCompare(b.productName);
        default:
          return 0;
      }
    });

  const handleToggleAlert = (alertId) => {
    setPriceAlerts(alerts => 
      alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, isActive: !alert.isActive }
          : alert
      )
    );
    showToast('Alert status updated', 'success');
  };

  const handleDeleteAlert = (alertId) => {
    if (window.confirm('Are you sure you want to delete this price alert?')) {
      setPriceAlerts(alerts => alerts.filter(a => a.id !== alertId));
      showToast('Price alert deleted', 'success');
    }
  };

  const handleBulkDelete = () => {
    if (selectedAlerts.length === 0) return;
    
    setPriceAlerts(alerts => alerts.filter(a => !selectedAlerts.includes(a.id)));
    setSelectedAlerts([]);
    showToast(`${selectedAlerts.length} alerts deleted`, 'success');
  };

  const handleSelectAlert = (alertId) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId)
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAll = () => {
    const allIds = filteredAlerts.map(a => a.id);
    setSelectedAlerts(
      selectedAlerts.length === allIds.length ? [] : allIds
    );
  };

  const calculatePriceChange = (current, original) => {
    const change = ((current - original) / original) * 100;
    return change;
  };

  const isNearTarget = (alert) => {
    if (alert.percentage) {
      const discountPercentage = ((alert.originalPrice - alert.currentPrice) / alert.originalPrice) * 100;
      return discountPercentage >= (alert.thresholdValue * 0.8); // 80% of target
    } else {
      const diff = Math.abs(alert.currentPrice - alert.thresholdValue);
      return diff <= (alert.originalPrice * 0.1); // Within 10% of original price
    }
  };

  const getTargetDisplay = (alert) => {
    if (alert.percentage) {
      return `${alert.thresholdValue}% off`;
    } else {
      return `$${alert.thresholdValue}`;
    }
  };

  const stats = {
    active: priceAlerts.filter(a => a.isActive).length,
    triggered: priceAlerts.filter(a => a.lastTriggered).length,
    nearTarget: priceAlerts.filter(isNearTarget).length,
    totalSavings: priceAlerts.reduce((sum, alert) => {
      if (alert.lastTriggered) {
        return sum + (alert.originalPrice - alert.currentPrice);
      }
      return sum;
    }, 0)
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Price Alerts</h1>
          <p className="text-gray-600">
            Track price changes and get notified when products hit your target price
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiBell className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Triggered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.triggered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FiAlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Near Target</p>
                <p className="text-2xl font-bold text-gray-900">{stats.nearTarget}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FiDollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSavings.toFixed(2)}</p>
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
                  placeholder="Search price alerts..."
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

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="price_high">Highest Price</option>
                <option value="price_low">Lowest Price</option>
                <option value="closest">Closest to Target</option>
                <option value="name">Product Name</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              {selectedAlerts.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4 mr-2" />
                  Delete ({selectedAlerts.length})
                </button>
              )}
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiBell className="w-5 h-5 mr-2" />
                New Alert
              </Link>
            </div>
          </div>

          {filteredAlerts.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedAlerts.length === filteredAlerts.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Select all</span>
              </label>
            </div>
          )}
        </div>

        {/* Price Alerts List */}
        <div className="space-y-6">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
              <FiBell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No price alerts found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Set up price alerts to get notified when items go on sale'
                }
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FiShoppingCart className="w-5 h-5 mr-2" />
                Browse Products
              </Link>
            </div>
          ) : (
            filteredAlerts.map(alert => {
              const priceChange = calculatePriceChange(alert.currentPrice, alert.originalPrice);
              const nearTarget = isNearTarget(alert);
              
              return (
                <div key={alert.id} className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
                  alert.lastTriggered ? 'border-green-200 bg-green-50/30' : 
                  nearTarget ? 'border-yellow-200 bg-yellow-50/30' : 
                  'border-gray-200'
                }`}>
                  <div className="p-6">
                    {/* Alert Header */}
                    <div className="flex items-start space-x-4 mb-4">
                      <input
                        type="checkbox"
                        checked={selectedAlerts.includes(alert.id)}
                        onChange={() => handleSelectAlert(alert.id)}
                        className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      
                      <img
                        src={alert.productImage}
                        alt={alert.productName}
                        className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link
                              to={`/products/${alert.productId}`}
                              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                            >
                              {alert.productName}
                            </Link>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm text-gray-600">{alert.brand}</span>
                              <span className="text-sm text-gray-600">{alert.category}</span>
                              <div className="flex items-center">
                                <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm text-gray-600 ml-1">
                                  {alert.rating} ({alert.reviewCount})
                                </span>
                              </div>
                              {!alert.inStock && (
                                <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                  Out of Stock
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleToggleAlert(alert.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                alert.isActive 
                                  ? 'text-green-600 bg-green-50 hover:bg-green-100' 
                                  : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                              }`}
                              title={alert.isActive ? 'Active' : 'Inactive'}
                            >
                              <FiBell className="w-4 h-4" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                              <FiEdit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Information */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-900">${alert.currentPrice}</p>
                        <p className="text-sm text-gray-600">Current Price</p>
                      </div>
                      
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-lg font-bold text-blue-600">{getTargetDisplay(alert)}</p>
                        <p className="text-sm text-gray-600">Target</p>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-lg font-medium text-gray-900">${alert.originalPrice}</p>
                        <p className="text-sm text-gray-600">Original</p>
                      </div>
                      
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-lg font-medium text-gray-900">${alert.lowestPrice}</p>
                        <p className="text-sm text-gray-600">Lowest Seen</p>
                      </div>
                      
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className={`flex items-center justify-center ${
                          priceChange < 0 ? 'text-green-600' : priceChange > 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {priceChange < 0 ? <FiTrendingDown className="w-4 h-4 mr-1" /> : 
                           priceChange > 0 ? <FiTrendingUp className="w-4 h-4 mr-1" /> : null}
                          <span className="font-medium">
                            {priceChange > 0 ? '+' : ''}{priceChange.toFixed(1)}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">Change</p>
                      </div>
                    </div>

                    {/* Alert Status */}
                    <div className={`p-4 rounded-lg ${
                      alert.lastTriggered ? 'bg-green-50 border border-green-200' :
                      nearTarget ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-blue-50 border border-blue-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {alert.lastTriggered ? (
                            <FiCheckCircle className="w-5 h-5 text-green-600" />
                          ) : nearTarget ? (
                            <FiAlertCircle className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <FiBell className="w-5 h-5 text-blue-600" />
                          )}
                          
                          <div>
                            <p className={`font-medium ${
                              alert.lastTriggered ? 'text-green-800' :
                              nearTarget ? 'text-yellow-800' :
                              'text-blue-800'
                            }`}>
                              {alert.lastTriggered ? 'Target Price Reached!' :
                               nearTarget ? 'Close to Target Price' :
                               `Alert Active - Tracking ${getTargetDisplay(alert)}`}
                            </p>
                            {alert.lastTriggered && (
                              <p className="text-sm text-green-700">
                                Triggered on {new Date(alert.lastTriggered).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">
                            by {alert.dealerName}
                          </span>
                          {alert.inStock && (
                            <Link
                              to={`/products/${alert.productId}`}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FiShoppingCart className="w-4 h-4 mr-2" />
                              Buy Now
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Smart Price Tracking Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Set Realistic Targets</h3>
              <p className="text-green-100 text-sm">
                Look at price history to set achievable target prices
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Track Multiple Products</h3>
              <p className="text-green-100 text-sm">
                Compare similar products to find the best deals
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Act Fast</h3>
              <p className="text-green-100 text-sm">
                Great deals don't last long - be ready to purchase
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceAlerts; 