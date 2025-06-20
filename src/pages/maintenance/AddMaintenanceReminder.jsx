import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiTool, FiAlertTriangle } from 'react-icons/fi';
import { useMaintenanceReminders } from '../../contexts/MaintenanceRemindersContext';
import { useAuth } from '../../contexts/AuthContext';
import { Breadcrumb, Button } from '../../components/common';
import supabase from '../../../shared/supabase/supabaseClient.js';

const AddMaintenanceReminder = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addReminder, maintenanceIntervals } = useMaintenanceReminders();
  
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [useTemplate, setUseTemplate] = useState(true);
  
  // Form state
  const [reminderData, setReminderData] = useState({
    vehicle_id: '',
    type: 'oilChange',
    description: '',
    due_date: new Date().toISOString().slice(0, 10),
    due_mileage: '',
    notes: '',
    priority: 'medium'
  });
  
  // Load vehicles
  useEffect(() => {
    const loadVehicles = async () => {
      setLoadingVehicles(true);
      try {
        if (user) {
          // Load from database if logged in
          const { data, error } = await supabase
            .from('user_vehicles')
            .select('id, year, make, model, trim, current_mileage')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          setVehicles(data || []);
        } else {
          // Load from localStorage if not logged in
          const savedVehicles = localStorage.getItem('userVehicles');
          const parsedVehicles = savedVehicles ? JSON.parse(savedVehicles) : [];
          setVehicles(parsedVehicles);
        }
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoadingVehicles(false);
      }
    };
    
    loadVehicles();
  }, [user]);
  
  // Generate vehicle display name
  const getVehicleDisplayName = (vehicle) => {
    if (!vehicle) return '';
    return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}`.trim();
  };
  
  // Update description when type changes (when using template)
  useEffect(() => {
    if (useTemplate && reminderData.type && maintenanceIntervals[reminderData.type]) {
      setReminderData(prev => ({
        ...prev,
        description: maintenanceIntervals[reminderData.type].description
      }));
    }
  }, [reminderData.type, useTemplate, maintenanceIntervals]);
  
  // Handle vehicle selection change
  useEffect(() => {
    if (reminderData.vehicle_id) {
      const selectedVehicle = vehicles.find(v => v.id === reminderData.vehicle_id);
      
      if (selectedVehicle && selectedVehicle.current_mileage && useTemplate && reminderData.type) {
        // Calculate due mileage based on current mileage and maintenance interval
        const interval = maintenanceIntervals[reminderData.type];
        if (interval) {
          const dueMileage = selectedVehicle.current_mileage + interval.miles;
          setReminderData(prev => ({
            ...prev,
            due_mileage: dueMileage,
            vehicle_name: getVehicleDisplayName(selectedVehicle)
          }));
        }
      }
    }
  }, [reminderData.vehicle_id, reminderData.type, useTemplate, vehicles, maintenanceIntervals]);
  
  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setReminderData({
      ...reminderData,
      [name]: value
    });
    
    // If switching from template to custom, preserve the description
    if (name === 'type' && !value && useTemplate) {
      setUseTemplate(false);
    }
  };
  
  // Handle template toggle
  const handleTemplateToggle = (e) => {
    const useTemplateValue = e.target.value === 'template';
    setUseTemplate(useTemplateValue);
    
    if (useTemplateValue && reminderData.type && maintenanceIntervals[reminderData.type]) {
      setReminderData(prev => ({
        ...prev,
        description: maintenanceIntervals[reminderData.type].description
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate required fields
    if (!reminderData.vehicle_id || !reminderData.due_date || 
        (useTemplate && !reminderData.type) || 
        (!useTemplate && !reminderData.description)) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    try {
      // Find the selected vehicle to get the name
      const selectedVehicle = vehicles.find(v => v.id === reminderData.vehicle_id);
      
      // Prepare reminder data
      const reminder = {
        ...reminderData,
        vehicle_name: getVehicleDisplayName(selectedVehicle),
        due_mileage: reminderData.due_mileage ? parseInt(reminderData.due_mileage) : undefined
      };
      
      // Add reminder
      const result = await addReminder(reminder);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add reminder');
      }
      
      setSuccess(true);
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/maintenance');
      }, 1500);
    } catch (err) {
      console.error('Error adding reminder:', err);
      setError(err.message || 'Failed to add reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Show loading state
  if (loadingVehicles) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4 mb-6"></div>
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
          { name: 'Maintenance', url: '/maintenance' },
          { name: 'Add Reminder', url: '#' }
        ]} />
      </div>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Add Maintenance Reminder</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/maintenance')}
        >
          <FiArrowLeft className="mr-2" /> Back to Maintenance
        </Button>
      </div>
      
      {/* No vehicles message */}
      {vehicles.length === 0 ? (
        <div className="bg-error-50 border border-error-200 text-error-700 p-6 rounded-md">
          <div className="flex items-center mb-4">
            <FiAlertTriangle size={24} className="mr-3" />
            <h2 className="text-lg font-bold">No Vehicles Available</h2>
          </div>
          <p className="mb-4">You need to add a vehicle before you can create maintenance reminders.</p>
          <Button
            variant="primary"
            onClick={() => navigate('/garage/add')}
          >
            Add a Vehicle
          </Button>
        </div>
      ) : (
        <>
          {/* Success message */}
          {success && (
            <div className="bg-success-50 border border-success-200 text-success-700 p-4 rounded-md mb-6 flex items-center">
              <FiCheck className="mr-2" size={20} />
              <span>Reminder added successfully! Redirecting to maintenance dashboard...</span>
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
              <FiTool size={24} className="text-primary-500 mr-3" />
              <h2 className="text-lg font-medium">Reminder Details</h2>
            </div>
            
            <form onSubmit={handleSubmit}>
              {/* Select vehicle */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1 required">
                  Vehicle
                </label>
                <select
                  name="vehicle_id"
                  value={reminderData.vehicle_id}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-md py-2 px-3"
                  required
                >
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {getVehicleDisplayName(vehicle)}
                      {vehicle.current_mileage ? ` (${vehicle.current_mileage.toLocaleString()} miles)` : ''}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Template or custom reminder */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Reminder Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="reminder_type"
                      value="template"
                      checked={useTemplate}
                      onChange={handleTemplateToggle}
                      className="form-radio h-4 w-4 text-primary-600"
                    />
                    <span className="ml-2 text-neutral-700">Use template</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="reminder_type"
                      value="custom"
                      checked={!useTemplate}
                      onChange={handleTemplateToggle}
                      className="form-radio h-4 w-4 text-primary-600"
                    />
                    <span className="ml-2 text-neutral-700">Custom reminder</span>
                  </label>
                </div>
              </div>
              
              {/* Maintenance type (for templates) */}
              {useTemplate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-1 required">
                    Maintenance Type
                  </label>
                  <select
                    name="type"
                    value={reminderData.type}
                    onChange={handleChange}
                    className="w-full border border-neutral-300 rounded-md py-2 px-3"
                    required={useTemplate}
                  >
                    <option value="">Select maintenance type</option>
                    {Object.entries(maintenanceIntervals).map(([key, interval]) => (
                      <option key={key} value={key}>
                        {interval.description} (every {interval.miles.toLocaleString()} miles)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Custom description (for custom reminders) */}
              {!useTemplate && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 mb-1 required">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={reminderData.description}
                    onChange={handleChange}
                    placeholder="e.g. Replace cabin air filter"
                    className="w-full border border-neutral-300 rounded-md py-2 px-3"
                    required={!useTemplate}
                  />
                </div>
              )}
              
              {/* Due date and mileage */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1 required">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="due_date"
                    value={reminderData.due_date}
                    onChange={handleChange}
                    className="w-full border border-neutral-300 rounded-md py-2 px-3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Due Mileage
                  </label>
                  <input
                    type="number"
                    name="due_mileage"
                    value={reminderData.due_mileage}
                    onChange={handleChange}
                    placeholder="e.g. 60000"
                    className="w-full border border-neutral-300 rounded-md py-2 px-3"
                    min="0"
                  />
                </div>
              </div>
              
              {/* Priority */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={reminderData.priority}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-md py-2 px-3"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={reminderData.notes}
                  onChange={handleChange}
                  placeholder="Additional information about this maintenance task"
                  className="w-full border border-neutral-300 rounded-md py-2 px-3"
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  className="mr-4"
                  onClick={() => navigate('/maintenance')}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={loading}
                >
                  Add Reminder
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AddMaintenanceReminder; 