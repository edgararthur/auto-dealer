import React from 'react';
import { FiEye, FiX, FiShoppingCart, FiHeart } from 'react-icons/fi';

const ProductComparison = ({ 
  compareProducts = [], 
  onRemoveProduct, 
  onCompareNow, 
  onClearAll, 
  isVisible = false 
}) => {
  if (!isVisible || compareProducts.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-blue-500 shadow-lg z-50 animate-slideInUp">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Products */}
          <div className="flex items-center space-x-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <FiEye className="w-5 h-5 mr-2 text-blue-600" />
              Compare Products ({compareProducts.length}/4)
            </h3>
            <div className="flex items-center space-x-3 overflow-x-auto">
              {compareProducts.map((product) => (
                <div key={product.id} className="relative bg-gray-50 rounded-lg p-2 min-w-max">
                  <button
                    onClick={() => onRemoveProduct(product.id)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    title="Remove from comparison"
                  >
                    ×
                  </button>
                  <img 
                    src={product.image_url || '/api/placeholder/60/60'} 
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <p className="text-xs mt-1 text-center w-12 truncate" title={product.name}>
                    {product.name}
                  </p>
                  <p className="text-xs font-semibold text-center text-blue-600">
                    GHS {product.price?.toFixed(2)}
                  </p>
                </div>
              ))}
              
              {/* Add more placeholder */}
              {compareProducts.length < 4 && (
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-2 w-16 h-20 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-6 h-6 border-2 border-dashed border-current rounded mb-1"></div>
                  <span className="text-xs">Add more</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center text-sm text-gray-600">
              <span>Compare features, prices & reviews</span>
            </div>
            <button
              onClick={onCompareNow}
              disabled={compareProducts.length < 2}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <FiEye className="w-4 h-4 mr-2" />
              Compare Now
            </button>
            <button
              onClick={onClearAll}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Mobile layout adjustments */}
        <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Compare features & prices</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onCompareNow}
                disabled={compareProducts.length < 2}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              >
                Compare
              </button>
              <button
                onClick={onClearAll}
                className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductComparison; 