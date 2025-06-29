import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiBell, 
  FiPackage, 
  FiDollarSign, 
  FiTruck,
  FiHeart,
  FiStar,
  FiSettings,
  FiCheck,
  FiX,
  FiTrash2,
  FiFilter,
  FiSearch,
  FiClock,
  FiEye,
  FiEyeOff,
  FiVolume2,
  FiVolumeX,
  FiMail,
  FiSmartphone,
  FiToggleLeft,
  FiToggleRight,
  FiCheckCircle,
  FiInfo
} from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    orderUpdates: true,
    priceAlerts: true,
    promotions: false,
    reviews: true,
    inventory: true
  });
  const { showToast } = useToast();

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      type: 'order',
      title: 'Order Shipped',
      message: 'Your order #ORD-2024-001 has been shipped and is on its way!',
      timestamp: '2024-01-20T10:30:00Z',
      read: false,
      priority: 'high',
      actionUrl: '/orders/ORD-2024-001',
      icon: FiTruck,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 2,
      type: 'price_alert',
      title: 'Price Drop Alert',
      message: 'Brake Pads - Premium Set is now 20% off! Was $89.99, now $71.99',
      timestamp: '2024-01-19T15:45:00Z',
      read: false,
      priority: 'medium',
      actionUrl: '/products/brake-pads-premium',
      icon: FiDollarSign,
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 3,
      type: 'wishlist',
      title: 'Wishlist Item Back in Stock',
      message: 'LED Headlight Kit H11 is now available. Order soon!',
      timestamp: '2024-01-19T09:15:00Z',
      read: true,
      priority: 'medium',
      actionUrl: '/wishlist',
      icon: FiHeart,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 4,
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order #ORD-2024-002 has been delivered. How was your experience?',
      timestamp: '2024-01-18T14:20:00Z',
      read: true,
      priority: 'medium',
      actionUrl: '/orders/ORD-2024-002',
      icon: FiPackage,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 5,
      type: 'review',
      title: 'Review Request',
      message: 'Please review your recent purchase of Air Filter K&N',
      timestamp: '2024-01-17T11:30:00Z',
      read: true,
      priority: 'low',
      actionUrl: '/reviews',
      icon: FiStar,
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      id: 6,
      type: 'promotion',
      title: 'Weekend Sale',
      message: 'Save up to 30% on all brake components this weekend only!',
      timestamp: '2024-01-16T08:00:00Z',
      read: true,
      priority: 'low',
      actionUrl: '/deals',
      icon: FiDollarSign,
      color: 'text-red-600 bg-red-50'
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const notificationTypes = [
    { value: 'all', label: 'All Notifications', count: notifications.length },
    { value: 'unread', label: 'Unread', count: notifications.filter(n => !n.read).length },
    { value: 'order', label: 'Orders', count: notifications.filter(n => n.type === 'order').length },
    { value: 'price_alert', label: 'Price Alerts', count: notifications.filter(n => n.type === 'price_alert').length },
    { value: 'wishlist', label: 'Wishlist', count: notifications.filter(n => n.type === 'wishlist').length },
    { value: 'promotion', label: 'Promotions', count: notifications.filter(n => n.type === 'promotion').length }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      notification.type === filter;
    
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleMarkAsRead = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    showToast('Marked as read', 'success');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'success');
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
    showToast('Notification deleted', 'success');
  };

  const handleBulkDelete = () => {
    if (selectedNotifications.length === 0) return;
    
    setNotifications(notifications.filter(n => !selectedNotifications.includes(n.id)));
    setSelectedNotifications([]);
    showToast(`${selectedNotifications.length} notifications deleted`, 'success');
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    const allIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(
      selectedNotifications.length === allIds.length ? [] : allIds
    );
  };

  const toggleNotificationSetting = (setting) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    showToast('Settings updated', 'success');
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = now - time;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Notifications</h1>
            <p className="text-gray-600">
              Stay updated with your orders, price alerts, and more
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="inline-flex items-center px-4 py-2 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FiCheck className="w-4 h-4 mr-2" />
                Mark All Read
              </button>
            )}
            <Link
              to="#settings"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FiSettings className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search */}
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search notifications..."
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
                    {notificationTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} ({type.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bulk Actions */}
                {selectedNotifications.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {selectedNotifications.length} selected
                    </span>
                    <button
                      onClick={handleBulkDelete}
                      className="inline-flex items-center px-3 py-1 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {filteredNotifications.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.length === filteredNotifications.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Select all</span>
                  </label>
                </div>
              )}
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
                  <FiBell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications found</h3>
                  <p className="text-gray-600">
                    {searchQuery || filter !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'You\'re all caught up! No new notifications.'
                    }
                  </p>
                </div>
              ) : (
                filteredNotifications.map(notification => {
                  const IconComponent = notification.icon;
                  return (
                    <div
                      key={notification.id}
                      className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${
                        notification.read 
                          ? 'border-gray-200' 
                          : 'border-blue-200 bg-blue-50/30'
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start space-x-4">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selectedNotifications.includes(notification.id)}
                            onChange={() => handleSelectNotification(notification.id)}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />

                          {/* Icon */}
                          <div className={`p-2 rounded-lg ${notification.color}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className={`text-lg font-semibold ${
                                  notification.read ? 'text-gray-900' : 'text-gray-900'
                                }`}>
                                  {notification.title}
                                  {!notification.read && (
                                    <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                  )}
                                </h3>
                                <p className="text-gray-600 mt-1">
                                  {notification.message}
                                </p>
                                <div className="flex items-center space-x-4 mt-3">
                                  <span className="text-sm text-gray-500">
                                    {getTimeAgo(notification.timestamp)}
                                  </span>
                                  {notification.priority === 'high' && (
                                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                                      High Priority
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2 ml-4">
                                {notification.actionUrl && (
                                  <Link
                                    to={notification.actionUrl}
                                    className="px-3 py-1 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                                  >
                                    View
                                  </Link>
                                )}
                                {!notification.read && (
                                  <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                    title="Mark as read"
                                  >
                                    <FiEye className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteNotification(notification.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar - Notification Settings */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" id="settings">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Notification Settings
              </h3>

              <div className="space-y-6">
                {/* Delivery Methods */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Delivery Methods</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiMail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm">Email</span>
                      </div>
                      <button
                        onClick={() => toggleNotificationSetting('email')}
                        className="relative"
                      >
                        {notificationSettings.email ? (
                          <FiToggleRight className="w-8 h-8 text-blue-600" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiBell className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm">Push</span>
                      </div>
                      <button
                        onClick={() => toggleNotificationSetting('push')}
                        className="relative"
                      >
                        {notificationSettings.push ? (
                          <FiToggleRight className="w-8 h-8 text-blue-600" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FiSmartphone className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm">SMS</span>
                      </div>
                      <button
                        onClick={() => toggleNotificationSetting('sms')}
                        className="relative"
                      >
                        {notificationSettings.sms ? (
                          <FiToggleRight className="w-8 h-8 text-blue-600" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Notification Types */}
                <div className="border-t border-gray-100 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Notification Types</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Order Updates</span>
                      <button
                        onClick={() => toggleNotificationSetting('orderUpdates')}
                        className="relative"
                      >
                        {notificationSettings.orderUpdates ? (
                          <FiToggleRight className="w-8 h-8 text-blue-600" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Price Alerts</span>
                      <button
                        onClick={() => toggleNotificationSetting('priceAlerts')}
                        className="relative"
                      >
                        {notificationSettings.priceAlerts ? (
                          <FiToggleRight className="w-8 h-8 text-blue-600" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Promotions</span>
                      <button
                        onClick={() => toggleNotificationSetting('promotions')}
                        className="relative"
                      >
                        {notificationSettings.promotions ? (
                          <FiToggleRight className="w-8 h-8 text-blue-600" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Review Requests</span>
                      <button
                        onClick={() => toggleNotificationSetting('reviews')}
                        className="relative"
                      >
                        {notificationSettings.reviews ? (
                          <FiToggleRight className="w-8 h-8 text-blue-600" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Inventory Updates</span>
                      <button
                        onClick={() => toggleNotificationSetting('inventory')}
                        className="relative"
                      >
                        {notificationSettings.inventory ? (
                          <FiToggleRight className="w-8 h-8 text-blue-600" />
                        ) : (
                          <FiToggleLeft className="w-8 h-8 text-gray-300" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage; 