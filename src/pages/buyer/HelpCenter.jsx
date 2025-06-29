import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSearch, 
  FiMessageCircle, 
  FiPhone, 
  FiMail,
  FiHelpCircle,
  FiBook,
  FiSettings,
  FiShield,
  FiPackage,
  FiCreditCard,
  FiTruck,
  FiRefreshCw,
  FiChevronRight,
  FiChevronDown,
  FiUser,
  FiStar,
  FiClock,
  FiCheck,
  FiEye
} from 'react-icons/fi';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const helpCategories = [
    {
      id: 'all',
      name: 'All Topics',
      icon: FiBook,
      count: 156
    },
    {
      id: 'orders',
      name: 'Orders & Shipping',
      icon: FiPackage,
      count: 45,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      id: 'payments',
      name: 'Payments & Billing',
      icon: FiCreditCard,
      count: 32,
      color: 'text-green-600 bg-green-50'
    },
    {
      id: 'returns',
      name: 'Returns & Refunds',
      icon: FiRefreshCw,
      count: 28,
      color: 'text-orange-600 bg-orange-50'
    },
    {
      id: 'account',
      name: 'Account & Security',
      icon: FiShield,
      count: 25,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      id: 'products',
      name: 'Product Information',
      icon: FiSettings,
      count: 26,
      color: 'text-red-600 bg-red-50'
    }
  ];

  const frequentQuestions = [
    {
      id: 1,
      category: 'orders',
      question: 'How can I track my order?',
      answer: 'You can track your order by going to "My Orders" in your account dashboard or by clicking the tracking link in your confirmation email. We provide real-time updates on your shipment status.',
      helpful: 245,
      views: 1890
    },
    {
      id: 2,
      category: 'returns',
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for most items. Products must be in original condition with original packaging. Some restrictions apply to certain categories like fluids and electrical components.',
      helpful: 198,
      views: 1654
    },
    {
      id: 3,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, Google Pay, and bank transfers. All payments are processed securely through encrypted connections.',
      helpful: 167,
      views: 1432
    },
    {
      id: 4,
      category: 'products',
      question: 'How do I know if a part fits my vehicle?',
      answer: 'Use our Vehicle Compatibility Checker on each product page. Enter your vehicle\'s year, make, and model to see compatible parts. You can also add your vehicle to "My Garage" for personalized recommendations.',
      helpful: 289,
      views: 2341
    },
    {
      id: 5,
      category: 'orders',
      question: 'Can I modify or cancel my order?',
      answer: 'Orders can be modified or cancelled within 2 hours of placement if they haven\'t entered the fulfillment process. After that, please contact customer service for assistance.',
      helpful: 134,
      views: 987
    },
    {
      id: 6,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click "Forgot Password" on the login page and enter your email address. You\'ll receive a secure link to reset your password. Make sure to check your spam folder if you don\'t see the email.',
      helpful: 156,
      views: 1123
    }
  ];

  const contactOptions = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Available 24/7',
      icon: FiMessageCircle,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
      action: 'Start Chat'
    },
    {
      id: 'phone',
      title: 'Phone Support',
      description: 'Speak directly with a specialist',
      availability: 'Mon-Fri 8AM-8PM EST',
      icon: FiPhone,
      color: 'text-green-600 bg-green-50 border-green-200',
      action: 'Call Now: 1-800-AUTO-PARTS'
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us a detailed message',
      availability: 'Response within 24 hours',
      icon: FiMail,
      color: 'text-purple-600 bg-purple-50 border-purple-200',
      action: 'Send Email'
    }
  ];

  const quickActions = [
    {
      title: 'Track an Order',
      description: 'Get real-time updates on your shipment',
      icon: FiPackage,
      link: '/orders'
    },
    {
      title: 'Return an Item',
      description: 'Start a return or exchange',
      icon: FiRefreshCw,
      link: '/returns'
    },
    {
      title: 'Update Payment',
      description: 'Manage your payment methods',
      icon: FiCreditCard,
      link: '/account/payment-methods'
    },
    {
      title: 'Account Security',
      description: 'Update password and security settings',
      icon: FiShield,
      link: '/account/security'
    }
  ];

  const filteredFAQs = frequentQuestions.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleFAQToggle = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              How can we help you?
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Find answers to your questions, get support, and learn about our services
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help articles, FAQs, or topics..."
                  className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-0 focus:ring-2 focus:ring-blue-300 text-gray-900 placeholder-gray-500"
                />
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-blue-300 group"
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <action.icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {action.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Contact Options */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Get in Touch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactOptions.map((option) => (
              <div
                key={option.id}
                className={`bg-white rounded-xl p-8 shadow-sm border hover:shadow-lg transition-all duration-200 ${option.color}`}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white flex items-center justify-center">
                    <option.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {option.title}
                  </h3>
                  <p className="text-gray-600 mb-3">
                    {option.description}
                  </p>
                  <p className="text-sm font-medium mb-6">
                    {option.availability}
                  </p>
                  <button className="w-full px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors">
                    {option.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Frequently Asked Questions
            </h2>
            <div className="text-sm text-gray-600">
              {filteredFAQs.length} articles found
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-8">
            {helpCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <category.icon className="w-4 h-4 mr-2" />
                {category.name}
                <span className="ml-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                  {category.count}
                </span>
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm"
              >
                <button
                  onClick={() => handleFAQToggle(faq.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <h3 className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <FiEye className="w-4 h-4 mr-1" />
                      {faq.views}
                    </div>
                    <FiChevronDown 
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        expandedFAQ === faq.id ? 'transform rotate-180' : ''
                      }`} 
                    />
                  </div>
                </button>
                
                {expandedFAQ === faq.id && (
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-100 pt-6">
                      <p className="text-gray-700 leading-relaxed mb-4">
                        {faq.answer}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">Was this helpful?</span>
                          <div className="flex items-center space-x-2">
                            <button className="flex items-center px-3 py-1 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                              <FiCheck className="w-4 h-4 mr-1" />
                              Yes ({faq.helpful})
                            </button>
                            <button className="flex items-center px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                              No
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <FiStar className="w-4 h-4 mr-1 text-yellow-400 fill-current" />
                          Helpful to {faq.helpful} people
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <FiHelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or browse different categories
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Still Need Help */}
        <section className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Still need help?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Our customer support team is here to help you with any questions or issues you may have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
              Contact Support
            </button>
            <button className="px-8 py-3 border border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gray-900 transition-colors">
              Schedule a Call
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter; 