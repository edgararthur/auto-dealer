import React, { useState, useEffect } from 'react';
import { 
  FiX, 
  FiShoppingCart, 
  FiHeart, 
  FiBarChart2, 
  FiStar,
  FiShield,
  FiTruck,
  FiRotateCcw,
  FiZoomIn,
  FiChevronLeft,
  FiChevronRight,
  FiShare2,
  FiExternalLink,
  FiCheck,
  FiInfo,
  FiClock,
  FiMapPin,
  FiAward,
  FiPackage
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ProductService from '../../../shared/services/productService';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { useToast } from '../../contexts/ToastContext';
import OptimizedImage from '../common/OptimizedImage';
import { MagnifyGalleryImage } from '../common/MagnifyImage';
import VehicleCompatibility from '../common/VehicleCompatibility';
import { formatPrice } from '../../utils/priceFormatter';

const ProductQuickView = ({ 
  productId, 
  isOpen, 
  onClose 
}) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');

  const [addingToCart, setAddingToCart] = useState(false);
  
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToComparison, isInComparison } = useComparison();
  const { success, error: showError } = useToast();
  
  const isWishlisted = product ? isInWishlist(product.id) : false;
  const isInComparisonList = product ? isInComparison(product.id) : false;

  // Fetch product data
  useEffect(() => {
    if (isOpen && productId) {
      fetchProduct();
    }
  }, [isOpen, productId]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ProductService.getProductById(productId);
      
      if (response.success && response.product) {
        setProduct(response.product);
        setSelectedImageIndex(0);
        setQuantity(1);
        setActiveTab('overview');
      } else {
        setError(response.error || 'Product not found');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || addingToCart) return;
    
    setAddingToCart(true);
    try {
      await addToCart(product, quantity);
      success(`Added ${product.name} to cart!`, {
        action: {
          label: 'View Cart',
          onClick: () => {
            onClose();
            window.location.href = '/cart';
          }
        }
      });
    } catch (err) {
      showError('Failed to add product to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
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

  const handleAddToComparison = async () => {
    if (!product) return;
    
    try {
      if (isInComparisonList) {
        success('Removed from comparison');
      } else {
        await addToComparison(product);
        success('Added to comparison');
      }
    } catch (err) {
      showError('Failed to update comparison');
    }
  };

  const handleShare = async () => {
    const productUrl = `${window.location.origin}/products/${productId}`;
    
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
    
    if (product.images && product.images.length > 0) {
      return product.images.map(img => img.url || img);
    }
    
    if (product.image) {
      return [product.image];
    }
    
    return ['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80'];
  };

  const productImages = getProductImages();

  // Calculate pricing
  const finalPrice = product?.discount_price || product?.price || 0;
  const originalPrice = product?.discount_price ? product?.price : null;
  const hasDiscount = originalPrice && originalPrice > finalPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

  // Get availability status
  const getAvailabilityStatus = () => {
    if (!product) return null;
    
    const stockQty = product.stock_quantity || 0;
    
    if (stockQty > 10) {
      return {
        status: 'In Stock',
        color: 'text-green-600 bg-green-50',
        icon: FiCheck,
        message: 'Ready to ship'
      };
    } else if (stockQty > 0) {
      return {
        status: `Only ${stockQty} left`,
        color: 'text-orange-600 bg-orange-50', 
        icon: FiClock,
        message: 'Order soon!'
      };
    } else {
      return {
        status: 'Out of Stock',
        color: 'text-red-600 bg-red-50',
        icon: FiClock,
        message: 'Currently unavailable'
      };
    }
  };

  const availabilityStatus = getAvailabilityStatus();

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating || 4) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <FiPackage className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="Share Product"
              >
                <FiShare2 className="w-5 h-5" />
              </button>
              
              <Link
                to={`/products/${productId}`}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                title="View Full Details"
                onClick={onClose}
              >
                <FiExternalLink className="w-5 h-5" />
              </Link>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading product details...</p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <FiInfo className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <p className="text-red-600 mb-4">{error}</p>
                  <button 
                    onClick={fetchProduct}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : product ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                {/* Left Column - Images */}
                <div className="space-y-4">
                  {/* Main Image with Magnify Effect */}
                  <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden group">
                    <MagnifyGalleryImage
                      src={productImages[selectedImageIndex]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      width={450}
                      height={450}
                      zoomLevel={2.8}
                      lensSize={110}
                      zoomWindowSize={350}
                      borderRadius={12}
                    />


                    {hasDiscount && (
                      <div className="absolute top-4 left-4">
                        <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          {discountPercent}% OFF
                        </span>
                      </div>
                    )}

                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImageIndex(prev => 
                            prev === 0 ? productImages.length - 1 : prev - 1
                          )}
                          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setSelectedImageIndex(prev => 
                            prev === productImages.length - 1 ? 0 : prev + 1
                          )}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Thumbnail Images */}
                  {productImages.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {productImages.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                            selectedImageIndex === index ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
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

                {/* Right Column - Product Info */}
                <div className="space-y-6">
                  {/* Product Title & Basic Info */}
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                      <button
                        onClick={handleToggleWishlist}
                        className={`p-2 rounded-full transition-colors ${
                          isWishlisted 
                            ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                            : 'text-gray-400 hover:text-red-600 hover:bg-gray-100'
                        }`}
                      >
                        <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <div className="flex items-center">
                          {renderStars(product.rating)}
                        </div>
                        <span>({product.review_count || 0} reviews)</span>
                      </div>
                      {product.dealer && (product.dealer.company_name || product.dealer.business_name || product.dealer.name) && (
                        <span className="text-blue-600 font-medium">
                          Sold by: {product.dealer.company_name || product.dealer.business_name || product.dealer.name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex items-baseline space-x-3">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(finalPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-lg text-gray-500 line-through">
                          {formatPrice(originalPrice)}
                        </span>
                      )}
                    </div>
                    {hasDiscount && (
                      <div className="flex items-center space-x-2">
                        <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                          Save {discountPercent}%
                        </span>
                        <span className="text-sm text-green-600 font-medium">
                          You save {formatPrice(originalPrice - finalPrice)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Availability */}
                  {availabilityStatus && (
                    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${availabilityStatus.color}`}>
                      <availabilityStatus.icon className="w-4 h-4" />
                      <span className="font-medium">{availabilityStatus.status}</span>
                      <span className="text-sm">• {availabilityStatus.message}</span>
                    </div>
                  )}

                  {/* Key Features */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <FiTruck className="w-4 h-4 text-blue-600" />
                      <span>Free Shipping</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <FiShield className="w-4 h-4 text-green-600" />
                      <span>2 Year Warranty</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <FiRotateCcw className="w-4 h-4 text-purple-600" />
                      <span>Easy Returns</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-700">
                      <FiAward className="w-4 h-4 text-yellow-600" />
                      <span>Quality Guaranteed</span>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200">
                    <div className="flex space-x-6">
                      {[
                        { id: 'overview', label: 'Overview' },
                        { id: 'compatibility', label: 'Compatibility' },
                        { id: 'specifications', label: 'Specifications' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.id
                              ? 'border-blue-600 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content */}
                  <div className="min-h-[120px]">
                    {activeTab === 'overview' && (
                      <div className="space-y-3">
                        <p className="text-gray-700 leading-relaxed">
                          {product.description || 'High-quality auto part designed for optimal performance and reliability.'}
                        </p>
                        
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Brand:</span>
                            <span className="font-medium">{product.brand || 'OEM'}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Category:</span>
                            <span className="font-medium">{product.category || 'Auto Parts'}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Dealer:</span>
                            <span className="font-medium text-blue-600">
                              {product.dealer ?
                                (product.dealer.company_name || product.dealer.business_name || product.dealer.name || 'Verified Dealer')
                                : 'Marketplace Seller'
                              }
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-2">
                            <span className="text-gray-600">Part Number:</span>
                            <span className="font-medium font-mono text-sm">{product.part_number || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'compatibility' && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Vehicle Compatibility</h4>
                        {product.compatibility ? (
                          <VehicleCompatibility 
                            compatibility={product.compatibility}
                            compact={true}
                          />
                        ) : (
                          <p className="text-gray-500 text-sm">Compatibility information not available. Please check product description or contact seller.</p>
                        )}
                      </div>
                    )}

                    {activeTab === 'specifications' && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Technical Specifications</h4>
                        {product.specifications ? (
                          <div className="space-y-2 text-sm">
                            {Object.entries(product.specifications).map(([key, value]) => (
                              <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}</span>
                                <span className="font-medium">{value}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Detailed specifications not available.</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Quantity & Actions */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-gray-700">Quantity:</span>
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                          className="p-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">{quantity}</span>
                        <button
                          onClick={() => setQuantity(quantity + 1)}
                          className="p-2 hover:bg-gray-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart || !availabilityStatus || availabilityStatus.status === 'Out of Stock'}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                      >
                        {addingToCart ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <>
                            <FiShoppingCart className="w-4 h-4" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleToggleWishlist}
                          className={`py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 border ${
                            isWishlisted
                              ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <FiHeart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                          <span className="text-sm">{isWishlisted ? 'Saved' : 'Save'}</span>
                        </button>

                        <button
                          onClick={handleAddToComparison}
                          className={`py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 border ${
                            isInComparisonList
                              ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <FiBarChart2 className="w-4 h-4" />
                          <span className="text-sm">Compare</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dealer Info */}
                  {product.dealer && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {product.dealer.company_name || product.dealer.business_name || product.dealer.name || 'Verified Dealer'}
                            </h4>
                            {product.dealer.verified && (
                              <div className="flex items-center space-x-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                                <FiAward className="w-3 h-3" />
                                <span>Verified</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <div className="flex items-center">
                                {renderStars(product.dealer.rating || 4.5)}
                              </div>
                              <span>({(product.dealer.rating || 4.5).toFixed(1)})</span>
                            </div>
                            
                            {product.dealer.location && (
                              <div className="flex items-center space-x-1">
                                <FiMapPin className="w-3 h-3" />
                                <span>{product.dealer.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Link
                          to={`/dealers/${product.dealer.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View Store
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <FiInfo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Product not found</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView; 