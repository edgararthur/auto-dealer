import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBox, FiGrid, FiSearch, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { Breadcrumb } from '../../components/common';
import ProductService from '../../../shared/services/productService';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await ProductService.getCategories();
        
        if (response.success) {
          setCategories(response.categories);
          setFilteredCategories(response.categories);
        } else {
          setError(response.error || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCategories(filtered);
    }
  }, [searchTerm, categories]);

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Categories', path: '/categories' }
  ];

  if (loading) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-6 text-neutral-600 font-medium">Loading categories...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-neutral-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
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
    <div className="bg-neutral-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary-100 rounded-full">
              <FiGrid size={32} className="text-primary-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Shop by Category
          </h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Discover our comprehensive collection of automotive parts organized by category. 
            Find exactly what you need for your vehicle with ease.
          </p>
        </div>

        {/* Search Categories */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <FiSearch className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No categories found</h3>
            <p className="text-neutral-600">
              Try adjusting your search term or browse all categories.
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Show All Categories
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-neutral-900">
                  {searchTerm ? `Search Results (${filteredCategories.length})` : 'All Categories'}
                </h2>
                <p className="text-neutral-600 mt-1">
                  {searchTerm 
                    ? `Found ${filteredCategories.length} categories matching "${searchTerm}"`
                    : `Browse through ${filteredCategories.length} categories`
                  }
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm text-neutral-600">
                <div className="flex items-center">
                  <FiBox className="mr-1" size={16} />
                  <span>{filteredCategories.length} Categories</span>
                </div>
                <div className="flex items-center">
                  <FiTrendingUp className="mr-1" size={16} />
                  <span>Premium Quality</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCategories.map((category) => (
                <div
                  key={category.id}
                  className="bg-white rounded-lg shadow-sm border border-neutral-200 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="p-6">
                    {/* Category Icon */}
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-primary-50 rounded-lg group-hover:bg-primary-100 transition-colors duration-300">
                        <FiBox size={24} className="text-primary-600" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors duration-300">
                          {category.name}
                        </h3>
                      </div>
                    </div>

                    {/* Category Description */}
                    <p className="text-neutral-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                      {category.description || 
                       `Explore our comprehensive selection of ${category.name.toLowerCase()} with guaranteed quality and competitive prices from trusted dealers.`
                      }
                    </p>

                    {/* Action Button */}
                    <Link
                      to={`/products?category=${category.id}`}
                      className="flex items-center justify-between w-full p-3 border border-primary-200 rounded-lg text-primary-600 hover:bg-primary-50 hover:border-primary-300 transition-all duration-200 group/button"
                    >
                      <span className="font-medium">Shop {category.name}</span>
                      <FiArrowRight 
                        size={16} 
                        className="group-hover/button:translate-x-1 transition-transform duration-200" 
                      />
                    </Link>
                  </div>

                  {/* Hover overlay for additional info */}
                  <div className="absolute inset-0 bg-primary-600 bg-opacity-0 group-hover:bg-opacity-5 rounded-lg transition-all duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center bg-white rounded-xl p-8 shadow-sm border border-neutral-200">
          <h3 className="text-2xl font-semibold text-neutral-900 mb-4">
            Can't find what you're looking for?
          </h3>
          <p className="text-neutral-600 mb-6 max-w-2xl mx-auto">
            Our comprehensive search can help you find specific parts across all categories, 
            or browse our featured products for popular items.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              <FiSearch className="mr-2" size={20} />
              Search All Products
            </Link>
            <Link
              to="/best-sellers"
              className="inline-flex items-center px-6 py-3 border border-neutral-300 text-base font-medium rounded-lg text-neutral-700 bg-white hover:bg-neutral-50 transition-colors duration-200"
            >
              <FiTrendingUp className="mr-2" size={20} />
              View Best Sellers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories; 