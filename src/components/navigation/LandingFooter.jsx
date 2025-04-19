import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';
import { 
  FiFacebook, 
  FiTwitter, 
  FiInstagram, 
  FiLinkedin 
} from 'react-icons/fi';

const LandingFooter = () => {
  return (
    <footer className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <Logo size="medium" dark={false} />
            <p className="mt-4 text-neutral-300 max-w-md">
              The premier multi-tenant marketplace connecting automotive parts dealers with buyers. 
              Our platform offers a comprehensive solution for inventory management, order fulfillment, 
              and business growth.
            </p>
            <div className="mt-6 flex space-x-6">
              <a href="#" className="text-neutral-400 hover:text-white">
                <FiFacebook size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="text-neutral-400 hover:text-white">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>
          
          {/* Solutions */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Solutions
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/dealer-portal" className="text-neutral-300 hover:text-white">
                  Dealer Portal
                </Link>
              </li>
              <li>
                <Link to="/buyer-marketplace" className="text-neutral-300 hover:text-white">
                  Buyer Marketplace
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard" className="text-neutral-300 hover:text-white">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/api-integration" className="text-neutral-300 hover:text-white">
                  API Integration
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/about" className="text-neutral-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-neutral-300 hover:text-white">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/partners" className="text-neutral-300 hover:text-white">
                  Partners
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-neutral-300 hover:text-white">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider">
              Support
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/contact" className="text-neutral-300 hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-neutral-300 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/documentation" className="text-neutral-300 hover:text-white">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-neutral-300 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-neutral-300 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-neutral-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-base text-neutral-400">
            &copy; {new Date().getFullYear()} AutoParts Marketplace. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/privacy" className="text-sm text-neutral-400 hover:text-neutral-300">
              Privacy
            </Link>
            <Link to="/terms" className="text-sm text-neutral-400 hover:text-neutral-300">
              Terms
            </Link>
            <Link to="/cookies" className="text-sm text-neutral-400 hover:text-neutral-300">
              Cookies
            </Link>
            <Link to="/sitemap" className="text-sm text-neutral-400 hover:text-neutral-300">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
      
      {/* Copyright bar */}
      <div className="bg-black px-4 py-2 text-center text-xs text-neutral-500">
        AI-powered development by Biela.dev, powered by TeachMeCode® Institute
      </div>
    </footer>
  );
};

export default LandingFooter;
