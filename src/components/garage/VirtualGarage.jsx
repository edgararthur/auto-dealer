import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiPlus, 
  FiEdit2, 
  FiTrash2, 
  FiTool, 
  FiCheck, 
  FiAlertTriangle, 
  FiBell,
  FiMoreVertical,
  FiX,
  FiCalendar,
  FiTrendingUp
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useMaintenanceReminders } from '../../contexts/MaintenanceRemindersContext';
import { Button, EmptyState } from '../common';
import MaintenanceReminders from '../maintenance/MaintenanceReminders';
import supabase from '../../../shared/supabase/supabaseClient';

const VirtualGarage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { generateRemindersForVehicle, getDueReminders } = useMaintenanceReminders();
  
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVehicle, setActiveVehicle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddMileageModal, setShowAddMileageModal] = useState(false);
  const [mileageInput, setMileageInput] = useState('');
  const [mileageDate, setMileageDate] = useState(new Date().toISOString().slice(0, 10));
  const [openVehicleMenu, setOpenVehicleMenu] = useState(null);
  
  // Load vehicles from database
  useEffect(() => {
    const loadVehicles = async () => {
      setLoading(true);
      try {
        if (user) {
          // Load user's vehicles from database
          const { data, error } = await supabase
            .from('user_vehicles')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          setVehicles(data || []);
          
          // Set active vehicle to the first one if any exists
          if (data && data.length > 0) {
            setActiveVehicle(data[0].id);
          }
        } else {
          // Load from localStorage if not logged in
          const savedVehicles = localStorage.getItem('userVehicles');
          const parsedVehicles = savedVehicles ? JSON.parse(savedVehicles) : [];
          
          setVehicles(parsedVehicles);
          
          if (parsedVehicles.length > 0) {
            setActiveVehicle(parsedVehicles[0].id);
          }
        }
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadVehicles();
  }, [user]);
  
  // Save vehicles to localStorage
  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem('userVehicles', JSON.stringify(vehicles));
    }
  }, [vehicles, loading, user]);
  
  // Handle vehicle selection
  const handleSelectVehicle = (vehicleId) => {
    setActiveVehicle(vehicleId);
    setOpenVehicleMenu(null);
  };
  
  // Delete a vehicle
  const handleDeleteVehicle = async () => {
    if (!activeVehicle) return;
    
    try {
      // Remove from state
      setVehicles(vehicles.filter(v => v.id !== activeVehicle));
      
      // Set new active vehicle
      const remainingVehicles = vehicles.filter(v => v.id !== activeVehicle);
      if (remainingVehicles.length > 0) {
        setActiveVehicle(remainingVehicles[0].id);
      } else {
        setActiveVehicle(null);
      }
      
      // Remove from database if logged in
      if (user) {
        await supabase
          .from('user_vehicles')
          .delete()
          .eq('id', activeVehicle)
          .eq('user_id', user.id);
      }
      
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
    }
  };
  
  // Add mileage update to vehicle
  const handleAddMileage = async () => {
    if (!activeVehicle || !mileageInput) return;
    
    try {
      const mileage = parseInt(mileageInput);
      if (isNaN(mileage) || mileage <= 0) {
        return; // Invalid input
      }
      
      // Find the active vehicle
      const vehicleIndex = vehicles.findIndex(v => v.id === activeVehicle);
      if (vehicleIndex === -1) return;
      
      const vehicle = vehicles[vehicleIndex];
      
      // Create mileage update entry
      const mileageEntry = {
        mileage,
        date: mileageDate,
        created_at: new Date().toISOString()
      };
      
      // Update vehicle's mileage history and current mileage
      const mileageHistory = vehicle.mileage_history || [];
      const updatedVehicle = {
        ...vehicle,
        mileage_history: [...mileageHistory, mileageEntry],
        current_mileage: mileage,
        last_mileage_update: mileageDate
      };
      
      // Calculate average daily miles
      if (mileageHistory.length > 0) {
        const oldestEntry = mileageHistory[0];
        const oldestDate = new Date(oldestEntry.date);
        const currentDate = new Date(mileageDate);
        const daysDiff = Math.max(1, Math.round((currentDate - oldestDate) / (1000 * 60 * 60 * 24)));
        const mileageDiff = mileage - oldestEntry.mileage;
        
        updatedVehicle.average_daily_miles = Math.max(0, Math.round(mileageDiff / daysDiff));
      }
      
      // Update vehicles array
      const updatedVehicles = [...vehicles];
      updatedVehicles[vehicleIndex] = updatedVehicle;
      setVehicles(updatedVehicles);
      
      // Update in database if logged in
      if (user) {
        await supabase
          .from('user_vehicles')
          .update({
            mileage_history: updatedVehicle.mileage_history,
            current_mileage: updatedVehicle.current_mileage,
            last_mileage_update: updatedVehicle.last_mileage_update,
            average_daily_miles: updatedVehicle.average_daily_miles
          })
          .eq('id', activeVehicle)
          .eq('user_id', user.id);
      }
      
      // Generate maintenance reminders based on new mileage
      generateRemindersForVehicle(updatedVehicle);
      
      // Close modal and reset inputs
      setShowAddMileageModal(false);
      setMileageInput('');
      setMileageDate(new Date().toISOString().slice(0, 10));
    } catch (error) {
      console.error('Error updating mileage:', error);
    }
  };
  
  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate when maintenance is due
  const calculateMaintenanceDue = (vehicle) => {
    if (!vehicle || !vehicle.current_mileage) return null;
    
    // Check when oil change is due
    const lastOilChange = vehicle.service_history?.find(s => s.type === 'oilChange');
    const lastOilChangeMileage = lastOilChange?.mileage || 0;
    const mileageSinceOilChange = vehicle.current_mileage - lastOilChangeMileage;
    
    if (mileageSinceOilChange >= 5000) {
      return {
        isDue: true,
        service: 'Oil Change',
        overdueMiles: mileageSinceOilChange - 5000
      };
    }
    
    if (mileageSinceOilChange >= 4000) {
      return {
        isDue: false,
        service: 'Oil Change',
        milesRemaining: 5000 - mileageSinceOilChange
      };
    }
    
    return null;
  };
  
  // Get active vehicle object
  const getActiveVehicle = () => {
    return vehicles.find(v => v.id === activeVehicle);
  };
  
  // Get maintenance status for the active vehicle
  const getMaintenanceStatus = () => {
    const vehicle = getActiveVehicle();
    if (!vehicle) return { count: 0, icon: <FiCheck className="text-success-500" /> };
    
    const dueReminders = getDueReminders()
      .filter(r => r.vehicle_id === vehicle.id)
      .length;
    
    if (dueReminders > 0) {
      return {
        count: dueReminders,
        icon: <FiAlertTriangle className="text-error-500" />
      };
    }
    
    return {
      count: 0,
      icon: <FiCheck className="text-success-500" />
    };
  };
  
  // Get formatted vehicle title
  const getVehicleTitle = (vehicle) => {
    if (!vehicle) return '';
    
    return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}`.trim();
  };
  
  // Get mileage trend
  const getMileageTrend = (vehicle) => {
    if (!vehicle || !vehicle.mileage_history || vehicle.mileage_history.length < 2) {
      return null;
    }
    
    const history = [...vehicle.mileage_history].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    const firstEntry = history[0];
    const lastEntry = history[history.length - 1];
    
    const firstDate = new Date(firstEntry.date);
    const lastDate = new Date(lastEntry.date);
    
    const daysDiff = Math.max(1, Math.round((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
    const mileageDiff = lastEntry.mileage - firstEntry.mileage;
    
    const dailyAverage = Math.round(mileageDiff / daysDiff);
    const monthlyEstimate = dailyAverage * 30;
    const yearlyEstimate = dailyAverage * 365;
    
    return {
      dailyAverage,
      monthlyEstimate,
      yearlyEstimate
    };
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-10 bg-neutral-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1 h-60 bg-neutral-200 rounded"></div>
            <div className="md:col-span-3 h-60 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Empty state when no vehicles
  if (vehicles.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Garage</h1>
        
        <EmptyState
          icon={<FaCar size={48} />}
          title="No Vehicles Found"
          description="Add your first vehicle to get started."
          actionText="Add Vehicle"
          actionLink="/garage/add"
        />
      </div>
    );
  }
  
  const currentVehicle = getActiveVehicle();
  const maintenanceStatus = getMaintenanceStatus();
  const mileageTrend = getMileageTrend(currentVehicle);
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Garage</h1>
        
        <Button
          variant="primary"
          onClick={() => navigate('/garage/add')}
        >
          <FiPlus className="mr-2" /> Add Vehicle
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Vehicles sidebar */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
              <h2 className="font-medium">My Vehicles</h2>
            </div>
            
            <div className="divide-y divide-neutral-100">
              {vehicles.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className={`p-3 cursor-pointer relative ${
                    activeVehicle === vehicle.id ? 'bg-primary-50' : 'hover:bg-neutral-50'
                  }`}
                  onClick={() => handleSelectVehicle(vehicle.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-medium ${activeVehicle === vehicle.id ? 'text-primary-700' : ''}`}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      
                      {vehicle.current_mileage && (
                        <p className="text-sm text-neutral-500 mt-1">
                          {vehicle.current_mileage.toLocaleString()} miles
                        </p>
                      )}
                      
                      {vehicle.license_plate && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {vehicle.license_plate}
                        </p>
                      )}
                    </div>
                    
                    <div className="relative">
                      <button 
                        className="p-1 rounded-full hover:bg-neutral-100 text-neutral-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenVehicleMenu(openVehicleMenu === vehicle.id ? null : vehicle.id);
                        }}
                      >
                        <FiMoreVertical size={16} />
                      </button>
                      
                      {openVehicleMenu === vehicle.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg overflow-hidden z-10">
                          <div className="py-1">
                            <Link
                              to={`/garage/edit/${vehicle.id}`}
                              className="flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600"
                            >
                              <FiEdit2 className="mr-2" size={14} /> Edit Vehicle
                            </Link>
                            
                            <button
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-primary-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowAddMileageModal(true);
                                setOpenVehicleMenu(null);
                              }}
                            >
                              <FiTrendingUp className="mr-2" size={14} /> Update Mileage
                            </button>
                            
                            <button
                              className="flex items-center w-full text-left px-4 py-2 text-sm text-error-600 hover:bg-error-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteModal(true);
                                setOpenVehicleMenu(null);
                              }}
                            >
                              <FiTrash2 className="mr-2" size={14} /> Delete Vehicle
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Vehicle details */}
        <div className="md:col-span-3">
          {currentVehicle ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Vehicle header */}
              <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <h2 className="text-lg font-bold">
                    {getVehicleTitle(currentVehicle)}
                  </h2>
                  
                  <div className="flex mt-2 sm:mt-0 space-x-2">
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => navigate(`/garage/edit/${currentVehicle.id}`)}
                    >
                      <FiEdit2 className="mr-1" size={14} /> Edit
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => setShowAddMileageModal(true)}
                    >
                      <FiTrendingUp className="mr-1" size={14} /> Update Mileage
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="small"
                      onClick={() => navigate(`/products?vehicle=${currentVehicle.id}`)}
                    >
                      <FiCheck className="mr-1" size={14} /> Find Parts
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Vehicle details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Vehicle info */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-neutral-500">Year</p>
                        <p className="font-medium">{currentVehicle.year}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-500">Make</p>
                        <p className="font-medium">{currentVehicle.make}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-500">Model</p>
                        <p className="font-medium">{currentVehicle.model}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-500">Trim</p>
                        <p className="font-medium">{currentVehicle.trim || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-500">Engine</p>
                        <p className="font-medium">{currentVehicle.engine || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-500">Transmission</p>
                        <p className="font-medium">{currentVehicle.transmission || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-500">Color</p>
                        <p className="font-medium">{currentVehicle.color || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-500">License Plate</p>
                        <p className="font-medium">{currentVehicle.license_plate || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-neutral-500">VIN</p>
                        <p className="font-medium">{currentVehicle.vin || 'Not specified'}</p>
                      </div>
                    </div>
                    
                    {/* Current mileage card */}
                    <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-100">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-neutral-700">Current Mileage</h4>
                          
                          <div className="mt-1 text-2xl font-bold text-primary-700">
                            {currentVehicle.current_mileage?.toLocaleString() || 'Not set'}
                            {currentVehicle.current_mileage && <span className="text-sm font-normal ml-1">miles</span>}
                          </div>
                          
                          {currentVehicle.last_mileage_update && (
                            <p className="text-xs text-neutral-500 mt-1">
                              Last updated: {formatDate(currentVehicle.last_mileage_update)}
                            </p>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="small"
                          onClick={() => setShowAddMileageModal(true)}
                        >
                          Update
                        </Button>
                      </div>
                      
                      {mileageTrend && (
                        <div className="mt-3 pt-3 border-t border-primary-100 text-sm text-neutral-600">
                          <p className="flex items-center">
                            <FiTrendingUp className="mr-1" size={14} />
                            {mileageTrend.dailyAverage} miles per day average
                          </p>
                          <p className="text-xs text-neutral-500 mt-1">
                            Yearly estimate: {mileageTrend.yearlyEstimate.toLocaleString()} miles
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Maintenance section */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Maintenance</h3>
                      
                      <div className="flex items-center">
                        <div className="bg-white p-1 rounded-full">
                          {maintenanceStatus.icon}
                        </div>
                        {maintenanceStatus.count > 0 && (
                          <span className="ml-2 text-sm font-medium text-error-600">
                            {maintenanceStatus.count} item{maintenanceStatus.count > 1 ? 's' : ''} due
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <MaintenanceReminders
                      vehicle={currentVehicle}
                      limit={3}
                      className="mt-3"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <div className="text-neutral-400 mb-4">
                <FaCar size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Vehicle Selected</h3>
              <p className="text-neutral-500 mb-4">
                Select a vehicle from the sidebar to view details.
              </p>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Delete Vehicle</h3>
            <p className="text-neutral-600 mb-6">
              Are you sure you want to delete this vehicle? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteVehicle}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add mileage modal */}
      {showAddMileageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Update Mileage</h3>
              <button 
                onClick={() => setShowAddMileageModal(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Current Mileage
              </label>
              <input
                type="number"
                value={mileageInput}
                onChange={(e) => setMileageInput(e.target.value)}
                placeholder="Enter current mileage"
                className="w-full border border-neutral-300 rounded-md py-2 px-3"
                min="0"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Date
              </label>
              <div className="flex items-center border border-neutral-300 rounded-md overflow-hidden">
                <div className="p-2 bg-neutral-50 border-r border-neutral-300">
                  <FiCalendar className="text-neutral-500" />
                </div>
                <input
                  type="date"
                  value={mileageDate}
                  onChange={(e) => setMileageDate(e.target.value)}
                  className="w-full py-2 px-3 focus:outline-none"
                  max={new Date().toISOString().slice(0, 10)}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                variant="outline"
                className="mr-2"
                onClick={() => setShowAddMileageModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddMileage}
                disabled={!mileageInput}
              >
                Update Mileage
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualGarage; 