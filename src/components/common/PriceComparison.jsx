import React, { useState, useEffect } from 'react';
import { FiStar, FiMapPin, FiTruck, FiShield, FiX, FiCheck, FiChevronDown } from 'react-icons/fi';
import PropTypes from 'prop-types';

/**
 * PriceComparison Component - Shows multiple dealers selling the same product
 * 
 * @param {Object} product - The base product being compared
 * @param {Array} dealerPrices - Array of dealer price objects
 * @param {Function} onClose - Function to handle modal close
 * @param {Function} onAddToCart - Function to handle adding to cart from specific dealer
 * @param {String} userLocation - User's location for distance calculation
 */
const PriceComparison = ({ 
  product, 
  dealerPrices = [], 
  onClose, 
  onAddToCart,
  userLocation = null 
}) => {
  const [sortBy, setSortBy] = useState('price'); // price, rating, distance
  const [sortedDealers, setSortedDealers] = useState([]);

  useEffect(() => {
    if (dealerPrices.length === 0) return;

    let sorted = [...dealerPrices];
    
    switch (sortBy) {
      case 'price':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'rating':
        sorted.sort((a, b) => (b.dealer.rating || 0) - (a.dealer.rating || 0));
        break;
      case 'distance':
        // Mock distance calculation - in real app, would use geolocation
        sorted.sort((a, b) => (a.distance || 999) - (b.distance || 999));
        break;
      default:
        break;
    }
    
    setSortedDealers(sorted);
  }, [dealerPrices, sortBy]);

  const handleAddToCart = (dealerPrice) => {
    if (onAddToCart) {
      onAddToCart({
        productId: product.id,
        dealerId: dealerPrice.dealer.id,
        price: dealerPrice.price
      });
    }
  };

  const formatDistance = (distance) => {
    if (!distance) return 'Distance unknown';
    return distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`;
  };

  const getBestValueBadge = (dealerPrice, index) => {
    if (index === 0 && sortBy === 'price') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
          <FiCheck size={10} className="mr-1" />
          Best Price
        </span>
      );
    }
    
    if (dealerPrice.dealer.rating >= 4.5 && dealerPrice.price <= sortedDealers[0].price * 1.1) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
          <FiStar size={10} className="mr-1" />
          Best Value
        </span>
      );
    }
    
    return null;
  };

  if (dealerPrices.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Price Comparison</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <FiX size={20} />
            </button>
          </div>
          <p className="text-gray-600">No other dealers found for this product.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Compare Prices - {product.name}
              </h2>
              <p className="text-sm text-gray-600">
                Found {dealerPrices.length} dealers selling this product
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiX size={20} />
            </button>
          </div>
          
          {/* Sort Options */}
          <div className="mt-4 flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex space-x-2">
              {[
                { value: 'price', label: 'Price' },
                { value: 'rating', label: 'Rating' },
                { value: 'distance', label: 'Distance' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    sortBy === option.value
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dealers List */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {sortedDealers.map((dealerPrice, index) => (
              <div 
                key={`${dealerPrice.dealer.id}-${dealerPrice.price}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  {/* Dealer Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {dealerPrice.dealer.logo ? (
                        <img 
                          src={dealerPrice.dealer.logo} 
                          alt={dealerPrice.dealer.company_name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-gray-600">
                          {(dealerPrice.dealer.company_name || 'Dealer').substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {dealerPrice.dealer.company_name || dealerPrice.dealer.name}
                        </h3>
                        {getBestValueBadge(dealerPrice, index)}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {/* Rating */}
                        <div className="flex items-center space-x-1">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <FiStar
                                key={i}
                                size={14}
                                className={i < Math.floor(dealerPrice.dealer.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                              />
                            ))}
                          </div>
                          <span>({dealerPrice.dealer.rating || '0.0'})</span>
                        </div>
                        
                        {/* Location */}
                        <div className="flex items-center space-x-1">
                          <FiMapPin size={14} />
                          <span>{dealerPrice.dealer.location || 'Location unknown'}</span>
                          {dealerPrice.distance && (
                            <span className="text-xs">• {formatDistance(dealerPrice.distance)}</span>
                          )}
                        </div>
                      </div>
                      
                      {/* Dealer features */}
                      <div className="flex items-center space-x-2 mt-2">
                        {dealerPrice.dealer.verified && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            <FiCheck size={10} className="mr-1" />
                            Verified
                          </span>
                        )}
                        {dealerPrice.dealer.fastShipping && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            <FiTruck size={10} className="mr-1" />
                            Fast Shipping
                          </span>
                        )}
                        {dealerPrice.dealer.hasWarranty && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                            <FiShield size={10} className="mr-1" />
                            Warranty
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="text-right">
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        ${dealerPrice.price.toFixed(2)}
                      </span>
                      {dealerPrice.originalPrice && dealerPrice.originalPrice > dealerPrice.price && (
                        <div className="text-sm">
                          <span className="text-gray-500 line-through">
                            ${dealerPrice.originalPrice.toFixed(2)}
                          </span>
                          <span className="text-green-600 ml-1">
                            Save ${(dealerPrice.originalPrice - dealerPrice.price).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 mb-3">
                      {dealerPrice.shipping?.cost ? (
                        `+ $${dealerPrice.shipping.cost.toFixed(2)} shipping`
                      ) : (
                        'Free shipping'
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleAddToCart(dealerPrice)}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
                
                {/* Additional dealer info */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Ships in {dealerPrice.shipping?.estimatedDays || '2-3'} days</span>
                      <span>Return Policy: {dealerPrice.dealer.returnPolicy || '30 days'}</span>
                    </div>
                    <span>Stock: {dealerPrice.stock || 'In stock'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Prices and availability are subject to change. Shipping costs calculated at checkout.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

PriceComparison.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string
  }).isRequired,
  dealerPrices: PropTypes.arrayOf(PropTypes.shape({
    dealer: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string,
      company_name: PropTypes.string,
      logo: PropTypes.string,
      location: PropTypes.string,
      rating: PropTypes.number,
      verified: PropTypes.bool,
      fastShipping: PropTypes.bool,
      hasWarranty: PropTypes.bool,
      returnPolicy: PropTypes.string
    }).isRequired,
    price: PropTypes.number.isRequired,
    originalPrice: PropTypes.number,
    stock: PropTypes.string,
    distance: PropTypes.number,
    shipping: PropTypes.shape({
      cost: PropTypes.number,
      estimatedDays: PropTypes.string
    })
  })),
  onClose: PropTypes.func.isRequired,
  onAddToCart: PropTypes.func,
  userLocation: PropTypes.string
};

export default PriceComparison; 