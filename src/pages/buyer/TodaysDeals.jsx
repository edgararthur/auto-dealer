import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiShoppingCart, FiArrowRight, FiTag, FiChevronRight, FiCalendar } from 'react-icons/fi';
import Breadcrumb from '../../components/common/Breadcrumb';

// Reusing the flash deals data from BuyerHome for consistency
const flashDeals = [
  {
    id: 10,
    name: 'Synthetic Motor Oil (5L)',
    category: 'Engine',
    price: 29.99,
    oldPrice: 59.99,
    image: 'https://images.unsplash.com/photo-1635270364846-5e3190b48026?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 212,
    discount: 50, // Percent off
    endsIn: 12 * 60 * 60, // 12 hours in seconds
  },
  {
    id: 11,
    name: 'Performance Exhaust System',
    category: 'Exhaust',
    price: 249.99,
    oldPrice: 399.99,
    image: 'https://images.unsplash.com/photo-1596994836684-85ca30e8179b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 98,
    discount: 38,
    endsIn: 6 * 60 * 60, // 6 hours in seconds
  },
  {
    id: 12,
    name: 'Car Battery (60Ah)',
    category: 'Electrical',
    price: 89.99,
    oldPrice: 149.99,
    image: 'https://images.unsplash.com/photo-1617886322168-72b886573c6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 156,
    discount: 40,
    endsIn: 9 * 60 * 60, // 9 hours in seconds
  },
  {
    id: 13,
    name: 'Brake Rotor Set',
    category: 'Brakes',
    price: 69.99,
    oldPrice: 99.99,
    image: 'https://images.unsplash.com/photo-1588169770457-8bfc2de92556?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.6,
    reviewCount: 68,
    discount: 30,
    endsIn: 15 * 60 * 60, // 15 hours in seconds
  }
];

// Weekly deals - additional deals with longer timeframes
const weeklyDeals = [
  {
    id: 14,
    name: 'Complete Suspension Kit',
    category: 'Suspension',
    price: 399.99,
    oldPrice: 599.99,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 87,
    discount: 33,
    endsIn: 5 * 24 * 60 * 60, // 5 days in seconds
  },
  {
    id: 15,
    name: 'Premium Steering Wheel Cover',
    category: 'Interior',
    price: 19.99,
    oldPrice: 34.99,
    image: 'https://images.unsplash.com/photo-1547245324-13c1eacb1e9b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 215,
    discount: 43,
    endsIn: 6 * 24 * 60 * 60, // 6 days in seconds
  },
  {
    id: 16,
    name: 'LED Conversion Kit',
    category: 'Lighting',
    price: 59.99,
    oldPrice: 89.99,
    image: 'https://images.unsplash.com/photo-1519566657253-e37fbaa3bad6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 102,
    discount: 33,
    endsIn: 4 * 24 * 60 * 60, // 4 days in seconds
  },
  {
    id: 17,
    name: 'Complete Tool Set',
    category: 'Tools',
    price: 129.99,
    oldPrice: 199.99,
    image: 'https://images.unsplash.com/photo-1581166397057-235af2b3c6dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 76,
    discount: 35,
    endsIn: 7 * 24 * 60 * 60, // 7 days in seconds
  }
];

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
  return (
    <div className="bg-white rounded-lg shadow-card hover:shadow-luxury transition-all duration-300 overflow-hidden group border border-neutral-100 relative">
      {/* Product image */}
      <Link to={`/products/${deal.id}`} className="block overflow-hidden relative">
        <img
          src={deal.image}
          alt={deal.name}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>
      
      {/* Discount badge */}
      <div className="absolute top-3 left-3">
        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-gradient-gold text-neutral-900 text-xs font-bold shadow-gold">
          {deal.discount}% OFF
        </span>
      </div>
      
      {/* Time remaining badge */}
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center px-2.5 py-1.5 rounded-full bg-neutral-800 text-white text-xs font-bold shadow-md">
          <FiClock className="mr-1" size={12} />
          {formatTime(timeRemaining)}
        </span>
      </div>
      
      {/* Product info */}
      <div className="p-5 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-gold-50/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <Link to={`/products/${deal.id}`} className="block">
          <h3 className="text-sm font-bold text-neutral-800 hover:text-primary-600 line-clamp-2 mb-2 transition-colors duration-200">
            {deal.name}
          </h3>
        </Link>
        
        <p className="text-xs text-neutral-500 mb-3">{deal.category}</p>
        
        <div className="flex items-center mb-4">
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-accent-600">${deal.price.toFixed(2)}</span>
            <span className="ml-2 text-sm text-neutral-500 line-through">${deal.oldPrice.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3.5 h-3.5 ${i < Math.floor(deal.rating) ? 'text-gold-400' : 'text-neutral-300'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="ml-1.5 text-xs text-neutral-500">({deal.reviewCount})</span>
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
  const [countdown, setCountdown] = useState({
    flash: flashDeals.map(deal => deal.endsIn),
    weekly: weeklyDeals.map(deal => deal.endsIn)
  });
  
  const handleAddToCart = (productId) => {
    // In a real implementation, this would add the item to the cart
    console.log(`Added product ${productId} to cart`);
  };
  
  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prevState => ({
        flash: prevState.flash.map(time => (time > 0 ? time - 1 : 0)),
        weekly: prevState.weekly.map(time => (time > 0 ? time - 1 : 0))
      }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Page header with countdown to end of flash sale */}
      <div className="bg-gradient-luxury pt-10 pb-12 px-4 sm:px-6 lg:px-8 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1583121274602-3e2820c69888?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80')] bg-no-repeat bg-cover bg-center"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-900/60 to-transparent opacity-60 pointer-events-none"></div>
        
        <div className="absolute bottom-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto opacity-10">
            <path fill="#ffffff" fillOpacity="1" d="M0,160L48,144C96,128,192,96,288,90.7C384,85,480,107,576,133.3C672,160,768,192,864,192C960,192,1056,160,1152,144C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <Breadcrumb
            items={[
              { label: 'Today\'s Deals', path: '/deals' }
            ]}
          />
          
          <div className="mt-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3">Today's <span className="text-gold-300">Special Deals</span></h1>
            <p className="text-neutral-200 max-w-2xl">
              Exclusive time-limited offers on premium auto parts. Don't miss out on these incredible savings!
            </p>
          </div>
          
          <div className="inline-flex items-center px-4 py-3 bg-white rounded-lg shadow-luxury">
            <div className="mr-3 text-neutral-800 font-medium">Flash Deals End In:</div>
            <div className="bg-gradient-gold text-neutral-900 font-bold rounded-md px-3 py-1.5 flex items-center">
              <FiClock className="mr-2" />
              <span id="flash-sale-countdown" className="tabular-nums">
                {formatTime(Math.max(...countdown.flash))}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Flash deals section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center mb-2">
                <FiTag className="text-accent-500 mr-2" size={20} />
                <h2 className="text-2xl font-bold text-neutral-900 font-display">Flash Deals</h2>
              </div>
              <p className="text-neutral-600">Limited-time offers that won't last long!</p>
            </div>
            
            <Link to="/flash-deals" className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors group">
              View All <FiChevronRight className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {flashDeals.map((deal, index) => (
              <DealCard
                key={deal.id}
                deal={deal}
                timeRemaining={countdown.flash[index]}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
          
          <div className="mt-6 text-center sm:hidden">
            <Link to="/flash-deals" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors">
              View All Flash Deals <FiChevronRight className="ml-1" />
            </Link>
          </div>
        </section>
        
        {/* Weekly deals section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center mb-2">
                <FiCalendar className="text-primary-600 mr-2" size={20} />
                <h2 className="text-2xl font-bold text-neutral-900 font-display">Weekly Deals</h2>
              </div>
              <p className="text-neutral-600">Great savings all week long</p>
            </div>
            
            <Link to="/weekly-deals" className="hidden sm:flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors group">
              View All <FiChevronRight className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {weeklyDeals.map((deal, index) => (
              <DealCard
                key={deal.id}
                deal={deal}
                timeRemaining={countdown.weekly[index]}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
          
          <div className="mt-6 text-center sm:hidden">
            <Link to="/weekly-deals" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors">
              View All Weekly Deals <FiChevronRight className="ml-1" />
            </Link>
          </div>
        </section>
        
        {/* Newsletter subscription banner */}
        <section className="mt-16 bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-xl p-6 md:p-8 shadow-luxury overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-gold-300/20 to-transparent opacity-60"></div>
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-accent-500/10 backdrop-blur-xl"></div>
          <div className="absolute top-1/2 left-1/3 w-6 h-6 rounded-full bg-gold-400/30 backdrop-blur-sm"></div>
          <div className="absolute bottom-1/4 right-1/4 w-4 h-4 rounded-full bg-primary-400/20 backdrop-blur-sm"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between relative">
            <div className="mb-6 md:mb-0 md:max-w-md">
              <h3 className="text-xl font-bold text-white font-display mb-2">Don't Miss Any <span className="text-gold-300">Deals!</span></h3>
              <p className="text-neutral-300">
                Subscribe to our newsletter to get notifications about exclusive deals and promotions.
              </p>
            </div>
            
            <form className="w-full md:w-auto">
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="px-4 py-3 rounded-l-lg w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-gold-300"
                />
                <button
                  type="submit"
                  className="bg-gradient-gold text-neutral-900 px-4 py-3 rounded-r-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap shadow-gold"
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TodaysDeals; 