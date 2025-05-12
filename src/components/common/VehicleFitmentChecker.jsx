import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FiCheck, FiX, FiChevronDown, FiTruck, FiAlertCircle } from 'react-icons/fi';
import PropTypes from 'prop-types';
import VehicleService from '../../../shared/services/vehicleService';

const VehicleFitmentChecker = ({ productId, className = '' }) => {
  const { user } = useAuth();
  
  const [step, setStep] = useState('SELECT_METHOD');
  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [years, setYears] = useState([]);
  const [savedVehicles, setSavedVehicles] = useState([]);
  
  const [selectedMake, setSelectedMake] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [fitmentResult, setFitmentResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Load user's saved vehicles on component mount
  useEffect(() => {
    if (user) {
      fetchSavedVehicles();
    }
  }, [user]);
  
  // Load makes when selecting manual entry
  useEffect(() => {
    if (step === 'SELECT_MAKE') {
      fetchMakes();
    }
  }, [step]);
  
  // Load models when make is selected
  useEffect(() => {
    if (selectedMake) {
      fetchModels(selectedMake.id);
      setSelectedModel(null);
      setSelectedYear(null);
    }
  }, [selectedMake]);
  
  // Load years when model is selected
  useEffect(() => {
    if (selectedModel) {
      fetchYears(selectedModel.id);
      setSelectedYear(null);
    }
  }, [selectedModel]);
  
  // Fetch all vehicle makes
  const fetchMakes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await VehicleService.getMakes();
      
      if (response.success) {
        setMakes(response.makes);
      } else {
        setError(response.error || 'Failed to load vehicle makes');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading vehicle makes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch models for a selected make
  const fetchModels = async (makeId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await VehicleService.getModelsByMake(makeId);
      
      if (response.success) {
        setModels(response.models);
      } else {
        setError(response.error || 'Failed to load vehicle models');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading vehicle models');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch years for a selected model
  const fetchYears = async (modelId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await VehicleService.getYearsByModel(modelId);
      
      if (response.success) {
        setYears(response.years);
      } else {
        setError(response.error || 'Failed to load vehicle years');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading vehicle years');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch user's saved vehicles
  const fetchSavedVehicles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await VehicleService.getUserVehicles(user.id);
      
      if (response.success) {
        setSavedVehicles(response.vehicles);
      } else {
        setError(response.error || 'Failed to load your vehicles');
      }
    } catch (err) {
      setError('An unexpected error occurred while loading your vehicles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Check fitment for a vehicle
  const checkFitment = async (vehicle) => {
    setLoading(true);
    setError(null);
    setFitmentResult(null);
    
    try {
      const response = await VehicleService.checkFitment(
        productId,
        {
          make_id: vehicle.make_id,
          model_id: vehicle.model_id,
          year_id: vehicle.year_id
        }
      );
      
      if (response.success) {
        setFitmentResult(response);
      } else {
        setError(response.error || 'Failed to check fitment');
      }
    } catch (err) {
      setError('An unexpected error occurred while checking compatibility');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Save the current vehicle selection
  const saveCurrentVehicle = async () => {
    if (!selectedMake || !selectedModel || !selectedYear) {
      setError('Please select make, model, and year to save this vehicle');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await VehicleService.saveVehicle(user.id, {
        make_id: selectedMake.id,
        model_id: selectedModel.id,
        year_id: selectedYear.id,
        is_primary: savedVehicles.length === 0 // Make primary if it's the first vehicle
      });
      
      if (response.success) {
        // Refresh saved vehicles
        await fetchSavedVehicles();
        
        // Show success message
        setError(null);
        
        // Set this as the selected vehicle
        setSelectedVehicle(response.vehicle);
      } else {
        setError(response.error || 'Failed to save your vehicle');
      }
    } catch (err) {
      setError('An unexpected error occurred while saving your vehicle');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle vehicle selection from saved vehicles
  const handleSelectSavedVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    checkFitment(vehicle);
  };
  
  // Handle manual vehicle selection
  const handleSelectManualVehicle = () => {
    if (!selectedMake || !selectedModel || !selectedYear) {
      setError('Please select make, model, and year');
      return;
    }
    
    const vehicle = {
      make_id: selectedMake.id,
      model_id: selectedModel.id,
      year_id: selectedYear.id,
      make: selectedMake,
      model: selectedModel,
      year: selectedYear
    };
    
    checkFitment(vehicle);
  };
  
  // Reset the selection process
  const handleReset = () => {
    setStep('SELECT_METHOD');
    setSelectedMake(null);
    setSelectedModel(null);
    setSelectedYear(null);
    setSelectedVehicle(null);
    setFitmentResult(null);
    setError(null);
  };
  
  // Render the vehicle selection method step
  const renderSelectMethod = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-neutral-800">Check Vehicle Compatibility</h3>
        <p className="text-sm text-neutral-600">Select how you want to choose your vehicle:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            className="flex items-center justify-center p-4 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            onClick={() => setStep('SELECT_SAVED_VEHICLE')}
            disabled={savedVehicles.length === 0}
          >
            <FiTruck className="text-primary-600 mr-2" size={18} />
            <span className="font-medium">
              {savedVehicles.length > 0 ? 'Choose from My Vehicles' : 'No Saved Vehicles'}
            </span>
          </button>
          
          <button
            className="flex items-center justify-center p-4 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
            onClick={() => setStep('SELECT_MAKE')}
          >
            <FiTruck className="text-primary-600 mr-2" size={18} />
            <span className="font-medium">Enter Vehicle Details</span>
          </button>
        </div>
      </div>
    );
  };
  
  // Render the saved vehicles selection step
  const renderSelectSavedVehicle = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-800">Select Your Vehicle</h3>
          <button
            className="text-sm text-primary-600 hover:text-primary-700"
            onClick={handleReset}
          >
            Back
          </button>
        </div>
        
        <div className="space-y-2">
          {savedVehicles.map(vehicle => (
            <button
              key={vehicle.id}
              className="w-full flex items-center justify-between p-3 border border-neutral-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              onClick={() => handleSelectSavedVehicle(vehicle)}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{vehicle.nickname}</span>
                <span className="text-sm text-neutral-500">
                  {vehicle.year?.year} {vehicle.make?.name} {vehicle.model?.name}
                </span>
              </div>
              {vehicle.is_primary && (
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                  Primary
                </span>
              )}
            </button>
          ))}
        </div>
        
        <button
          className="w-full text-center text-sm text-primary-600 hover:text-primary-700"
          onClick={() => setStep('SELECT_MAKE')}
        >
          Enter New Vehicle
        </button>
      </div>
    );
  };
  
  // Render the make selection step
  const renderSelectMake = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-neutral-800">Select Make</h3>
          <button
            className="text-sm text-primary-600 hover:text-primary-700"
            onClick={handleReset}
          >
            Back
          </button>
        </div>
        
        <div className="relative">
          <select
            className="w-full p-3 border border-neutral-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={selectedMake?.id || ''}
            onChange={(e) => {
              const selected = makes.find(make => make.id === e.target.value);
              setSelectedMake(selected || null);
            }}
          >
            <option value="">Select Make</option>
            {makes.map(make => (
              <option key={make.id} value={make.id}>
                {make.name}
              </option>
            ))}
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
        </div>
        
        {selectedMake && (
          <div className="space-y-4">
            <div className="relative">
              <select
                className="w-full p-3 border border-neutral-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedModel?.id || ''}
                onChange={(e) => {
                  const selected = models.find(model => model.id === e.target.value);
                  setSelectedModel(selected || null);
                }}
              >
                <option value="">Select Model</option>
                {models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
            </div>
            
            {selectedModel && (
              <div className="relative">
                <select
                  className="w-full p-3 border border-neutral-300 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={selectedYear?.id || ''}
                  onChange={(e) => {
                    const selected = years.find(year => year.id === e.target.value);
                    setSelectedYear(selected || null);
                  }}
                >
                  <option value="">Select Year</option>
                  {years.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.year}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-500" />
              </div>
            )}
            
            {selectedMake && selectedModel && selectedYear && (
              <div className="flex space-x-2">
                <button
                  className="flex-1 py-2 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  onClick={handleSelectManualVehicle}
                >
                  Check Compatibility
                </button>
                
                {user && (
                  <button
                    className="py-2 px-4 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                    onClick={saveCurrentVehicle}
                  >
                    Save Vehicle
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Render the fitment result
  const renderFitmentResult = () => {
    if (!fitmentResult) return null;
    
    const { compatible, fitmentNotes } = fitmentResult;
    
    return (
      <div className={`mt-4 p-4 rounded-lg ${compatible ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center">
          {compatible ? (
            <FiCheck className="text-green-600 mr-2" size={20} />
          ) : (
            <FiX className="text-red-600 mr-2" size={20} />
          )}
          <div>
            <h4 className={`font-medium ${compatible ? 'text-green-700' : 'text-red-700'}`}>
              {compatible ? 'Compatible with your vehicle' : 'Not compatible with your vehicle'}
            </h4>
            {fitmentNotes && (
              <p className="text-sm mt-1">{fitmentNotes}</p>
            )}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-neutral-200">
          <p className="text-sm text-neutral-600">
            <span className="font-medium">Your Vehicle:</span>{' '}
            {selectedVehicle ? (
              <span>
                {selectedVehicle.year?.year || selectedVehicle.year.year}{' '}
                {selectedVehicle.make?.name || selectedVehicle.make.name}{' '}
                {selectedVehicle.model?.name || selectedVehicle.model.name}
              </span>
            ) : (
              <span>
                {selectedYear?.year} {selectedMake?.name} {selectedModel?.name}
              </span>
            )}
          </p>
        </div>
        
        <button
          className="w-full mt-3 text-center text-sm text-primary-600 hover:text-primary-700"
          onClick={handleReset}
        >
          Check Another Vehicle
        </button>
      </div>
    );
  };
  
  // Render error message
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start">
        <FiAlertCircle className="mr-2 flex-shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  };
  
  // Render loading state
  const renderLoading = () => {
    if (!loading) return null;
    
    return (
      <div className="mt-4 p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 text-sm flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
        <span>Loading...</span>
      </div>
    );
  };
  
  return (
    <div className={`bg-white p-4 border border-neutral-200 rounded-lg shadow-sm ${className}`}>
      {step === 'SELECT_METHOD' && renderSelectMethod()}
      {step === 'SELECT_SAVED_VEHICLE' && renderSelectSavedVehicle()}
      {step === 'SELECT_MAKE' && renderSelectMake()}
      
      {renderFitmentResult()}
      {renderError()}
      {renderLoading()}
    </div>
  );
};

VehicleFitmentChecker.propTypes = {
  productId: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default VehicleFitmentChecker; 