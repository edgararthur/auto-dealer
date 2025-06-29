import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiX, FiAlertCircle, FiInfo, FiXCircle } from 'react-icons/fi';

const Toast = ({ message, type = 'info', duration = 4000, onClose, isVisible }) => {
  const [isShowing, setIsShowing] = useState(isVisible);

  useEffect(() => {
    setIsShowing(isVisible);
  }, [isVisible]);

  useEffect(() => {
    if (isShowing && duration > 0) {
      const timer = setTimeout(() => {
        setIsShowing(false);
        setTimeout(() => onClose && onClose(), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isShowing, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'error':
        return <FiXCircle className="w-5 h-5" />;
      case 'warning':
        return <FiAlertCircle className="w-5 h-5" />;
      default:
        return <FiInfo className="w-5 h-5" />;
    }
  };

  const getStyles = () => {
    const baseStyles = 'flex items-center gap-3 min-w-72 max-w-md p-4 rounded-lg shadow-lg border backdrop-blur-sm';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-200 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-200 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-200 text-yellow-800`;
      default:
        return `${baseStyles} bg-blue-50 border-blue-200 text-blue-800`;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      case 'warning':
        return 'text-yellow-500';
      default:
        return 'text-blue-500';
    }
  };

  if (!isShowing) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isShowing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={getStyles()}>
        <div className={getIconColor()}>
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsShowing(false);
            setTimeout(() => onClose && onClose(), 300);
          }}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Toast Container for managing multiple toasts
export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          isVisible={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default Toast; 