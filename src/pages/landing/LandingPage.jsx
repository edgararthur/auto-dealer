import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiSearch,
  FiArrowRight,
  FiBox,
  FiTool,
  FiZap,
  FiSettings,
  FiFilter,
  FiDroplet,
  FiShoppingCart,
  FiStar,
  FiTruck, 
  FiShield,
  FiHeart,
  FiEye,
  FiRefreshCw,
  FiPhone,
  FiMail,
  FiMapPin,
  FiClock,
  FiUsers,
  FiAward,
  FiGift,
  FiCheckCircle
} from 'react-icons/fi';
import ProductService from '../../../shared/services/productService';
import CategoryService from '../../../shared/services/categoryService';
import BrandService from '../../../shared/services/brandService';
import { ProductCard } from '../../components/common';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestDeals, setBestDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');
  const [selectedTransmission, setSelectedTransmission] = useState('');
  const [selectedTrim, setSelectedTrim] = useState('');
  const [vinSearch, setVinSearch] = useState('');

  // Vehicle selector options
  const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan', 'Hyundai', 'Kia'];
  const models = ['Corolla', 'Camry', 'Prius', 'RAV4', 'Highlander', 'Civic', 'Accord', 'CR-V', 'Pilot'];
  const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
  const engines = ['1.6L 4-Cylinder', '1.8L 4-Cylinder', '2.0L 4-Cylinder', '2.4L 4-Cylinder', '3.5L V6', '5.0L V8'];
  const transmissions = ['Manual', 'Automatic', 'CVT', 'Dual-Clutch'];
  const trims = ['Base', 'S', 'SE', 'SEL', 'Limited', 'Premium', 'Sport'];

  // Categories matching MOBEX design
  const categories = [
    { name: 'Body', icon: <FiBox className="w-8 h-8" />, link: '/categories/body' },
    { name: 'Brakes', icon: <FiTool className="w-8 h-8" />, link: '/categories/brakes' },
    { name: 'Care Kit', icon: <FiSettings className="w-8 h-8" />, link: '/categories/care-kit' },
    { name: 'Damping', icon: <FiTool className="w-8 h-8" />, link: '/categories/damping' },
    { name: 'Electrics', icon: <FiZap className="w-8 h-8" />, link: '/categories/electrics' },
    { name: 'Engine', icon: <FiSettings className="w-8 h-8" />, link: '/categories/engine' },
    { name: 'Filters', icon: <FiFilter className="w-8 h-8" />, link: '/categories/filters' },
    { name: 'Interior', icon: <FiBox className="w-8 h-8" />, link: '/categories/interior' },
    { name: 'Fluids', icon: <FiDroplet className="w-8 h-8" />, link: '/categories/fluids' }
  ];

  // Featured manufacturers
  const featuredManufacturers = [
    { name: 'Audi', logo: '/brands/audi.png' },
    { name: 'Bentley', logo: '/brands/bentley.png' },
    { name: 'Chevrolet', logo: '/brands/chevrolet.png' },
    { name: 'Ford', logo: '/brands/ford.png' },
    { name: 'Infiniti', logo: '/brands/infiniti.png' },
    { name: 'Kia', logo: '/brands/kia.png' },
    { name: 'Lexus', logo: '/brands/lexus.png' },
    { name: 'Mazda', logo: '/brands/mazda.png' },
    { name: 'Mitsubishi', logo: '/brands/mitsubishi.png' },
    { name: 'Porsche', logo: '/brands/porsche.png' },
    { name: 'Toyota', logo: '/brands/toyota.png' },
    { name: 'Volvo', logo: '/brands/volvo.png' }
  ];

  // Mock product data
  const mockProducts = [
    {
      id: 1,
      name: 'FEBI BILSTEIN 31110 Engine oil',
      originalPrice: 33.31,
      price: 23.65,
      image: '/products/engine-oil.jpg',
      rating: 0,
      isSale: true,
      isNew: false
    },
    {
      id: 2,
      name: 'BOSCH 0 258 986 615 Lambda Sensor',
      originalPrice: 61.03,
      price: 43.90,
      image: '/products/lambda-sensor.jpg',
      rating: 0,
      isSale: true,
      isNew: false
    },
    {
      id: 3,
      name: 'VEMO V95-72-0029',
      originalPrice: 33.60,
      price: 23.86,
      image: '/products/vemo-sensor.jpg',
      rating: 0,
      isSale: true,
      isPopular: true
    },
    {
      id: 4,
      name: 'VDO 5WK97004Z Mass air flow',
      originalPrice: 111.90,
      price: 79.33,
      image: '/products/mass-airflow.jpg',
      rating: 0,
      isSale: true,
      isNew: true
    },
    {
      id: 5,
      name: 'RIDEX 46800075 Engine oil cooler',
      originalPrice: 75.60,
      price: 53.68,
      image: '/products/oil-cooler.jpg',
      rating: 0,
      isSale: true,
      isPopular: true
    },
    {
      id: 6,
      name: 'RIDEX 3922L0210 Lambda Sensor',
      originalPrice: 38.08,
      price: 27.04,
      image: '/products/ridex-sensor.jpg',
      rating: 0,
      isSale: true,
      isNew: true
    }
  ];

  const bestDealsProducts = [
    {
      id: 7,
      name: 'YATO YT-04382 Screwdriver Bit',
      price: 1.85,
      image: '/products/screwdriver-bit.jpg',
      rating: 0
    },
    {
      id: 8,
      name: 'VICMA Relay, start repeater',
      price: 14.36,
      image: '/products/relay.jpg',
      rating: 0,
      isPopular: true
    },
    {
      id: 9,
      name: 'VEMO V20-61-0001',
      price: 65.06,
      image: '/products/vemo-part.jpg',
      rating: 0
    },
    {
      id: 10,
      name: 'VDO 5WK97004Z Mass air flow',
      originalPrice: 111.90,
      price: 79.33,
      image: '/products/mass-airflow.jpg',
      rating: 0,
      isSale: true,
      isNew: true
    }
  ];

  useEffect(() => {
    // Mock loading delay
    setTimeout(() => {
      setFeaturedProducts(mockProducts);
      setBestDeals(bestDealsProducts);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVehicleSearch = () => {
    const params = new URLSearchParams();
    if (selectedMake) params.append('make', selectedMake);
    if (selectedModel) params.append('model', selectedModel);
    if (selectedYear) params.append('year', selectedYear);
    if (selectedEngine) params.append('engine', selectedEngine);
    if (selectedTransmission) params.append('transmission', selectedTransmission);
    if (selectedTrim) params.append('trim', selectedTrim);
    
    navigate(`/products?${params.toString()}`);
  };

  const handleVinSearch = () => {
    if (vinSearch.trim()) {
      navigate(`/products?vin=${encodeURIComponent(vinSearch.trim())}`);
    }
  };

  const ProductCard = ({ product }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-48 object-cover rounded-t-lg"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=Auto+Part';
          }}
        />
        <div className="absolute top-2 left-2 flex gap-1">
          {product.isSale && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">Sale</span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">New!</span>
          )}
          {product.isPopular && (
            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Popular</span>
          )}
        </div>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
            <FiHeart className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
            <FiRefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
            <FiEye className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <FiStar key={i} className="w-3 h-3" />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {product.originalPrice && (
              <span className="text-xs text-gray-500 line-through mr-2">
                ${product.originalPrice}
              </span>
            )}
            <span className="text-lg font-bold text-blue-600">${product.price}</span>
          </div>
        </div>
        <button className="w-full mt-3 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          Add to cart <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section with Vehicle Selector */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Find the Perfect Parts for Your Vehicle
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
              Over 300,000 genuine auto parts and accessories from trusted manufacturers
            </p>
        </div>
        
          {/* Vehicle Selector Card */}
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select your car</h2>
              <p className="text-gray-600">Find parts that fit your vehicle perfectly</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Make</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={!selectedMake}
              >
                <option value="">Model</option>
                {models.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Engine</option>
                {engines.map(engine => (
                  <option key={engine} value={engine}>{engine}</option>
                ))}
              </select>

              <select
                value={selectedTransmission}
                onChange={(e) => setSelectedTransmission(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Transmission</option>
                {transmissions.map(transmission => (
                  <option key={transmission} value={transmission}>{transmission}</option>
                ))}
              </select>

              <select
                value={selectedTrim}
                onChange={(e) => setSelectedTrim(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Trim</option>
                {trims.map(trim => (
                  <option key={trim} value={trim}>{trim}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex items-center text-gray-600 font-medium">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">OR</span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Search by VIN"
                  value={vinSearch}
                  onChange={(e) => setVinSearch(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={handleVinSearch}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <FiSearch className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleVehicleSearch}
                className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Categories */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Featured categories</h2>
            <div className="grid grid-cols-3 md:grid-cols-9 gap-6">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  to={category.link}
                className="flex flex-col items-center text-center hover:scale-105 transition-transform duration-200 group"
                >
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-3 shadow-md group-hover:shadow-lg transition-shadow">
                  <div className="text-blue-600">
                    {category.icon}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </span>
                </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured products in</h2>
            <div className="flex justify-center gap-4 mb-8">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium">
                Engine parts
              </button>
              <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors">
                Oil & Fluids
              </button>
              <button className="px-6 py-2 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition-colors">
                Suspension
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-t-lg"></div>
                  <div className="bg-white p-4 rounded-b-lg">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Promotional Banners */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Batteries Banner */}
            <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded mb-4 inline-block">Top brands</span>
                <h3 className="text-3xl font-bold mb-2">BATTERIES</h3>
                <p className="text-lg mb-4">Stay charged up!</p>
                <button className="bg-white text-orange-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Shop now →
                </button>
              </div>
              <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            </div>

            {/* Tires & Wheels Banner */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded mb-4 inline-block">Buy 3 Get 1 For Free</span>
                <h3 className="text-3xl font-bold mb-2">TIRES & WHEELS</h3>
                <p className="text-lg mb-4">Stay safe on road!</p>
                <button className="bg-white text-blue-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Shop now →
                </button>
              </div>
              <div className="absolute right-0 bottom-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mb-16"></div>
            </div>

            {/* Springs Banner */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded mb-4 inline-block">Big sale</span>
                <h3 className="text-3xl font-bold mb-2">BUY 1 GET 1</h3>
                <p className="text-lg mb-4">FREE</p>
                <button className="bg-white text-red-500 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Shop now →
                </button>
              </div>
              <div className="absolute right-0 top-1/2 w-24 h-24 bg-white opacity-10 rounded-full -mr-12 -mt-12"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Deals Section */}
      <div className="py-12 bg-gradient-to-r from-orange-400 to-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-2">Best Deals of the week!</h2>
              <div className="flex items-center gap-4 text-lg">
                <span className="bg-red-600 px-3 py-1 rounded text-white font-bold">09</span>
                <span>:</span>
                <span className="bg-red-600 px-3 py-1 rounded text-white font-bold">19</span>
                <span>:</span>
                <span className="bg-red-600 px-3 py-1 rounded text-white font-bold">58</span>
                <span>:</span>
                <span className="bg-red-600 px-3 py-1 rounded text-white font-bold">50</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-colors">
                <FiArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <button className="p-2 bg-white bg-opacity-20 rounded-full text-white hover:bg-opacity-30 transition-colors">
                <FiArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestDeals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Featured manufacturers */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Featured manufacturers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {featuredManufacturers.map((brand, index) => (
              <div key={index} className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                <img 
                  src={brand.logo} 
                  alt={brand.name}
                  className="max-h-12 max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    e.target.src = `https://via.placeholder.com/120x60?text=${brand.name}`;
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Dealers Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted Dealers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Shop with confidence from our network of verified auto parts dealers across the country
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Mock Featured Dealers */}
            {[
              {
                name: "AutoParts Pro",
                location: "New York, NY",
                rating: 4.8,
                reviews: 156,
                specialties: ["Engine Parts", "Brakes"],
                verified: true
              },
              {
                name: "Motor Solutions",
                location: "Los Angeles, CA", 
                rating: 4.9,
                reviews: 203,
                specialties: ["Suspension", "Electrical"],
                verified: true
              },
              {
                name: "Parts Express",
                location: "Chicago, IL",
                rating: 4.7,
                reviews: 89,
                specialties: ["Body Parts", "Interior"],
                verified: true
              },
              {
                name: "Quality Auto",
                location: "Houston, TX",
                rating: 4.6,
                reviews: 124,
                specialties: ["Filters", "Oil & Fluids"],
                verified: true
              }
            ].map((dealer, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex items-center mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-bold text-lg">
                      {dealer.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      {dealer.name}
                      {dealer.verified && (
                        <FiCheckCircle className="w-4 h-4 text-green-500 ml-1" />
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">{dealer.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <FiStar 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(dealer.rating) ? 'fill-current' : ''}`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {dealer.rating} ({dealer.reviews})
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {dealer.specialties.map((specialty, idx) => (
                    <span 
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
                
                <Link 
                  to="/dealers"
                  className="block w-full text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Visit Store
                </Link>
              </div>
            ))}
          </div>
          
          <div className="text-center">
                  <Link
              to="/dealers"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
              View All Dealers
              <FiArrowRight className="w-5 h-5" />
                  </Link>
          </div>
        </div>
      </div>

      {/* Service Features */}
      <div className="py-12 bg-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-white">
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Expert Service</h3>
              <p className="text-sm opacity-90">Our friendly team's on hand seven days a week</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiGift className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Amazing Value</h3>
              <p className="text-sm opacity-90">The brands you prefer, at the prices you crave</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiTruck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Fast & Free Shipping</h3>
              <p className="text-sm opacity-90">Order ships out in a snap, and delivers in 1-3 days</p>
            </div>
          <div className="text-center">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiAward className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Unbeatable Selection</h3>
              <p className="text-sm opacity-90">Everything you want for your car, all in one place</p>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Section */}
      <div className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Guides and articles</h2>
              <p className="text-gray-600 max-w-2xl">
                Articles and Guides that are written with the help of mechanics to ensure you have all the 
                knowledge you need to make the correct purchase here at Autora.
              </p>
            </div>
            <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
              Read more →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src="https://via.placeholder.com/400x250?text=Car+Sales" 
                  alt="Car sales article"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                  02 OCT
                </div>
              </div>
              <div className="p-6">
                <span className="text-sm text-blue-600 font-medium">News</span>
                <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-3">
                  The number of new cars sold over 20 years
                </h3>
                <button className="text-blue-600 font-medium hover:text-blue-700">
                  Read more →
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src="https://via.placeholder.com/400x250?text=Warning+Lights" 
                  alt="Warning lights article"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                  02 OCT
                </div>
              </div>
              <div className="p-6">
                <span className="text-sm text-blue-600 font-medium">Useful</span>
                <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-3">
                  Warning lights indicating activation of various systems
                </h3>
                <button className="text-blue-600 font-medium hover:text-blue-700">
                  Read more →
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative">
                <img 
                  src="https://via.placeholder.com/400x250?text=Engine+Oil" 
                  alt="Engine oil article"
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
                  02 OCT
                </div>
              </div>
              <div className="p-6">
                <span className="text-sm text-blue-600 font-medium">Premium</span>
                <h3 className="text-lg font-semibold text-gray-900 mt-2 mb-3">
                  What to know about changing the engine oil and oil filters
                </h3>
                <button className="text-blue-600 font-medium hover:text-blue-700">
                  Read more →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
