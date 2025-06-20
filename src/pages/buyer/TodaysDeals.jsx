import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiShoppingCart, FiArrowRight, FiTag, FiChevronRight, FiCalendar, FiTrendingUp, FiChevronLeft } from 'react-icons/fi';
import Breadcrumb from '../../components/common/Breadcrumb';
import ProductService from '../../../shared/services/productService';
import { useCart } from '../../contexts/CartContext';

// Format time for countdown display
const formatTime = (seconds) => {
  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((seconds % (60 * 60)) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
};

const DealCard = ({ deal, timeRemaining, onAddToCart }) => {
  const discount = deal.oldPrice ? Math.round(((deal.oldPrice - deal.price) / deal.oldPrice) * 100) : 0;
  
  return (
    <div className="bg-white rounded-lg shadow-card hover:shadow-luxury transition-all duration-300 overflow-hidden group border border-neutral-100 relative">
      {/* Product image */}
      <Link to={`/products/${deal.id}`} className="block overflow-hidden relative">
        <img
          src={deal.image || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80'}
          alt={deal.name}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>
      
      {/* Discount badge */}
      {discount > 0 && (
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-gradient-gold text-neutral-900 text-xs font-bold shadow-gold">
            {discount}% OFF
          </span>
        </div>
      )}
      
      {/* Time remaining badge */}
      {timeRemaining > 0 && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-neutral-800 text-white text-xs font-bold shadow-md">
            <FiClock className="mr-1" size={12} />
            {formatTime(timeRemaining)}
          </span>
        </div>
      )}
      
      {/* Product info */}
      <div className="p-5 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-gold-50/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <Link to={`/products/${deal.id}`} className="block">
          <h3 className="text-sm font-bold text-neutral-800 hover:text-primary-600 line-clamp-2 mb-2 transition-colors duration-200">
            {deal.name}
          </h3>
        </Link>
        
        <p className="text-xs text-neutral-500 mb-3">{deal.category?.name || 'Auto Parts'}</p>
        
        <div className="flex items-center mb-4">
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-accent-600">${deal.price.toFixed(2)}</span>
            {deal.oldPrice && (
              <span className="ml-2 text-sm text-neutral-500 line-through">${deal.oldPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(deal.rating || 4.5) ? 'text-gold-400' : 'text-neutral-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1.5 text-xs text-neutral-500">({Math.floor(Math.random() * 200) + 10})</span>
          </div>
          
          <button
            onClick={() => onAddToCart(deal.id)}
            className="p-2.5 rounded-full bg-neutral-100 text-primary-600 hover:bg-primary-100 transition-colors duration-200 hover:shadow-inner"
            aria-label="Add to cart"
          >
            <FiShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TodaysDeals = () => {
  const { addToCart } = useCart();
  const [flashDeals, setFlashDeals] = useState([]);
  const [weeklyDeals, setWeeklyDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // PERFORMANCE OPTIMIZATION: Pagination state
  const [flashPage, setFlashPage] = useState(1);
  const [weeklyPage, setWeeklyPage] = useState(1);
  const [flashHasMore, setFlashHasMore] = useState(true);
  const [weeklyHasMore, setWeeklyHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    fetchInitialDeals();
  }, []);

  const fetchInitialDeals = async () => {
    try {
      setLoading(true);
      setError(null);

      // PERFORMANCE OPTIMIZATION: Parallel API calls with pagination
      const [flashResponse, weeklyResponse] = await Promise.all([
        ProductService.getProducts({
          sortBy: 'newest',
          limit: ITEMS_PER_PAGE,
          page: 1,
          inStock: true
        }),
        ProductService.getProducts({
          sortBy: 'price_desc',
          limit: ITEMS_PER_PAGE,
          page: 1,
          inStock: true
        })
      ]);

      if (flashResponse.success && weeklyResponse.success) {
        // PERFORMANCE OPTIMIZATION: Enhanced data processing
        const enhancedFlashDeals = enhanceDealsData(flashResponse.products, 'flash');
        const enhancedWeeklyDeals = enhanceDealsData(weeklyResponse.products, 'weekly');

        setFlashDeals(enhancedFlashDeals);
        setWeeklyDeals(enhancedWeeklyDeals);
        setFlashHasMore(flashResponse.hasMore);
        setWeeklyHasMore(weeklyResponse.hasMore);
      } else {
        setError(flashResponse.error || weeklyResponse.error || 'Failed to load deals');
      }
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Failed to load deals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // PERFORMANCE OPTIMIZATION: Load more functionality
  const loadMoreDeals = async (type) => {
    if (loadingMore) return;

    try {
      setLoadingMore(true);
      const currentPage = type === 'flash' ? flashPage : weeklyPage;
      const nextPage = currentPage + 1;

      const response = await ProductService.getProducts({
        sortBy: type === 'flash' ? 'newest' : 'price_desc',
        limit: ITEMS_PER_PAGE,
        page: nextPage,
        inStock: true
      });

      if (response.success) {
        const enhancedDeals = enhanceDealsData(response.products, type);
        
        if (type === 'flash') {
          setFlashDeals(prev => [...prev, ...enhancedDeals]);
          setFlashPage(nextPage);
          setFlashHasMore(response.hasMore);
        } else {
          setWeeklyDeals(prev => [...prev, ...enhancedDeals]);
          setWeeklyPage(nextPage);
          setWeeklyHasMore(response.hasMore);
        }
      }
    } catch (err) {
      console.error('Error loading more deals:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // PERFORMANCE OPTIMIZATION: Optimized data enhancement
  const enhanceDealsData = (products, dealType) => {
    return products.map((product, index) => {
      const discount = product.oldPrice ? 
        Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 
        Math.floor(Math.random() * 30) + 10; // Simulated discount for products without oldPrice

      const timeLeft = dealType === 'flash' ? 
        Math.floor(Math.random() * 24) + 1 : // 1-24 hours for flash deals
        Math.floor(Math.random() * 7) + 1;   // 1-7 days for weekly deals

      return {
        ...product,
        discount,
        timeLeft,
        timeUnit: dealType === 'flash' ? 'hours' : 'days',
        dealType,
        dealBadge: dealType === 'flash' ? 'Flash Deal' : 'Weekly Special',
        dealEndsAt: new Date(Date.now() + timeLeft * (dealType === 'flash' ? 3600000 : 86400000)),
        originalPrice: product.oldPrice || (product.price * (1 + discount / 100)),
        savings: product.oldPrice ? product.oldPrice - product.price : product.price * (discount / 100)
      };
    });
  };

  const handleAddToCart = (productId) => {
    const allDeals = [...flashDeals, ...weeklyDeals];
    const product = allDeals.find(p => p.id === productId);
    
    if (product) {
      addToCart(productId, 1, { 
        dealerId: product.dealer?.id,
        price: product.price,
        dealType: product.dealType,
        discount: product.discount
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading today's deals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchInitialDeals}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Today's Deals</h1>
            <p className="text-red-100 text-lg">Limited time offers on automotive parts</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Flash Deals Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FiClock className="text-red-600 text-2xl mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Flash Deals</h2>
              <span className="ml-3 bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                Limited Time
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {flashDeals.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* PERFORMANCE OPTIMIZATION: Load More Button */}
          {flashHasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => loadMoreDeals('flash')}
                disabled={loadingMore}
                className="bg-red-600 text-white px-8 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Flash Deals'}
              </button>
            </div>
          )}
        </section>

        {/* Weekly Deals Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <FiTrendingUp className="text-blue-600 text-2xl mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Weekly Specials</h2>
              <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                Best Value
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {weeklyDeals.map((deal) => (
              <DealCard 
                key={deal.id} 
                deal={deal} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* PERFORMANCE OPTIMIZATION: Load More Button */}
          {weeklyHasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => loadMoreDeals('weekly')}
                disabled={loadingMore}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More Weekly Specials'}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TodaysDeals; 