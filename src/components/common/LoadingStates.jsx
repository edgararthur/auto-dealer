import React from 'react';

/**
 * Modern Loading States and Skeleton Screens
 */

// Product Card Skeleton
export const ProductCardSkeleton = ({ compact = false }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 animate-fade-in">
      {/* Image skeleton */}
      <div className={`skeleton-image ${compact ? 'h-36' : 'h-48'} mb-4 rounded-lg`} />
      
      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="skeleton-title" />
        <div className="skeleton-text w-1/2" />
        <div className="flex items-center justify-between">
          <div className="skeleton h-6 w-16 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
        <div className="skeleton-button w-full" />
      </div>
    </div>
  );
};

// Product Grid Skeleton
export const ProductGridSkeleton = ({ count = 12, compact = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} compact={compact} />
      ))}
    </div>
  );
};

// Page Loading Spinner
export const PageLoader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className={`spinner ${sizeClasses[size]} text-primary-600 mb-4`} />
      {text && (
        <p className="text-neutral-600 text-sm font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

// Inline Loading Spinner
export const InlineLoader = ({ size = 'sm', className = '' }) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className={`spinner ${sizeClasses[size]} ${className}`} />
  );
};

// Button Loading State
export const ButtonLoader = ({ loading, children, ...props }) => {
  return (
    <button {...props} disabled={loading || props.disabled}>
      <div className="flex items-center justify-center">
        {loading && <InlineLoader className="mr-2" />}
        {children}
      </div>
    </button>
  );
};

// Progress Bar
export const ProgressBar = ({ progress = 0, className = '', showPercentage = false }) => {
  return (
    <div className={`progress-bar ${className}`}>
      <div 
        className="progress-fill" 
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
      {showPercentage && (
        <div className="text-xs text-neutral-600 mt-1 text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

// Content Skeleton for text-heavy areas
export const ContentSkeleton = () => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="skeleton-title w-1/2" />
      <div className="space-y-2">
        <div className="skeleton-text" />
        <div className="skeleton-text" />
        <div className="skeleton-text w-3/4" />
      </div>
      <div className="skeleton-title w-1/3" />
      <div className="space-y-2">
        <div className="skeleton-text" />
        <div className="skeleton-text w-5/6" />
      </div>
    </div>
  );
};

// List Item Skeleton
export const ListItemSkeleton = ({ showAvatar = false, lines = 2 }) => {
  return (
    <div className="flex items-start space-x-3 p-4 animate-fade-in">
      {showAvatar && <div className="skeleton-avatar flex-shrink-0" />}
      <div className="flex-1 space-y-2">
        <div className="skeleton-title w-1/2" />
        {Array.from({ length: lines }).map((_, index) => (
          <div 
            key={index} 
            className={`skeleton-text ${index === lines - 1 ? 'w-3/4' : ''}`} 
          />
        ))}
      </div>
    </div>
  );
};

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="skeleton h-4 w-3/4" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div 
          key={rowIndex} 
          className="grid gap-4 py-2" 
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div key={colIndex} className="skeleton h-4" />
          ))}
        </div>
      ))}
    </div>
  );
};

// Loading Overlay
export const LoadingOverlay = ({ loading, children, text = 'Loading...' }) => {
  return (
    <div className="relative">
      {children}
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
          <div className="text-center">
            <div className="spinner-lg text-primary-600 mb-2" />
            <p className="text-sm text-neutral-600 font-medium">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Pulsing Dot Loader
export const PulsingDots = ({ className = '' }) => {
  return (
    <div className={`flex space-x-1 ${className}`}>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"
          style={{ animationDelay: `${index * 0.2}s` }}
        />
      ))}
    </div>
  );
};

// Typing Indicator
export const TypingIndicator = ({ className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <PulsingDots />
      <span className="text-sm text-neutral-500">Loading...</span>
    </div>
  );
};

// Image Loading Placeholder
export const ImagePlaceholder = ({ className = '', aspectRatio = 'square' }) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  };

  return (
    <div className={`skeleton ${aspectClasses[aspectRatio]} flex items-center justify-center ${className}`}>
      <svg 
        className="w-8 h-8 text-neutral-400" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" 
          clipRule="evenodd" 
        />
      </svg>
    </div>
  );
};

// Search Results Skeleton
export const SearchResultsSkeleton = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex space-x-4 p-4 border border-neutral-200 rounded-lg animate-fade-in">
          <div className="skeleton w-16 h-16 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-4 w-full" />
            <div className="skeleton h-4 w-1/2" />
            <div className="flex space-x-2">
              <div className="skeleton h-6 w-16 rounded" />
              <div className="skeleton h-6 w-20 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default {
  ProductCardSkeleton,
  ProductGridSkeleton,
  PageLoader,
  InlineLoader,
  ButtonLoader,
  ProgressBar,
  ContentSkeleton,
  ListItemSkeleton,
  TableSkeleton,
  LoadingOverlay,
  PulsingDots,
  TypingIndicator,
  ImagePlaceholder,
  SearchResultsSkeleton
};
