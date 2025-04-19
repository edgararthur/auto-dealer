import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiShoppingCart, 
  FiHeart, 
  FiShare2, 
  FiCheck, 
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiTruck,
  FiShield,
  FiClock,
  FiInfo,
  FiThumbsUp,
  FiMessageSquare,
  FiMapPin
} from 'react-icons/fi';
import { 
  ProductGrid, 
  Breadcrumb, 
  Rating, 
  QuantitySelector,
  ProductSkeleton,
  EmptyState
} from '../../components/common';
import { useAuth } from '../../contexts/AuthContext';
import supabase from '../../../../shared/supabase/supabaseClient';

const ProductDetail = () => {
  const { productId } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [notification, setNotification] = useState(null);
  const [wishlistId, setWishlistId] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const { user } = useAuth();
  
  useEffect(() => {
    if (productId) {
      fetchProductDetails();
      checkIfInWishlist();
    }
  }, [productId, user?.id]);

  const fetchProductDetails = async () => {
    // Simulate fetching product details
    setTimeout(() => {
      // Mock product data
      const mockProduct = {
        id: productId,
        name: 'Premium Brake Pads Set',
        description: 'High-performance ceramic brake pads designed for optimal stopping power and minimal noise. Made with premium materials for long-lasting durability and exceptional braking performance under all driving conditions. Includes wear indicators and all hardware needed for installation.',
        price: 79.99,
        oldPrice: 99.99,
        image: 'https://example.com/images/brake-pads.jpg',
        additionalImages: [
          'https://example.com/images/brake-pads-2.jpg',
          'https://example.com/images/brake-pads-3.jpg',
          'https://example.com/images/brake-pads-4.jpg',
        ],
        category: 'Brake System',
        subcategory: 'Brake Pads',
        rating: 4.5,
        reviewCount: 127,
        inStock: true,
        sku: 'BP-12345',
        isNew: true,
        compatibleWith: [
          'Toyota Camry (2018-2022)',
          'Honda Accord (2017-2021)',
          'Nissan Altima (2019-2022)'
        ],
        specifications: [
          { name: 'Material', value: 'Ceramic' },
          { name: 'Position', value: 'Front' },
          { name: 'Pad Type', value: 'Low Dust' },
          { name: 'Includes Hardware', value: 'Yes' },
          { name: 'Wear Indicator', value: 'Yes' },
          { name: 'Warranty', value: '2 Years' }
        ],
        features: [
          'Advanced ceramic formula for superior braking performance',
          'Low-dust formulation keeps wheels cleaner',
          'Engineered for quiet operation and reduced noise',
          'Includes shims and hardware for complete installation',
          'Heat-resistant design for consistent performance'
        ],
        dealer: {
          id: 'dealer123',
          name: 'AutoPlus Parts',
          logo: 'https://example.com/images/dealer-logo.jpg'
        }
      };
      
      setProduct(mockProduct);
      setLoading(false);
      
      // Set mock related products
      setRelatedProducts([
        {
          id: 'rel1',
          name: 'Premium Brake Rotors',
          price: 119.99,
          image: 'https://example.com/images/brake-rotors.jpg',
          rating: 4.3,
          reviewCount: 89
        },
        {
          id: 'rel2',
          name: 'Brake Pad Wear Sensors',
          price: 24.99,
          image: 'https://example.com/images/wear-sensors.jpg',
          rating: 4.0,
          reviewCount: 42
        },
        {
          id: 'rel3',
          name: 'Brake Caliper Kit',
          price: 149.99,
          image: 'https://example.com/images/caliper-kit.jpg',
          rating: 4.7,
          reviewCount: 36
        },
        {
          id: 'rel4',
          name: 'Brake Fluid DOT 4',
          price: 12.99,
          image: 'https://example.com/images/brake-fluid.jpg',
          rating: 4.2,
          reviewCount: 112
        }
      ]);
    }, 1000);
  };

  const checkIfInWishlist = async () => {
    if (!user || !user.id || !productId) return;
    
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking wishlist:', error);
        return;
      }
      
      if (data) {
        setInWishlist(true);
        setWishlistId(data.id);
      } else {
        setInWishlist(false);
        setWishlistId(null);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({
      message,
      type
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    if (product.inStock && newQuantity > 10) {
      showNotification('Maximum quantity is 10', 'error');
      return;
    }
    setQuantity(newQuantity);
  };

  const handleAddToCart = () => {
    showNotification(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to your cart`);
    console.log(`Added ${quantity} of product ${product.id} to cart`);
    // Implement cart functionality
  };

  const handleAddToWishlist = async () => {
    if (!user || !user.id) {
      showNotification('Please log in to save items to your wishlist', 'error');
      return;
    }
    
    try {
      if (inWishlist) {
        // Remove from wishlist
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('id', wishlistId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        setInWishlist(false);
        setWishlistId(null);
        showNotification('Removed from your wishlist');
      } else {
        // Add to wishlist
        const { data, error } = await supabase
          .from('wishlists')
          .insert([
            { 
              user_id: user.id, 
              product_id: productId 
            }
          ])
          .select('id')
          .single();
        
        if (error) throw error;
        
        setInWishlist(true);
        setWishlistId(data.id);
        showNotification('Added to your wishlist');
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      showNotification('Failed to update wishlist', 'error');
    }
  };

  const handleQuickBuy = () => {
    showNotification('Proceeding to checkout');
    console.log(`Quick buy for product ${product.id}`);
    // Navigate to checkout
  };
  
  // Build breadcrumb items
  const breadcrumbItems = [
    {
      label: 'Shop',
      path: '/products'
    },
    {
      label: product.category,
      path: `/products?category=${encodeURIComponent(product.category)}`
    },
    {
      label: product.name,
      path: `/products/${product.id}`
    }
  ];

  // Calculate sale percentage
  const salePercentage = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;
  
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col lg:flex-row animate-pulse">
            <div className="lg:w-1/2 pr-0 lg:pr-8">
              <div className="bg-neutral-200 h-96 rounded-lg mb-4"></div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, idx) => (
                  <div key={idx} className="w-16 h-16 bg-neutral-200 rounded-md"></div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 mt-6 lg:mt-0 space-y-4">
              <div className="h-8 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
              <div className="h-10 bg-neutral-200 rounded w-1/3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-neutral-200 rounded"></div>
                <div className="h-4 bg-neutral-200 rounded"></div>
                <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
              </div>
              <div className="h-12 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-neutral-50 pb-16 min-h-screen">
      {/* Notification toast */}
      {notification && (
        <div className={`fixed top-20 right-4 z-50 flex items-center p-4 mb-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="ml-3 text-sm font-medium">{notification.message}</div>
          <button
            type="button"
            className="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
            onClick={() => setNotification(null)}
            aria-label="Close"
          >
            <FiX size={16} />
          </button>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Breadcrumb items={breadcrumbItems} />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 mb-8">
          <div className="flex flex-col lg:flex-row">
            {/* Left column - Images */}
            <div className="lg:w-1/2 pr-0 lg:pr-8">
              <div className="relative bg-neutral-100 rounded-lg overflow-hidden mb-4 h-72 md:h-96">
                <img 
                  src={selectedImage === 0 ? product.image : product.additionalImages[selectedImage - 1]} 
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
                
                {salePercentage > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                    SAVE {salePercentage}%
                  </div>
                )}
                
                {product.isNew && (
                  <div className="absolute top-4 right-4 bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded">
                    NEW
                  </div>
                )}
              </div>
            
              {/* Thumbnail gallery */}
              <div className="flex space-x-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedImage(0)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 ${selectedImage === 0 ? 'border-primary-600' : 'border-transparent'}`}
                >
                  <img
                    src={product.image} 
                    alt={`${product.name} - main`} 
                    className="w-full h-full object-cover"
                  />
                </button>
                
                {product.additionalImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(idx + 1)}
                    className={`w-16 h-16 rounded-md overflow-hidden border-2 ${selectedImage === idx + 1 ? 'border-primary-600' : 'border-transparent'}`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name} - ${idx + 1}`} 
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          
            {/* Right column - Product details */}
            <div className="lg:w-1/2 mt-6 lg:mt-0">
              <div className="flex flex-col h-full">
                {/* Dealer info */}
                <div className="mb-2">
                  <span className="text-sm text-neutral-500 flex items-center">
                    <img 
                      src={product.dealer?.logo || "https://via.placeholder.com/40x40?text=D"} 
                      alt="Dealer" 
                      className="w-5 h-5 mr-1 rounded-full" 
                    />
                    Sold by <Link to={`/dealers/${product.dealer.id}`} className="font-medium text-primary-600 hover:text-primary-700 ml-1">{product.dealer?.name}</Link>
                  </span>
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">{product.name}</h1>
                
                {/* Ratings */}
                <div className="flex items-center mb-4">
                  <Rating value={product.rating} count={product.reviewCount} />
                  <Link to="#reviews" onClick={() => setActiveTab('reviews')} className="ml-2 text-sm text-primary-600 hover:text-primary-700">
                    See all reviews
                  </Link>
                </div>
            
                {/* Price */}
                <div className="mb-6">
                  {product.oldPrice ? (
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-red-500">${product.price.toFixed(2)}</span>
                      <span className="ml-2 text-sm text-neutral-500 line-through">${product.oldPrice.toFixed(2)}</span>
                      <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">
                        SAVE ${(product.oldPrice - product.price).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-neutral-900">${product.price.toFixed(2)}</span>
                  )}
                </div>
              
                {/* Short description */}
                <div className="mb-6">
                  <p className="text-neutral-700">
                    {showFullDescription 
                      ? product.description 
                      : `${product.description.substring(0, 200)}...`
                    }
                  </p>
                  <button 
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700"
                  >
                    {showFullDescription ? 'Show less' : 'Read more'}
                  </button>
                </div>
                
                {/* Stock and SKU */}
                <div className="flex space-x-6 mb-6">
                  <div className="flex items-center">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="text-sm text-neutral-700">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                  </div>
                  <div className="text-sm text-neutral-500">
                    SKU: <span className="text-neutral-700">{product.sku}</span>
                  </div>
                </div>
                
                {/* Compatibility */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Compatible with:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.compatibleWith.map((car, idx) => (
                      <span key={idx} className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full">
                        {car}
                      </span>
                    ))}
                  </div>
                </div>
            
                {/* Quantity and add to cart */}
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                  <QuantitySelector 
                    value={quantity} 
                    onChange={handleQuantityChange} 
                    min={1} 
                    max={99} 
                    disabled={!product.inStock}
                  />
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className={`flex-1 flex items-center justify-center py-3 px-4 ${
                      product.inStock
                        ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                        : 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                    } rounded-md transition-colors`}
                  >
                    <FiShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </button>
                </div>

                {/* Buy now button */}
                {product.inStock && (
                  <button
                    onClick={handleQuickBuy}
                    className="w-full flex items-center justify-center py-3 px-4 mb-6 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                  >
                    Buy Now
                  </button>
                )}
                
                {/* Action buttons */}
                <div className="flex space-x-4 mb-6">
                  <button 
                    className={`flex items-center ${
                      inWishlist ? 'text-red-500' : 'text-neutral-600 hover:text-red-500'
                    }`}
                    onClick={handleAddToWishlist}
                  >
                    <FiHeart className="mr-1 h-4 w-4" fill={inWishlist ? 'currentColor' : 'none'} />
                    <span className="text-sm">{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                  </button>
                  <button className="flex items-center text-neutral-600 hover:text-blue-500">
                    <FiShare2 className="mr-1 h-4 w-4" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
            
                {/* Features */}
                <div className="bg-neutral-50 p-4 rounded-md mb-6">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">Key Features:</h3>
                  <ul className="space-y-1">
                    {product.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <FiCheck className="text-green-500 h-5 w-5 flex-shrink-0 mr-2" />
                        <span className="text-sm text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Shipping & Returns */}
                <div className="grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4 mt-auto">
                  <div className="flex items-start">
                    <FiTruck className="h-5 w-5 text-neutral-400 flex-shrink-0 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900">Free Shipping</h4>
                      <p className="text-xs text-neutral-500">For orders over $100</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiShield className="h-5 w-5 text-neutral-400 flex-shrink-0 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900">Warranty</h4>
                      <p className="text-xs text-neutral-500">1 year manufacturer</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiClock className="h-5 w-5 text-neutral-400 flex-shrink-0 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900">30-Day Returns</h4>
                      <p className="text-xs text-neutral-500">Hassle-free returns</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <FiInfo className="h-5 w-5 text-neutral-400 flex-shrink-0 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900">Support</h4>
                      <p className="text-xs text-neutral-500">24/7 customer service</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm mb-8 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-neutral-200 scrollbar-hide">
            <button
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'description'
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'specifications' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button
              id="reviews"
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'reviews' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviews.length})
            </button>
            <button
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap ${
                activeTab === 'dealer' 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
              onClick={() => setActiveTab('dealer')}
            >
              About Dealer
            </button>
          </div>
        
          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <h2 className="text-xl font-medium text-neutral-900 mb-4">Product Description</h2>
                <p className="text-neutral-700 mb-4">{product.description}</p>
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-neutral-900 mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {product.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <FiCheck className="text-green-500 h-5 w-5 flex-shrink-0 mr-2 mt-0.5" />
                        <span className="text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          
            {activeTab === 'specifications' && (
              <div>
                <h2 className="text-xl font-medium text-neutral-900 mb-4">Technical Specifications</h2>
                <div className="border rounded-md overflow-hidden">
                  {product.specifications.map((spec, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${idx % 2 === 0 ? 'bg-neutral-50' : 'bg-white'}`}
                    >
                      <div className="w-1/3 p-3 font-medium text-neutral-700 border-r border-neutral-200">
                        {spec.name}
                      </div>
                      <div className="w-2/3 p-3 text-neutral-700">
                        {spec.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          
            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
                  <div className="md:w-1/3">
                    <h2 className="text-xl font-medium text-neutral-900 mb-4">Customer Reviews</h2>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <div className="flex items-center mb-4">
                        <div className="mr-4">
                          <span className="text-4xl font-bold text-neutral-900">{product.rating}</span>
                          <span className="text-sm text-neutral-500"> out of 5</span>
                        </div>
                        <div>
                          <Rating value={product.rating} size={20} />
                          <p className="text-sm text-neutral-600 mt-1">{product.reviewCount} ratings</p>
                        </div>
                      </div>
                      
                      {/* Rating bars */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => {
                          // Calculate percentage (mock data)
                          const percentage = rating === 5 ? 70 : rating === 4 ? 20 : rating === 3 ? 7 : rating === 2 ? 2 : 1;
                          return (
                            <div key={rating} className="flex items-center">
                              <div className="w-10 text-sm text-neutral-600 mr-2">{rating} star</div>
                              <div className="flex-1 h-2 bg-neutral-200 rounded-full">
                                <div 
                                  className="h-2 bg-yellow-400 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="w-10 text-sm text-neutral-500 ml-2">{percentage}%</div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <button className="mt-4 px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors w-full">
                        Write a Review
                      </button>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3">
                    <div className="space-y-6">
                      {product.reviews.map((review) => (
                        <div key={review.id} className="border-b border-neutral-200 pb-6">
                          <div className="flex justify-between mb-2">
                            <h3 className="font-medium text-neutral-900">{review.user}</h3>
                            <span className="text-sm text-neutral-500">{review.date}</span>
                          </div>
                          <div className="mb-2">
                            <Rating value={review.rating} size={16} />
                          </div>
                          <p className="text-neutral-700 mb-2">{review.comment}</p>
                          <div className="flex items-center text-sm text-neutral-500">
                            <button className="hover:text-neutral-700 flex items-center">
                              <FiThumbsUp size={14} className="mr-1" />
                              <span>{review.helpful} people found this helpful</span>
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {/* Show more reviews button */}
                      {product.reviews.length > 3 && (
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                          Show more reviews
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'dealer' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="md:w-1/4 flex flex-col items-center">
                    <img 
                      src={product.dealer.logo} 
                      alt={product.dealer.name} 
                      className="w-32 h-32 rounded-full shadow-sm mb-3" 
                    />
                    <h3 className="text-lg font-medium text-neutral-900">{product.dealer.name}</h3>
                    <div className="flex items-center mt-1 mb-3">
                      <Rating value={product.dealer.rating} count={product.dealer.reviewCount} />
                    </div>
                    <span className="text-sm text-neutral-500">Member since {product.dealer.joinedDate}</span>
                    <button className="mt-4 px-4 py-2 w-full text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
                      View Store
                    </button>
                  </div>
                    
                  <div className="md:w-3/4">
                    <h2 className="text-xl font-medium text-neutral-900 mb-3">About {product.dealer.name}</h2>
                    <p className="text-neutral-700 mb-4">{product.dealer.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-neutral-50 p-4 rounded-md">
                        <h3 className="font-medium text-neutral-900 mb-2 flex items-center">
                          <FiMapPin className="mr-2 text-neutral-500" />
                          Location
                        </h3>
                        <p className="text-neutral-700">{product.dealer.location}</p>
                      </div>
                      <div className="bg-neutral-50 p-4 rounded-md">
                        <h3 className="font-medium text-neutral-900 mb-2 flex items-center">
                          <FiMessageSquare className="mr-2 text-neutral-500" />
                          Contact
                        </h3>
                        <button className="text-primary-600 hover:text-primary-700">
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      
        {/* Related Products */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Related Products</h2>
          <ProductGrid 
            products={relatedProducts}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            columns={4}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 