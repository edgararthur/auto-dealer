import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { 
  FiFacebook, 
  FiTwitter, 
  FiInstagram, 
  FiYoutube,
  FiMapPin,
  FiPhone,
  FiMail,
  FiClock,
  FiCreditCard,
  FiShield,
  FiArrowRight,
  FiHeart
} from 'react-icons/fi';

const StoreFooter = () => {
  const [email, setEmail] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement newsletter subscription
    if (email.trim()) {
      alert(`Thank you for subscribing with ${email}!`);
      setEmail('');
    }
  };
  
  const currentYear = new Date().getFullYear();
  
  // Footer navigation groups
  const footerLinks = [
    {
      title: 'Shop',
      links: [
        { name: 'All Products', href: '/products' },
        { name: 'Deals & Promotions', href: '/deals' },
        { name: 'New Arrivals', href: '/products?sort=newest' },
        { name: 'Best Sellers', href: '/products?sort=bestsellers' },
        { name: 'Browse by Brand', href: '/brands' },
      ]
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'FAQs', href: '/faqs' },
        { name: 'Shipping Policy', href: '/shipping' },
        { name: 'Returns & Refunds', href: '/returns' },
        { name: 'Order Tracking', href: '/track-order' },
      ]
    },
    {
      title: 'My Account',
      links: [
        { name: 'Sign In', href: '/login' },
        { name: 'Register', href: '/register' },
        { name: 'View Cart', href: '/cart' },
        { name: 'My Orders', href: '/orders' },
        { name: 'My Wishlist', href: '/wishlist' },
      ]
    },
    {
      title: 'About AutoPlus',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Our Stores', href: '/locations' },
        { name: 'Affiliate Program', href: '/affiliates' },
        { name: 'Corporate Sales', href: '/corporate' },
      ]
    }
  ];
  
  // Payment methods
  const paymentMethods = [
    { name: 'Visa', image: 'https://cdn-icons-png.flaticon.com/128/196/196578.png' },
    { name: 'Mastercard', image: 'https://cdn-icons-png.flaticon.com/128/196/196561.png' },
    { name: 'American Express', image: 'https://cdn-icons-png.flaticon.com/128/196/196539.png' },
    { name: 'PayPal', image: 'https://cdn-icons-png.flaticon.com/128/196/196565.png' },
    { name: 'MPesa', image: 'https://cdn-icons-png.flaticon.com/128/825/825454.png' },
    { name: 'MTN MoMo', image: 'https://cdn-icons-png.flaticon.com/128/5969/5969007.png' }
  ];
  
  return (
    <footer className="bg-neutral-900 text-neutral-200">
      {/* Newsletter section */}
      <div className="bg-primary-700 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-1">Subscribe to our newsletter</h3>
              <p className="text-primary-100">Get the latest updates, deals and exclusive offers</p>
            </div>
            
            <form onSubmit={handleSubmit} className="w-full md:w-auto flex">
              <div className="relative w-full md:w-80">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-l-md text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Your email address"
                  required
                />
                <button
                  type="submit"
                  className="bg-neutral-800 text-white px-6 py-3 rounded-r-md hover:bg-neutral-700 transition-colors flex items-center justify-center"
                >
                  Subscribe <FiArrowRight className="ml-2" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company info */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <span className="text-2xl font-bold text-white">AutoPlus</span>
            </Link>
            <p className="text-neutral-400 mb-6">
              Your trusted destination for quality auto parts and accessories at competitive prices.
            </p>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <FiMapPin className="mt-1 mr-3 text-primary-500" />
                <span>123 Market Street, Accra, Ghana</span>
              </div>
              <div className="flex items-start">
                <FiPhone className="mt-1 mr-3 text-primary-500" />
                <span>+233 50 999 9999</span>
              </div>
              <div className="flex items-start">
                <FiMail className="mt-1 mr-3 text-primary-500" />
                <span>support@autoplus.com</span>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-neutral-400 hover:text-primary-500 transition-colors">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-500 transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-500 transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-primary-500 transition-colors">
                <FiYoutube size={20} />
              </a>
            </div>
          </div>
          
          {/* Footer navigation */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-white font-semibold mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-neutral-400 hover:text-primary-500 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Payment methods */}
        <div className="border-t border-neutral-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h4 className="text-white font-medium mb-2">Accepted Payment Methods</h4>
              <div className="flex flex-wrap gap-3">
                {paymentMethods.map((method) => (
                  <div key={method.name} className="bg-white p-1 rounded w-12 h-8 flex items-center justify-center">
                    <img src={method.image} alt={method.name} className="h-5" />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex flex-col items-center md:items-end">
              <div className="flex items-center text-neutral-400 mb-2">
                <span>Made with</span>
                <FiHeart className="mx-1 text-red-500" />
                <span>in Ghana</span>
              </div>
              <p className="text-neutral-500 text-sm">
                &copy; {currentYear} AutoPlus. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom bar */}
      <div className="bg-neutral-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-neutral-500">
            <div className="mb-2 md:mb-0">
              <Link to="/privacy" className="hover:text-neutral-300 mr-4">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-neutral-300 mr-4">Terms of Service</Link>
              <Link to="/cookies" className="hover:text-neutral-300">Cookie Policy</Link>
            </div>
            <div>
              <span>Prices shown in: <strong>GHC (₵)</strong></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;