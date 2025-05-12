import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiClock, 
  FiX, 
  FiShoppingCart, 
  FiEye, 
  FiFilter, 
  FiCalendar, 
  FiTrash2,
  FiBarChart2
} from 'react-icons/fi';
import { useBrowsingHistory } from '../../contexts/BrowsingHistoryContext';
import { useCart } from '../../contexts/CartContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { Breadcrumb, Button, EmptyState } from '../../components/common';

const BrowsingHistory = () => {
  const navigate = useNavigate();
  const { 
    historyItems, 
    loading, 
    clearHistory, 
    removeFromHistory, 
    getHistoryGroupedByDate 
  } = useBrowsingHistory();
  const { addToCart } = useCart();
  const { addToComparison, isInComparison } = useComparison();
  
  const [groupedHistory, setGroupedHistory] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [showClearModal, setShowClearModal] = useState(false);
  
  useEffect(() => {
    if (!loading) {
      setGroupedHistory(getHistoryGroupedByDate());
    }
  }, [loading, historyItems, getHistoryGroupedByDate]);
  
  // Filter history items by date range
  const filterByDate = (items) => {
    if (dateRange === 'all') return items;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch(dateRange) {
      case 'today':
        cutoffDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return items;
    }
    
    return items.filter(item => new Date(item.viewed_at) >= cutoffDate);
  };
  
  // Filter history items by category
  const filterByCategory = (items) => {
    if (!categoryFilter) return items;
    
    return items.filter(item => 
      item.product?.category?.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  };
  
  // Get all unique categories from history items
  const getCategories = () => {
    const categories = new Set();
    
    historyItems.forEach(item => {
      if (item.product?.category) {
        categories.add(item.product.category);
      }
    });
    
    return Array.from(categories);
  };
  
  // Apply all filters
  const getFilteredHistory = () => {
    const filteredByDate = filterByDate(historyItems);
    const filteredByCategory = filterByCategory(filteredByDate);
    
    // Group by date
    const groups = {};
    
    filteredByCategory.forEach(item => {
      const date = new Date(item.viewed_at).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
    });
    
    return Object.entries(groups).map(([date, items]) => ({
      date,
      items
    }));
  };
  
  // Handle adding an item to cart
  const handleAddToCart = (productId) => {
    addToCart(productId, 1);
  };
  
  // Handle adding an item to comparison
  const handleAddToComparison = (productId) => {
    addToComparison(productId);
  };
  
  // Handle clearing all history
  const handleClearHistory = () => {
    clearHistory();
    setShowClearModal(false);
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }
  
  // Filter history and update display
  const filteredGroupedHistory = getFilteredHistory();
  const categories = getCategories();
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Breadcrumb items={[
          { name: 'Home', url: '/' },
          { name: 'Account', url: '/account' },
          { name: 'Browsing History', url: '#' }
        ]} />
      </div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
            <FiClock className="mr-2" /> Browsing History
          </h1>
          <p className="text-neutral-500 mt-1">
            {historyItems.length} products viewed
          </p>
        </div>
        
        {historyItems.length > 0 && (
          <Button 
            variant="outline" 
            className="mt-4 sm:mt-0"
            onClick={() => setShowClearModal(true)}
          >
            <FiTrash2 className="mr-2" /> Clear History
          </Button>
        )}
      </div>
      
      {/* Filters - only visible when there are items */}
      {historyItems.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <FiFilter className="text-neutral-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {/* Date filter */}
              <div className="min-w-[180px]">
                <label htmlFor="date-filter" className="block text-xs text-neutral-500 mb-1">
                  <FiCalendar className="inline mr-1" /> Date Range
                </label>
                <select
                  id="date-filter"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full border border-neutral-300 rounded p-2 text-sm"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                </select>
              </div>
              
              {/* Category filter */}
              {categories.length > 0 && (
                <div className="min-w-[180px]">
                  <label htmlFor="category-filter" className="block text-xs text-neutral-500 mb-1">
                    Category
                  </label>
                  <select
                    id="category-filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full border border-neutral-300 rounded p-2 text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Empty state */}
      {historyItems.length === 0 ? (
        <EmptyState
          icon={<FiClock size={48} />}
          title="No Browsing History"
          description="Products you view will appear here"
          actionText="Browse Products"
          actionLink="/products"
        />
      ) : filteredGroupedHistory.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <FiFilter size={48} className="text-neutral-300" />
          </div>
          <h3 className="text-lg font-medium text-neutral-800 mb-2">No Results Found</h3>
          <p className="text-neutral-500 mb-6">
            No items match your current filters.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setCategoryFilter('');
              setDateRange('all');
            }}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredGroupedHistory.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-neutral-50 px-6 py-3 border-b border-neutral-200">
                <h3 className="font-medium text-neutral-800">{group.date}</h3>
              </div>
              
              <div className="relative">
                {/* Timeline axis */}
                <div className="absolute top-0 bottom-0 left-16 w-0.5 bg-neutral-200"></div>
                
                <ul className="relative divide-y divide-neutral-100">
                  {group.items.map((item) => (
                    <li key={item.id} className="p-4 hover:bg-neutral-50 transition-colors duration-150">
                      <div className="flex items-start">
                        {/* Time indicator */}
                        <div className="w-32 flex-shrink-0 text-center relative">
                          <div className="text-sm text-neutral-500">
                            {formatTime(item.viewed_at)}
                          </div>
                          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-primary-500 rounded-full border-2 border-white z-10"></div>
                        </div>
                        
                        {/* Product info */}
                        <div className="flex-grow flex items-center">
                          <div className="h-20 w-20 flex-shrink-0 bg-neutral-100 rounded overflow-hidden">
                            <img
                              src={item.product?.image || 'https://via.placeholder.com/80'}
                              alt={item.product?.name || 'Product'}
                              className="h-full w-full object-cover object-center"
                            />
                          </div>
                          
                          <div className="ml-4 flex-grow">
                            <Link 
                              to={`/products/${item.product_id}`}
                              className="font-medium text-neutral-900 hover:text-primary-600 line-clamp-2"
                            >
                              {item.product?.name || `Product #${item.product_id}`}
                            </Link>
                            
                            {item.product?.category && (
                              <div className="mt-1 text-sm text-neutral-500">
                                {item.product.category}
                              </div>
                            )}
                            
                            {item.product?.price && (
                              <div className="mt-1 font-medium text-primary-600">
                                ${item.product.price.toFixed(2)}
                              </div>
                            )}
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleAddToCart(item.product_id)}
                              title="Add to Cart"
                            >
                              <FiShoppingCart size={16} />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => handleAddToComparison(item.product_id)}
                              title="Add to Comparison"
                              className={isInComparison(item.product_id) ? 'text-primary-600' : ''}
                            >
                              <FiBarChart2 size={16} />
                            </Button>
                            
                            <Button
                              variant="outline"
                              size="small"
                              onClick={() => navigate(`/products/${item.product_id}`)}
                              title="View Product"
                            >
                              <FiEye size={16} />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="small"
                              onClick={() => removeFromHistory(item.id)}
                              title="Remove from History"
                              className="text-neutral-400 hover:text-red-500"
                            >
                              <FiX size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Clear history confirmation modal */}
      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Clear Browsing History</h3>
            <p className="text-neutral-600 mb-6">
              Are you sure you want to clear your entire browsing history? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleClearHistory}
              >
                Clear History
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowsingHistory; 