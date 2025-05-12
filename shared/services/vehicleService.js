import supabase from '../supabase/supabaseClient.js';

/**
 * Service for managing vehicle data and fitment checking
 */
const VehicleService = {
  /**
   * Get all makes
   * @returns {Promise} - Array of vehicle makes
   */
  getMakes: async () => {
    try {
      const { data, error } = await supabase
        .from('vehicle_makes')
        .select('*')
        .order('name');
        
      if (error) throw error;
      
      return {
        success: true,
        makes: data || []
      };
    } catch (error) {
      console.error('Error fetching vehicle makes:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Get models for a specific make
   * @param {string} makeId - The ID of the vehicle make
   * @returns {Promise} - Array of vehicle models
   */
  getModelsByMake: async (makeId) => {
    try {
      const { data, error } = await supabase
        .from('vehicle_models')
        .select('*')
        .eq('make_id', makeId)
        .order('name');
        
      if (error) throw error;
      
      return {
        success: true,
        models: data || []
      };
    } catch (error) {
      console.error('Error fetching vehicle models:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Get years for a specific model
   * @param {string} modelId - The ID of the vehicle model
   * @returns {Promise} - Array of years
   */
  getYearsByModel: async (modelId) => {
    try {
      const { data, error } = await supabase
        .from('vehicle_years')
        .select('*')
        .eq('model_id', modelId)
        .order('year', { ascending: false });
        
      if (error) throw error;
      
      return {
        success: true,
        years: data || []
      };
    } catch (error) {
      console.error('Error fetching vehicle years:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Check if a product is compatible with a specific vehicle
   * @param {string} productId - The ID of the product
   * @param {object} vehicle - Vehicle details (make_id, model_id, year_id)
   * @returns {Promise} - Compatibility result
   */
  checkFitment: async (productId, vehicle) => {
    try {
      if (!productId || !vehicle.make_id || !vehicle.model_id || !vehicle.year_id) {
        throw new Error('Missing required fitment check information');
      }
      
      // First, check if there's a direct fitment entry
      const { data, error } = await supabase
        .from('product_fitments')
        .select('*')
        .eq('product_id', productId)
        .eq('make_id', vehicle.make_id)
        .eq('model_id', vehicle.model_id)
        .eq('year_id', vehicle.year_id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // Not found error is acceptable
        throw error;
      }
      
      // If direct fitment found, it's compatible
      if (data) {
        return {
          success: true,
          compatible: true,
          fitmentNotes: data.notes || null
        };
      }
      
      // If no direct fitment, check universal fitment flag
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('is_universal_fit')
        .eq('id', productId)
        .single();
        
      if (productError) {
        throw productError;
      }
      
      return {
        success: true,
        compatible: productData.is_universal_fit || false,
        fitmentNotes: productData.is_universal_fit ? 'Universal fit product' : null
      };
    } catch (error) {
      console.error('Error checking fitment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Save a vehicle to user's garage
   * @param {string} userId - The user ID
   * @param {object} vehicle - Vehicle details
   * @returns {Promise} - Result of operation
   */
  saveVehicle: async (userId, vehicle) => {
    try {
      if (!userId || !vehicle.make_id || !vehicle.model_id || !vehicle.year_id) {
        throw new Error('Missing required vehicle information');
      }
      
      // Add optional nickname if not provided
      if (!vehicle.nickname) {
        const { data: makeData } = await supabase
          .from('vehicle_makes')
          .select('name')
          .eq('id', vehicle.make_id)
          .single();
          
        const { data: modelData } = await supabase
          .from('vehicle_models')
          .select('name')
          .eq('id', vehicle.model_id)
          .single();
          
        const { data: yearData } = await supabase
          .from('vehicle_years')
          .select('year')
          .eq('id', vehicle.year_id)
          .single();
          
        vehicle.nickname = `${yearData?.year || ''} ${makeData?.name || ''} ${modelData?.name || ''}`.trim();
      }
      
      const { data, error } = await supabase
        .from('user_vehicles')
        .insert({
          user_id: userId,
          make_id: vehicle.make_id,
          model_id: vehicle.model_id,
          year_id: vehicle.year_id,
          nickname: vehicle.nickname,
          is_primary: vehicle.is_primary || false,
          color: vehicle.color,
          license_plate: vehicle.license_plate,
          vin: vehicle.vin,
          notes: vehicle.notes,
          created_at: new Date()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // If this is set as primary, update all other vehicles to non-primary
      if (vehicle.is_primary) {
        await supabase
          .from('user_vehicles')
          .update({ is_primary: false })
          .neq('id', data.id)
          .eq('user_id', userId);
      }
      
      return {
        success: true,
        vehicle: data
      };
    } catch (error) {
      console.error('Error saving vehicle:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },
  
  /**
   * Get user's saved vehicles
   * @param {string} userId - The user ID
   * @returns {Promise} - Array of saved vehicles
   */
  getUserVehicles: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_vehicles')
        .select(`
          *,
          make:make_id(id, name),
          model:model_id(id, name),
          year:year_id(id, year)
        `)
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      return {
        success: true,
        vehicles: data || []
      };
    } catch (error) {
      console.error('Error fetching user vehicles:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default VehicleService; 