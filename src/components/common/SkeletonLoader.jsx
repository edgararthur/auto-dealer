import React from 'react';

// Base Skeleton Component
export const Skeleton = ({ className = '', children, ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Product Card Skeleton
export const ProductCardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Image skeleton */}
      <div className="aspect-square bg-gray-200 animate-pulse" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Brand */}
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3" />
        
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5" />
        </div>
        
        {/* Rating */}
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
          ))}
          <div className="h-3 bg-gray-200 rounded animate-pulse w-12 ml-2" />
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
        </div>
        
        {/* Features */}
        <div className="flex items-center space-x-4">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
        </div>
        
        {/* Button */}
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse mt-4" />
      </div>
    </div>
  );
};

// Product Grid Skeleton
export const ProductGridSkeleton = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(count)].map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Search Results Skeleton
export const SearchResultsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-64" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
            <div className="h-10 bg-gray-200 rounded animate-pulse w-20" />
          </div>
        </div>
      </div>
      
      {/* Products grid skeleton */}
      <ProductGridSkeleton />
    </div>
  );
};

// Filter Sidebar Skeleton
export const FilterSidebarSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Search filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-4" />
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
      </div>
      
      {/* Vehicle search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-36 mb-4" />
        <div className="space-y-3">
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
      
      {/* Categories filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="h-5 bg-gray-200 rounded animate-pulse w-24 mb-4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Hero Section Skeleton
export const HeroSkeleton = () => {
  return (
    <div className="relative bg-gray-200 animate-pulse overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content skeleton */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-12 bg-gray-300 rounded animate-pulse w-3/4" />
              <div className="h-12 bg-gray-300 rounded animate-pulse w-1/2" />
              <div className="h-6 bg-gray-300 rounded animate-pulse w-5/6 mt-4" />
            </div>
            
            {/* Stats skeleton */}
            <div className="grid grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gray-300 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-300 rounded animate-pulse" />
                </div>
              ))}
            </div>
            
            {/* Buttons skeleton */}
            <div className="flex flex-wrap gap-4">
              <div className="h-12 bg-gray-300 rounded-lg animate-pulse w-32" />
              <div className="h-12 bg-gray-300 rounded-lg animate-pulse w-36" />
            </div>
          </div>
          
          {/* Form skeleton */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4 mx-auto mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6 mx-auto" />
            </div>
            
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Category Grid Skeleton
export const CategoryGridSkeleton = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
          <div className="w-12 h-12 bg-gray-200 rounded animate-pulse mx-auto mb-3" />
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
};

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {[...Array(columns)].map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skeleton; 