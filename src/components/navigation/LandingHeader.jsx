import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from '../common/Logo';
import { FiMenu, FiX } from 'react-icons/fi';

const LandingHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  // Handle scroll event to change header appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);
  
  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center">
            <Logo size="medium" dark={scrolled} />
          </Link>
          
          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link 
              to="/features" 
              className={`font-medium hover:text-primary-600 ${
                scrolled ? 'text-neutral-800' : 'text-white hover:text-white'
              }`}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className={`font-medium hover:text-primary-600 ${
                scrolled ? 'text-neutral-800' : 'text-white hover:text-white'
              }`}
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className={`font-medium hover:text-primary-600 ${
                scrolled ? 'text-neutral-800' : 'text-white hover:text-white'
              }`}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium hover:text-primary-600 ${
                scrolled ? 'text-neutral-800' : 'text-white hover:text-white'
              }`}
            >
              Contact
            </Link>
          </nav>
          
          {/* CTA buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/auth/login" 
              className={`text-sm font-medium hover:text-primary-600 ${
                scrolled ? 'text-neutral-800' : 'text-white hover:text-white'
              }`}
            >
              Login
            </Link>
            <Link 
              to="/auth/register?type=dealer" 
              className={`rounded-md shadow px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700`}
            >
              Join as Dealer
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className={`inline-flex items-center justify-center p-2 rounded-md ${
                scrolled
                  ? 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
                  : 'text-white hover:text-white hover:bg-primary-700'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FiX className="block h-6 w-6" />
              ) : (
                <FiMenu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-md">
          <Link
            to="/features"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-800 hover:text-primary-600 hover:bg-neutral-50"
          >
            Features
          </Link>
          <Link
            to="/pricing"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-800 hover:text-primary-600 hover:bg-neutral-50"
          >
            Pricing
          </Link>
          <Link
            to="/about"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-800 hover:text-primary-600 hover:bg-neutral-50"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="block px-3 py-2 rounded-md text-base font-medium text-neutral-800 hover:text-primary-600 hover:bg-neutral-50"
          >
            Contact
          </Link>
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <Link
              to="/auth/login"
              className="block px-3 py-2 rounded-md text-base font-medium text-neutral-800 hover:text-primary-600 hover:bg-neutral-50"
            >
              Login
            </Link>
            <Link
              to="/auth/register?type=dealer"
              className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:text-primary-700 hover:bg-neutral-50"
            >
              Join as Dealer
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default LandingHeader;
