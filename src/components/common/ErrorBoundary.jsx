import React from 'react';
import { FiRefreshCw, FiAlertTriangle, FiHome, FiAlertCircle } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      hasError: true
    });

    // Log error to monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    const errorData = {
      error: error?.toString(),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    // Here you would send to your error reporting service
    console.log('Error report:', errorData);
    
    // For now, just copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorData, null, 2))
      .then(() => alert('Error details copied to clipboard'))
      .catch(() => console.error('Failed to copy error details'));
  };

  render() {
    if (this.state.hasError) {
      const { error, retryCount } = this.state;
      const isRecurringError = retryCount >= 3;

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isRecurringError ? 'Persistent Error' : 'Something went wrong'}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {isRecurringError 
                ? 'We\'ve encountered the same error multiple times. Please try refreshing the page or contact support.'
                : 'An unexpected error occurred. This might be a temporary issue.'
              }
            </p>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === 'development' && error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <h3 className="font-semibold text-sm text-gray-900 mb-2">Error Details:</h3>
                <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
                  {error.toString()}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isRecurringError && (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </button>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors duration-200"
                >
                  <FiHome className="w-4 h-4 mr-2" />
                  Go Home
                </button>

                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium rounded-lg transition-colors duration-200"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
              </div>

              {/* Report Error Button */}
              <button
                onClick={this.handleReportError}
                className="w-full flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200 text-sm"
              >
                <FiAlertCircle className="w-4 h-4 mr-2" />
                Report Error
              </button>
            </div>

            {/* Retry Counter */}
            {retryCount > 0 && (
              <p className="mt-4 text-xs text-gray-500">
                Retry attempts: {retryCount}
              </p>
            )}
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">
              Still having issues?
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm">
              <a 
                href="mailto:support@autora.com" 
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Contact Support
              </a>
              <span className="text-gray-300">|</span>
              <a 
                href="/help" 
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Help Center
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundaries
export const withErrorBoundary = (Component, errorFallback) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for programmatic error handling
export const useErrorHandler = () => {
  return React.useCallback((error, errorInfo) => {
    console.error('Handled error:', error);
    
    // You can implement custom error reporting here
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }, []);
};

export default ErrorBoundary; 