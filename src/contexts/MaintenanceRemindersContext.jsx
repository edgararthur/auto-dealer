import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from './AuthContext';
import supabase from '../../shared/supabase/supabaseClient.js';

const MaintenanceRemindersContext = createContext();

export const useMaintenanceReminders = () => useContext(MaintenanceRemindersContext);

export const MaintenanceRemindersProvider = ({ children }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Common vehicle maintenance intervals (mileage)
  const maintenanceIntervals = {
    oilChange: { miles: 5000, months: 6, description: 'Oil and filter change' },
    tireRotation: { miles: 5000, months: 6, description: 'Tire rotation' },
    brakeInspection: { miles: 10000, months: 12, description: 'Brake inspection' },
    airFilter: { miles: 15000, months: 12, description: 'Air filter replacement' },
    brakePads: { miles: 50000, months: 36, description: 'Brake pad replacement' },
    timingBelt: { miles: 60000, months: 60, description: 'Timing belt replacement' },
    sparkPlugs: { miles: 60000, months: 60, description: 'Spark plugs replacement' },
    transmission: { miles: 60000, months: 60, description: 'Transmission fluid change' },
    coolant: { miles: 30000, months: 24, description: 'Coolant flush' },
    powerSteering: { miles: 30000, months: 24, description: 'Power steering fluid flush' },
    fuelFilter: { miles: 30000, months: 24, description: 'Fuel filter replacement' },
    batteries: { miles: 50000, months: 36, description: 'Battery replacement' },
  };
  
  // Load reminders from localStorage or database
  useEffect(() => {
    const loadReminders = async () => {
      setLoading(true);
      try {
        if (user) {
          // If user is logged in, load from database
          const { data, error } = await supabase
            .from('maintenance_reminders')
            .select('*')
            .eq('user_id', user.id)
            .order('due_date', { ascending: true });
          
          if (error) throw error;
          
          setReminders(data || []);
        } else {
          // If not logged in, load from localStorage
          const savedReminders = localStorage.getItem('maintenanceReminders');
          setReminders(savedReminders ? JSON.parse(savedReminders) : []);
        }
      } catch (error) {
        console.error('Error loading maintenance reminders:', error);
        // Fallback to localStorage
        const savedReminders = localStorage.getItem('maintenanceReminders');
        setReminders(savedReminders ? JSON.parse(savedReminders) : []);
      } finally {
        setLoading(false);
      }
    };
    
    loadReminders();
  }, [user]);
  
  // Save reminders to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('maintenanceReminders', JSON.stringify(reminders));
    }
  }, [reminders, loading]);
  
  // Add a new maintenance reminder
  const addReminder = async (reminderData) => {
    try {
      const newReminder = {
        id: Date.now().toString(),
        ...reminderData,
        created_at: new Date().toISOString(),
        user_id: user?.id,
        is_completed: false
      };
      
      // Save to state
      setReminders(prev => [...prev, newReminder]);
      
      // Save to database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('maintenance_reminders')
          .insert(newReminder);
        
        if (error) throw error;
      }
      
      return { success: true, reminder: newReminder };
    } catch (error) {
      console.error('Error adding maintenance reminder:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Update a maintenance reminder
  const updateReminder = async (reminderId, updates) => {
    try {
      // Update in state
      const updatedReminders = reminders.map(reminder => 
        reminder.id === reminderId ? { ...reminder, ...updates } : reminder
      );
      
      setReminders(updatedReminders);
      
      // Update in database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('maintenance_reminders')
          .update(updates)
          .eq('id', reminderId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating maintenance reminder:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Delete a maintenance reminder
  const deleteReminder = async (reminderId) => {
    try {
      // Remove from state
      setReminders(reminders.filter(reminder => reminder.id !== reminderId));
      
      // Remove from database if user is logged in
      if (user) {
        const { error } = await supabase
          .from('maintenance_reminders')
          .delete()
          .eq('id', reminderId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting maintenance reminder:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Mark a reminder as completed
  const markReminderComplete = async (reminderId, completedDate = new Date()) => {
    return updateReminder(reminderId, { 
      is_completed: true, 
      completed_date: completedDate.toISOString() 
    });
  };
  
  // Generate reminders for a vehicle based on current mileage
  const generateRemindersForVehicle = async (vehicle) => {
    if (!vehicle || !vehicle.id || !vehicle.current_mileage) {
      return { success: false, error: 'Invalid vehicle data' };
    }
    
    try {
      const newReminders = [];
      
      // Generate reminders for each maintenance type
      Object.entries(maintenanceIntervals).forEach(([type, interval]) => {
        // Calculate next due mileage
        const lastServiceMileage = vehicle.service_history?.find(s => s.type === type)?.mileage || 0;
        const mileageSinceService = vehicle.current_mileage - lastServiceMileage;
        const nextDueMileage = lastServiceMileage + interval.miles;
        
        // If next service is due within 2000 miles or already overdue, create a reminder
        if (mileageSinceService > (interval.miles - 2000)) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 
            Math.max(0, Math.floor((nextDueMileage - vehicle.current_mileage) / (vehicle.average_daily_miles || 25)))
          );
          
          const newReminder = {
            id: `${vehicle.id}-${type}-${Date.now()}`,
            vehicle_id: vehicle.id,
            vehicle_name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            type,
            description: interval.description,
            due_mileage: nextDueMileage,
            due_date: dueDate.toISOString(),
            created_at: new Date().toISOString(),
            user_id: user?.id,
            is_completed: false,
            priority: nextDueMileage <= vehicle.current_mileage ? 'high' : 'medium'
          };
          
          newReminders.push(newReminder);
        }
      });
      
      // Save to state
      if (newReminders.length > 0) {
        setReminders(prev => [...prev, ...newReminders]);
        
        // Save to database if user is logged in
        if (user) {
          const { error } = await supabase
            .from('maintenance_reminders')
            .insert(newReminders);
          
          if (error) throw error;
        }
      }
      
      return { success: true, reminders: newReminders };
    } catch (error) {
      console.error('Error generating maintenance reminders:', error);
      return { success: false, error: error.message };
    }
  };
  
  // Get due and upcoming reminders
  const getDueReminders = () => {
    const now = new Date();
    
    return reminders.filter(reminder => 
      !reminder.is_completed && 
      new Date(reminder.due_date) <= now
    );
  };
  
  // Get upcoming reminders (due in the next 30 days)
  const getUpcomingReminders = (days = 30) => {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    
    return reminders.filter(reminder => 
      !reminder.is_completed && 
      new Date(reminder.due_date) > now &&
      new Date(reminder.due_date) <= future
    );
  };
  
  const value = {
    reminders,
    loading,
    maintenanceIntervals,
    addReminder,
    updateReminder,
    deleteReminder,
    markReminderComplete,
    generateRemindersForVehicle,
    getDueReminders,
    getUpcomingReminders
  };
  
  return (
    <MaintenanceRemindersContext.Provider value={value}>
      {children}
    </MaintenanceRemindersContext.Provider>
  );
};

MaintenanceRemindersProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default MaintenanceRemindersContext;