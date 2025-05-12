import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { 
  FiClock, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiCheck, 
  FiX, 
  FiCalendar, 
  FiTool,
  FiBell,
  FiPlusCircle,
  FiChevronRight,
  FiTrash2
} from 'react-icons/fi';
import { Button } from '../common';
import { useMaintenanceReminders } from '../../contexts/MaintenanceRemindersContext';

const MaintenanceReminders = ({ 
  vehicle = null, 
  limit = 5, 
  showActions = true,
  className = '' 
}) => {
  const { 
    reminders, 
    loading, 
    markReminderComplete, 
    deleteReminder,
    getDueReminders,
    getUpcomingReminders
  } = useMaintenanceReminders();
  
  const [activeTab, setActiveTab] = useState('due');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [showCompleteForm, setShowCompleteForm] = useState(null);
  const [completedDate, setCompletedDate] = useState(new Date().toISOString().slice(0, 10));
  const [completedMileage, setCompletedMileage] = useState('');
  const [notes, setNotes] = useState('');
  
  // Get filtered reminders based on active tab and vehicle
  const getFilteredReminders = () => {
    let filtered = [];
    
    if (activeTab === 'due') {
      filtered = getDueReminders();
    } else if (activeTab === 'upcoming') {
      filtered = getUpcomingReminders();
    } else {
      filtered = reminders.filter(r => r.is_completed);
    }
    
    // Filter by vehicle if specified
    if (vehicle) {
      filtered = filtered.filter(r => r.vehicle_id === vehicle.id);
    }
    
    // Apply limit
    if (limit) {
      filtered = filtered.slice(0, limit);
    }
    
    return filtered;
  };
  
  // Format dates for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Get style classes for reminder based on priority
  const getReminderClasses = (reminder) => {
    if (reminder.is_completed) {
      return 'bg-success-50 border-success-200';
    }
    
    const now = new Date();
    const dueDate = new Date(reminder.due_date);
    const daysDiff = Math.ceil((dueDate - now) / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return 'bg-error-50 border-error-200';
    }
    
    if (daysDiff < 7) {
      return 'bg-accent-50 border-accent-200';
    }
    
    return 'bg-white border-neutral-200';
  };
  
  // Complete a maintenance task
  const handleCompleteTask = async (reminderId) => {
    if (!completedDate) return;
    
    const serviceData = {
      completed_date: new Date(completedDate).toISOString(),
      notes: notes.trim() || undefined,
      completed_mileage: completedMileage ? parseInt(completedMileage) : undefined
    };
    
    await markReminderComplete(reminderId, new Date(completedDate));
    setShowCompleteForm(null);
    
    // Reset form fields
    setCompletedDate(new Date().toISOString().slice(0, 10));
    setCompletedMileage('');
    setNotes('');
  };
  
  // Delete a reminder
  const handleDeleteReminder = async (reminderId) => {
    await deleteReminder(reminderId);
    setConfirmDelete(null);
  };
  
  const filteredReminders = getFilteredReminders();
  const dueCount = getDueReminders().filter(r => vehicle ? r.vehicle_id === vehicle.id : true).length;
  const upcomingCount = getUpcomingReminders().filter(r => vehicle ? r.vehicle_id === vehicle.id : true).length;
  
  if (loading) {
    return (
      <div className={`${className} p-4 bg-white rounded-lg shadow-sm`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/4"></div>
          <div className="h-12 bg-neutral-200 rounded"></div>
          <div className="h-12 bg-neutral-200 rounded"></div>
          <div className="h-12 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`maintenance-reminders ${className}`}>
      {/* Tabs */}
      <div className="flex border-b border-neutral-200 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'due'
            ? 'text-error-600 border-error-500'
            : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:border-neutral-300'
          }`}
          onClick={() => setActiveTab('due')}
        >
          <span className="flex items-center">
            <FiAlertTriangle className="mr-1" size={16} />
            Due
            {dueCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-error-100 text-error-600 rounded-full">
                {dueCount}
              </span>
            )}
          </span>
        </button>
        
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'upcoming'
            ? 'text-accent-600 border-accent-500'
            : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:border-neutral-300'
          }`}
          onClick={() => setActiveTab('upcoming')}
        >
          <span className="flex items-center">
            <FiClock className="mr-1" size={16} />
            Upcoming
            {upcomingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-xs bg-accent-100 text-accent-600 rounded-full">
                {upcomingCount}
              </span>
            )}
          </span>
        </button>
        
        <button
          className={`px-4 py-2 text-sm font-medium border-b-2 ${
            activeTab === 'completed'
            ? 'text-success-600 border-success-500'
            : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:border-neutral-300'
          }`}
          onClick={() => setActiveTab('completed')}
        >
          <span className="flex items-center">
            <FiCheckCircle className="mr-1" size={16} />
            Completed
          </span>
        </button>
      </div>
      
      {/* Reminders list */}
      {filteredReminders.length === 0 ? (
        <div className="text-center py-8 bg-neutral-50 rounded-lg">
          <div className="flex justify-center mb-3">
            {activeTab === 'due' ? (
              <FiAlertTriangle size={40} className="text-neutral-300" />
            ) : activeTab === 'upcoming' ? (
              <FiClock size={40} className="text-neutral-300" />
            ) : (
              <FiCheckCircle size={40} className="text-neutral-300" />
            )}
          </div>
          <h3 className="text-lg font-medium text-neutral-700 mb-2">
            {activeTab === 'due' 
              ? 'No due maintenance'
              : activeTab === 'upcoming'
              ? 'No upcoming maintenance'
              : 'No completed maintenance'
            }
          </h3>
          <p className="text-neutral-500 text-sm">
            {activeTab === 'due' || activeTab === 'upcoming'
              ? 'Great job! Your vehicle is up to date.'
              : 'Completed maintenance tasks will appear here.'
            }
          </p>
          
          {!vehicle && (
            <div className="mt-4">
              <Link
                to="/garage"
                className="inline-flex items-center text-primary-600 font-medium text-sm"
              >
                Manage vehicles <FiChevronRight className="ml-1" size={14} />
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReminders.map(reminder => (
            <div 
              key={reminder.id} 
              className={`border rounded-lg p-4 ${getReminderClasses(reminder)}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    {reminder.is_completed ? (
                      <span className="p-1 rounded-full bg-success-100 text-success-600 mr-2">
                        <FiCheck size={16} />
                      </span>
                    ) : (
                      <span className="p-1 rounded-full bg-accent-100 text-accent-600 mr-2">
                        <FiTool size={16} />
                      </span>
                    )}
                    <h3 className="font-medium">{reminder.description}</h3>
                  </div>
                  
                  {reminder.vehicle_name && (
                    <p className="text-sm text-neutral-600 mt-1">
                      {reminder.vehicle_name}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-x-4 mt-2">
                    <div className="text-sm text-neutral-500 flex items-center">
                      <FiCalendar size={14} className="mr-1" />
                      {reminder.is_completed 
                        ? `Completed: ${formatDate(reminder.completed_date)}` 
                        : `Due: ${formatDate(reminder.due_date)}`
                      }
                    </div>
                    
                    {reminder.due_mileage && !reminder.is_completed && (
                      <div className="text-sm text-neutral-500">
                        Due at: {reminder.due_mileage.toLocaleString()} miles
                      </div>
                    )}
                    
                    {reminder.completed_mileage && reminder.is_completed && (
                      <div className="text-sm text-neutral-500">
                        Completed at: {reminder.completed_mileage.toLocaleString()} miles
                      </div>
                    )}
                  </div>
                  
                  {reminder.notes && (
                    <p className="text-sm text-neutral-600 mt-2">
                      {reminder.notes}
                    </p>
                  )}
                </div>
                
                {showActions && !reminder.is_completed && (
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="small"
                      onClick={() => setShowCompleteForm(reminder.id)}
                    >
                      <FiCheck size={16} className="mr-1" /> Complete
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="small"
                      className="text-neutral-400 hover:text-red-500"
                      onClick={() => setConfirmDelete(reminder.id)}
                    >
                      <FiTrash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
              
              {/* Complete form */}
              {showCompleteForm === reminder.id && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <h4 className="text-sm font-medium mb-3">Mark as completed</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Completion Date
                      </label>
                      <input 
                        type="date" 
                        value={completedDate}
                        onChange={(e) => setCompletedDate(e.target.value)}
                        className="w-full border border-neutral-300 rounded p-2 text-sm"
                        max={new Date().toISOString().slice(0, 10)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">
                        Mileage (optional)
                      </label>
                      <input 
                        type="number" 
                        value={completedMileage}
                        onChange={(e) => setCompletedMileage(e.target.value)}
                        placeholder="Current mileage"
                        className="w-full border border-neutral-300 rounded p-2 text-sm"
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-xs text-neutral-500 mb-1">
                      Notes (optional)
                    </label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Service details, parts replaced, etc."
                      className="w-full border border-neutral-300 rounded p-2 text-sm"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="small"
                      onClick={() => setShowCompleteForm(null)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="primary" 
                      size="small"
                      onClick={() => handleCompleteTask(reminder.id)}
                    >
                      Mark Complete
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* View all link */}
      {limit && filteredReminders.length >= limit && (
        <div className="mt-4 text-center">
          <Link 
            to="/maintenance" 
            className="inline-flex items-center text-primary-600 font-medium"
          >
            View all reminders <FiChevronRight className="ml-1" />
          </Link>
        </div>
      )}
      
      {/* Add reminder button */}
      {showActions && vehicle && (
        <div className="mt-4">
          <Link 
            to="/maintenance/new" 
            className="flex items-center justify-center w-full py-2 bg-neutral-100 text-neutral-700 rounded-lg border border-neutral-200 hover:bg-neutral-200 transition-colors"
          >
            <FiPlusCircle className="mr-2" /> Add Maintenance Reminder
          </Link>
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Delete Reminder</h3>
            <p className="text-neutral-600 mb-6">
              Are you sure you want to delete this maintenance reminder? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => handleDeleteReminder(confirmDelete)}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

MaintenanceReminders.propTypes = {
  vehicle: PropTypes.object,
  limit: PropTypes.number,
  showActions: PropTypes.bool,
  className: PropTypes.string
};

export default MaintenanceReminders; 