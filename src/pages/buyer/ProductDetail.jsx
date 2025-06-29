import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiHeart, 
  FiShoppingCart, 
  FiStar, 
  FiTruck, 
  FiShield,
  FiCheck,
  FiInfo,
  FiPackage,
  FiRefreshCw,
  FiShare2,
  FiEye,
  FiClock,
  FiAward,
  FiTag,
  FiMapPin,
  FiPhone,
  FiMail,
  FiMessageCircle,
  FiArrowLeft,
  FiChevronRight,
  FiZap,
  FiUsers,
  FiGift,
  FiZoomIn,
  FiChevronLeft
} from 'react-icons/fi';

import ProductService from '../../../shared/services/productService';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useToast } from '../../contexts/ToastContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import ProductCard from '../../components/common/ProductCard';
import VehicleCompatibility from '../../components/common/VehicleCompatibility';
import { ContentSkeleton } from '../../components/common/LoadingStates';
import OptimizedImage from '../../components/common/OptimizedImage';
import { formatPrice } from '../../utils/priceFormatter';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { success, error: showError } = useToast();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  
  const isWishlisted = product ? isInWishlist(product.id) : false;

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ProductService.getProductById(productId);
      
      if (response.success && response.product) {
        setProduct(response.product);
        
        // Load related products
        const relatedResponse = await ProductService.getProducts({
          category: response.product.category,
          limit: 4,
          exclude: productId
        });
        
        if (relatedResponse.success) {
          setRelatedProducts(relatedResponse.products || []);
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Failed to load product details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(product, quantity);
      success(`Added ${product.name} to cart!`, {
        icon: '🛒',
        action: {
          label: 'View Cart',
          onClick: () => navigate('/cart')
        }
      });
    } catch (err) {
      showError('Failed to add product to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id);
        success('Removed from wishlist');
      } else {
        await addToWishlist(product);
        success('Added to wishlist ❤️');
      }
    } catch (err) {
      showError('Failed to update wishlist');
    }
  };

  const handleShare = async () => {
    const productUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: `Check out this ${product?.name} on Autora`,
          url: productUrl
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(productUrl);
        success('Product link copied to clipboard!');
      } catch (err) {
        showError('Failed to copy link');
      }
    }
  };

  // Get product images
  const getProductImages = () => {
    if (!product) return [];
    
    const images = [];
    
    if (product.images && product.images.length > 0) {
      images.push(...product.images.map(img => img.url || img));
    } else if (product.image) {
      images.push(product.image);
    }
    
    // Add fallback if no images
    if (images.length === 0) {
      images.push('https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80');
    }
    
    return images;
  };

  const productImages = getProductImages();

  // Calculate pricing
  const finalPrice = product?.discount_price || product?.price || 0;
  const originalPrice = product?.discount_price ? product?.price : null;
  const hasDiscount = originalPrice && originalPrice > finalPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

  // Get availability info
  const getAvailabilityInfo = () => {
    if (!product) return null;
    
    const stockQty = product.stock_quantity || 0;
    
    if (stockQty > 10) {
      return {
        status: 'In Stock',
        icon: FiCheck,
        color: 'text-green-600 bg-green-50 border-green-200',
        message: 'Ready to ship'
      };
    } else if (stockQty > 0) {
      return {
        status: `Only ${stockQty} left`,
        icon: FiClock,
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        message: 'Order soon!'
      };
    } else {
      return {
        status: 'Out of Stock',
        icon: FiClock,
        color: 'text-red-600 bg-red-50 border-red-200',
        message: 'Notify when available'
      };
    }
  };

  const availability = getAvailabilityInfo();

  const renderStars = (rating, size = 'md') => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 !== 0;
    const sizeClass = size === 'lg' ? 'w-6 h-6' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <FiStar key={i} className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className={`relative ${sizeClass}`}>
            <FiStar className={`absolute ${sizeClass} text-gray-300`} />
            <div className="absolute overflow-hidden w-1/2">
              <FiStar className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <FiStar key={i} className={`${sizeClass} text-gray-300`} />
        );
      }
    }
    
    return stars;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContentSkeleton />
            <ContentSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiInfo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={loadProduct}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Shop', href: '/shop' },
              { label: product.category || 'Products', href: `/shop?category=${product.category}` },
              { label: product.name, current: true }
            ]}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Details */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Product Images */}
            <div className="relative">
              <div className="sticky top-8 p-8">
                {/* Main Image */}
                <div className="relative aspect-square bg-gray-50 rounded-2xl overflow-hidden group mb-4">
                  <OptimizedImage
                    src={productImages[selectedImageIndex]}
                    alt={product.name}
                    className={`w-full h-full object-contain transition-transform duration-300 ${
                      imageZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in group-hover:scale-105'
                    }`}
                    onClick={() => setImageZoomed(!imageZoomed)}
                  />
                  
                  {/* Image Controls */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setImageZoomed(!imageZoomed)}
                      className="absolute top-4 right-4 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    >
                      <FiZoomIn className="w-5 h-5" />
                    </button>
                    
                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex(prev => 
                            prev === 0 ? productImages.length - 1 : prev - 1
                          )}
                          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                        >
                          <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex(prev => 
                            prev === productImages.length - 1 ? 0 : prev + 1
                          )}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                        >
                          <FiChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                        {discountPercent}% OFF
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Thumbnail Images */}
                {productImages.length > 1 && (
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {productImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index 
                            ? 'border-blue-600 ring-2 ring-blue-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <OptimizedImage
                          src={image}
                          alt={`${product.name} view ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Information */}
            <div className="p-8 lg:p-12">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight mb-3">
                    {product.name}
                  </h1>
                  
                  {/* Rating & Reviews */}
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="flex items-center space-x-1">
                      <div className="flex items-center">
                        {renderStars(product.rating || 4.2)}
                      </div>
                      <span className="text-lg font-medium text-gray-900">
                        {(product.rating || 4.2).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-gray-500">•</span>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      {product.review_count || 0} reviews
                    </button>
                  </div>

                  {/* SKU & Brand */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
                    {product.sku && (
                      <span>SKU: <span className="font-mono">{product.sku}</span></span>
                    )}
                    {product.brand && (
                      <>
                        <span>•</span>
                        <span>Brand: <span className="font-medium">{product.brand}</span></span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Action Icons */}
                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={handleShare}
                    className="p-3 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FiShare2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-full transition-colors ${
                      isWishlisted 
                        ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                        : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'
                    }`}
                  >
                    <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-8">
                <div className="flex items-baseline space-x-4 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(finalPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-2xl text-gray-500 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                  )}
                </div>
                
                {hasDiscount && (
                  <div className="flex items-center space-x-3">
                    <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                      Save {discountPercent}%
                    </span>
                    <span className="text-green-600 font-semibold">
                      You save {formatPrice(originalPrice - finalPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Availability */}
              {availability && (
                <div className={`flex items-center space-x-3 px-4 py-3 rounded-xl border mb-8 ${availability.color}`}>
                  <availability.icon className="w-5 h-5" />
                  <div>
                    <span className="font-semibold">{availability.status}</span>
                    <span className="ml-2 text-sm">• {availability.message}</span>
                  </div>
                </div>
              )}

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="flex items-center text-sm text-gray-600">
                  <FiTruck className="w-4 h-4 mr-2" />
                  Free Shipping
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiShield className="w-4 h-4 mr-2" />
                  2 Year Warranty
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Easy Returns
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <FiCheck className="w-4 h-4 mr-2" />
                  Quality Guaranteed
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="space-y-6">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-medium text-gray-900">Quantity:</span>
                  <div className="flex items-center border-2 border-gray-200 rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-3 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      -
                    </button>
                    <span className="px-6 py-3 text-lg font-semibold min-w-[4rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover:bg-gray-50 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || !availability || availability.status === 'Out of Stock'}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 px-8 rounded-xl font-bold text-lg transition-colors flex items-center justify-center space-x-3"
                  >
                    {isAddingToCart ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <FiShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="bg-white rounded-3xl shadow-lg mb-12 overflow-hidden">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Overview', icon: FiInfo },
                { id: 'compatibility', label: 'Vehicle Compatibility', icon: FiPackage },
                { id: 'specifications', label: 'Specifications', icon: FiZap },
                { id: 'reviews', label: 'Reviews', icon: FiUsers }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-6 border-b-2 font-semibold text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="prose max-w-none">
                <h3 className="text-2xl font-bold mb-6">Product Description</h3>
                <p className="text-gray-700 text-lg leading-relaxed mb-8">
                  {product.description || 'High-quality auto part designed for optimal performance and reliability. Engineered to meet or exceed OEM specifications for a perfect fit and long-lasting durability.'}
                </p>
                
                {/* Key Features */}
                <div className="grid md:grid-cols-2 gap-8 mt-8">
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">Key Features</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-700">
                        <FiCheck className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        High-quality construction and materials
                      </li>
                      <li className="flex items-center text-gray-700">
                        <FiCheck className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        Easy installation with included hardware
                      </li>
                      <li className="flex items-center text-gray-700">
                        <FiCheck className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        Comprehensive manufacturer warranty
                      </li>
                      <li className="flex items-center text-gray-700">
                        <FiCheck className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                        Perfect fit guarantee for listed vehicles
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-4">What's Included</h4>
                    <ul className="space-y-3">
                      <li className="flex items-center text-gray-700">
                        <FiPackage className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                        Main product component
                      </li>
                      <li className="flex items-center text-gray-700">
                        <FiPackage className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                        Installation hardware and gaskets
                      </li>
                      <li className="flex items-center text-gray-700">
                        <FiPackage className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                        Detailed installation manual
                      </li>
                      <li className="flex items-center text-gray-700">
                        <FiPackage className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
                        Warranty registration card
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'compatibility' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Vehicle Compatibility</h3>
                {product.compatibility ? (
                  <VehicleCompatibility compatibility={product.compatibility} />
                ) : (
                  <div className="text-center py-12">
                    <FiInfo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Vehicle compatibility information is being updated.</p>
                    <p className="text-sm text-gray-400">Please check the product description or contact our support team for compatibility details.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Technical Specifications</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <span className="font-semibold text-gray-900">Brand:</span>
                      <span className="ml-3 text-gray-700">{product.brand || 'OEM Quality'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <span className="font-semibold text-gray-900">SKU:</span>
                      <span className="ml-3 text-gray-700 font-mono">{product.sku || 'N/A'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <span className="font-semibold text-gray-900">Part Number:</span>
                      <span className="ml-3 text-gray-700 font-mono">{product.part_number || 'N/A'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <span className="font-semibold text-gray-900">Category:</span>
                      <span className="ml-3 text-gray-700">{product.category || 'Auto Parts'}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-3">
                      <span className="font-semibold text-gray-900">Weight:</span>
                      <span className="ml-3 text-gray-700">{product.weight || 'Contact for details'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <span className="font-semibold text-gray-900">Dimensions:</span>
                      <span className="ml-3 text-gray-700">{product.dimensions || 'Contact for details'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <span className="font-semibold text-gray-900">Material:</span>
                      <span className="ml-3 text-gray-700">{product.material || 'Premium Quality'}</span>
                    </div>
                    <div className="border-b border-gray-200 pb-3">
                      <span className="font-semibold text-gray-900">Warranty:</span>
                      <span className="ml-3 text-gray-700">{product.warranty || '2 Years'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-2xl font-bold mb-6">Customer Reviews</h3>
                <div className="text-center py-16">
                  <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                  <h4 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h4>
                  <p className="text-gray-500 mb-6">Be the first to review this product and help other customers!</p>
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    Write a Review
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">You might also like</h2>
              <Link
                to={`/shop?category=${product.category}`}
                className="text-blue-600 hover:text-blue-700 font-semibold flex items-center group"
              >
                View all in category
                <FiChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map(relatedProduct => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  showQuickView={true}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail; 