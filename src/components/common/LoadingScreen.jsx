import React from 'react';

const LoadingScreen = ({ 
  message = "Loading...", 
  subMessage = null,
  showRetry = false,
  onRetry = null 
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        {/* Loading Spinner */}
        <div className="relative mb-6">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full opacity-20"></div>
          </div>
        </div>

        {/* Main Message */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {message}
        </h2>

        {/* Sub Message */}
        {subMessage && (
          <p className="text-gray-600 mb-6">
            {subMessage}
          </p>
        )}

        {/* Retry Button */}
        {showRetry && onRetry && (
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
            <p className="text-sm text-gray-500">
              If the problem persists, try refreshing the page
            </p>
          </div>
        )}

        {/* Progress Dots */}
        <div className="flex justify-center space-x-1 mt-6">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
