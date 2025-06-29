import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiClock,
  FiFacebook, 
  FiTwitter, 
  FiInstagram, 
  FiLinkedin,
  FiYoutube,
  FiShield,
  FiTruck,
  FiAward,
  FiHeadphones,
  FiCheck,
  FiStar
} from 'react-icons/fi';

const StoreFooter = () => {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Newsletter Signup Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Connected with Autora</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Get exclusive deals, new product launches, installation guides, and automotive insights delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row justify-center items-center max-w-md mx-auto gap-3">
              <div className="relative flex-1 w-full">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                className="px-8 py-3 bg-yellow-400 text-gray-900 font-semibold rounded-lg hover:bg-yellow-300 transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
              >
                {isSubscribed ? (
                  <span className="flex items-center">
                    <FiCheck className="mr-2" />
                    Subscribed!
                  </span>
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
            <p className="text-xs text-blue-200 mt-3">
              Join 50,000+ automotive enthusiasts. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badges Section */}
      <div className="border-b border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-3">
                <FiShield className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm">100% Authentic Parts</h4>
              <p className="text-xs text-gray-400 mt-1">OEM & certified aftermarket</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                <FiTruck className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm">Fast Shipping</h4>
              <p className="text-xs text-gray-400 mt-1">Same day dispatch available</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center mb-3">
                <FiAward className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm">Warranty Protected</h4>
              <p className="text-xs text-gray-400 mt-1">Up to 3 years coverage</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-3">
                <FiHeadphones className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-sm">Expert Support</h4>
              <p className="text-xs text-gray-400 mt-1">24/7 technical assistance</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Footer Content */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center mb-6">
                <div className="text-3xl font-bold text-white tracking-wider">
                  <span className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-3 py-2 rounded-lg mr-2">AUTO</span>
                  <span className="text-orange-400 font-black">RA</span>
                </div>
              </Link>
              <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                Ghana's premier automotive parts marketplace. Connecting drivers with trusted dealers 
                for quality parts, expert service, and unbeatable prices since 2024.
              </p>
              
              {/* Awards/Certifications */}
              <div className="mb-6">
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center">
                    <FiStar className="w-4 h-4 text-yellow-400 mr-1" />
                    <span>4.8/5 Customer Rating</span>
                  </div>
                  <div className="flex items-center">
                    <FiShield className="w-4 h-4 text-green-400 mr-1" />
                    <span>SSL Secured</span>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div>
                <h4 className="text-sm font-semibold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="https://facebook.com/autora" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-200">
                    <FiFacebook size={18} />
                  </a>
                  <a href="https://instagram.com/autora" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-pink-600 transition-all duration-200">
                    <FiInstagram size={18} />
                  </a>
                  <a href="https://linkedin.com/company/autora" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-700 transition-all duration-200">
                    <FiLinkedin size={18} />
                  </a>
                  <a href="https://twitter.com/autora" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-400 transition-all duration-200">
                    <FiTwitter size={18} />
                  </a>
                  <a href="https://youtube.com/autora" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-red-600 transition-all duration-200">
                    <FiYoutube size={18} />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Shop Categories */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Shop by Category</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/categories/engine-parts" className="text-gray-400 hover:text-orange-400 transition-colors">Engine Parts</Link></li>
                <li><Link to="/categories/brake-system" className="text-gray-400 hover:text-orange-400 transition-colors">Brake System</Link></li>
                <li><Link to="/categories/suspension" className="text-gray-400 hover:text-orange-400 transition-colors">Suspension</Link></li>
                <li><Link to="/categories/electrical" className="text-gray-400 hover:text-orange-400 transition-colors">Electrical</Link></li>
                <li><Link to="/categories/filters" className="text-gray-400 hover:text-orange-400 transition-colors">Filters</Link></li>
                <li><Link to="/categories/body-parts" className="text-gray-400 hover:text-orange-400 transition-colors">Body Parts</Link></li>
                <li><Link to="/categories/tools" className="text-gray-400 hover:text-orange-400 transition-colors">Tools & Equipment</Link></li>
                <li><Link to="/shop" className="text-orange-400 hover:text-orange-300 font-medium">View All →</Link></li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Customer Service</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/account" className="text-gray-400 hover:text-orange-400 transition-colors">My Account</Link></li>
                <li><Link to="/orders" className="text-gray-400 hover:text-orange-400 transition-colors">Order Tracking</Link></li>
                <li><Link to="/returns" className="text-gray-400 hover:text-orange-400 transition-colors">Returns & Exchanges</Link></li>
                <li><Link to="/warranty" className="text-gray-400 hover:text-orange-400 transition-colors">Warranty Claims</Link></li>
                <li><Link to="/installation-guide" className="text-gray-400 hover:text-orange-400 transition-colors">Installation Guides</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-orange-400 transition-colors">FAQ</Link></li>
                <li><Link to="/support" className="text-gray-400 hover:text-orange-400 transition-colors">Technical Support</Link></li>
              </ul>
            </div>
          
            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
              <ul className="space-y-3 text-sm">
                <li><Link to="/about" className="text-gray-400 hover:text-orange-400 transition-colors">About Autora</Link></li>
                <li><Link to="/dealers" className="text-gray-400 hover:text-orange-400 transition-colors">Become a Dealer</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-orange-400 transition-colors">Careers</Link></li>
                <li><Link to="/press" className="text-gray-400 hover:text-orange-400 transition-colors">Press & Media</Link></li>
                <li><Link to="/sustainability" className="text-gray-400 hover:text-orange-400 transition-colors">Sustainability</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-orange-400 transition-colors">Automotive Blog</Link></li>
                <li><Link to="/community" className="text-gray-400 hover:text-orange-400 transition-colors">Community</Link></li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Get in Touch</h3>
              <div className="space-y-4 text-sm">
                <div className="flex items-start">
                  <FiMapPin className="mr-3 mt-1 text-orange-400 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-white font-medium">Accra Headquarters</p>
                    <p className="text-gray-400">Ring Road East, Accra</p>
                    <p className="text-gray-400">Greater Accra Region, Ghana</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiPhone className="mr-3 mt-1 text-orange-400 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Customer Service (24/7)</p>
                    <p className="text-orange-400 font-semibold">+233 24 123 4567</p>
                    <p className="text-gray-400 text-xs">Call or WhatsApp</p>
                  </div>
                </div>
        
                <div className="flex items-start">
                  <FiMail className="mr-3 mt-1 text-orange-400 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Email Support</p>
                    <p className="text-white">support@autora.com.gh</p>
                    <p className="text-gray-400 text-xs">Response within 2 hours</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FiClock className="mr-3 mt-1 text-orange-400 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Business Hours</p>
                    <p className="text-white text-xs">Mon-Fri: 8AM - 8PM</p>
                    <p className="text-white text-xs">Sat: 9AM - 6PM</p>
                    <p className="text-white text-xs">Sun: 10AM - 4PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods & Certifications */}
      <div className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Payment Methods */}
            <div className="text-center lg:text-left">
              <h4 className="text-sm font-semibold mb-4 text-white">Secure Payment Options</h4>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center shadow-md">
                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 16'%3E%3Cpath fill='%23FF5F00' d='M8.75 3h6.5v10h-6.5z'/%3E%3Cpath fill='%23EB001B' d='M9.25 8c0-2.04.83-3.89 2.17-5.25A6.74 6.74 0 005 8a6.74 6.74 0 006.42 5.25A6.2 6.2 0 019.25 8z'/%3E%3Cpath fill='%23F79E1B' d='M22 8a6.74 6.74 0 01-6.42 5.25 6.2 6.2 0 002.17-5.25 6.2 6.2 0 00-2.17-5.25A6.74 6.74 0 0122 8z'/%3E%3C/svg%3E" alt="Mastercard" className="w-8 h-5" />
                </div>
                <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center shadow-md">
                  <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 16'%3E%3Cpath fill='%230066B2' d='M2 8h20v8H2z'/%3E%3Cpath fill='%23FFD700' d='M2 0h20v8H2z'/%3E%3C/svg%3E" alt="Visa" className="w-8 h-5" />
                </div>
                <div className="w-12 h-8 bg-green-600 rounded-md flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">MTN</span>
                </div>
                <div className="w-12 h-8 bg-yellow-500 rounded-md flex items-center justify-center shadow-md">
                  <span className="text-black text-xs font-bold">AT</span>
                </div>
                <div className="w-12 h-8 bg-red-600 rounded-md flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">VOD</span>
                </div>
                <div className="w-12 h-8 bg-blue-600 rounded-md flex items-center justify-center shadow-md">
                  <span className="text-white text-xs font-bold">GCB</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">All payments secured with 256-bit SSL encryption</p>
            </div>
            
            {/* Certifications */}
            <div className="text-center lg:text-right">
              <h4 className="text-sm font-semibold mb-4 text-white">Certifications & Awards</h4>
              <div className="flex flex-wrap justify-center lg:justify-end gap-3">
                <div className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-xs font-semibold text-white">
                  ISO 9001 Certified
                </div>
                <div className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-xs font-semibold text-white">
                  Ghana Business Awards 2024
                </div>
                <div className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg text-xs font-semibold text-white">
                  Best E-commerce Platform
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Copyright Bar */}
      <div className="border-t border-gray-800 py-6 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm">
            <div className="mb-4 md:mb-0 text-center md:text-left">
              <p className="text-gray-400">
                Copyright © {new Date().getFullYear()} Autora Ghana Ltd. All Rights Reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Registered in Ghana • Company No. C123456789 • VAT No. V987654321
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 text-xs">
              <Link to="/terms" className="text-gray-400 hover:text-orange-400 transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors">Privacy Policy</Link>
              <Link to="/cookies" className="text-gray-400 hover:text-orange-400 transition-colors">Cookie Policy</Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-orange-400 transition-colors">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;