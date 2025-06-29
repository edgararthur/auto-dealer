import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiStar, 
  FiThumbsUp, 
  FiThumbsDown, 
  FiEdit, 
  FiTrash2,
  FiCamera,
  FiFilter,
  FiSearch,
  FiCalendar,
  FiPackage,
  FiUser,
  FiHeart,
  FiMessageCircle,
  FiTrendingUp,
  FiEye,
  FiCheckCircle,
  FiClock,
  FiImage
} from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Mock reviews data - in real app this would come from API
  const mockReviews = [
    {
      id: 1,
      productId: 'prod-001',
      productName: 'Premium Brake Pads - Front Set',
      productImage: 'https://via.placeholder.com/80x80',
      rating: 5,
      title: 'Excellent quality brake pads!',
      content: 'These brake pads have been fantastic. Much better than the OEM ones that came with my car. Installation was straightforward and the stopping power is noticeably improved.',
      date: '2024-01-15',
      verified: true,
      helpful: 23,
      notHelpful: 2,
      images: ['https://via.placeholder.com/100x100', 'https://via.placeholder.com/100x100'],
      orderNumber: 'ORD-2024-001',
      dealerName: 'AutoParts Pro',
      status: 'published',
      canEdit: true
    },
    {
      id: 2,
      productId: 'prod-002',
      productName: 'High Performance Air Filter',
      productImage: 'https://via.placeholder.com/80x80',
      rating: 4,
      title: 'Good air filter, improved performance',
      content: 'Noticed a slight improvement in fuel efficiency after installing this air filter. The quality seems good, though time will tell how long it lasts.',
      date: '2024-01-10',
      verified: true,
      helpful: 15,
      notHelpful: 1,
      images: [],
      orderNumber: 'ORD-2024-002',
      dealerName: 'Parts Paradise',
      status: 'published',
      canEdit: true
    },
    {
      id: 3,
      productId: 'prod-003',
      productName: 'LED Headlight Bulbs H11',
      productImage: 'https://via.placeholder.com/80x80',
      rating: 3,
      title: 'Decent bulbs but installation was tricky',
      content: 'The light output is good and they look modern, but the installation required some modifications to fit properly in my vehicle. Customer service was helpful though.',
      date: '2024-01-05',
      verified: true,
      helpful: 8,
      notHelpful: 4,
      images: ['https://via.placeholder.com/100x100'],
      orderNumber: 'ORD-2024-003',
      dealerName: 'Bright Auto Parts',
      status: 'pending',
      canEdit: true
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setReviews(mockReviews);
      setLoading(false);
    }, 1000);
  }, []);

  const filterOptions = [
    { value: 'all', label: 'All Reviews', count: reviews.length },
    { value: 'published', label: 'Published', count: reviews.filter(r => r.status === 'published').length },
    { value: 'pending', label: 'Pending Approval', count: reviews.filter(r => r.status === 'pending').length },
    { value: '5star', label: '5 Stars', count: reviews.filter(r => r.rating === 5).length },
    { value: '4star', label: '4 Stars', count: reviews.filter(r => r.rating === 4).length },
    { value: '3star', label: '3 Stars', count: reviews.filter(r => r.rating === 3).length }
  ];

  const filteredAndSortedReviews = reviews
    .filter(review => {
      // Filter by category
      if (filter === 'published' && review.status !== 'published') return false;
      if (filter === 'pending' && review.status !== 'pending') return false;
      if (filter === '5star' && review.rating !== 5) return false;
      if (filter === '4star' && review.rating !== 4) return false;
      if (filter === '3star' && review.rating !== 3) return false;
      
      // Filter by search query
      if (searchQuery && !review.productName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !review.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !review.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.date) - new Date(a.date);
        case 'oldest':
          return new Date(a.date) - new Date(b.date);
        case 'rating-high':
          return b.rating - a.rating;
        case 'rating-low':
          return a.rating - b.rating;
        case 'helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  const renderStars = (rating, size = 'w-4 h-4') => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map(star => (
          <FiStar
            key={star}
            className={`${size} ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const handleDeleteReview = (reviewId) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      setReviews(reviews.filter(r => r.id !== reviewId));
      showToast('Review deleted successfully', 'success');
    }
  };

  const handleHelpfulVote = (reviewId, isHelpful) => {
    setReviews(reviews.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          helpful: isHelpful ? review.helpful + 1 : review.helpful,
          notHelpful: !isHelpful ? review.notHelpful + 1 : review.notHelpful
        };
      }
      return review;
    }));
    showToast(`Marked as ${isHelpful ? 'helpful' : 'not helpful'}`, 'success');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Reviews</h1>
          <p className="text-gray-600">
            Manage your product reviews and help other customers make informed decisions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 rounded-lg">
                <FiMessageCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reviews</p>
                <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 rounded-lg">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.status === 'published').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <FiClock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <FiThumbsUp className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Helpful Votes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {reviews.reduce((sum, r) => sum + r.helpful, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                />
              </div>

              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
              <option value="helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredAndSortedReviews.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
              <FiMessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'You haven\'t written any reviews yet'
                }
              </p>
              {!searchQuery && filter === 'all' && (
                <Link
                  to="/orders"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FiPackage className="w-5 h-5 mr-2" />
                  View Your Orders
                </Link>
              )}
            </div>
          ) : (
            filteredAndSortedReviews.map(review => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <img
                        src={review.productImage}
                        alt={review.productName}
                        className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                      />
                      <div>
                        <Link
                          to={`/products/${review.productId}`}
                          className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          {review.productName}
                        </Link>
                        <div className="flex items-center mt-1 space-x-4">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">
                            {new Date(review.date).toLocaleDateString()}
                          </span>
                          {review.verified && (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-full">
                              <FiCheckCircle className="w-3 h-3 mr-1" />
                              Verified Purchase
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                            review.status === 'published' 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-yellow-50 text-yellow-700'
                          }`}>
                            {review.status === 'published' ? 'Published' : 'Pending Approval'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {review.canEdit && (
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <FiEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteReview(review.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {review.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {review.content}
                    </p>
                  </div>

                  {/* Review Images */}
                  {review.images.length > 0 && (
                    <div className="flex space-x-3 mb-4">
                      {review.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          className="w-20 h-20 rounded-lg object-cover border border-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
                        />
                      ))}
                    </div>
                  )}

                  {/* Review Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Order:</span>
                        <Link
                          to={`/orders/${review.orderNumber}`}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {review.orderNumber}
                        </Link>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Dealer:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {review.dealerName}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleHelpfulVote(review.id, true)}
                          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                        >
                          <FiThumbsUp className="w-4 h-4" />
                          <span>{review.helpful}</span>
                        </button>
                        <button
                          onClick={() => handleHelpfulVote(review.id, false)}
                          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                        >
                          <FiThumbsDown className="w-4 h-4" />
                          <span>{review.notHelpful}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Write Review CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">
            Share Your Experience
          </h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Help other customers by writing reviews for products you've purchased. Your honest feedback makes a difference!
          </p>
          <Link
            to="/orders"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiPackage className="w-5 h-5 mr-2" />
            Find Products to Review
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage; 