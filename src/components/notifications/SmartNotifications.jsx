import React, { useState, useEffect } from 'react';
import { 
  FiBell, 
  FiX, 
  FiTrendingDown, 
  FiPackage, 
  FiTag, 
  FiHeart,
  FiShoppingCart,
  FiTruck,
  FiAlertCircle,
  FiCheck,
  FiInfo
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../contexts/WishlistContext';
import RealtimeService from '../../../shared/services/realtimeService';
import { Link } from 'react-router-dom';

const SmartNotifications = ({ className = '' }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { user } = useAuth();
  const { wishlistItems } = useWishlist();

  useEffect(() => {
    if (user) {
      generateSmartNotifications();
      
      // Initialize real-time service and listen for notifications
      RealtimeService.initialize();
      
      // Add real-time notification listener
      const handleRealtimeNotification = (event) => {
        const notification = event.detail;
        addNotification({
          ...notification,
          id: notification.id || `realtime_${Date.now()}`,
          read: false
        });
      };
      
      RealtimeService.addNotificationListener(handleRealtimeNotification);
      
      // Cleanup on unmount
      return () => {
        RealtimeService.removeNotificationListener(handleRealtimeNotification);
      };
    }
  }, [user, wishlistItems]);

  const generateSmartNotifications = () => {
    const newNotifications = [];
    
    // Price drop notifications (demo)
    if (Math.random() > 0.7) {
      newNotifications.push({
        id: `price_drop_${Date.now()}`,
        type: 'price_drop',
        title: 'Price Drop Alert! 🎉',
        message: 'Brake pads you viewed are now 15% cheaper!',
        actionText: 'View Product',
        actionUrl: '/products',
        priority: 'high',
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // Stock notifications (demo)
    if (Math.random() > 0.8) {
      newNotifications.push({
        id: `stock_${Date.now()}`,
        type: 'restock',
        title: 'Back in Stock! ✨',
        message: 'Engine oil filter is now available',
        actionText: 'Shop Now',
        actionUrl: '/products',
        priority: 'medium',
        timestamp: new Date().toISOString(),
        read: false
      });
    }

    // Personalized offers (demo)
    const offers = [
      {
        type: 'free_shipping',
        title: 'Free Shipping Available! 🚚',
        message: 'Get free shipping on orders over GH₵200',
        actionText: 'Shop Now',
        actionUrl: '/products',
        priority: 'medium'
      },
      {
        type: 'bundle_deal',
        title: 'Bundle Deal Alert! 📦',
        message: 'Save 20% when you buy 3 or more parts',
        actionText: 'Explore Deals',
        actionUrl: '/deals',
        priority: 'medium'
      }
    ];

    const randomOffer = offers[Math.floor(Math.random() * offers.length)];
    newNotifications.push({
      ...randomOffer,
      id: `offer_${randomOffer.type}_${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    });

    setNotifications(newNotifications);
    setUnreadCount(newNotifications.length);
  };

  const addNotification = (notification) => {
    setNotifications(prev => {
      // Avoid duplicates
      const exists = prev.some(n => n.id === notification.id);
      if (exists) return prev;
      
      const updated = [notification, ...prev];
      return updated.slice(0, 50); // Keep max 50 notifications
    });
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== notificationId);
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'price_drop': return <FiTrendingDown className="text-green-500" />;
      case 'price_increase': return <FiTrendingDown className="text-red-500 rotate-180" />;
      case 'stock_update': return <FiPackage className="text-blue-500" />;
      case 'back_in_stock': return <FiPackage className="text-green-500" />;
      case 'low_stock': return <FiAlertCircle className="text-yellow-500" />;
      case 'out_of_stock': return <FiPackage className="text-red-500" />;
      case 'free_shipping': return <FiTruck className="text-purple-500" />;
      case 'bundle_deal': return <FiTag className="text-orange-500" />;
      case 'restock': return <FiPackage className="text-green-500" />;
      case 'order_update': return <FiShoppingCart className="text-blue-500" />;
      case 'wishlist': return <FiHeart className="text-red-500" />;
      case 'warning': return <FiAlertCircle className="text-yellow-500" />;
      case 'success': return <FiCheck className="text-green-500" />;
      default: return <FiInfo className="text-neutral-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-blue-500';
      default: return 'border-l-neutral-300';
    }
  };

  if (!user) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-600 hover:text-primary-600 transition-colors"
      >
        <FiBell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-neutral-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="font-semibold text-neutral-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FiX size={20} />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-neutral-500">
                <FiBell size={48} className="mx-auto mb-4 text-neutral-300" />
                <p>No notifications yet</p>
                <p className="text-sm mt-1">We'll notify you about price drops, new deals, and order updates</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-neutral-50 transition-colors border-l-4 ${getPriorityColor(notification.priority)} ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className={`text-sm font-medium ${!notification.read ? 'text-neutral-900' : 'text-neutral-700'}`}>
                              {notification.title}
                            </p>
                            <p className="text-sm text-neutral-600 mt-1">
                              {notification.message}
                            </p>
                            
                            {notification.actionUrl && (
                              <Link
                                to={notification.actionUrl}
                                onClick={() => {
                                  markAsRead(notification.id);
                                  setIsOpen(false);
                                }}
                                className="inline-block mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                              >
                                {notification.actionText || 'View'}
                              </Link>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-xs text-blue-600 hover:text-blue-700"
                                title="Mark as read"
                              >
                                <FiCheck size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="text-xs text-neutral-400 hover:text-neutral-600"
                              title="Delete"
                            >
                              <FiX size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-xs text-neutral-500 mt-2">
                          {new Date(notification.timestamp).toLocaleDateString()} at{' '}
                          {new Date(notification.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-neutral-200 text-center">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SmartNotifications; 