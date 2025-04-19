import React from 'react';
import PropTypes from 'prop-types';
import { FaAward, FaMedal, FaTrophy, FaGem } from 'react-icons/fa';

/**
 * Component to display a dealer's reputation tier with an appropriate badge
 */
const DealerReputationBadge = ({ tier, size = 'md', showLabel = true }) => {
  // Define the appearance for each tier
  const tierConfig = {
    bronze: {
      icon: FaMedal,
      color: 'text-amber-700',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-300',
      label: 'Bronze Dealer'
    },
    silver: {
      icon: FaAward,
      color: 'text-gray-400',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
      label: 'Silver Dealer'
    },
    gold: {
      icon: FaTrophy,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      label: 'Gold Dealer'
    },
    diamond: {
      icon: FaGem,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      label: 'Diamond Dealer'
    }
  };

  // Default to bronze if tier is not recognized
  const tierData = tierConfig[tier.toLowerCase()] || tierConfig.bronze;
  const IconComponent = tierData.icon;
  
  // Size classes
  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs',
      icon: 'text-sm',
      tooltip: 'w-40'
    },
    md: {
      container: 'px-3 py-1 text-sm',
      icon: 'text-base',
      tooltip: 'w-48'
    },
    lg: {
      container: 'px-4 py-2 text-base',
      icon: 'text-lg',
      tooltip: 'w-56'
    }
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  // Tooltip content based on tier
  const tooltipContent = {
    bronze: "New or unrated dealer with fewer than 5 reviews.",
    silver: "Quality dealer with good ratings from at least 5 customers.",
    gold: "Highly-rated dealer with consistent service and excellent reviews.",
    diamond: "Top-tier dealer with exceptional service and many outstanding reviews."
  };

  return (
    <div className="relative group">
      <div 
        className={`inline-flex items-center rounded-full border ${tierData.borderColor} ${tierData.bgColor} ${sizeClass.container}`}
      >
        <IconComponent className={`${tierData.color} ${sizeClass.icon} mr-1`} />
        {showLabel && (
          <span className={`font-medium ${tierData.color}`}>{tierData.label}</span>
        )}
      </div>
      
      {/* Tooltip */}
      <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 ${sizeClass.tooltip} hidden group-hover:block z-10`}>
        <div className="bg-neutral-800 text-white text-xs rounded py-1 px-2 text-center">
          {tooltipContent[tier.toLowerCase()] || tooltipContent.bronze}
          <svg className="absolute text-neutral-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
            <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
          </svg>
        </div>
      </div>
    </div>
  );
};

DealerReputationBadge.propTypes = {
  tier: PropTypes.oneOf(['bronze', 'silver', 'gold', 'diamond']).isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showLabel: PropTypes.bool
};

export default DealerReputationBadge; 