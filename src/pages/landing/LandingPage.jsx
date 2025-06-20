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
  FiShield
} from 'react-icons/fi';
import ProductService from '../../../shared/services/productService';
import RecommendationService from '../../../shared/services/recommendationService';
import { ProductCard } from '../../components/common';

const LandingPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');

  // Vehicle selector options
  const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes-Benz', 'Audi', 'Nissan'];
  const models = ['Select Model', 'Corolla', 'Camry', 'Prius', 'RAV4', 'Highlander'];
  const years = Array.from({ length: 25 }, (_, i) => new Date().getFullYear() - i);
  const engines = ['1.8L 4-Cylinder', '2.0L 4-Cylinder', '2.4L 4-Cylinder', '3.5L V6'];

  // Category data matching MOBEX design
  const categories = [
    { name: 'Body', icon: <FiBox className="w-8 h-8" />, color: 'bg-blue-100 text-blue-600', link: '/categories/body' },
    { name: 'Brakes', icon: <FiTool className="w-8 h-8" />, color: 'bg-red-100 text-red-600', link: '/categories/brakes' },
    { name: 'Care Kit', icon: <FiSettings className="w-8 h-8" />, color: 'bg-green-100 text-green-600', link: '/categories/care-kit' },
    { name: 'Damping', icon: <FiTool className="w-8 h-8" />, color: 'bg-purple-100 text-purple-600', link: '/categories/damping' },
    { name: 'Electrics', icon: <FiZap className="w-8 h-8" />, color: 'bg-yellow-100 text-yellow-600', link: '/categories/electrics' },
    { name: 'Engine', icon: <FiSettings className="w-8 h-8" />, color: 'bg-gray-100 text-gray-600', link: '/categories/engine' },
    { name: 'Filters', icon: <FiFilter className="w-8 h-8" />, color: 'bg-indigo-100 text-indigo-600', link: '/categories/filters' },
    { name: 'Interior', icon: <FiBox className="w-8 h-8" />, color: 'bg-pink-100 text-pink-600', link: '/categories/interior' },
    { name: 'Fluids', icon: <FiDroplet className="w-8 h-8" />, color: 'bg-cyan-100 text-cyan-600', link: '/categories/fluids' }
  ];

  // Brand logos (mock data)
  const featuredBrands = [
    { name: 'Toyota', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Toyota-Logo.png' },
    { name: 'Honda', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Honda-Logo.png' },
    { name: 'Ford', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Ford-Logo.png' },
    { name: 'BMW', logo: 'https://logos-world.net/wp-content/uploads/2020/04/BMW-Logo.png' },
    { name: 'Mercedes', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Mercedes-Logo.png' },
    { name: 'Audi', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Audi-Logo.png' },
    { name: 'Nissan', logo: 'https://logos-world.net/wp-content/uploads/2020/04/Nissan-Logo.png' },
    { name: 'Hyundai', logo: 'https://logos-world.net/wp-content/uploads/2021/03/Hyundai-Logo.png' }
  ];

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      
      // Get trending products
      const trendingRes = await RecommendationService.getTrendingRecommendations({ limit: 6 });
      setTrendingProducts(trendingRes);
      
      // Get featured products
      const featuredRes = await ProductService.getProducts({ limit: 12, featured: true });
      if (featuredRes.success) {
        setFeaturedProducts(featuredRes.products || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

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
    
    navigate(`/products?${params.toString()}`);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section - Vehicle Selector */}
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Select your car
            </h1>
            <p className="text-xl md:text-2xl text-blue-100">
              Over 300,000 auto parts and accessories
            </p>
        </div>
        
          {/* Vehicle Selector */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-0 text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Make</option>
                {makes.map(make => (
                  <option key={make} value={make}>{make}</option>
                ))}
              </select>

              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-0 text-gray-900 focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-3 rounded-lg border-0 text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Year</option>
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border-0 text-gray-900 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Engine</option>
                {engines.map(engine => (
                  <option key={engine} value={engine}>{engine}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center">
              <span className="text-white font-semibold">OR</span>
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <input
                  type="text"
                  placeholder="Search by VIN"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border-0 text-gray-900 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleVehicleSearch}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Search
                </button>
              </form>
          </div>
        </div>
      </div>

        {/* Category Icons */}
        <div className="relative bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-3 md:grid-cols-9 gap-6">
              {categories.map((category, index) => (
                <Link
                  key={index}
                  to={category.link}
                  className="flex flex-col items-center text-center hover:scale-105 transition-transform duration-200"
                >
                  <div className={`w-16 h-16 rounded-full ${category.color} flex items-center justify-center mb-2 shadow-lg`}>
                    {category.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Continue shopping section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Ready to find your perfect auto parts?
            </h2>
                  <Link
            to="/products"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
          >
            Browse All Products
            <FiArrowRight className="ml-2" />
                  </Link>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="bg-blue-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <FiTruck className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Fast Shipping</h3>
              <p className="text-blue-100">Free delivery on orders over GH₵200</p>
            </div>
            <div className="flex flex-col items-center">
              <FiShield className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure Payment</h3>
              <p className="text-blue-100">Your payment information is safe</p>
            </div>
            <div className="flex flex-col items-center">
              <FiStar className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Quality Parts</h3>
              <p className="text-blue-100">Only genuine and high-quality parts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
