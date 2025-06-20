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
  FiExternalLink
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import ProductService from '../../../shared/services/productService';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { Rating, Button, QuantitySelector } from '../common';

const ProductQuickView = ({ 
  productId, 
  isOpen, 
  onClose,
  onAddToCart,
  onAddToWishlist,
  onAddToComparison 
}) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist } = useWishlist();
  const { addToComparison, isInComparison } = useComparison();

  // Fetch product data
  useEffect(() => {
    if (isOpen && productId) {
      fetchProduct();
    }
  }, [isOpen, productId]);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ProductService.getProductById(productId);
      
      if (response.success) {
        setProduct(response.product);
        setSelectedImage(0);
        setQuantity(1);
        setSelectedVariant(null);
      } else {
        setError(response.error || 'Failed to load product');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle actions
  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(productId, quantity, selectedVariant);
    } else {
      addToCart(productId, quantity, { 
        dealerId: product?.dealer?.id,
        price: product?.price,
        variant: selectedVariant
      });
    }
  };

  const handleAddToWishlist = () => {
    if (onAddToWishlist) {
      onAddToWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  const handleAddToComparison = () => {
    if (onAddToComparison) {
      onAddToComparison(productId);
    } else {
      addToComparison(productId);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: `Check out this ${product?.name} on Autora`,
        url: `${window.location.origin}/products/${productId}`
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/products/${productId}`);
      alert('Product link copied to clipboard!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <FiX size={20} />
          </button>

          {loading ? (
            <div className="flex items-center justify-center h-96">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={fetchProduct} variant="primary">
                  Try Again
                </Button>
              </div>
            </div>
          ) : product ? (
            <div className="flex flex-col lg:flex-row max-h-[90vh] overflow-y-auto">
              {/* Product Images */}
              <div className="lg:w-1/2 p-6">
                <div className="relative">
                  {/* Main image */}
                  <div className="relative mb-4 bg-neutral-50 rounded-lg overflow-hidden">
                    <img
                      src={product.images?.[selectedImage]?.url || product.image || 'https://via.placeholder.com/500'}
                      alt={product.name}
                      className={`w-full h-96 object-contain transition-transform duration-300 ${
                        isImageZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'
                      }`}
                      onClick={() => setIsImageZoomed(!isImageZoomed)}
                    />
                    
                    {/* Zoom indicator */}
                    <button
                      onClick={() => setIsImageZoomed(!isImageZoomed)}
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      <FiZoomIn size={16} />
                    </button>
                  </div>

                  {/* Thumbnail images */}
                  {product.images && product.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImage === index ? 'border-primary-500' : 'border-neutral-200'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Image navigation */}
                  {product.images && product.images.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                      >
                        <FiChevronLeft size={20} />
                      </button>
                      <button
                        onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                      >
                        <FiChevronRight size={20} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div className="lg:w-1/2 p-6 border-l border-neutral-200">
                <div className="space-y-6">
                  {/* Product title and rating */}
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">
                      {product.name}
                    </h1>
                    
                    {product.reviews && product.reviews.length > 0 && (
                      <div className="flex items-center space-x-2 mb-2">
                        <Rating 
                          value={product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length} 
                        />
                        <span className="text-sm text-neutral-600">
                          ({product.reviews.length} reviews)
                        </span>
                      </div>
                    )}

                    <p className="text-neutral-600">{product.short_description}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-primary-600">
                      GH₵{product.price?.toFixed(2)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <>
                        <span className="text-lg text-neutral-500 line-through">
                          GH₵{product.original_price.toFixed(2)}
                        </span>
                        <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded">
                          {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>

                  {/* Dealer info */}
                  <div className="flex items-center space-x-4 p-4 bg-neutral-50 rounded-lg">
                    <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center">
                      {product.dealer?.logo ? (
                        <img 
                          src={product.dealer.logo} 
                          alt={product.dealer.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-neutral-600">
                          {product.dealer?.name?.substring(0, 2) || 'D'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-900">
                        {product.dealer?.name || 'Unknown Dealer'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Rating value={product.dealer?.rating || 0} size="small" />
                        <span className="text-sm text-neutral-600">
                          ({product.dealer?.review_count || 0} reviews)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stock status */}
                  <div className="flex items-center space-x-2">
                    {product.stock_quantity > 0 ? (
                      <>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-green-600 font-medium">
                          {product.stock_quantity > 10 ? 'In Stock' : `Only ${product.stock_quantity} left`}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-red-600 font-medium">Out of Stock</span>
                      </>
                    )}
                  </div>

                  {/* Quantity selector */}
                  {product.stock_quantity > 0 && (
                    <div className="flex items-center space-x-4">
                      <label className="text-sm font-medium text-neutral-700">Quantity:</label>
                      <QuantitySelector
                        value={quantity}
                        onChange={setQuantity}
                        max={Math.min(product.stock_quantity, 10)}
                        className="w-32"
                      />
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="space-y-3">
                    <div className="flex space-x-3">
                      <Button
                        onClick={handleAddToCart}
                        disabled={product.stock_quantity === 0}
                        className="flex-1"
                        variant="primary"
                      >
                        <FiShoppingCart size={18} className="mr-2" />
                        Add to Cart
                      </Button>
                      
                      <Button
                        onClick={handleAddToWishlist}
                        variant="outline"
                        className={isInWishlist(productId) ? 'text-red-500 border-red-500' : ''}
                      >
                        <FiHeart size={18} className={isInWishlist(productId) ? 'fill-current' : ''} />
                      </Button>
                      
                      <Button
                        onClick={handleAddToComparison}
                        variant="outline"
                        className={isInComparison(productId) ? 'text-primary-500 border-primary-500' : ''}
                      >
                        <FiBarChart2 size={18} />
                      </Button>
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={handleShare}
                        variant="ghost"
                        className="flex-1"
                      >
                        <FiShare2 size={16} className="mr-2" />
                        Share
                      </Button>
                      
                      <Link
                        to={`/products/${productId}`}
                        className="flex-1"
                      >
                        <Button variant="ghost" className="w-full">
                          <FiExternalLink size={16} className="mr-2" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div className="flex items-center justify-around p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FiShield className="text-green-600" size={20} />
                      <span className="text-sm text-neutral-600">Secure Payment</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiTruck className="text-blue-600" size={20} />
                      <span className="text-sm text-neutral-600">Fast Shipping</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiRotateCcw className="text-orange-600" size={20} />
                      <span className="text-sm text-neutral-600">Easy Returns</span>
                    </div>
                  </div>

                  {/* Key features */}
                  {product.features && product.features.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-neutral-900 mb-2">Key Features</h3>
                      <ul className="space-y-1">
                        {product.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                            <span className="text-sm text-neutral-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ProductQuickView; 