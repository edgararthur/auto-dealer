import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiCalendar, 
  FiClock, 
  FiTool, 
  FiFilter, 
  FiDownload, 
  FiPlusCircle,
  FiTrendingUp
} from 'react-icons/fi';
import { FaCar } from 'react-icons/fa';
import { useMaintenanceReminders } from '../../contexts/MaintenanceRemindersContext';
import { useAuth } from '../../contexts/AuthContext';
import { Breadcrumb, Button, EmptyState } from '../../components/common';
import MaintenanceReminders from '../../components/maintenance/MaintenanceReminders';
import supabase from '../../../shared/supabase/supabaseClient';

const MaintenanceDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { reminders, loading } = useMaintenanceReminders();
  
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [maintenanceStats, setMaintenanceStats] = useState({
    dueCount: 0,
    upcomingCount: 0,
    completedCount: 0
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
            .select('id, year, make, model, trim')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          setVehicles(data || []);
        } else {
          // Load from localStorage if not logged in
          const savedVehicles = localStorage.getItem('userVehicles');
          const parsedVehicles = savedVehicles ? JSON.parse(savedVehicles) : [];
          
          // Extract only needed fields for the dropdown
          const vehicleOptions = parsedVehicles.map(v => ({
            id: v.id,
            year: v.year,
            make: v.make,
            model: v.model,
            trim: v.trim
          }));
          
          setVehicles(vehicleOptions);
        }
      } catch (error) {
        console.error('Error loading vehicles:', error);
      } finally {
        setLoadingVehicles(false);
      }
    };
    
    loadVehicles();
  }, [user]);
  
  // Calculate maintenance stats
  useEffect(() => {
    if (loading) return;
    
    // Filter by vehicle if one is selected
    const filteredReminders = selectedVehicle === 'all' 
      ? reminders 
      : reminders.filter(r => r.vehicle_id === selectedVehicle);
    
    // Count due, upcoming, and completed
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + 30);
    
    const dueCount = filteredReminders.filter(r => 
      !r.is_completed && new Date(r.due_date) <= now
    ).length;
    
    const upcomingCount = filteredReminders.filter(r => 
      !r.is_completed && 
      new Date(r.due_date) > now && 
      new Date(r.due_date) <= future
    ).length;
    
    const completedCount = filteredReminders.filter(r => 
      r.is_completed
    ).length;
    
    setMaintenanceStats({
      dueCount,
      upcomingCount,
      completedCount
    });
  }, [reminders, selectedVehicle, loading]);
  
  // Handle vehicle selection change
  const handleVehicleChange = (e) => {
    setSelectedVehicle(e.target.value);
  };
  
  // Generate vehicle display name
  const getVehicleDisplayName = (vehicle) => {
    if (!vehicle) return '';
    return `${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim || ''}`.trim();
  };
  
  // Handle export to CSV
  const exportToCSV = () => {
    // Filter reminders by selected vehicle
    const filteredReminders = selectedVehicle === 'all' 
      ? reminders 
      : reminders.filter(r => r.vehicle_id === selectedVehicle);
    
    // Convert to CSV format
    const headers = ['Vehicle', 'Service', 'Due Date', 'Status', 'Completed Date', 'Notes'];
    const rows = filteredReminders.map(reminder => [
      reminder.vehicle_name || '',
      reminder.description || '',
      new Date(reminder.due_date).toLocaleDateString(),
      reminder.is_completed ? 'Completed' : 'Pending',
      reminder.completed_date ? new Date(reminder.completed_date).toLocaleDateString() : '',
      reminder.notes || ''
    ]);
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'maintenance_report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading || loadingVehicles) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-40 bg-neutral-200 rounded"></div>
          <div className="h-64 bg-neutral-200 rounded"></div>
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
          { name: 'Maintenance', url: '#' }
        ]} />
      </div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <h1 className="text-2xl font-bold">Maintenance Dashboard</h1>
        
        <div className="flex mt-4 sm:mt-0 space-x-3">
          <Button
            variant="outline"
            onClick={exportToCSV}
          >
            <FiDownload className="mr-2" /> Export
          </Button>
          
          <Button
            variant="primary"
            onClick={() => navigate('/maintenance/new')}
          >
            <FiPlusCircle className="mr-2" /> Add Reminder
          </Button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-error-500">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-error-100 rounded-full text-error-600 mr-3">
              <FiClock size={20} />
            </div>
            <h3 className="text-lg font-medium">Due Now</h3>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-neutral-900 mr-2">{maintenanceStats.dueCount}</span>
            <span className="text-neutral-500">maintenance items</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-accent-500">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-accent-100 rounded-full text-accent-600 mr-3">
              <FiCalendar size={20} />
            </div>
            <h3 className="text-lg font-medium">Upcoming</h3>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-neutral-900 mr-2">{maintenanceStats.upcomingCount}</span>
            <span className="text-neutral-500">in next 30 days</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-success-500">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-success-100 rounded-full text-success-600 mr-3">
              <FiTool size={20} />
            </div>
            <h3 className="text-lg font-medium">Completed</h3>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-neutral-900 mr-2">{maintenanceStats.completedCount}</span>
            <span className="text-neutral-500">total services</span>
          </div>
        </div>
      </div>
      
      {/* Vehicle filter */}
      {vehicles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex items-center mr-4 mb-4 md:mb-0">
              <FiFilter className="text-neutral-500 mr-2" />
              <span className="text-neutral-700 font-medium">Filter by vehicle:</span>
            </div>
            
            <div className="flex-grow">
              <select
                value={selectedVehicle}
                onChange={handleVehicleChange}
                className="w-full md:max-w-xs border border-neutral-300 rounded p-2"
              >
                <option value="all">All Vehicles</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {getVehicleDisplayName(vehicle)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Maintenance reminders */}
      {vehicles.length === 0 ? (
        <EmptyState
          icon={<FaCar size={48} />}
          title="No Vehicles Found"
          description="Add a vehicle to start tracking maintenance."
          actionText="Add Vehicle"
          actionLink="/garage/add"
        />
      ) : reminders.length === 0 ? (
        <EmptyState
          icon={<FiTool size={48} />}
          title="No Maintenance Reminders"
          description="Add maintenance reminders to keep your vehicles running smoothly."
          actionText="Add Reminder"
          actionLink="/maintenance/new"
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200">
            <h2 className="text-lg font-medium">Maintenance Schedule</h2>
          </div>
          
          <div className="p-6">
            <MaintenanceReminders 
              vehicle={selectedVehicle !== 'all' ? { id: selectedVehicle } : null}
              limit={0}
              showActions={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceDashboard; 