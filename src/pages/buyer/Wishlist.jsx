import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiShoppingCart, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../../../shared/supabase/supabaseClient';
import EmptyState from '../../components/common/EmptyState';

const Wishlist = () => {
  const [loading, setLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const { user } = useAuth();

  useEffect(() => {
    if (user && user.id) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      
      // Fetch wishlist items with product details
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          id, 
          product_id,
          created_at,
          products:product_id (
            id,
            name,
            description,
            price,
            sale_price,
            stock_level,
            dealer_id,
            dealer:dealer_id (
              id,
              name,
              company_name
            ),
            product_images (
              id,
              url,
              is_primary
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format data for display
      const formattedItems = data.map(item => ({
        id: item.id,
        product_id: item.product_id,
        product: {
          ...item.products,
          image: item.products.product_images.find(img => img.is_primary)?.url || 
                item.products.product_images[0]?.url || 
                '/placeholder-product.jpg',
          final_price: item.products.sale_price || item.products.price,
          discount_percentage: item.products.sale_price ? 
            Math.round((1 - item.products.sale_price / item.products.price) * 100) : 0
        },
        added_at: item.created_at
      }));
      
      setWishlistItems(formattedItems);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      showNotification('Failed to load your wishlist', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      setWishlistItems(prev => prev.filter(item => item.id !== wishlistId));
      showNotification('Product removed from wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      showNotification('Failed to remove product from wishlist', 'error');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 5000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Wishlist</h1>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">My Wishlist</h1>
      
      {notification.show && (
        <div className={`mb-4 p-3 rounded-md relative ${
          notification.type === 'error' ? 'bg-error-50 text-error-700 border border-error-200' : 'bg-success-50 text-success-700 border border-success-200'
        }`}>
          {notification.message}
          <button 
            className="absolute top-3 right-3 text-neutral-400 hover:text-neutral-600"
            onClick={() => setNotification({ show: false, message: '', type: '' })}
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      )}

      {wishlistItems.length === 0 ? (
        <EmptyState 
          type="wishlist" 
          actionButtonText="Browse Products"
          actionButtonLink="/products"
        />
      ) : (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <ul className="divide-y divide-neutral-200">
            {wishlistItems.map(item => (
              <li key={item.id} className="flex flex-col sm:flex-row px-4 py-4 sm:py-6">
                <div className="flex-shrink-0 w-full sm:w-48 h-48 sm:h-36 mb-4 sm:mb-0">
                  <Link to={`/products/${item.product_id}`}>
                    <img 
                      src={item.product.image} 
                      alt={item.product.name} 
                      className="h-full w-full object-cover object-center rounded-md"
                    />
                  </Link>
                </div>
                
                <div className="sm:ml-6 flex-1 flex flex-col">
                  <div>
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium text-neutral-900">
                        <Link to={`/products/${item.product_id}`} className="hover:text-primary-600">
                          {item.product.name}
                        </Link>
                      </h3>
                      
                      <div className="ml-4">
                        <button
                          type="button"
                          onClick={() => removeFromWishlist(item.id)}
                          className="text-neutral-400 hover:text-error-500"
                        >
                          <FiTrash2 className="h-5 w-5" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </div>
                    </div>
                    
                    <p className="mt-1 text-sm text-neutral-600 line-clamp-2">
                      {item.product.description}
                    </p>
                    
                    <p className="mt-1 text-sm text-neutral-500">
                      Seller: {item.product.dealer?.name || item.product.dealer?.company_name || 'Unknown'}
                    </p>
                  </div>
                  
                  <div className="mt-auto pt-4 flex flex-wrap items-end justify-between">
                    <div className="flex items-center">
                      {item.product.discount_percentage > 0 ? (
                        <>
                          <p className="text-lg font-medium text-neutral-900">GH₵{item.product.final_price.toFixed(2)}</p>
                          <p className="ml-2 text-sm line-through text-neutral-500">GH₵{item.product.price.toFixed(2)}</p>
                          <span className="ml-2 text-xs font-semibold text-error-600 bg-error-50 px-1.5 py-0.5 rounded">
                            -{item.product.discount_percentage}%
                          </span>
                        </>
                      ) : (
                        <p className="text-lg font-medium text-neutral-900">GH₵{item.product.final_price.toFixed(2)}</p>
                      )}
                    </div>
                    
                    <div className="mt-4 sm:mt-0">
                      {item.product.stock_level > 0 ? (
                        <Link 
                          to={`/products/${item.product_id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                        >
                          <FiShoppingCart className="mr-2 h-4 w-4" />
                          Add to Cart
                        </Link>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-500 bg-neutral-100">
                          Out of Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Wishlist; 