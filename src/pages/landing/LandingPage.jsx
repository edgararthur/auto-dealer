import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiTruck, 
  FiPackage, 
  FiShield, 
  FiBarChart2, 
  FiUsers, 
  FiSettings, 
  FiCheck,
  FiArrowRight
} from 'react-icons/fi';

const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gradient-to-r from-primary-900 to-primary-700 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/3815585/pexels-photo-3815585.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Auto parts"
            className="w-full h-full object-cover object-center opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700 mix-blend-multiply" />
        </div>
        
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:px-8 pt-32">
          <div className="md:flex md:items-center md:justify-between">
            <div className="md:w-3/5 animate-slide-up">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-shadow-lg">
                The Ultimate Auto Parts Marketplace Platform
              </h1>
              <p className="mt-6 max-w-lg text-xl text-primary-100">
                Connect buyers with quality automotive parts dealers through a powerful multi-tenant marketplace platform with dedicated dealer and administrative tools.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/auth/register?type=dealer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-primary-50 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Register as Dealer
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  Shop Auto Parts
                </Link>
              </div>
            </div>
            <div className="mt-12 md:mt-0 md:w-2/5 hidden md:block">
              <div className="relative mx-auto w-full max-w-md animate-fade-in">
                <img
                  src="https://images.pexels.com/photos/4480523/pexels-photo-4480523.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Dashboard"
                  className="rounded-lg shadow-2xl transform hover:scale-105 transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">
              Platform Features
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-neutral-900 sm:text-5xl sm:tracking-tight">
              Everything you need in one platform
            </p>
            <p className="max-w-xl mt-5 mx-auto text-xl text-neutral-500">
              Our comprehensive solution offers specialized tools for dealers, buyers, and administrators.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-neutral-50 rounded-lg px-6 pb-8 shadow-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                        <FiPackage className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-neutral-900 tracking-tight">
                      Inventory Management
                    </h3>
                    <p className="mt-5 text-base text-neutral-500">
                      Comprehensive tools for dealers to manage product listings, track inventory levels, and update pricing in real-time.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-neutral-50 rounded-lg px-6 pb-8 shadow-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-accent-500 rounded-md shadow-lg">
                        <FiTruck className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-neutral-900 tracking-tight">
                      Order Fulfillment
                    </h3>
                    <p className="mt-5 text-base text-neutral-500">
                      Streamlined order processing, shipping management, and return handling for efficient operations.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-neutral-50 rounded-lg px-6 pb-8 shadow-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-secondary-600 rounded-md shadow-lg">
                        <FiBarChart2 className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-neutral-900 tracking-tight">
                      Analytics Dashboard
                    </h3>
                    <p className="mt-5 text-base text-neutral-500">
                      Detailed insights into sales performance, customer behavior, and inventory metrics for data-driven decisions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-neutral-50 rounded-lg px-6 pb-8 shadow-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-success-600 rounded-md shadow-lg">
                        <FiUsers className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-neutral-900 tracking-tight">
                      Multi-Tenant Architecture
                    </h3>
                    <p className="mt-5 text-base text-neutral-500">
                      Securely host multiple dealer storefronts within a single platform, each with isolated data and customizable settings.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-neutral-50 rounded-lg px-6 pb-8 shadow-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                        <FiShield className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-neutral-900 tracking-tight">
                      Secure Transactions
                    </h3>
                    <p className="mt-5 text-base text-neutral-500">
                      PCI-compliant payment processing with fraud detection and secure customer data handling.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-neutral-50 rounded-lg px-6 pb-8 shadow-card hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-accent-500 rounded-md shadow-lg">
                        <FiSettings className="h-6 w-6 text-white" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-neutral-900 tracking-tight">
                      Administrative Controls
                    </h3>
                    <p className="mt-5 text-base text-neutral-500">
                      Powerful tools for platform owners to manage dealers, oversee operations, and ensure compliance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Platform comparison section */}
      <div className="py-16 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">
              Three Integrated Applications
            </h2>
            <p className="mt-2 text-3xl font-extrabold text-neutral-900 sm:text-4xl">
              A complete ecosystem for automotive parts
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-y-10 gap-x-8 lg:grid-cols-3">
            {/* Dealer Portal */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-neutral-200">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-neutral-900 text-center">Dealer Portal</h3>
                <p className="mt-4 text-neutral-500 text-center">
                  Comprehensive tools for automotive parts dealers to manage their business
                </p>
                <div className="mt-8">
                  <ul className="space-y-4">
                    {[
                      'Inventory management',
                      'Order processing & fulfillment',
                      'Staff permission controls',
                      'Performance analytics',
                      'Customer management',
                      'Custom storefront branding'
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <FiCheck className="h-5 w-5 text-success-500" />
                        </div>
                        <p className="ml-3 text-sm text-neutral-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    to="/auth/register?type=dealer"
                    className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                  >
                    Join as Dealer
                  </Link>
                </div>
              </div>
            </div>

            {/* Buyer Marketplace */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-neutral-200">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-neutral-900 text-center">Buyer Marketplace</h3>
                <p className="mt-4 text-neutral-500 text-center">
                  User-friendly e-commerce platform for finding and purchasing auto parts
                </p>
                <div className="mt-8">
                  <ul className="space-y-4">
                    {[
                      'Advanced search filters',
                      'Detailed product information',
                      'Secure checkout process',
                      'Order tracking',
                      'Customer reviews & ratings',
                      'Vehicle compatibility checking'
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <FiCheck className="h-5 w-5 text-success-500" />
                        </div>
                        <p className="ml-3 text-sm text-neutral-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    to="/shop"
                    className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-500 hover:bg-accent-600"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>

            {/* Admin Platform */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-neutral-200">
              <div className="px-6 py-8">
                <h3 className="text-2xl font-bold text-neutral-900 text-center">Admin Platform</h3>
                <p className="mt-4 text-neutral-500 text-center">
                  Powerful controls for marketplace owners to oversee operations
                </p>
                <div className="mt-8">
                  <ul className="space-y-4">
                    {[
                      'Dealer onboarding & management',
                      'Listing moderation & compliance',
                      'Platform-wide analytics',
                      'Support ticket management',
                      'Payment processing oversight',
                      'System configuration controls'
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0">
                          <FiCheck className="h-5 w-5 text-success-500" />
                        </div>
                        <p className="ml-3 text-sm text-neutral-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    to="/contact"
                    className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-secondary-600 hover:bg-secondary-700"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold text-primary-600 tracking-wide uppercase">
              Testimonials
            </h2>
            <p className="mt-1 text-4xl font-extrabold text-neutral-900 sm:text-5xl sm:tracking-tight">
              Trusted by dealers nationwide
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="bg-neutral-50 rounded-lg p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center mb-4">
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Customer"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-neutral-900">Michael Johnson</h3>
                  <p className="text-neutral-500">Auto Parts Plus, Chicago</p>
                </div>
              </div>
              <p className="text-neutral-700">
                "This platform has transformed our business. We've increased sales by 35% and reduced inventory management time by half. The analytics dashboard gives us insights we never had before."
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center mb-4">
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Customer"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-neutral-900">Sarah Martinez</h3>
                  <p className="text-neutral-500">Elite Auto Supply, Miami</p>
                </div>
              </div>
              <p className="text-neutral-700">
                "The multi-tenant architecture is perfect for our multiple locations. Each store manager has their own dashboard, but I can oversee everything from one central admin portal. Brilliant!"
              </p>
            </div>
            <div className="bg-neutral-50 rounded-lg p-6 shadow-sm border border-neutral-200">
              <div className="flex items-center mb-4">
                <img
                  className="h-12 w-12 rounded-full object-cover"
                  src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
                  alt="Customer"
                />
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-neutral-900">David Wilson</h3>
                  <p className="text-neutral-500">Wilson's Auto Parts, Dallas</p>
                </div>
              </div>
              <p className="text-neutral-700">
                "The customer experience is seamless. Our buyers love the detailed product pages and vehicle compatibility checker. We've seen a significant reduction in returns since implementing this platform."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to boost your auto parts business?</span>
            <span className="block text-primary-200">Join our marketplace today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link
                to="/auth/register?type=dealer"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
              >
                Join as Dealer
                <FiArrowRight className="ml-2 -mr-1 h-5 w-5" />
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-500"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
