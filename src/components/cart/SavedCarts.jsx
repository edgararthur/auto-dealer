import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FiClock, FiShoppingBag, FiTrash, FiPlusCircle, FiX, FiCheck } from 'react-icons/fi';
import { Button } from '../common';

/**
 * SavedCarts Component - Displays saved shopping carts and provides options to restore them
 * 
 * @param {Array} savedCarts - Array of saved cart objects
 * @param {Function} onLoadCart - Function to load a saved cart
 * @param {Function} onDeleteCart - Function to delete a saved cart
 * @param {Boolean} loading - Whether the component is in a loading state
 */
const SavedCarts = ({ 
  savedCarts = [], 
  onLoadCart, 
  onDeleteCart, 
  loading = false 
}) => {
  const [activeSavedCart, setActiveSavedCart] = useState(null);
  const [loadingCartId, setLoadingCartId] = useState(null);
  const [loadAction, setLoadAction] = useState(null);
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4"></div>
          <div className="h-16 bg-neutral-200 rounded mb-4"></div>
          <div className="h-16 bg-neutral-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (savedCarts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <FiShoppingBag size={48} className="text-neutral-300" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">No Saved Carts</h3>
          <p className="text-neutral-500">
            You haven't saved any carts for later. When you save a cart, it will appear here.
          </p>
        </div>
      </div>
    );
  }
  
  const handleLoad = async (cartId, replace) => {
    setLoadingCartId(cartId);
    setLoadAction(replace ? 'replace' : 'merge');
    
    try {
      await onLoadCart(cartId, replace);
    } finally {
      setLoadingCartId(null);
      setLoadAction(null);
      setActiveSavedCart(null);
    }
  };
  
  const handleDelete = async (cartId) => {
    setLoadingCartId(cartId);
    
    try {
      await onDeleteCart(cartId);
    } finally {
      setLoadingCartId(null);
      setActiveSavedCart(null);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <FiClock className="mr-2" /> Saved Carts
      </h2>
      
      <div className="space-y-4">
        {savedCarts.map(cart => (
          <div 
            key={cart.id} 
            className={`border rounded-lg overflow-hidden ${
              activeSavedCart === cart.id ? 'border-primary-500' : 'border-neutral-200'
            }`}
          >
            <div 
              className="p-4 cursor-pointer hover:bg-neutral-50 flex justify-between items-center"
              onClick={() => setActiveSavedCart(activeSavedCart === cart.id ? null : cart.id)}
            >
              <div>
                <h3 className="font-medium">{cart.name}</h3>
                <div className="text-sm text-neutral-500 flex items-center">
                  <span className="mr-2">{formatDate(cart.created_at)}</span>
                  <span className="bg-neutral-100 px-2 py-0.5 rounded-full text-xs">
                    {cart.cart_items.length} {cart.cart_items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center">
                {loadingCartId === cart.id ? (
                  <div className="mr-2 p-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                  </div>
                ) : (
                  <>
                    <button 
                      className="text-neutral-400 hover:text-red-500 p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(cart.id);
                      }}
                    >
                      <FiTrash size={16} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {activeSavedCart === cart.id && (
              <div className="border-t border-neutral-200 p-4 bg-neutral-50">
                <div className="space-y-2">
                  {cart.cart_items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <span className="mr-2 text-neutral-500">•</span>
                      <span className="font-medium">{item.quantity}x</span>
                      <span className="ml-2 truncate">{item.product?.name || `Product #${item.product_id}`}</span>
                    </div>
                  ))}
                  
                  {cart.cart_items.length > 3 && (
                    <div className="text-sm text-neutral-500">
                      + {cart.cart_items.length - 3} more items
                    </div>
                  )}
                </div>
                
                <div className="flex mt-4 space-x-2">
                  <Button
                    variant="primary"
                    size="small"
                    onClick={() => handleLoad(cart.id, true)}
                    disabled={loadingCartId === cart.id}
                    className="flex-1"
                  >
                    {loadingCartId === cart.id && loadAction === 'replace' ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <>
                        <FiCheck className="mr-1" /> Replace Current Cart
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => handleLoad(cart.id, false)}
                    disabled={loadingCartId === cart.id}
                    className="flex-1"
                  >
                    {loadingCartId === cart.id && loadAction === 'merge' ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <>
                        <FiPlusCircle className="mr-1" /> Add to Current Cart
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

SavedCarts.propTypes = {
  savedCarts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      created_at: PropTypes.string.isRequired,
      cart_items: PropTypes.array.isRequired
    })
  ),
  onLoadCart: PropTypes.func.isRequired,
  onDeleteCart: PropTypes.func.isRequired,
  loading: PropTypes.bool
};

export default SavedCarts; 