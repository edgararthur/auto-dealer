import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
  FiMapPin,
  FiGrid,
  FiList,
  FiZoomIn,
  FiBarChart2
} from 'react-icons/fi';
import { ProductService } from 'autoplus-shared';
import { 
  ProductGrid, 
  Breadcrumb, 
  Rating, 
  QuantitySelector,
  ProductSkeleton,
  EmptyState,
  Button
} from '../../components/common';
import VehicleFitmentChecker from '../../components/common/VehicleFitmentChecker';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { useComparison } from '../../contexts/ComparisonContext';
import { AnimatePresence, motion } from 'framer-motion';
import { LazyLoadComponent } from 'react-lazy-load-image-component';

const ProductDetail = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToComparison, removeFromComparison, isInComparison } = useComparison();
  
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [notification, setNotification] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  // Fetch product data
  useEffect(() => {
    const fetchData = async () => {
      if (productId) {
        setLoading(true);
        try {
          const response = await ProductService.getProductById(productId);
          if (response.success && response.product) {
            setProduct(response.product);
            
            // Set default variant if available
            if (response.product.variants && response.product.variants.length > 0) {
              setSelectedVariant(response.product.variants[0]);
            }
            
            // Also fetch related products
            const relatedResponse = await ProductService.getProducts({
              categoryId: response.product.category?.id,
              limit: 4,
              exclude: [productId]
            });
            
            if (relatedResponse.success) {
              setRelatedProducts(relatedResponse.products || []);
            }
          } else {
            console.error('Failed to fetch product:', response.error);
          }
        } catch (error) {
          console.error('Error fetching product details:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchData();
  }, [productId]);
  
  // Check if product is in wishlist
  const inWishlist = isInWishlist(productId);
  
  // Check if product is in comparison
  const inComparison = isInComparison(productId);
  
  // Calculate rating statistics
  const getRatingStats = () => {
    if (!product?.reviews || product.reviews.length === 0) return null;
    
    const totalReviews = product.reviews.length;
    const avgRating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
    
    // Count reviews by star rating
    const ratingCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    product.reviews.forEach(review => {
      ratingCounts[review.rating] = (ratingCounts[review.rating] || 0) + 1;
    });
    
    return {
      average: avgRating,
      total: totalReviews,
      counts: ratingCounts
    };
  };
  
  const ratingStats = getRatingStats();
  
  // Handle image zoom
  const handleImageMouseMove = (e) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };
  
  // Handle adding product to cart
  const handleAddToCart = () => {
    if (!product) return;
    
    const variant = selectedVariant ? selectedVariant.id : null;
    addToCart(product.id, quantity, variant);
    showNotification(`Added ${quantity} ${quantity > 1 ? 'items' : 'item'} to your cart`);
  };
  
  // Handle adding product to wishlist
  const handleToggleWishlist = () => {
    if (!user) {
      showNotification('Please log in to save items to your wishlist', 'error');
      return;
    }
    
    if (inWishlist) {
      removeFromWishlist(productId);
      showNotification('Removed from your wishlist');
    } else {
      addToWishlist(productId);
      showNotification('Added to your wishlist');
    }
  };
  
  // Handle adding product to comparison
  const handleToggleComparison = () => {
    if (inComparison) {
      removeFromComparison(productId);
      showNotification('Removed from comparison');
    } else {
      addToComparison(productId);
      showNotification('Added to comparison');
    }
  };
  
  // Handle buy now action
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };
  
  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({
      message,
      type
    });
    
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  // If loading, show skeleton
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Breadcrumb items={[
            { name: 'Home', url: '/' },
            { name: 'Products', url: '/products' },
            { name: 'Loading...', url: '#' }
          ]} />
        </div>
        <ProductSkeleton type="detail" />
      </div>
    );
  }
  
  // If product not found
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title="Product Not Found"
          description="The product you're looking for doesn't exist or has been removed."
          actionText="Back to Products"
          actionLink="/products"
        />
      </div>
    );
  }
  
  // Build breadcrumb items
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: 'Category', url: `/categories/${product.category?.id}` },
    { name: product.name, url: `#` }
  ];
  
  // Format product images
  const productImages = product.product_images && product.product_images.length > 0 
    ? product.product_images.map(img => img.url)
    : [product.image || 'https://via.placeholder.com/600x600?text=No+Image'];
  
  return (
    <div className="bg-white min-h-screen">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 z-50 px-6 py-3 rounded-lg shadow-lg ${
              notification.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
              'bg-red-50 text-red-700 border border-red-200'
            } flex items-center`}
          >
            {notification.type === 'success' ? <FiCheck className="mr-2" /> : <FiX className="mr-2" />}
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
        
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center text-neutral-500 hover:text-primary-600 transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          <span>Back</span>
        </button>
        
        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          {/* Left Column - Images */}
          <div className="lg:col-span-3">
            <LazyLoadComponent>
              <div className="relative bg-neutral-50 rounded-2xl overflow-hidden h-[500px] mb-4 cursor-zoom-in"
                  onMouseEnter={() => setIsZoomed(true)}
                  onMouseLeave={() => setIsZoomed(false)}
                  onMouseMove={handleImageMouseMove}
                  onClick={() => setIsZoomed(!isZoomed)}
              >
                <img 
                  src={productImages[selectedImage]} 
                  alt={product.name}
                  className={`w-full h-full object-contain transition-transform duration-300 ${isZoomed ? 'scale-150' : ''}`}
                  style={isZoomed ? {
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                  } : {}}
                />
                
                <button
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md text-neutral-500 hover:text-primary-600 hover:shadow-lg transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsZoomed(!isZoomed);
                  }}
                >
                  <FiZoomIn size={18} />
                </button>
              </div>
              
              {/* Thumbnail Gallery */}
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-24 h-24 bg-neutral-50 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedImage === index ? 'border-primary-600 shadow-md' : 'border-transparent'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - view ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            </LazyLoadComponent>
          </div>
          
          {/* Right Column - Details */}
          <div className="lg:col-span-2 flex flex-col">
            {/* Product Info */}
            <div className="mb-8">
              {/* Badge */}
              {(product.isNew || product.discount) && (
                <span className="inline-block px-3 py-1 mb-3 rounded-full bg-accent-500 text-white text-xs font-bold">
                  {product.isNew ? 'NEW' : `${product.discount}% OFF`}
                </span>
              )}
              
              {/* Title */}
              <h1 className="text-3xl font-bold text-neutral-900 mb-4">{product.name}</h1>
              
              {/* Part Number/SKU */}
              <div className="flex items-center text-sm text-neutral-500 mb-4">
                {product.part_number && (
                  <div className="mr-4">
                    <span className="font-medium">Part #:</span> {product.part_number}
                  </div>
                )}
                {product.sku && (
                  <div>
                    <span className="font-medium">SKU:</span> {product.sku}
                  </div>
                )}
              </div>
              
              {/* Ratings Summary */}
              {ratingStats && (
                <div className="flex items-center mb-6">
                  <Rating value={ratingStats.average} size="medium" />
                  <span className="ml-2 text-neutral-700 font-medium">
                    {ratingStats.average.toFixed(1)}
                  </span>
                  <span className="mx-2 text-neutral-400">•</span>
                  <a href="#reviews" className="text-primary-600 hover:underline">
                    {ratingStats.total} {ratingStats.total === 1 ? 'review' : 'reviews'}
                  </a>
                </div>
              )}
              
              {/* Short Description */}
              <p className="text-neutral-600 mb-6">
                {product.short_description || product.description?.substring(0, 120) + '...'}
              </p>
              
              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end">
                  {product.oldPrice && (
                    <span className="text-neutral-400 line-through text-lg mr-3">
                      ${product.oldPrice.toFixed(2)}
                    </span>
                  )}
                  <span className="text-3xl font-bold text-neutral-900">
                    ${(selectedVariant?.price || product.price).toFixed(2)}
                  </span>
                  
                  {product.oldPrice && (
                    <span className="ml-3 text-accent-600 font-medium">
                      Save ${(product.oldPrice - product.price).toFixed(2)}
                    </span>
                  )}
                </div>
                
                {/* In Stock Status */}
                <div className="mt-2 flex items-center">
                  {product.inStock !== false ? (
                    <>
                      <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                      <span className="text-emerald-600 font-medium">In Stock</span>
                    </>
                  ) : (
                    <>
                      <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                      <span className="text-red-600 font-medium">Out of Stock</span>
                    </>
                  )}
                  
                  {product.stock_quantity && product.stock_quantity < 10 && (
                    <span className="ml-2 text-amber-600 text-sm">
                      Only {product.stock_quantity} left
                    </span>
                  )}
                </div>
              </div>
              
              {/* Variants Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-700 mb-3">Options</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map(variant => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          selectedVariant?.id === variant.id 
                            ? 'border-primary-600 bg-primary-50 text-primary-700' 
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Quantity & Add to Cart */}
              {product.inStock !== false && (
                <div className="mb-8">
                  <div className="flex items-center mb-6">
                    <h3 className="text-sm font-medium text-neutral-700 mr-4 w-24">Quantity</h3>
                    <QuantitySelector 
                      value={quantity} 
                      onChange={setQuantity} 
                      min={1} 
                      max={product.stock_quantity || 10} 
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-3">
                    <Button 
                      onClick={handleAddToCart}
                      size="large"
                      className="w-full"
                    >
                      <FiShoppingCart className="mr-2" />
                      Add to Cart
                    </Button>
                    
                    <Button 
                      onClick={handleBuyNow}
                      variant="secondary"
                      size="large"
                      className="w-full"
                    >
                      Buy Now
                    </Button>
                    
                    <div className="flex space-x-3">
                      <Button 
                        onClick={handleToggleWishlist}
                        variant="outline"
                        size="large"
                        className="flex-1"
                      >
                        <FiHeart className={`mr-2 ${inWishlist ? 'fill-accent-500 text-accent-500' : ''}`} />
                        {inWishlist ? 'Saved' : 'Save'}
                      </Button>
                      
                      <Button 
                        onClick={handleToggleComparison}
                        variant="outline"
                        size="large"
                        className="flex-1"
                      >
                        <FiBarChart2 className={`mr-2 ${inComparison ? 'text-primary-500' : ''}`} />
                        {inComparison ? 'Added' : 'Compare'}
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={() => {
                        navigator.share({
                          title: product.name,
                          text: product.short_description || product.description?.substring(0, 120),
                          url: window.location.href
                        }).catch(err => console.error('Could not share', err));
                      }}
                      variant="outline"
                      size="large"
                      className="w-full"
                    >
                      <FiShare2 className="mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Additional Info */}
              <div className="border-t border-neutral-200 pt-6 space-y-4">
                {/* Shipping */}
                <div className="flex items-start">
                  <FiTruck className="text-neutral-400 mt-1 mr-3" />
                  <div>
                    <h4 className="font-medium text-neutral-800">Free Shipping</h4>
                    <p className="text-sm text-neutral-500">Orders over $50 qualify for free shipping</p>
                  </div>
                </div>
                
                {/* Returns */}
                <div className="flex items-start">
                  <FiShield className="text-neutral-400 mt-1 mr-3" />
                  <div>
                    <h4 className="font-medium text-neutral-800">Returns</h4>
                    <p className="text-sm text-neutral-500">30-day money back guarantee</p>
                  </div>
                </div>
                
                {/* Warranty */}
                {product.warranty && (
                  <div className="flex items-start">
                    <FiClock className="text-neutral-400 mt-1 mr-3" />
                    <div>
                      <h4 className="font-medium text-neutral-800">Warranty</h4>
                      <p className="text-sm text-neutral-500">{product.warranty}</p>
                    </div>
                  </div>
                )}
                
                {/* Seller */}
                {product.dealer && (
                  <div className="flex items-start">
                    <FiMapPin className="text-neutral-400 mt-1 mr-3" />
                    <div>
                      <h4 className="font-medium text-neutral-800">Sold by</h4>
                      <Link to={`/dealers/${product.dealer.id}`} className="text-sm text-primary-600 hover:underline">
                        {product.dealer.company_name || product.dealer.name}
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Vehicle Fitment Checker */}
              <div className="mt-6 pt-6 border-t border-neutral-200">
                <VehicleFitmentChecker productId={product.id} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Details Tabs */}
        <div className="mb-16">
          <div className="border-b border-neutral-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`py-4 px-6 text-md font-medium border-b-2 ${
                  activeTab === 'description' 
                    ? 'border-primary-600 text-primary-600' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('specifications')}
                className={`py-4 px-6 text-md font-medium border-b-2 ${
                  activeTab === 'specifications' 
                    ? 'border-primary-600 text-primary-600' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 px-6 text-md font-medium border-b-2 ${
                  activeTab === 'reviews' 
                    ? 'border-primary-600 text-primary-600' 
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Reviews {ratingStats && `(${ratingStats.total})`}
              </button>
            </div>
          </div>
          
          <div className="py-8">
            {/* Description Tab */}
            {activeTab === 'description' && (
              <div className="prose prose-lg max-w-none">
                <div className={`${!showFullDescription && 'max-h-96 overflow-hidden relative'}`}>
                  {product.description}
                  
                  {!showFullDescription && (
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
                  )}
                </div>
                
                {product.description && product.description.length > 500 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-4 text-primary-600 hover:text-primary-700 flex items-center font-medium"
                  >
                    {showFullDescription ? (
                      <>
                        Show Less <FiChevronUp className="ml-1" />
                      </>
                    ) : (
                      <>
                        Show More <FiChevronDown className="ml-1" />
                      </>
                    )}
                  </button>
                )}
                
                {/* Features */}
                {product.features && product.features.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Key Features</h3>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <FiCheck className="text-primary-600 mt-1 mr-2 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Compatibility */}
                {product.compatibleWith && product.compatibleWith.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Compatible With</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {product.compatibleWith.map((item, index) => (
                        <div key={index} className="flex items-center p-3 bg-neutral-50 rounded-lg">
                          <FiCheck className="text-primary-600 mr-2 flex-shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Specifications Tab */}
            {activeTab === 'specifications' && (
              <div>
                {product.specifications && product.specifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="py-3 border-b border-neutral-100">
                        <div className="flex justify-between">
                          <span className="text-neutral-600 font-medium">{spec.name}</span>
                          <span className="text-neutral-900">{spec.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-neutral-500 italic">No specifications available for this product.</p>
                )}
              </div>
            )}
            
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Review Summary */}
                    <div className="bg-neutral-50 p-6 rounded-xl">
                      <h3 className="text-lg font-bold mb-4">Customer Ratings</h3>
                      <div className="flex items-center justify-center flex-col mb-6">
                        <span className="text-5xl font-bold">{ratingStats.average.toFixed(1)}</span>
                        <div className="my-2">
                          <Rating value={ratingStats.average} size="large" />
                        </div>
                        <span className="text-neutral-500">{ratingStats.total} reviews</span>
                      </div>
                      
                      {/* Rating Distribution */}
                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map(stars => {
                          const count = ratingStats.counts[stars] || 0;
                          const percentage = (count / ratingStats.total) * 100;
                          
                          return (
                            <div key={stars} className="flex items-center">
                              <div className="w-8 text-sm text-neutral-600 font-medium">{stars} <FiStar className="inline-block" size={12} /></div>
                              <div className="flex-1 mx-3 h-2 bg-neutral-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary-600 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="w-8 text-right text-sm text-neutral-600">{count}</div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-6">
                        <Button 
                          onClick={() => {}}
                          variant="outline"
                          className="w-full"
                        >
                          <FiMessageSquare className="mr-2" />
                          Write a Review
                        </Button>
                      </div>
                    </div>
                    
                    {/* Review List */}
                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-bold mb-4">Reviews</h3>
                      <div className="space-y-6">
                        {product.reviews.map((review, index) => (
                          <div key={index} className="border-b border-neutral-100 pb-6">
                            <div className="flex justify-between mb-2">
                              <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center text-lg font-bold text-neutral-600">
                                  {review.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="ml-3">
                                  <h4 className="font-medium">{review.user?.name || 'Anonymous'}</h4>
                                  <div className="flex items-center">
                                    <Rating value={review.rating} size="small" />
                                    <span className="ml-2 text-sm text-neutral-500">
                                      {new Date(review.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button className="text-neutral-400 hover:text-neutral-600">
                                <FiThumbsUp />
                              </button>
                            </div>
                            <p className="text-neutral-700 mt-3">{review.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FiMessageSquare size={48} className="mx-auto text-neutral-300 mb-4" />
                    <h3 className="text-lg font-bold text-neutral-800 mb-2">No Reviews Yet</h3>
                    <p className="text-neutral-500 mb-6">Be the first to review this product</p>
                    <Button 
                      onClick={() => {}}
                      className="mx-auto"
                    >
                      Write a Review
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <LazyLoadComponent threshold={400}>
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">Related Products</h2>
                <Link to="/products" className="text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </Link>
              </div>
              <ProductGrid products={relatedProducts} />
            </div>
          </LazyLoadComponent>
        )}
        
        {/* Recently Viewed (would typically use local storage or user history) */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Recently Viewed</h2>
            <button className="text-primary-600 hover:text-primary-700 font-medium">
              Clear All
            </button>
          </div>
          {/* Would typically load from user's browsing history */}
          <EmptyState 
            icon={<FiClock size={48} />}
            title="No recently viewed products"
            description="Products you view will appear here for easy access."
            compact
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 