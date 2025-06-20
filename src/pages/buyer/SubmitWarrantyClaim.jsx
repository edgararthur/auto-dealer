import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { WarrantyService, OrderService, ProductService } from 'Autora-shared';
import { 
  FiAlertCircle, 
  FiCheckCircle, 
  FiUpload, 
  FiFile, 
  FiTrash2, 
  FiChevronLeft,
  FiSend
} from 'react-icons/fi';

const claimReasons = [
  'Defective Product',
  'Damaged During Shipping',
  'Wrong Product Received',
  'Missing Parts',
  'Does Not Match Description',
  'Not Working as Expected',
  'Other'
];

const SubmitWarrantyClaim = () => {
  const { orderId, productId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [product, setProduct] = useState(null);
  const [order, setOrder] = useState(null);
  const [warranty, setWarranty] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    images: []
  });
  
  useEffect(() => {
    fetchOrderAndProduct();
  }, [orderId, productId]);
  
  const fetchOrderAndProduct = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!orderId || !productId || !currentUser?.id) {
        setError('Missing required information');
        setLoading(false);
        return;
      }
      
      // Fetch order details
      const orderResult = await OrderService.getOrderById(orderId);
      if (!orderResult.success) {
        setError(`Failed to load order: ${orderResult.error}`);
        setLoading(false);
        return;
      }
      
      // Verify the order belongs to the current user
      if (orderResult.order.user_id !== currentUser.id) {
        setError('You are not authorized to submit a claim for this order');
        setLoading(false);
        return;
      }
      
      // Fetch product details
      const productResult = await ProductService.getProductById(productId);
      if (!productResult.success) {
        setError(`Failed to load product: ${productResult.error}`);
        setLoading(false);
        return;
      }
      
      setOrder(orderResult.order);
      setProduct(productResult.product);
      
      // Fetch warranty details if product has warranty_policy_id
      if (productResult.product.warranty_policy_id) {
        const warrantyResult = await WarrantyService.getWarrantyById(
          productResult.product.warranty_policy_id
        );
        
        if (warrantyResult.success) {
          setWarranty(warrantyResult.warranty);
          
          // Check warranty eligibility
          const purchaseDate = new Date(orderResult.order.created_at);
          const currentDate = new Date();
          
          // Calculate warranty end date based on duration type
          let warrantyEndDate = new Date(purchaseDate);
          const { duration, duration_type } = warrantyResult.warranty;
          
          if (duration_type === 'days') {
            warrantyEndDate.setDate(warrantyEndDate.getDate() + duration);
          } else if (duration_type === 'months') {
            warrantyEndDate.setMonth(warrantyEndDate.getMonth() + duration);
          } else if (duration_type === 'years') {
            warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + duration);
          }
          
          // Check if current date is before warranty end date
          const isStillUnderWarranty = currentDate < warrantyEndDate;
          setIsEligible(isStillUnderWarranty);
          
          // Calculate days remaining
          if (isStillUnderWarranty) {
            const diffTime = Math.abs(warrantyEndDate - currentDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setDaysRemaining(diffDays);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load order and product information');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Limit to 5 images
    if (formData.images.length + files.length > 5) {
      setError('You can upload a maximum of 5 images');
      return;
    }
    
    const newImages = [];
    
    files.forEach(file => {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }
      
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      newImages.push({
        file,
        preview: imageUrl
      });
    });
    
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
    
    // Reset the input
    e.target.value = '';
  };
  
  const removeImage = (index) => {
    const newImages = [...formData.images];
    
    // Revoke object URL to prevent memory leaks
    URL.revokeObjectURL(newImages[index].preview);
    
    newImages.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isEligible) {
      setError('This product is no longer under warranty');
      return;
    }
    
    if (!formData.reason || !formData.description) {
      setError('Please provide a reason and description for your claim');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      // In a real app, we would first upload the images to a storage service
      // and get back URLs to store in the claim
      
      // For this example, we'll just simulate upload success
      const imageUrls = formData.images.map((image, index) => 
        `https://example.com/claim-images/${Date.now()}-${index}.jpg`
      );
      
      const claimData = {
        reason: formData.reason,
        description: formData.description,
        images: imageUrls
      };
      
      const result = await WarrantyService.submitWarrantyClaim(
        orderId,
        productId,
        currentUser.id,
        claimData
      );
      
      if (result.success) {
        setSuccess(true);
      } else {
        setError(`Failed to submit claim: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      setError('Failed to submit warranty claim. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Show success message and back button
  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-success-50 border border-success-200 rounded-lg p-6 text-center">
          <FiCheckCircle className="h-16 w-16 text-success-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Warranty Claim Submitted</h1>
          <p className="text-neutral-600 mb-6">
            Your warranty claim has been successfully submitted. We'll review your claim and notify you of the decision.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/orders')}
              className="px-6 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              View Orders
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-primary-600 hover:text-primary-800 font-medium"
        >
          <FiChevronLeft className="mr-1" />
          Back to Order
        </button>
      </div>
      
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Submit Warranty Claim</h1>
      
      {/* Error message */}
      {error && (
        <div className="bg-error-50 border border-error-200 text-error-700 px-4 py-3 rounded-md flex items-start mb-6">
          <FiAlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading order and product information...</p>
        </div>
      ) : (
        <>
          {/* Product and warranty information */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-medium text-neutral-900 mb-4">Product Information</h2>
              
              <div className="flex flex-col md:flex-row">
                {product?.images && product.images.length > 0 && (
                  <div className="md:w-1/4 mb-4 md:mb-0 md:mr-6">
                    <img 
                      src={product.images[0]} 
                      alt={product?.name || 'Product'} 
                      className="w-full h-auto rounded-md" 
                    />
                  </div>
                )}
                
                <div className="md:w-3/4">
                  <h3 className="text-lg font-medium text-neutral-900">{product?.name}</h3>
                  <p className="text-sm text-neutral-500 mb-4">SKU: {product?.sku}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700">Order Details</h4>
                      <p className="text-sm text-neutral-500">Order #{order?.order_number}</p>
                      <p className="text-sm text-neutral-500">
                        Purchased on: {formatDate(order?.created_at)}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700">Warranty Status</h4>
                      {warranty ? (
                        <>
                          <p className="text-sm text-neutral-500">
                            {warranty.title}: {warranty.duration} {warranty.duration_type}
                          </p>
                          {isEligible ? (
                            <p className="text-sm text-success-600">
                              <FiCheckCircle className="inline mr-1" />
                              Eligible for warranty claim ({daysRemaining} days remaining)
                            </p>
                          ) : (
                            <p className="text-sm text-error-600">
                              <FiAlertCircle className="inline mr-1" />
                              Warranty expired
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-neutral-500">No warranty information available</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {warranty && isEligible && (
              <div className="px-6 py-4 bg-neutral-50">
                <h3 className="text-sm font-medium text-neutral-700">Warranty Coverage</h3>
                <p className="text-sm text-neutral-500 mt-1">{warranty.coverage_details}</p>
              </div>
            )}
          </div>
          
          {/* Claim form */}
          {isEligible ? (
            <form onSubmit={handleSubmit}>
              <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-neutral-900 mb-6">Claim Details</h2>
                  
                  <div className="space-y-6">
                    {/* Reason selector */}
                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-neutral-700 mb-1">
                        Reason for Claim *
                      </label>
                      <select
                        id="reason"
                        name="reason"
                        required
                        value={formData.reason}
                        onChange={handleChange}
                        className="block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      >
                        <option value="">Select a reason</option>
                        {claimReasons.map(reason => (
                          <option key={reason} value={reason}>{reason}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                        Detailed Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        required
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        className="block w-full border border-neutral-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Please describe the issue in detail..."
                      ></textarea>
                    </div>
                    
                    {/* Image upload */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Upload Images (Optional)
                      </label>
                      <p className="text-xs text-neutral-500 mb-3">
                        Upload up to 5 images showing the issue. Each image must be less than 5MB.
                      </p>
                      
                      <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          <FiUpload className="mx-auto h-12 w-12 text-neutral-400" />
                          <div className="flex text-sm text-neutral-600">
                            <label
                              htmlFor="images"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                            >
                              <span>Upload images</span>
                              <input
                                id="images"
                                name="images"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-neutral-500">
                            PNG, JPG, GIF up to 5MB
                          </p>
                        </div>
                      </div>
                      
                      {/* Image previews */}
                      {formData.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {formData.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 bg-error-100 text-error-600 rounded-full p-1 hover:bg-error-200"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Form actions */}
                <div className="px-6 py-4 bg-neutral-50 text-right">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 bg-white hover:bg-neutral-50 mr-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 flex items-center"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FiSend className="mr-2" />
                        Submit Claim
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-error-50 border border-error-200 rounded-lg p-6 text-center">
              <FiAlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
              <h2 className="text-lg font-medium text-neutral-900 mb-2">Not Eligible for Warranty Claim</h2>
              <p className="text-neutral-600">
                {warranty ? 
                  "This product's warranty has expired. Please contact the dealer directly for assistance." : 
                  "This product doesn't have a warranty policy associated with it. Please contact the dealer directly for assistance."}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 bg-white border border-neutral-300 rounded-md shadow-sm text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Go Back
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubmitWarrantyClaim; 