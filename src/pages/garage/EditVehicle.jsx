import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Breadcrumb } from '../../components/common';
import supabase from '../../../shared/supabase/supabaseClient.js';

const EditVehicle = () => {
  const navigate = useNavigate();
  const { vehicleId } = useParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [notFound, setNotFound] = useState(false);
  
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
  
  // Load vehicle data
  useEffect(() => {
    const loadVehicle = async () => {
      setLoading(true);
      setError('');
      
      try {
        let vehicle = null;
        
        if (user) {
          // Fetch from database if logged in
          const { data, error } = await supabase
            .from('user_vehicles')
            .select('*')
            .eq('id', vehicleId)
            .eq('user_id', user.id)
            .single();
            
          if (error) throw error;
          vehicle = data;
        } else {
          // Fetch from localStorage if not logged in
          const savedVehicles = localStorage.getItem('userVehicles');
          const vehicles = savedVehicles ? JSON.parse(savedVehicles) : [];
          vehicle = vehicles.find(v => v.id === vehicleId);
        }
        
        if (!vehicle) {
          setNotFound(true);
          return;
        }
        
        // Set form data from vehicle
        setVehicleData({
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
          trim: vehicle.trim || '',
          engine: vehicle.engine || '',
          transmission: vehicle.transmission || '',
          color: vehicle.color || '',
          license_plate: vehicle.license_plate || '',
          vin: vehicle.vin || '',
          current_mileage: vehicle.current_mileage || '',
          notes: vehicle.notes || ''
        });
      } catch (err) {
        console.error('Error loading vehicle:', err);
        setError('Failed to load vehicle data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadVehicle();
  }, [vehicleId, user]);
  
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
    setSaving(true);
    setError('');
    
    // Validate required fields
    if (!vehicleData.year || !vehicleData.make || !vehicleData.model) {
      setError('Please fill in all required fields (Year, Make, Model)');
      setSaving(false);
      return;
    }
    
    try {
      if (user) {
        // Update in database if logged in
        const { error: supabaseError } = await supabase
          .from('user_vehicles')
          .update({
            year: parseInt(vehicleData.year),
            make: vehicleData.make,
            model: vehicleData.model,
            trim: vehicleData.trim,
            engine: vehicleData.engine,
            transmission: vehicleData.transmission,
            color: vehicleData.color,
            license_plate: vehicleData.license_plate,
            vin: vehicleData.vin,
            current_mileage: vehicleData.current_mileage ? parseInt(vehicleData.current_mileage) : null,
            notes: vehicleData.notes
          })
          .eq('id', vehicleId)
          .eq('user_id', user.id);
          
        if (supabaseError) throw supabaseError;
      } else {
        // Update in localStorage if not logged in
        const savedVehicles = localStorage.getItem('userVehicles');
        const vehicles = savedVehicles ? JSON.parse(savedVehicles) : [];
        
        const updatedVehicles = vehicles.map(v => {
          if (v.id === vehicleId) {
            return {
              ...v,
              year: parseInt(vehicleData.year),
              make: vehicleData.make,
              model: vehicleData.model,
              trim: vehicleData.trim,
              engine: vehicleData.engine,
              transmission: vehicleData.transmission,
              color: vehicleData.color,
              license_plate: vehicleData.license_plate,
              vin: vehicleData.vin,
              current_mileage: vehicleData.current_mileage ? parseInt(vehicleData.current_mileage) : v.current_mileage,
              notes: vehicleData.notes
            };
          }
          return v;
        });
        
        localStorage.setItem('userVehicles', JSON.stringify(updatedVehicles));
      }
      
      setSuccess(true);
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/garage');
      }, 1500);
    } catch (err) {
      console.error('Error updating vehicle:', err);
      setError(err.message || 'Failed to update vehicle. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Years array for dropdown (current year down to 1960)
  const years = Array.from({ length: 65 }, (_, i) => new Date().getFullYear() - i);
  
  // Show not found message
  if (notFound) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-error-50 border border-error-200 text-error-700 p-6 rounded-md flex flex-col items-center">
          <FiAlertTriangle size={48} className="mb-4" />
          <h2 className="text-xl font-bold mb-2">Vehicle Not Found</h2>
          <p className="text-center mb-4">The vehicle you're looking for doesn't exist or you don't have permission to access it.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/garage')}
          >
            Return to Garage
          </Button>
        </div>
      </div>
    );
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-8"></div>
          <div className="h-64 bg-neutral-200 rounded mb-6"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb items={[
          { name: 'Home', url: '/' },
          { name: 'My Garage', url: '/garage' },
          { name: 'Edit Vehicle', url: '#' }
        ]} />
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Edit Vehicle</h1>
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
          <span>Vehicle updated successfully! Redirecting to your garage...</span>
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
              loading={saving}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicle; 