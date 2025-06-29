import React, { useEffect } from 'react';
import { FiCheck, FiX, FiInfo, FiAlertTriangle } from 'react-icons/fi';

const ToastNotifications = ({ notifications, setNotifications }) => {
  // Auto-dismiss notifications after 3 seconds
  useEffect(() => {
    notifications.forEach(notification => {
      if (!notification.persistent) {
        setTimeout(() => {
          setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 3000);
      }
    });
  }, [notifications, setNotifications]);

  if (notifications.length === 0) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <FiCheck className="h-5 w-5 text-white" />;
      case 'error': return <FiX className="h-5 w-5 text-white" />;
      case 'warning': return <FiAlertTriangle className="h-5 w-5 text-white" />;
      default: return <FiInfo className="h-5 w-5 text-white" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="fixed top-24 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto overflow-hidden transform transition-all duration-300 ease-in-out animate-slideInRight ${getBgColor(notification.type)}`}
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-white">
                  {notification.title && (
                    <span className="block font-semibold">{notification.title}</span>
                  )}
                  {notification.message}
                </p>
                {notification.action && (
                  <div className="mt-2">
                    <button
                      onClick={notification.action.onClick}
                      className="text-sm text-white underline hover:no-underline"
                    >
                      {notification.action.label}
                    </button>
                  </div>
                )}
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                  className="rounded-md inline-flex text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <span className="sr-only">Close</span>
                  <FiX className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Progress bar for auto-dismiss */}
          {!notification.persistent && (
            <div className="h-1 bg-white bg-opacity-30">
              <div 
                className="h-full bg-white animate-shrinkWidth" 
                style={{ animationDuration: '3s' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ToastNotifications; 