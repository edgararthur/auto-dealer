import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiChevronRight, FiStar, FiBookmark, FiBox, FiShield, FiAward, FiGrid, FiList, FiFilter } from 'react-icons/fi';
import Breadcrumb from '../../components/common/Breadcrumb';
import ProductService from '../../../shared/services/productService';

// Alphabetical letters for quick navigation
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Get brands that start with a specific letter
const getBrandsByLetter = (letter, brands) => {
  return brands.filter(brand => brand.name.toUpperCase().startsWith(letter));
};

// Group brands by first letter
const groupBrandsByFirstLetter = (brands) => {
  const grouped = {};
  
  brands.forEach(brand => {
    const firstLetter = brand.name.charAt(0).toUpperCase();
    if (!grouped[firstLetter]) {
      grouped[firstLetter] = [];
    }
    grouped[firstLetter].push(brand);
  });
  
  // Sort each group alphabetically
  Object.keys(grouped).forEach(letter => {
    grouped[letter].sort((a, b) => a.name.localeCompare(b.name));
  });
  
  return grouped;
};

const FeaturedBrandCard = ({ brand }) => {
  return (
    <div className="bg-white rounded-lg shadow-card hover:shadow-luxury transition-all duration-300 overflow-hidden group border border-neutral-100">
      <div className="p-6 flex flex-col items-center relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-gold-50/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="h-24 flex items-center justify-center mb-5 w-full bg-gradient-to-b from-neutral-50 to-white rounded-md p-2">
          <img 
            src={brand.logo} 
            alt={`${brand.name} logo`}
            className="max-h-20 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <h3 className="text-lg font-bold text-neutral-800 mb-2 text-center font-display">{brand.name}</h3>
        
        <div className="flex items-center mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(brand.rating) ? 'text-gold-400' : 'text-neutral-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-2 text-sm text-neutral-600">{brand.rating}</span>
        </div>
        
        <div className="text-sm text-neutral-600 mb-4">
          {brand.productCount} Products
        </div>
        
        <div className="flex flex-wrap justify-center gap-1 mb-5">
          {brand.categories.slice(0, 3).map((category, idx) => (
            <span key={idx} className="inline-block px-2 py-1 text-xs rounded-full bg-primary-50 text-primary-700 border border-primary-100">
              {category}
            </span>
          ))}
          {brand.categories.length > 3 && (
            <span className="inline-block px-2 py-1 text-xs rounded-full bg-neutral-100 text-neutral-700">
              +{brand.categories.length - 3}
            </span>
          )}
        </div>
        
        <Link 
          to={`/products?brand=${brand.name}`}
          className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors group-hover:underline"
        >
          View Products
          <FiChevronRight className="ml-1 group-hover:translate-x-1 transition-transform duration-300" size={16} />
        </Link>
      </div>
    </div>
  );
};

const BrandListItem = ({ brand }) => {
  return (
    <Link to={`/products?brand=${brand.name}`} className="group">
      <div className="flex items-center py-3 px-4 rounded-lg hover:bg-neutral-50 transition-colors duration-200">
        <div className="h-12 w-24 flex items-center justify-center mr-4 bg-white rounded-md shadow-sm p-1.5 group-hover:shadow">
          <img 
            src={brand.logo} 
            alt={`${brand.name} logo`}
            className="max-h-10 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-medium text-neutral-800 group-hover:text-primary-600 transition-colors">{brand.name}</h3>
          <p className="text-xs text-neutral-500">{brand.productCount} products</p>
        </div>
        
        <div className="flex items-center text-neutral-400 group-hover:text-primary-600 transition-colors">
          <FiChevronRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </Link>
  );
};

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortOption, setSortOption] = useState('name');
  const [activeLetter, setActiveLetter] = useState(null);
  
  // Fetch brands/dealers on component mount
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        
        // Use the real backend service to get dealers
        const dealers = await ProductService.getDealers();
        
        // Transform dealers data for brands display
        const brandsData = dealers.map(dealer => ({
          id: dealer.id,
          name: dealer.company_name || dealer.business_name,
          logo: dealer.profile?.avatar_url || `https://via.placeholder.com/150x80?text=${encodeURIComponent((dealer.company_name || dealer.business_name)?.substring(0, 2) || 'BR')}`,
          productCount: dealer.productCount || 0,
          location: dealer.location || 'Location not specified',
          description: dealer.metadata?.description || `Quality automotive parts from ${dealer.company_name || dealer.business_name}`,
          rating: dealer.rating || 4.0,
          establishedYear: dealer.created_at ? new Date(dealer.created_at).getFullYear() : 2020
        }));
        
        setBrands(brandsData);
        setFilteredBrands(brandsData);
        
      } catch (err) {
        console.error('Error fetching brands:', err);
        setError('Failed to load brands. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBrands();
  }, []);

  // Filter and sort brands based on search and sort options
  useEffect(() => {
    let filtered = brands;
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered = filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'products':
          return b.productCount - a.productCount;
        case 'rating':
          return b.rating - a.rating;
        case 'year':
          return b.establishedYear - a.establishedYear;
        default:
          return a.name.localeCompare(b.name);
      }
    });
    
    setFilteredBrands(filtered);
  }, [brands, searchTerm, sortOption]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setActiveLetter(null); // Reset active letter when searching
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleLetterClick = (letter) => {
    setActiveLetter(letter === activeLetter ? null : letter);
    setSearchTerm(''); // Clear search when selecting a letter
  };
  
  // Letters that have brands starting with them
  const activeLetters = Object.keys(groupBrandsByFirstLetter(filteredBrands));
  
  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent align-[-0.125em]"></div>
            <p className="mt-6 text-neutral-600 font-medium">Loading brands...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-50 min-h-screen pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Page header */}
      <div className="bg-gradient-luxury pt-10 pb-12 px-4 sm:px-6 lg:px-8 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80')] bg-no-repeat bg-cover bg-center"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-900/40 via-primary-800/20 to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <Breadcrumb
            items={[
              { label: 'Brands', path: '/brands' }
            ]}
          />
          
          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3">
              Our <span className="text-gold-300">Trusted Brands</span>
            </h1>
            <p className="text-neutral-200 max-w-2xl">
              Discover quality automotive parts from verified dealers and trusted brands worldwide.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Filter Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Search brands or locations..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
            </div>
            
            {/* Sort */}
            <div className="flex items-center space-x-4">
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="name">Sort by Name</option>
                <option value="products">Most Products</option>
                <option value="rating">Highest Rated</option>
                <option value="year">Newest First</option>
              </select>
              
              {/* View Mode Toggle */}
              <div className="flex rounded-lg border border-neutral-200 overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <FiGrid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <FiList size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 flex items-center text-sm text-neutral-600">
          <span>Showing <span className="font-semibold text-primary-700">{filteredBrands.length}</span> brands</span>
        </div>

        {/* Brands Grid/List */}
        {filteredBrands.length > 0 ? (
          <div className={`grid gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {filteredBrands.map(brand => (
              <div 
                key={brand.id} 
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-200 overflow-hidden ${
                  viewMode === 'list' ? 'flex items-center' : ''
                }`}
              >
                {/* Brand Logo */}
                <div className={`${viewMode === 'list' ? 'w-32 h-20 flex-shrink-0' : 'h-32'} bg-neutral-50 flex items-center justify-center`}>
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain p-4"
                    onError={(e) => {
                      e.target.src = `https://via.placeholder.com/150x80?text=${encodeURIComponent(brand.name.substring(0, 2))}`;
                    }}
                  />
                </div>
                
                {/* Brand Info */}
                <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                  <div className={`${viewMode === 'list' ? 'flex items-center justify-between' : ''}`}>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                        <Link 
                          to={`/products?brand=${encodeURIComponent(brand.name)}`}
                          className="hover:text-primary-600 transition-colors"
                        >
                          {brand.name}
                        </Link>
                      </h3>
                      
                      <p className="text-sm text-neutral-600 mb-2">{brand.description}</p>
                      
                      <div className="flex items-center text-xs text-neutral-500 space-x-4">
                        <span>{brand.productCount} products</span>
                        <span>★ {brand.rating.toFixed(1)}</span>
                        {brand.location && <span>📍 {brand.location}</span>}
                        <span>Since {brand.establishedYear}</span>
                      </div>
                    </div>
                    
                    {viewMode === 'list' && (
                      <Link
                        to={`/products?brand=${encodeURIComponent(brand.name)}`}
                        className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        View Products
                      </Link>
                    )}
                  </div>
                  
                  {viewMode === 'grid' && (
                    <Link
                      to={`/products?brand=${encodeURIComponent(brand.name)}`}
                      className="block w-full mt-3 px-4 py-2 bg-primary-600 text-white text-sm text-center rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      View Products
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500 mb-4">No brands found matching your search.</p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Brands; 