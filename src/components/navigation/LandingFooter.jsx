import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { 
  FiFacebook, 
  FiTwitter, 
  FiInstagram, 
  FiLinkedin,
  FiMail,
  FiPhone,
  FiMapPin,
  FiClock,
  FiShield,
  FiTruck,
  FiAward,
  FiUsers,
  FiCheck,
  FiStar
} from 'react-icons/fi';

const LandingFooter = () => {
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
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-2">Join the Autora Revolution</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Stay updated with platform updates, dealer success stories, and automotive industry insights.
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
              Join 10,000+ dealers and businesses. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Platform Stats Section */}
      <div className="border-b border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Trusted by Thousands</h3>
            <p className="text-gray-400">Leading Ghana's automotive parts marketplace</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <FiUsers className="w-8 h-8" />
              </div>
              <h4 className="text-3xl font-bold text-white mb-2">500+</h4>
              <p className="text-gray-400">Verified Dealers</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
                <FiShield className="w-8 h-8" />
              </div>
              <h4 className="text-3xl font-bold text-white mb-2">50K+</h4>
              <p className="text-gray-400">Parts Listed</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-yellow-600 rounded-full flex items-center justify-center mb-4">
                <FiTruck className="w-8 h-8" />
              </div>
              <h4 className="text-3xl font-bold text-white mb-2">25K+</h4>
              <p className="text-gray-400">Orders Delivered</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                <FiStar className="w-8 h-8" />
              </div>
              <h4 className="text-3xl font-bold text-white mb-2">4.9/5</h4>
              <p className="text-gray-400">Customer Rating</p>
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
              <div className="mb-6">
                <Logo size="large" dark={false} />
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Ghana's premier multi-tenant automotive parts marketplace. We connect verified dealers 
                with customers, providing a comprehensive platform for inventory management, 
                order fulfillment, and business growth in the automotive sector.
              </p>
              
              {/* Awards/Certifications */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold mb-3">Recognition & Certifications</h4>
                <div className="grid grid-cols-1 gap-2 text-xs text-gray-400">
                  <div className="flex items-center">
                    <FiAward className="w-4 h-4 text-yellow-400 mr-2" />
                    <span>Ghana Tech Awards - Best E-commerce Platform 2024</span>
                  </div>
                  <div className="flex items-center">
                    <FiShield className="w-4 h-4 text-green-400 mr-2" />
                    <span>ISO 27001 Information Security Certified</span>
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="w-4 h-4 text-blue-400 mr-2" />
                    <span>Ghana Chamber of Commerce Member</span>
                  </div>
                </div>
              </div>
              
              {/* Social Media Links */}
              <div>
                <h4 className="text-sm font-semibold mb-4">Connect With Us</h4>
                <div className="flex space-x-4">
                  <a href="https://facebook.com/autora" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-600 transition-all duration-200">
                    <FiFacebook size={18} />
                  </a>
                  <a href="https://twitter.com/autora" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-400 transition-all duration-200">
                    <FiTwitter size={18} />
                  </a>
                  <a href="https://instagram.com/autora" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-pink-600 transition-all duration-200">
                    <FiInstagram size={18} />
                  </a>
                  <a href="https://linkedin.com/company/autora" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-700 transition-all duration-200">
                    <FiLinkedin size={18} />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Platform Solutions */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Platform Solutions</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/dealer-portal" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Dealer Management Portal
                  </Link>
                </li>
                <li>
                  <Link to="/buyer-marketplace" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Buyer Marketplace
                  </Link>
                </li>
                <li>
                  <Link to="/inventory-management" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Inventory Management
                  </Link>
                </li>
                <li>
                  <Link to="/order-fulfillment" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Order Fulfillment System
                  </Link>
                </li>
                <li>
                  <Link to="/payment-processing" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Payment Processing
                  </Link>
                </li>
                <li>
                  <Link to="/analytics-dashboard" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Analytics Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/api-integration" className="text-gray-400 hover:text-orange-400 transition-colors">
                    API Integration
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Industries */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Industries</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/automotive-dealers" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Automotive Dealers
                  </Link>
                </li>
                <li>
                  <Link to="/auto-repair-shops" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Auto Repair Shops
                  </Link>
                </li>
                <li>
                  <Link to="/parts-distributors" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Parts Distributors
                  </Link>
                </li>
                <li>
                  <Link to="/fleet-management" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Fleet Management
                  </Link>
                </li>
                <li>
                  <Link to="/oem-manufacturers" className="text-gray-400 hover:text-orange-400 transition-colors">
                    OEM Manufacturers
                  </Link>
                </li>
                <li>
                  <Link to="/logistics-partners" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Logistics Partners
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-orange-400 transition-colors">
                    About Autora
                  </Link>
                </li>
                <li>
                  <Link to="/leadership" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Leadership Team
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/investors" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Investors
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Press & Media
                  </Link>
                </li>
                <li>
                  <Link to="/partnerships" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Partnership Program
                  </Link>
                </li>
                <li>
                  <Link to="/sustainability" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Sustainability
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Support & Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-6 text-white">Support & Contact</h3>
              <div className="space-y-4 text-sm mb-6">
                <div className="flex items-start">
                  <FiMapPin className="mr-3 mt-1 text-orange-400 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-white font-medium">Headquarters</p>
                    <p className="text-gray-400">Ring Road East, Accra</p>
                    <p className="text-gray-400">Greater Accra, Ghana</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <FiPhone className="mr-3 mt-1 text-orange-400 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Business Inquiries</p>
                    <p className="text-orange-400 font-semibold">+233 30 123 4567</p>
                  </div>
                </div>
        
                <div className="flex items-start">
                  <FiMail className="mr-3 mt-1 text-orange-400 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-gray-400 text-xs mb-1">General Inquiries</p>
                    <p className="text-white">hello@autora.com.gh</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FiClock className="mr-3 mt-1 text-orange-400 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Business Hours</p>
                    <p className="text-white text-xs">Mon-Fri: 8AM - 6PM GMT</p>
                    <p className="text-white text-xs">Response within 24 hours</p>
                  </div>
                </div>
              </div>
              
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Contact Sales Team
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Technical Support
                  </Link>
                </li>
                <li>
                  <Link to="/documentation" className="text-gray-400 hover:text-orange-400 transition-colors">
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-400 hover:text-orange-400 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link to="/security" className="text-gray-400 hover:text-orange-400 transition-colors">
                    Security & Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Security & Compliance */}
            <div className="text-center lg:text-left">
              <h4 className="text-sm font-semibold mb-4 text-white">Security & Compliance</h4>
              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <div className="px-3 py-2 bg-gradient-to-r from-green-600 to-green-700 rounded-lg text-xs font-semibold text-white">
                  🔒 256-bit SSL Encryption
                </div>
                <div className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-xs font-semibold text-white">
                  🛡️ PCI DSS Compliant
                </div>
                <div className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg text-xs font-semibold text-white">
                  ✅ ISO 27001 Certified
                </div>
              </div>
            </div>
            
            {/* Partnerships */}
            <div className="text-center lg:text-right">
              <h4 className="text-sm font-semibold mb-4 text-white">Trusted Partners</h4>
              <div className="flex flex-wrap justify-center lg:justify-end gap-4 text-xs text-gray-400">
                <span>Ghana Chamber of Commerce</span>
                <span>•</span>
                <span>GITEC Member</span>
                <span>•</span>
                <span>GABS Verified</span>
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
                &copy; {new Date().getFullYear()} Autora Ghana Ltd. All rights reserved.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Building the future of automotive commerce in Ghana and beyond
              </p>
            </div>
            <div className="flex flex-wrap justify-center md:justify-end gap-4 text-xs">
              <Link to="/privacy" className="text-gray-400 hover:text-orange-400 transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-orange-400 transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-orange-400 transition-colors">
                Cookie Policy
              </Link>
              <Link to="/data-protection" className="text-gray-400 hover:text-orange-400 transition-colors">
                Data Protection
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-orange-400 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Development Credit */}
      <div className="bg-gray-950 px-4 py-3 text-center text-xs text-gray-500 border-t border-gray-800">
        <p>
          🚀 Powered by innovative technology solutions from 
          <span className="text-orange-400 font-medium mx-1">Biela.dev</span>
          | Built with TeachMeCode® Institute methodologies
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;
