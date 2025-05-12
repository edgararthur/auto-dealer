import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiChevronRight, FiStar, FiBookmark, FiBox, FiShield, FiAward } from 'react-icons/fi';
import Breadcrumb from '../../components/common/Breadcrumb';

// Mock data for brands
const brandsData = [
  {
    id: 1,
    name: 'Bosch',
    logo: 'https://www.carlogos.org/car-logos/bosch-logo-1300x1100.png',
    productCount: 487,
    rating: 4.8,
    featured: true,
    categories: ['Engine', 'Electrical', 'Brakes', 'Filters']
  },
  {
    id: 2,
    name: 'Denso',
    logo: 'https://www.carlogos.org/logo/Denso-logo-3000x700.png',
    productCount: 354,
    rating: 4.7,
    featured: true,
    categories: ['Spark Plugs', 'Oxygen Sensors', 'Ignition', 'HVAC']
  },
  {
    id: 3,
    name: 'NGK',
    logo: 'https://www.carlogos.org/logo/NGK-logo-1920x1080.png',
    productCount: 278,
    rating: 4.9,
    featured: true,
    categories: ['Spark Plugs', 'Ignition', 'Oxygen Sensors']
  },
  {
    id: 4,
    name: 'AC Delco',
    logo: 'https://www.carlogos.org/logo/AC-Delco-logo-2000x1200.png',
    productCount: 412,
    rating: 4.6,
    featured: true,
    categories: ['Filters', 'Brakes', 'Electrical', 'Fluids']
  },
  {
    id: 5,
    name: 'Moog',
    logo: 'https://www.carlogos.org/car-logos/moog-logo-700x120.png',
    productCount: 246,
    rating: 4.7,
    featured: true,
    categories: ['Suspension', 'Steering', 'Chassis']
  },
  {
    id: 6,
    name: 'K&N',
    logo: 'https://www.carlogos.org/logo/K&N-logo-1000x600.png',
    productCount: 189,
    rating: 4.8,
    featured: true,
    categories: ['Air Filters', 'Performance', 'Intake Systems']
  },
  {
    id: 7,
    name: 'Brembo',
    logo: 'https://www.carlogos.org/logo/Brembo-logo-3000x1400.png',
    productCount: 167,
    rating: 4.9,
    featured: false,
    categories: ['Brakes', 'Performance']
  },
  {
    id: 8,
    name: 'Bilstein',
    logo: 'https://www.carlogos.org/logo/Bilstein-logo-blue-3000x600.png',
    productCount: 144,
    rating: 4.8,
    featured: false,
    categories: ['Suspension', 'Shocks', 'Struts']
  },
  {
    id: 9,
    name: 'Magnaflow',
    logo: 'https://www.carlogos.org/car-logos/magnaflow-logo-700x120.png',
    productCount: 132,
    rating: 4.7,
    featured: false,
    categories: ['Exhaust', 'Performance']
  },
  {
    id: 10,
    name: 'Monroe',
    logo: 'https://www.carlogos.org/car-logos/monroe-logo-700x150.png',
    productCount: 203,
    rating: 4.6,
    featured: false,
    categories: ['Suspension', 'Shocks', 'Struts']
  },
  {
    id: 11,
    name: 'Edelbrock',
    logo: 'https://www.carlogos.org/logo/Edelbrock-logo-1200x500.png',
    productCount: 158,
    rating: 4.8,
    featured: false,
    categories: ['Performance', 'Engine', 'Intake']
  },
  {
    id: 12,
    name: 'Optima',
    logo: 'https://www.carlogos.org/car-logos/optima-batteries-logo-1000x250.png',
    productCount: 87,
    rating: 4.9,
    featured: false,
    categories: ['Batteries', 'Electrical']
  },
  {
    id: 13,
    name: 'Hawk',
    logo: 'https://www.carlogos.org/car-logos/hawk-performance-logo-600x160.png',
    productCount: 112,
    rating: 4.7,
    featured: false,
    categories: ['Brakes', 'Performance']
  },
  {
    id: 14,
    name: 'PIAA',
    logo: 'https://www.carlogos.org/car-logos/piaa-logo-800x150.png',
    productCount: 94,
    rating: 4.6,
    featured: false,
    categories: ['Lighting', 'Wipers']
  },
  {
    id: 15,
    name: 'Flowmaster',
    logo: 'https://www.carlogos.org/car-logos/flowmaster-logo-1000x250.png',
    productCount: 126,
    rating: 4.8,
    featured: false,
    categories: ['Exhaust', 'Performance']
  },
  {
    id: 16,
    name: 'Walker',
    logo: 'https://www.carlogos.org/car-logos/walker-logo-700x150.png',
    productCount: 174,
    rating: 4.5,
    featured: false,
    categories: ['Exhaust', 'Catalytic Converters']
  },
  {
    id: 17,
    name: 'Fel-Pro',
    logo: 'https://www.carlogos.org/car-logos/felpro-logo-1200x300.png',
    productCount: 243,
    rating: 4.7,
    featured: false,
    categories: ['Gaskets', 'Engine']
  },
  {
    id: 18,
    name: 'MSD',
    logo: 'https://www.carlogos.org/car-logos/msd-performance-logo-800x200.png',
    productCount: 109,
    rating: 4.8,
    featured: false,
    categories: ['Ignition', 'Performance', 'Electrical']
  }
];

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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState(null);
  
  // Filter brands based on search query
  const filteredBrands = brandsData.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Get featured brands
  const featuredBrands = filteredBrands.filter(brand => brand.featured);
  
  // Group remaining brands by first letter for alphabetical navigation
  const groupedBrands = groupBrandsByFirstLetter(filteredBrands);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setActiveLetter(null); // Reset active letter when searching
  };
  
  const handleLetterClick = (letter) => {
    setActiveLetter(letter === activeLetter ? null : letter);
    setSearchQuery(''); // Clear search when selecting a letter
  };
  
  // Letters that have brands starting with them
  const activeLetters = Object.keys(groupedBrands);
  
  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Page header */}
      <div className="bg-gradient-luxury pt-10 pb-12 px-4 sm:px-6 lg:px-8 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560343776-97e7d202ff0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80')] bg-no-repeat bg-cover bg-center"></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-900/40 via-primary-900/20 to-transparent opacity-60 pointer-events-none"></div>
        
        <div className="absolute -bottom-36 -right-36 w-96 h-96 rounded-full bg-gradient-radial from-gold-300/10 to-transparent opacity-70"></div>
        
        <div className="absolute bottom-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto opacity-10">
            <path fill="#ffffff" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <Breadcrumb
            items={[
              { label: 'Brands', path: '/brands' }
            ]}
          />
          
          <div className="mt-6 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3">Shop by <span className="text-gold-300">Brands</span></h1>
            <p className="text-neutral-200 max-w-2xl">
              Explore our extensive collection of premium automotive brands, offering quality and performance you can trust.
            </p>
          </div>
          
          {/* Search input */}
          <div className="max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search brands..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full py-3 pl-10 pr-4 rounded-lg shadow-luxury border-0 focus:ring-2 focus:ring-gold-300"
              />
              <FiSearch className="absolute left-3 top-3.5 text-neutral-400" size={18} />
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand benefits section */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-white to-neutral-50 rounded-lg p-6 shadow-card border border-neutral-100 group hover:shadow-luxury transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiAward size={22} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2 font-display">Premium Quality</h3>
            <p className="text-neutral-600">We partner with trusted manufacturers that meet our high quality standards.</p>
          </div>
          
          <div className="bg-gradient-to-br from-white to-neutral-50 rounded-lg p-6 shadow-card border border-neutral-100 group hover:shadow-luxury transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center text-gold-600 mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiShield size={22} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2 font-display">Authentic Products</h3>
            <p className="text-neutral-600">Every product in our inventory is 100% genuine and comes with a manufacturer warranty.</p>
          </div>
          
          <div className="bg-gradient-to-br from-white to-neutral-50 rounded-lg p-6 shadow-card border border-neutral-100 group hover:shadow-luxury transition-all duration-300">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-100 to-accent-50 flex items-center justify-center text-accent-600 mb-4 group-hover:scale-110 transition-transform duration-300">
              <FiBox size={22} />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-2 font-display">Wide Selection</h3>
            <p className="text-neutral-600">Discover parts for every vehicle make and model from over 100 trusted brands.</p>
          </div>
        </div>
        
        {/* Featured brands section */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <FiBookmark className="text-gold-500 mr-2" size={22} />
            <h2 className="text-2xl font-bold text-neutral-900 font-display">Featured <span className="text-gold-500">Brands</span></h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredBrands.map(brand => (
              <FeaturedBrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </section>
        
        {/* Alphabetical navigation */}
        <div className="sticky top-4 z-20 bg-neutral-50 pt-2 pb-1 mb-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4 font-display">All <span className="text-primary-600">Brands</span></h2>
          
          <div className="flex flex-wrap gap-1.5 mb-8 bg-gradient-to-r from-white to-neutral-50 p-4 rounded-lg shadow-sm border border-neutral-200">
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                disabled={!activeLetters.includes(letter)}
                className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-all duration-300 ${
                  activeLetter === letter
                    ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-md transform scale-110'
                    : activeLetters.includes(letter)
                      ? 'bg-white text-neutral-800 hover:bg-neutral-100 border border-neutral-200 hover:border-primary-300 hover:text-primary-600'
                      : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
          
          {activeLetter ? (
            <div>
              <div className="flex items-center mb-4">
                <span className="w-10 h-10 rounded-md bg-gradient-to-r from-primary-100 to-primary-50 text-primary-600 flex items-center justify-center mr-3 font-bold text-lg shadow-sm">
                  {activeLetter}
                </span>
                <h3 className="text-lg font-medium text-neutral-800">
                  {groupedBrands[activeLetter]?.length || 0} Brands
                </h3>
              </div>
              
              <div className="bg-white rounded-lg shadow-card border border-neutral-100 divide-y divide-neutral-100">
                {groupedBrands[activeLetter]?.map(brand => (
                  <BrandListItem key={brand.id} brand={brand} />
                ))}
              </div>
            </div>
          ) : searchQuery ? (
            <div>
              <h3 className="text-lg font-medium text-neutral-800 mb-3 flex items-center">
                <FiSearch className="mr-2 text-primary-500" size={18} />
                <span>Search Results for "<span className="text-primary-600 font-semibold">{searchQuery}</span>"</span>
                <span className="ml-2 text-sm text-neutral-500">({filteredBrands.length} results)</span>
              </h3>
              
              {filteredBrands.length > 0 ? (
                <div className="bg-white rounded-lg shadow-card border border-neutral-100 divide-y divide-neutral-100">
                  {filteredBrands.map(brand => (
                    <BrandListItem key={brand.id} brand={brand} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-card p-8 text-center border border-neutral-100">
                  <p className="text-neutral-600">No brands found for "{searchQuery}"</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="mt-3 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* When no letter is selected and no search query, show all letters with their brands */}
              <div className="space-y-10">
                {Object.keys(groupedBrands).sort().map(letter => (
                  <div key={letter} className="scroll-mt-20" id={`letter-${letter}`}>
                    <div className="flex items-center mb-4">
                      <span className="w-10 h-10 rounded-md bg-gradient-to-r from-primary-100 to-primary-50 text-primary-600 flex items-center justify-center mr-3 font-bold text-lg shadow-sm">
                        {letter}
                      </span>
                      <h3 className="text-lg font-medium text-neutral-800">
                        {groupedBrands[letter].length} Brands
                      </h3>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-card border border-neutral-100 divide-y divide-neutral-100">
                      {groupedBrands[letter].map(brand => (
                        <BrandListItem key={brand.id} brand={brand} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
        
        {/* Become a partner CTA */}
        <div className="bg-gradient-to-r from-neutral-800 to-neutral-900 rounded-xl p-8 shadow-luxury overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-gold-300/20 to-transparent opacity-60"></div>
          <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-primary-500/10 backdrop-blur-xl"></div>
          <div className="absolute top-1/3 right-1/4 w-6 h-6 rounded-full bg-gold-400/30 backdrop-blur-sm"></div>
          <div className="absolute bottom-1/4 left-1/3 w-4 h-4 rounded-full bg-primary-400/20 backdrop-blur-sm"></div>
          
          <div className="relative">
            <h3 className="text-xl font-bold text-white mb-3 font-display">Are You a <span className="text-gold-300">Manufacturer</span>?</h3>
            <p className="text-neutral-300 mb-6 max-w-2xl">
              Join our platform to showcase your products to thousands of automotive enthusiasts. Become an official brand partner today.
            </p>
            
            <Link to="/partner-program" className="inline-flex items-center px-5 py-2.5 bg-gradient-gold text-neutral-900 rounded-md font-medium shadow-gold hover:opacity-90 transition-opacity group">
              Learn About Our Partner Program
              <FiChevronRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Brands; 