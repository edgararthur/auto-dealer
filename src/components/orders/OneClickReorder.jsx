import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiCheck, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { Button } from '../common';
import { useCart } from '../../contexts/CartContext';

const OneClickReorder = ({ order, buttonVariant = 'primary', buttonSize = 'medium', className = '' }) => {
  const { addToCart } = useCart();
  const [reordering, setReordering] = useState(false);
  const [reorderStatus, setReorderStatus] = useState(null); // null, 'success', 'partial', 'error'
  const [reorderMessage, setReorderMessage] = useState('');
  
  // Check if products are all available
  const checkProductAvailability = async (products) => {
    // This would typically call an API to check product availability
    // For now, we'll simulate that most products are available
    return products.map(product => ({
      ...product,
      isAvailable: Math.random() > 0.1, // 90% chance product is available
      currentPrice: product.price * (Math.random() > 0.3 ? 1 : 1 + (Math.random() * 0.3)), // 30% chance price changed
    }));
  };
  
  const handleReorder = async () => {
    if (reordering) return;
    
    setReordering(true);
    setReorderStatus(null);
    setReorderMessage('');
    
    try {
      // Get all products from order
      const products = order.items || [];
      
      if (products.length === 0) {
        throw new Error('No products found in this order');
      }
      
      // Check availability and current prices
      const checkedProducts = await checkProductAvailability(products);
      
      // Track unavailable products
      const unavailableProducts = checkedProducts.filter(p => !p.isAvailable);
      
      // Track price changes
      const priceChanges = checkedProducts.filter(p => 
        p.isAvailable && p.currentPrice !== p.price
      );
      
      // Add available products to cart
      const availableProducts = checkedProducts.filter(p => p.isAvailable);
      
      for (const product of availableProducts) {
        await addToCart(product.product_id, product.quantity);
      }
      
      // Determine status and message
      if (unavailableProducts.length === products.length) {
        setReorderStatus('error');
        setReorderMessage('None of the products in this order are currently available.');
      } else if (unavailableProducts.length > 0) {
        setReorderStatus('partial');
        setReorderMessage(`Added ${availableProducts.length} of ${products.length} products to your cart. ${unavailableProducts.length} products are unavailable.`);
      } else if (priceChanges.length > 0) {
        setReorderStatus('partial');
        setReorderMessage(`All products added to cart. Note: prices have changed for ${priceChanges.length} products.`);
      } else {
        setReorderStatus('success');
        setReorderMessage('All products have been added to your cart.');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      setReorderStatus('error');
      setReorderMessage(error.message || 'Failed to reorder. Please try again.');
    } finally {
      setReordering(false);
      
      // Auto-hide success message after 5 seconds
      if (reorderStatus === 'success') {
        setTimeout(() => {
          setReorderStatus(null);
          setReorderMessage('');
        }, 5000);
      }
    }
  };
  
  // Status icon and colors
  const getStatusIcon = () => {
    switch (reorderStatus) {
      case 'success':
        return <FiCheck className="mr-2" />;
      case 'partial':
        return <FiAlertCircle className="mr-2" />;
      case 'error':
        return <FiAlertCircle className="mr-2" />;
      default:
        return <FiShoppingCart className="mr-2" />;
    }
  };
  
  const getStatusClasses = () => {
    switch (reorderStatus) {
      case 'success':
        return 'bg-success-50 border-success-200 text-success-700';
      case 'partial':
        return 'bg-accent-50 border-accent-200 text-accent-700';
      case 'error':
        return 'bg-error-50 border-error-200 text-error-700';
      default:
        return '';
    }
  };
  
  return (
    <div className={className}>
      <Button
        variant={buttonVariant}
        size={buttonSize}
        onClick={handleReorder}
        disabled={reordering}
        className="w-full"
      >
        {reordering ? (
          <>
            <FiRefreshCw className="animate-spin mr-2" /> Reordering...
          </>
        ) : (
          <>
            <FiShoppingCart className="mr-2" /> Reorder
          </>
        )}
      </Button>
      
      {reorderStatus && (
        <div className={`mt-2 p-2 text-sm rounded border ${getStatusClasses()}`}>
          <div className="flex items-center">
            {getStatusIcon()}
            <span>{reorderMessage}</span>
          </div>
          
          {(reorderStatus === 'success' || reorderStatus === 'partial') && (
            <Link 
              to="/cart" 
              className="inline-block mt-1 text-primary-600 hover:text-primary-700 font-medium text-xs"
            >
              View Cart →
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

OneClickReorder.propTypes = {
  order: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        product_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        quantity: PropTypes.number.isRequired,
        price: PropTypes.number.isRequired,
      })
    ).isRequired,
  }).isRequired,
  buttonVariant: PropTypes.string,
  buttonSize: PropTypes.string,
  className: PropTypes.string,
};

export default OneClickReorder; 