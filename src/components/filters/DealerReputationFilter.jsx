import React from 'react';
import PropTypes from 'prop-types';
import { FaMedal, FaAward, FaTrophy, FaGem } from 'react-icons/fa';

/**
 * Component for filtering products by dealer reputation tier
 */
const DealerReputationFilter = ({ selectedTier, onChange }) => {
  const tiers = [
    { id: 'all', label: 'All Dealers', icon: null },
    { id: 'bronze', label: 'Bronze & Above', icon: FaMedal, color: 'text-amber-700', bgColor: 'bg-amber-100' },
    { id: 'silver', label: 'Silver & Above', icon: FaAward, color: 'text-gray-400', bgColor: 'bg-gray-100' },
    { id: 'gold', label: 'Gold & Above', icon: FaTrophy, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { id: 'diamond', label: 'Diamond Only', icon: FaGem, color: 'text-blue-500', bgColor: 'bg-blue-50' }
  ];

  return (
    <div>
      <h3 className="text-sm font-medium text-neutral-700 mb-3">Dealer Reputation</h3>
      
      <div className="space-y-2">
        {tiers.map((tier) => {
          const isSelected = selectedTier === tier.id;
          const IconComponent = tier.icon;
          
          return (
            <label 
              key={tier.id}
              className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-neutral-50 transition-colors ${
                isSelected ? 'bg-neutral-100' : ''
              }`}
            >
              <input
                type="radio"
                name="dealer-reputation"
                value={tier.id}
                checked={isSelected}
                onChange={() => onChange(tier.id)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300"
              />
              
              <div className="ml-3 flex items-center">
                {IconComponent && (
                  <div className={`mr-2 ${tier.color}`}>
                    <IconComponent />
                  </div>
                )}
                <span className="text-sm text-neutral-700">{tier.label}</span>
              </div>
            </label>
          );
        })}
      </div>
      
      <div className="mt-4">
        <p className="text-xs text-neutral-500">
          Filter products by the reputation tier of their dealers. Higher tiers indicate more trusted dealers with better reviews and service.
        </p>
      </div>
    </div>
  );
};

DealerReputationFilter.propTypes = {
  selectedTier: PropTypes.oneOf(['all', 'bronze', 'silver', 'gold', 'diamond']),
  onChange: PropTypes.func.isRequired
};

DealerReputationFilter.defaultProps = {
  selectedTier: 'all'
};

export default DealerReputationFilter; 