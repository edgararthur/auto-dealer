import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  FiX, 
  FiShoppingCart, 
  FiHeart, 
  FiShare2, 
  FiStar,
  FiTruck,
  FiShield,
  FiInfo,
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn
} from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import ProductService from '../../../shared/services/productService';
import VehicleCompatibilityChecker from './VehicleCompatibilityChecker';
import { OptimizedImage } from '../common';
import { MagnifyGalleryImage } from '../common/MagnifyImage';

/**
 * Modal-based Product Detail Component
 * Opens as overlay while maintaining URL routing
 */
const ProductModal = ({ 
  productId, 
  isOpen, 
  onClose, 
  selectedVehicle = null 
}) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [relatedProducts, setRelatedProducts] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();

  // Fetch product data when modal opens
  useEffect(() => {
    if (isOpen && productId) {
      fetchProductData();
    }
  }, [isOpen, productId]);

  // Handle URL changes for modal state
  useEffect(() => {
    if (isOpen && productId) {
      // Update URL without triggering navigation
      const newUrl = `/products/${productId}`;
      if (location.pathname !== newUrl) {
        window.history.pushState(null, '', newUrl);
      }
    }
  }, [isOpen, productId, location.pathname]);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen, onClose]);

  const fetchProductData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ProductService.getProductById(productId);
      if (response.success && response.product) {
        setProduct(response.product);
        
        // Set default variant if available
        if (response.product.variants && response.product.variants.length > 0) {
          setSelectedVariant(response.product.variants[0]);
        }
        
        // Fetch related products
        const relatedResponse = await ProductService.getProducts({
          categoryId: response.product.category?.id,
          limit: 4,
          exclude: [productId]
        });
        
        if (relatedResponse.success) {
          setRelatedProducts(relatedResponse.products || []);
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      setError('Failed to load product details');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Navigate back to previous URL
    window.history.back();
    onClose();
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity, {
        dealerId: product.dealer?.id,
        price: selectedVariant?.price || product.price,
        variant: selectedVariant
      });
    }
  };

  const handleAddToWishlist = () => {
    if (product) {
      addToWishlist(product.id);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.short_description,
          url: window.location.href
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const productImages = product?.product_images?.length > 0 
    ? product.product_images.map(img => img.url)
    : [product?.image || 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=350&q=80'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-luxury max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:bg-neutral-100 transition-colors"
          >
            <FiX size={20} />
          </button>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-error-600 mb-4">{error}</p>
                <button
                  onClick={fetchProductData}
                  className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : product ? (
            <div className="overflow-y-auto max-h-[90vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
                {/* Left Column - Images */}
                <div className="space-y-4">
                  {/* Main Image with Magnify Effect */}
                  <div className="relative bg-neutral-50 rounded-lg overflow-hidden aspect-square">
                    <MagnifyGalleryImage
                      src={productImages[selectedImage]}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      width={500}
                      height={500}
                      zoomLevel={3}
                      lensSize={120}
                      zoomWindowSize={400}
                      borderRadius={8}
                    />
                    
                    {/* Image Navigation */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : productImages.length - 1)}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-neutral-100 transition-colors"
                        >
                          <FiChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() => setSelectedImage(selectedImage < productImages.length - 1 ? selectedImage + 1 : 0)}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-neutral-100 transition-colors"
                        >
                          <FiChevronRight size={20} />
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
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImage === index ? 'border-primary-600' : 'border-neutral-200'
                          }`}
                        >
                          <OptimizedImage
                            src={image}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Product Info */}
                <div className="space-y-6">
                  {/* Product Title and Rating */}
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">{product.name}</h1>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.rating || 4) ? 'text-accent-500 fill-current' : 'text-neutral-300'}`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-neutral-600">
                          ({product.reviewCount || 0} reviews)
                        </span>
                      </div>
                      <span className="text-sm text-blue-600 font-medium">
                        Sold by: {product.dealer ?
                          (product.dealer.business_name || product.dealer.company_name || product.dealer.name || 'Verified Dealer')
                          : 'Marketplace Seller'
                        }
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl font-bold text-primary-600">
                      ${selectedVariant?.price || product.price}
                    </span>
                    {product.oldPrice && (
                      <span className="text-lg text-neutral-500 line-through">
                        ${product.oldPrice}
                      </span>
                    )}
                    {product.discount && (
                      <span className="bg-accent-500 text-white px-2 py-1 rounded text-sm font-medium">
                        {product.discount}% OFF
                      </span>
                    )}
                  </div>

                  {/* Vehicle Compatibility */}
                  {selectedVehicle && (
                    <VehicleCompatibilityChecker
                      productId={product.id}
                      selectedVehicle={selectedVehicle}
                    />
                  )}

                  {/* Short Description */}
                  {product.short_description && (
                    <p className="text-neutral-700">{product.short_description}</p>
                  )}

                  {/* Variants */}
                  {product.variants && product.variants.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900 mb-2">Options</h4>
                      <div className="flex flex-wrap gap-2">
                        {product.variants.map((variant, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedVariant(variant)}
                            className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                              selectedVariant?.id === variant.id
                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                : 'border-neutral-200 hover:border-neutral-300'
                            }`}
                          >
                            {variant.name} - ${variant.price}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity and Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Quantity
                        </label>
                        <select
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value))}
                          className="border border-neutral-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex-1">
                        <div className="text-sm text-neutral-600 mb-1">
                          {product.stock_quantity > 0 ? (
                            <span className="text-success-600">✓ In Stock ({product.stock_quantity} available)</span>
                          ) : (
                            <span className="text-error-600">✗ Out of Stock</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button
                        onClick={handleAddToCart}
                        disabled={product.stock_quantity === 0}
                        className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        <FiShoppingCart className="mr-2" size={18} />
                        Add to Cart
                      </button>
                      
                      <button
                        onClick={handleAddToWishlist}
                        className={`p-3 rounded-lg border transition-colors ${
                          isInWishlist(product.id)
                            ? 'border-error-300 bg-error-50 text-error-600'
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        <FiHeart size={18} />
                      </button>
                      
                      <button
                        onClick={handleShare}
                        className="p-3 rounded-lg border border-neutral-300 hover:border-neutral-400 transition-colors"
                      >
                        <FiShare2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Product Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
                    <div className="flex items-center space-x-2 text-sm text-neutral-600">
                      <FiTruck className="text-primary-600" size={16} />
                      <span>Free Shipping</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-neutral-600">
                      <FiShield className="text-primary-600" size={16} />
                      <span>Warranty Included</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-neutral-600">
                      <FiInfo className="text-primary-600" size={16} />
                      <span>Expert Support</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Details Tabs */}
              <div className="border-t border-neutral-200 p-6">
                <div className="space-y-6">
                  {/* Description */}
                  {product.description && (
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-3">Description</h3>
                      <div className="prose prose-sm max-w-none text-neutral-700">
                        {product.description}
                      </div>
                    </div>
                  )}

                  {/* Specifications */}
                  {product.specifications && (
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-3">Specifications</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(product.specifications).map(([key, value]) => (
                          <div key={key} className="flex justify-between py-2 border-b border-neutral-100">
                            <span className="font-medium text-neutral-700">{key}:</span>
                            <span className="text-neutral-600">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Compatibility */}
                  {product.compatibility && (
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-3">Vehicle Compatibility</h3>
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <p className="text-sm text-neutral-700">{product.compatibility}</p>
                      </div>
                    </div>
                  )}

                  {/* Dealer Information */}
                  {product.dealer && (
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-3">Sold By</h3>
                      <div className="bg-neutral-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              {product.dealer.business_name || product.dealer.name}
                            </h4>
                            {product.dealer.city && product.dealer.state && (
                              <p className="text-sm text-neutral-600">
                                {product.dealer.city}, {product.dealer.state}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <FiStar
                                  key={i}
                                  className={`w-4 h-4 ${i < 4 ? 'text-accent-500 fill-current' : 'text-neutral-300'}`}
                                />
                              ))}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">Trusted Dealer</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <div className="border-t border-neutral-200 p-6">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Related Products</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {relatedProducts.map((relatedProduct) => (
                      <div key={relatedProduct.id} className="bg-white border border-neutral-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-neutral-50 rounded-lg mb-2 overflow-hidden">
                          <OptimizedImage
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h4 className="text-sm font-medium text-neutral-900 line-clamp-2 mb-1">
                          {relatedProduct.name}
                        </h4>
                        <p className="text-sm font-bold text-primary-600">
                          ${relatedProduct.price}
                        </p>
                        <button
                          onClick={() => {
                            // Close current modal and open new one
                            onClose();
                            setTimeout(() => {
                              navigate(`/products/${relatedProduct.id}`);
                            }, 100);
                          }}
                          className="w-full mt-2 text-xs bg-primary-600 text-white py-1 rounded hover:bg-primary-700 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
