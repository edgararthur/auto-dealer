import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Breadcrumb } from '../../components/common';
import supabase from '../../../shared/supabase/supabaseClient.js';

const AddVehicle = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [vehicleData, setVehicleData] = useState({
    year: new Date().getFullYear(),
    make: '',
    model: '',
    trim: '',
    engine: '',
    transmission: '',
    color: '',
    license_plate: '',
    vin: '',
    current_mileage: '',
    notes: ''
  });
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setVehicleData({
      ...vehicleData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate required fields
    if (!vehicleData.year || !vehicleData.make || !vehicleData.model) {
      setError('Please fill in all required fields (Year, Make, Model)');
      setLoading(false);
      return;
    }
    
    try {
      // Create vehicle object
      const vehicle = {
        id: Date.now().toString(),
        ...vehicleData,
        current_mileage: vehicleData.current_mileage ? parseInt(vehicleData.current_mileage) : null,
        year: parseInt(vehicleData.year),
        last_mileage_update: vehicleData.current_mileage ? new Date().toISOString() : null,
        mileage_history: vehicleData.current_mileage 
          ? [{ 
              mileage: parseInt(vehicleData.current_mileage), 
              date: new Date().toISOString().slice(0, 10),
              created_at: new Date().toISOString()
            }] 
          : [],
        service_history: [],
        created_at: new Date().toISOString(),
        user_id: user?.id
      };
      
      if (user) {
        // Save to database if logged in
        const { error: supabaseError } = await supabase
          .from('user_vehicles')
          .insert(vehicle);
          
        if (supabaseError) throw supabaseError;
      } else {
        // Save to localStorage if not logged in
        const savedVehicles = localStorage.getItem('userVehicles');
        const vehicles = savedVehicles ? JSON.parse(savedVehicles) : [];
        localStorage.setItem('userVehicles', JSON.stringify([...vehicles, vehicle]));
      }
      
      setSuccess(true);
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/garage');
      }, 1500);
    } catch (err) {
      console.error('Error adding vehicle:', err);
      setError(err.message || 'Failed to add vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Years array for dropdown (current year down to 1960)
  const years = Array.from({ length: 65 }, (_, i) => new Date().getFullYear() - i);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={[
          { name: 'Home', url: '/' },
          { name: 'My Garage', url: '/garage' },
          { name: 'Add Vehicle', url: '#' }
        ]} />
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Add Vehicle</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/garage')}
        >
          <FiArrowLeft className="mr-2" /> Back to Garage
        </Button>
      </div>
      
      {/* Success message */}
      {success && (
        <div className="bg-success-50 border border-success-200 text-success-700 p-4 rounded-md mb-6 flex items-center">
          <FiCheck className="mr-2" size={20} />
          <span>Vehicle added successfully! Redirecting to your garage...</span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center border-b border-neutral-200 pb-4 mb-6">
          <FaCar size={24} className="text-primary-500 mr-3" />
          <h2 className="text-lg font-medium">Vehicle Information</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Year, Make, Model (required) */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1 required">
                Year
              </label>
              <select
                name="year"
                value={vehicleData.year}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md py-2 px-3"
                required
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1 required">
                Make
              </label>
              <input
                type="text"
                name="make"
                value={vehicleData.make}
                onChange={handleChange}
                placeholder="e.g. Toyota"
                className="w-full border border-neutral-300 rounded-md py-2 px-3"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1 required">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={vehicleData.model}
                onChange={handleChange}
                placeholder="e.g. Camry"
                className="w-full border border-neutral-300 rounded-md py-2 px-3"
                required
              />
            </div>
            
            {/* Optional fields */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Trim
              </label>
              <input
                type="text"
                name="trim"
                value={vehicleData.trim}
                onChange={handleChange}
                placeholder="e.g. SE"
                className="w-full border border-neutral-300 rounded-md py-2 px-3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Engine
              </label>
              <input
                type="text"
                name="engine"
                value={vehicleData.engine}
                onChange={handleChange}
                placeholder="e.g. 2.5L 4-cylinder"
                className="w-full border border-neutral-300 rounded-md py-2 px-3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Transmission
              </label>
              <input
                type="text"
                name="transmission"
                value={vehicleData.transmission}
                onChange={handleChange}
                placeholder="e.g. Automatic"
                className="w-full border border-neutral-300 rounded-md py-2 px-3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Color
              </label>
              <input
                type="text"
                name="color"
                value={vehicleData.color}
                onChange={handleChange}
                placeholder="e.g. Silver"
                className="w-full border border-neutral-300 rounded-md py-2 px-3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                License Plate
              </label>
              <input
                type="text"
                name="license_plate"
                value={vehicleData.license_plate}
                onChange={handleChange}
                placeholder="e.g. ABC123"
                className="w-full border border-neutral-300 rounded-md py-2 px-3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                VIN
              </label>
              <input
                type="text"
                name="vin"
                value={vehicleData.vin}
                onChange={handleChange}
                placeholder="Vehicle Identification Number"
                className="w-full border border-neutral-300 rounded-md py-2 px-3"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Current Mileage
              </label>
              <input
                type="number"
                name="current_mileage"
                value={vehicleData.current_mileage}
                onChange={handleChange}
                placeholder="e.g. 25000"
                className="w-full border border-neutral-300 rounded-md py-2 px-3"
                min="0"
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={vehicleData.notes}
              onChange={handleChange}
              placeholder="Additional information about your vehicle"
              className="w-full border border-neutral-300 rounded-md py-2 px-3"
              rows={4}
            />
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="mr-4"
              onClick={() => navigate('/garage')}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={loading}
            >
              Add Vehicle
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicle; 