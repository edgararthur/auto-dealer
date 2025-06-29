import React, { useState } from 'react';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import { 
  getCurrentCurrency, 
  setUserCurrency, 
  getSupportedCurrencies 
} from '../../utils/priceFormatter';

/**
 * CurrencySelector Component
 * Allows users to manually select their preferred currency
 */
const CurrencySelector = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentCurrency = getCurrentCurrency();
  const supportedCurrencies = getSupportedCurrencies();

  const handleCurrencyChange = (currencyCode) => {
    setUserCurrency(currencyCode);
    setIsOpen(false);
    // Force a page refresh to update all prices
    window.location.reload();
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <FiGlobe className="w-4 h-4" />
        <span className="font-medium">{currentCurrency.code}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-2 font-medium">
                Select Currency
              </div>
              
              {supportedCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleCurrencyChange(currency.code)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors flex items-center justify-between ${
                    currentCurrency.code === currency.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div>
                    <div className="font-medium">{currency.name}</div>
                    <div className="text-xs text-gray-500">{currency.code}</div>
                  </div>
                  <span className="text-lg">{currency.symbol}</span>
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-200 p-3 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <FiGlobe className="w-3 h-3" />
                <span>Prices convert from Ghana Cedis (₵)</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CurrencySelector; 