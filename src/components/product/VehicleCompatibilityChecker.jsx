import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiAlertTriangle, FiTruck, FiLoader } from 'react-icons/fi';
import { getVehicleCompatibility } from '../../data/vehicleData';

/**
 * Vehicle Compatibility Checker Component
 * Validates product fitment for specific vehicles
 */
const VehicleCompatibilityChecker = ({ 
  productId, 
  selectedVehicle, 
  className = '',
  showTitle = true 
}) => {
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productId && selectedVehicle) {
      checkCompatibility();
    } else {
      setCompatibility(null);
      setError(null);
    }
  }, [productId, selectedVehicle]);

  const checkCompatibility = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getVehicleCompatibility(productId, selectedVehicle);
      setCompatibility(result);
    } catch (err) {
      setError('Failed to check compatibility. Please try again.');
      console.error('Compatibility check error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedVehicle) {
    return (
      <div className={`bg-neutral-50 border border-neutral-200 rounded-lg p-4 ${className}`}>
        {showTitle && (
          <h4 className="text-sm font-medium text-neutral-900 mb-2 flex items-center">
            <FiTruck className="mr-2" size={16} />
            Vehicle Compatibility
          </h4>
        )}
        <p className="text-sm text-neutral-600">
          Select your vehicle to check compatibility with this product.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-neutral-50 border border-neutral-200 rounded-lg p-4 ${className}`}>
        {showTitle && (
          <h4 className="text-sm font-medium text-neutral-900 mb-2 flex items-center">
            <FiTruck className="mr-2" size={16} />
            Vehicle Compatibility
          </h4>
        )}
        <div className="flex items-center text-sm text-neutral-600">
          <FiLoader className="animate-spin mr-2" size={16} />
          Checking compatibility...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-error-50 border border-error-200 rounded-lg p-4 ${className}`}>
        {showTitle && (
          <h4 className="text-sm font-medium text-error-900 mb-2 flex items-center">
            <FiTruck className="mr-2" size={16} />
            Vehicle Compatibility
          </h4>
        )}
        <div className="flex items-center text-sm text-error-700">
          <FiX className="mr-2" size={16} />
          {error}
        </div>
        <button
          onClick={checkCompatibility}
          className="mt-2 text-xs text-error-600 hover:text-error-800 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!compatibility) {
    return null;
  }

  const getCompatibilityColor = () => {
    if (compatibility.compatible) {
      return compatibility.confidence >= 90 ? 'success' : 'accent';
    }
    return 'error';
  };

  const getCompatibilityIcon = () => {
    if (compatibility.compatible) {
      return compatibility.confidence >= 90 ? FiCheck : FiAlertTriangle;
    }
    return FiX;
  };

  const getCompatibilityMessage = () => {
    if (compatibility.compatible) {
      if (compatibility.confidence >= 90) {
        return 'Confirmed Compatible';
      } else {
        return 'Likely Compatible';
      }
    }
    return 'Not Compatible';
  };

  const colorClass = getCompatibilityColor();
  const Icon = getCompatibilityIcon();

  return (
    <div className={`bg-${colorClass}-50 border border-${colorClass}-200 rounded-lg p-4 ${className}`}>
      {showTitle && (
        <h4 className={`text-sm font-medium text-${colorClass}-900 mb-2 flex items-center`}>
          <FiTruck className="mr-2" size={16} />
          Vehicle Compatibility
        </h4>
      )}
      
      <div className="space-y-3">
        {/* Vehicle Info */}
        <div className={`text-sm text-${colorClass}-800`}>
          <strong>
            {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
            {selectedVehicle.vehicleType && ` (${selectedVehicle.vehicleType})`}
          </strong>
        </div>

        {/* Compatibility Status */}
        <div className={`flex items-center text-sm font-medium text-${colorClass}-800`}>
          <Icon className="mr-2" size={16} />
          {getCompatibilityMessage()}
          {compatibility.confidence && (
            <span className={`ml-2 text-xs text-${colorClass}-600`}>
              ({compatibility.confidence}% confidence)
            </span>
          )}
        </div>

        {/* Notes */}
        {compatibility.notes && (
          <p className={`text-xs text-${colorClass}-700`}>
            {compatibility.notes}
          </p>
        )}

        {/* Alternative Parts */}
        {compatibility.alternativeParts && compatibility.alternativeParts.length > 0 && (
          <div className={`text-xs text-${colorClass}-700`}>
            <p className="font-medium mb-1">Alternative compatible parts:</p>
            <ul className="list-disc list-inside space-y-1">
              {compatibility.alternativeParts.map((partId, index) => (
                <li key={index}>
                  <button className={`text-${colorClass}-600 hover:text-${colorClass}-800 underline`}>
                    Part #{partId}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warranty Notice */}
        {compatibility.compatible && (
          <div className={`text-xs text-${colorClass}-600 bg-${colorClass}-100 rounded p-2`}>
            <FiCheck className="inline mr-1" size={12} />
            Fitment guaranteed or your money back
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Compact version for product cards
 */
export const CompactCompatibilityChecker = ({ 
  productId, 
  selectedVehicle, 
  className = '' 
}) => {
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId && selectedVehicle) {
      checkCompatibility();
    }
  }, [productId, selectedVehicle]);

  const checkCompatibility = async () => {
    setLoading(true);
    try {
      const result = await getVehicleCompatibility(productId, selectedVehicle);
      setCompatibility(result);
    } catch (err) {
      console.error('Compatibility check error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedVehicle || loading) {
    return null;
  }

  if (!compatibility) {
    return null;
  }

  const Icon = compatibility.compatible ? FiCheck : FiX;
  const colorClass = compatibility.compatible ? 'success' : 'error';

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${colorClass}-100 text-${colorClass}-800 ${className}`}>
      <Icon className="mr-1" size={12} />
      {compatibility.compatible ? 'Compatible' : 'Not Compatible'}
    </div>
  );
};

export default VehicleCompatibilityChecker;
