import supabase from '../supabase/supabaseClient.js';

const ComparisonService = {
  addToComparison: async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const comparisons = JSON.parse(localStorage.getItem('product_comparisons') || '[]');
        if (comparisons.some(item => item.product_id === productId)) {
          return { success: false, error: 'Product already in comparison' };
        }
        if (comparisons.length >= 4) {
          return { success: false, error: 'Maximum 4 products can be compared at once' };
        }
        
        const newComparison = { product_id: productId, added_at: new Date().toISOString() };
        const updatedComparisons = [...comparisons, newComparison];
        localStorage.setItem('product_comparisons', JSON.stringify(updatedComparisons));
        return { success: true, comparison: newComparison };
      }

      const { data: existing } = await supabase
        .from('user_comparison')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (existing) {
        return { success: false, error: 'Product already in comparison' };
      }

      const { count, error: countError } = await supabase
        .from('user_comparison')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;
      if (count >= 4) {
        return { success: false, error: 'Maximum 4 products can be compared at once' };
      }

      const { data, error } = await supabase
        .from('user_comparison')
        .insert({ user_id: user.id, product_id: productId })
        .select('*')
        .single();

      if (error) throw error;
      return { success: true, comparison: data };
    } catch (error) {
      console.error('Error adding to comparison:', error);
      return { success: false, error: error.message };
    }
  },

  removeFromComparison: async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const comparisons = JSON.parse(localStorage.getItem('product_comparisons') || '[]');
        const updatedComparisons = comparisons.filter(item => item.product_id !== productId);
        localStorage.setItem('product_comparisons', JSON.stringify(updatedComparisons));
        return { success: true };
      }

      const { error } = await supabase
        .from('user_comparison')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error removing from comparison:', error);
      return { success: false, error: error.message };
    }
  },

  getComparison: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const comparisons = JSON.parse(localStorage.getItem('product_comparisons') || '[]');
        return { success: true, comparison: comparisons, products: [] };
      }

      const { data, error } = await supabase
        .from('user_comparison')
        .select(`
          id,
          added_at,
          product:products!product_id(
            id,
            name,
            description,
            price,
            discount_price,
            stock_quantity,
            specifications,
            warranty_info,
            status,
            is_active,
            category:categories!category_id(id, name),
            brand:brands!brand_id(id, name),
            product_images!left(id, url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('added_at', { ascending: true });

      if (error) throw error;

      const enrichedComparison = data.map(item => {
        const product = item.product;
        const primaryImg = product?.product_images?.find(img => img.is_primary) || product?.product_images?.[0];
        
        return {
          id: item.id,
          added_at: item.added_at,
          product: {
            ...product,
            image: primaryImg?.url || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
            inStock: product?.stock_quantity > 0,
            finalPrice: product?.discount_price || product?.price
          }
        };
      });

      return { success: true, comparison: enrichedComparison };
    } catch (error) {
      console.error('Error fetching comparison:', error);
      return { success: false, error: error.message };
    }
  },

  getComparisonCount: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const comparisons = JSON.parse(localStorage.getItem('product_comparisons') || '[]');
        return { success: true, count: comparisons.length };
      }

      const { count, error } = await supabase
        .from('user_comparison')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Error getting comparison count:', error);
      return { success: false, error: error.message };
    }
  },

  clearComparison: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        localStorage.removeItem('product_comparisons');
        return { success: true };
      }

      const { error } = await supabase
        .from('user_comparison')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error clearing comparison:', error);
      return { success: false, error: error.message };
    }
  },

  isInComparison: async (productId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        const comparisons = JSON.parse(localStorage.getItem('product_comparisons') || '[]');
        return { success: true, inComparison: comparisons.some(item => item.product_id === productId) };
      }

      const { data, error } = await supabase
        .from('user_comparison')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return { success: true, inComparison: !!data };
    } catch (error) {
      console.error('Error checking comparison status:', error);
      return { success: false, error: error.message };
    }
  }
};

export default ComparisonService; 