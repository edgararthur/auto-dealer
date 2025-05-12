import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiFilter, FiShoppingCart, FiChevronRight, FiBox, FiStar, FiLayers } from 'react-icons/fi';
import Breadcrumb from '../../components/common/Breadcrumb';

// Import mock data from CategoryPage
const categories = [
  {
    name: 'Engine Parts',
    icon: <FiBox />,
    subcategories: ['Oil Filters', 'Air Filters', 'Spark Plugs', 'Fuel Pumps'],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80',
    description: 'Discover high-quality engine parts designed for optimal performance and durability for your vehicle.'
  },
  {
    name: 'Brakes & Suspension',
    icon: <FiBox />,
    subcategories: ['Brake Pads', 'Shock Absorbers', 'Coil Springs', 'Struts'],
    image: 'https://images.unsplash.com/photo-1588169770457-8bfc2de92556?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80',
    description: 'Premium braking and suspension components that provide safety, control, and a smooth ride.'
  },
  {
    name: 'Lighting & Electrical',
    icon: <FiBox />,
    subcategories: ['Headlights', 'Taillights', 'Batteries', 'Alternators'],
    image: 'https://images.unsplash.com/photo-1519642751034-765dfdf7c58e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80',
    description: 'Upgrade your vehicle with our range of lighting solutions and electrical components for enhanced visibility and performance.'
  },
  {
    name: 'Interior Accessories',
    icon: <FiBox />,
    subcategories: ['Floor Mats', 'Seat Covers', 'Steering Wheels', 'Dashboard Accessories'],
    image: 'https://images.unsplash.com/photo-1547038577-da80abbc4f19?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=500&q=80',
    description: 'Enhance your driving experience with our stylish and functional interior accessories.'
  }
];

// Mock products data based on categories
const mockProducts = [
  // Engine Parts
  {
    id: 101,
    name: 'Premium Oil Filter',
    category: 'Engine Parts',
    subcategory: 'Oil Filters',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1635270364846-5e3190b48026?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 125,
    brand: 'Bosch'
  },
  {
    id: 102,
    name: 'High-Flow Air Filter',
    category: 'Engine Parts',
    subcategory: 'Air Filters',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 97,
    brand: 'K&N'
  },
  {
    id: 103,
    name: 'Iridium Spark Plugs (Set of 4)',
    category: 'Engine Parts',
    subcategory: 'Spark Plugs',
    price: 32.99,
    image: 'https://images.unsplash.com/photo-1563299796-17596ed6b017?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 213,
    brand: 'NGK'
  },
  {
    id: 104,
    name: 'Electric Fuel Pump Assembly',
    category: 'Engine Parts',
    subcategory: 'Fuel Pumps',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1590759668628-05b0fc3b8cbc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.6,
    reviewCount: 78,
    brand: 'Denso'
  },

  // Brakes & Suspension
  {
    id: 201,
    name: 'Ceramic Brake Pads (Front Set)',
    category: 'Brakes & Suspension',
    subcategory: 'Brake Pads',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1588169770457-8bfc2de92556?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 182,
    brand: 'Brembo'
  },
  {
    id: 202,
    name: 'Gas-Charged Shock Absorbers (Pair)',
    category: 'Brakes & Suspension',
    subcategory: 'Shock Absorbers',
    price: 119.99,
    image: 'https://images.unsplash.com/photo-1482575832494-771f74bf6857?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 95,
    brand: 'Bilstein'
  },
  {
    id: 203,
    name: 'Performance Coil Springs (Set of 4)',
    category: 'Brakes & Suspension',
    subcategory: 'Coil Springs',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1600623586346-47f5219f1f4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 67,
    brand: 'Eibach'
  },
  {
    id: 204,
    name: 'Quick-Install Strut Assembly',
    category: 'Brakes & Suspension',
    subcategory: 'Struts',
    price: 159.99,
    image: 'https://images.unsplash.com/photo-1504222490345-c075b6008014?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.6,
    reviewCount: 113,
    brand: 'Monroe'
  },

  // Lighting & Electrical
  {
    id: 301,
    name: 'LED Headlight Conversion Kit',
    category: 'Lighting & Electrical',
    subcategory: 'Headlights',
    price: 129.99,
    image: 'https://images.unsplash.com/photo-1519642751034-765dfdf7c58e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 156,
    brand: 'PIAA'
  },
  {
    id: 302,
    name: 'Sequential LED Tail Lights',
    category: 'Lighting & Electrical',
    subcategory: 'Taillights',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1621285853634-713b8d701a33?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 87,
    brand: 'Spyder'
  },
  {
    id: 303,
    name: 'AGM Performance Battery',
    category: 'Lighting & Electrical',
    subcategory: 'Batteries',
    price: 169.99,
    image: 'https://images.unsplash.com/photo-1565689157206-0fddef7589a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 228,
    brand: 'Optima'
  },
  {
    id: 304,
    name: 'High Output Alternator (180A)',
    category: 'Lighting & Electrical',
    subcategory: 'Alternators',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.6,
    reviewCount: 73,
    brand: 'Denso'
  },

  // Interior Accessories
  {
    id: 401,
    name: 'All-Weather Floor Mats (Set of 4)',
    category: 'Interior Accessories',
    subcategory: 'Floor Mats',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1582639510494-c80b5de9f148?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.9,
    reviewCount: 315,
    brand: 'WeatherTech'
  },
  {
    id: 402,
    name: 'Premium Leather Seat Covers',
    category: 'Interior Accessories',
    subcategory: 'Seat Covers',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1603811478698-7844d66faf0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.7,
    reviewCount: 126,
    brand: 'Covercraft'
  },
  {
    id: 403,
    name: 'Sport Leather Steering Wheel Cover',
    category: 'Interior Accessories',
    subcategory: 'Steering Wheels',
    price: 39.99,
    image: 'https://images.unsplash.com/photo-1547038577-da80abbc4f19?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.6,
    reviewCount: 84,
    brand: 'Momo'
  },
  {
    id: 404,
    name: 'Digital Dashboard Display System',
    category: 'Interior Accessories',
    subcategory: 'Dashboard Accessories',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1494905998402-395d579af36f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80',
    rating: 4.8,
    reviewCount: 58,
    brand: 'AutoGauge'
  }
];

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-card hover:shadow-luxury transition-all duration-300 overflow-hidden group border border-neutral-100 relative">
      {/* Product image */}
      <Link to={`/products/${product.id}`} className="block overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 via-neutral-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>
      
      {/* Product info */}
      <div className="p-5 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-primary-50/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        
        <div className="text-xs text-neutral-500 mb-2 flex items-center">
          <span className="font-medium text-primary-600">{product.subcategory}</span>
          <span className="mx-2 text-neutral-300">•</span>
          <span className="font-medium text-neutral-700">{product.brand}</span>
        </div>
        
        <Link to={`/products/${product.id}`} className="block mb-3">
          <h3 className="text-sm font-bold text-neutral-800 hover:text-primary-600 line-clamp-2 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-gold-400' : 'text-neutral-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="ml-1.5 text-xs text-neutral-500">({product.reviewCount})</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-neutral-900">${product.price.toFixed(2)}</span>
          
          <button
            onClick={() => onAddToCart(product.id)}
            className="p-2.5 rounded-full bg-neutral-100 text-primary-600 hover:bg-primary-100 transition-colors duration-200 hover:shadow-inner"
            aria-label="Add to cart"
          >
            <FiShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const SubcategoryPage = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);

  useEffect(() => {
    // Find the category from the slug
    const formattedCategorySlug = categorySlug.replace(/-/g, ' ');
    const foundCategory = categories.find(
      cat => cat.name.toLowerCase() === formattedCategorySlug.toLowerCase()
    );

    if (foundCategory) {
      setCategory(foundCategory);
      
      // Format subcategory slug for comparison
      const formattedSubcategorySlug = subcategorySlug.replace(/-/g, ' ');
      
      // Find the subcategory
      const foundSubcategory = foundCategory.subcategories.find(
        sub => sub.toLowerCase() === formattedSubcategorySlug.toLowerCase()
      );
      
      if (foundSubcategory) {
        setSubcategory(foundSubcategory);
        
        // Filter products for this category and subcategory
        const filteredProducts = mockProducts.filter(
          product => 
            product.category.toLowerCase() === foundCategory.name.toLowerCase() &&
            product.subcategory.toLowerCase() === foundSubcategory.toLowerCase()
        );
        
        setProducts(filteredProducts);
      }
    }
  }, [categorySlug, subcategorySlug]);

  const handleAddToCart = (productId) => {
    // In a real implementation, this would add the item to the cart
    console.log(`Added product ${productId} to cart`);
  };

  // If no category or subcategory found, display not found
  if (!category || !subcategory) {
    return (
      <div className="bg-neutral-50 min-h-screen py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-neutral-800 mb-4">Subcategory not found</h1>
          <p className="text-neutral-600 mb-6">The subcategory you are looking for does not exist.</p>
          <Link to="/" className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen pb-16">
      {/* Page header */}
      <div className="bg-gradient-luxury pt-10 pb-12 px-4 sm:px-6 lg:px-8 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-no-repeat bg-cover bg-center" style={{backgroundImage: `url(${category.image})`}}></div>
        </div>
        
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary-900/40 via-primary-800/20 to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-radial from-primary-500/20 to-transparent opacity-70"></div>
        
        <div className="absolute bottom-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto opacity-10">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L34.3,106.7C68.6,117,137,139,206,149.3C274.3,160,343,160,411,149.3C480,139,549,117,617,112C685.7,107,754,117,823,138.7C891.4,160,960,192,1029,197.3C1097.1,203,1166,181,1234,160C1302.9,139,1371,117,1406,106.7L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"></path>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <Breadcrumb
            items={[
              { label: 'Home', path: '/' },
              { label: category.name, path: `/category/${categorySlug}` },
              { label: subcategory, path: `/category/${categorySlug}/${subcategorySlug}` }
            ]}
          />
          
          <div className="mt-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white font-display mb-3">{subcategory}</h1>
            <p className="text-neutral-200 max-w-2xl">
              Quality {subcategory} for your vehicle. Explore our selection of premium parts and accessories.
            </p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results count */}
        <div className="mb-6 flex items-center text-sm text-neutral-600 bg-white px-4 py-2.5 rounded-lg shadow-sm border border-neutral-200">
          <FiLayers className="mr-2 text-gold-500" size={16} />
          <span>Showing <span className="font-semibold text-primary-700">{products.length}</span> products in {subcategory}</span>
        </div>
        
        {/* Product grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-luxury p-8 text-center border border-neutral-100">
            <div className="w-16 h-16 mx-auto mb-4 bg-neutral-100 rounded-full flex items-center justify-center">
              <FiBox className="text-neutral-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No products found</h3>
            <p className="text-neutral-600 mb-4">We couldn't find any products in this subcategory.</p>
            <Link 
              to={`/category/${categorySlug}`}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors inline-block"
            >
              View all {category.name}
            </Link>
          </div>
        )}
        
        {/* Recommended products section */}
        {products.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 font-display">Related Products</h2>
              <Link 
                to={`/category/${categorySlug}`}
                className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center"
              >
                View all {category.name}
                <FiChevronRight className="ml-1" size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {mockProducts
                .filter(product => 
                  product.category.toLowerCase() === category.name.toLowerCase() && 
                  product.subcategory.toLowerCase() !== subcategory.toLowerCase()
                )
                .slice(0, 4)
                .map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))
              }
            </div>
          </div>
        )}
        
        {/* Technical information */}
        <div className="mt-16 bg-white rounded-lg shadow-card p-8 border border-neutral-100">
          <h2 className="text-xl font-bold text-neutral-800 mb-4 font-display">About {subcategory}</h2>
          <div className="prose max-w-none text-neutral-700">
            <p>
              Our {subcategory} are designed to provide optimal performance and durability for your vehicle. 
              We source products from leading manufacturers to ensure you get the best quality parts for your car.
            </p>
            <p>
              When selecting {subcategory}, consider factors like your vehicle's make and model, your driving habits, 
              and the specific performance characteristics you're looking for.
            </p>
            <p>
              Regular maintenance and timely replacement of {subcategory} can significantly improve your vehicle's 
              performance, efficiency, and longevity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubcategoryPage; 