import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../../contexts/AuthContext';
import DealerReputationBadge from './DealerReputationBadge';
import { FaStar, FaRegStar, FaUserCircle, FaSpinner } from 'react-icons/fa';
import DealerService from '../../../../shared/services/dealerService';

const StarRating = ({ rating, setRating, editable = false, size = 'md' }) => {
  const sizeClass = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  }[size] || 'text-lg';

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => editable && setRating(star)}
          className={`${sizeClass} ${editable ? 'cursor-pointer' : 'cursor-default'} focus:outline-none`}
          disabled={!editable}
        >
          {star <= rating ? (
            <FaStar className="text-yellow-400" />
          ) : (
            <FaRegStar className="text-yellow-400" />
          )}
        </button>
      ))}
    </div>
  );
};

const ReviewItem = ({ review }) => {
  const date = new Date(review.created_at);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="border-b border-neutral-200 py-4 last:border-b-0">
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {review.user.profile_image ? (
            <img
              src={review.user.profile_image}
              alt={review.user.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <FaUserCircle className="w-10 h-10 text-neutral-400" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <h4 className="font-medium text-neutral-900 mr-2">{review.user.name}</h4>
            <span className="text-sm text-neutral-500">{formattedDate}</span>
          </div>
          <div className="mb-2">
            <StarRating rating={review.rating} />
          </div>
          {review.comment && (
            <p className="text-neutral-700">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const DealerReviewsSection = ({ dealer, onReviewAdded }) => {
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;

  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchReviews = async () => {
      if (!dealer?.id) return;
      
      setLoading(true);
      const result = await DealerService.getDealerReviews(dealer.id, {
        limit,
        offset: (page - 1) * limit,
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      
      if (result.success) {
        setReviews(result.reviews);
        setTotalReviews(result.total);
      } else {
        console.error('Failed to fetch dealer reviews:', result.error);
      }
      
      setLoading(false);
    };

    fetchReviews();
  }, [dealer?.id, page]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('You must be logged in to submit a review');
      return;
    }
    
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    const result = await DealerService.addDealerReview(dealer.id, user.id, {
      rating,
      comment
    });
    
    setIsSubmitting(false);
    
    if (result.success) {
      // Reset form
      setRating(0);
      setComment('');
      setShowReviewForm(false);
      
      // Update reviews list to include the new review
      setReviews(prevReviews => [result.review, ...prevReviews]);
      
      // Increment total count
      setTotalReviews(prev => prev + 1);
      
      // Notify parent component
      if (onReviewAdded) {
        onReviewAdded(result.review);
      }
    } else {
      setError(result.error || 'Failed to submit review');
    }
  };

  const totalPages = Math.ceil(totalReviews / limit);

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-medium text-neutral-900">Dealer Reviews</h3>
          <div className="flex items-center">
            <span className="font-semibold text-neutral-900 mr-1">
              {dealer?.average_rating?.toFixed(1) || "0.0"}
            </span>
            <StarRating rating={Math.round(dealer?.average_rating || 0)} />
            <span className="ml-2 text-sm text-neutral-500">
              ({dealer?.review_count || 0} reviews)
            </span>
          </div>
        </div>
        
        <div>
          {dealer?.reputation_tier && (
            <DealerReputationBadge tier={dealer.reputation_tier} />
          )}
        </div>
      </div>
      
      {isAuthenticated && !showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="mb-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Write a Review
        </button>
      )}
      
      {showReviewForm && (
        <div className="mb-6 p-4 bg-neutral-50 rounded-md border border-neutral-200">
          <h4 className="font-medium text-neutral-900 mb-2">Your Review</h4>
          
          {error && (
            <div className="mb-4 p-3 bg-error-50 text-error-700 rounded-md border border-error-200">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmitReview}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Rating
              </label>
              <StarRating rating={rating} setRating={setRating} editable={true} size="lg" />
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-1">
                Review (optional)
              </label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Share your experience with this dealer..."
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setRating(0);
                  setComment('');
                  setError('');
                }}
                className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className={`px-4 py-2 rounded-md text-white bg-primary-600 ${
                  isSubmitting || rating === 0
                    ? 'opacity-70 cursor-not-allowed'
                    : 'hover:bg-primary-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Submitting...
                  </span>
                ) : (
                  'Submit Review'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center py-8">
          <FaSpinner className="animate-spin text-2xl text-primary-600" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 text-neutral-500 bg-neutral-50 rounded-md">
          No reviews yet. Be the first to review this dealer!
        </div>
      ) : (
        <div>
          <div className="divide-y divide-neutral-200">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <nav className="flex items-center">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className={`mr-2 px-3 py-1 rounded-md ${
                    page === 1
                      ? 'opacity-50 cursor-not-allowed bg-neutral-100'
                      : 'bg-neutral-200 hover:bg-neutral-300'
                  }`}
                >
                  Previous
                </button>
                
                <span className="mx-2">
                  Page {page} of {totalPages}
                </span>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className={`ml-2 px-3 py-1 rounded-md ${
                    page === totalPages
                      ? 'opacity-50 cursor-not-allowed bg-neutral-100'
                      : 'bg-neutral-200 hover:bg-neutral-300'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

DealerReviewsSection.propTypes = {
  dealer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    reputation_tier: PropTypes.string,
    average_rating: PropTypes.number,
    review_count: PropTypes.number
  }).isRequired,
  onReviewAdded: PropTypes.func
};

StarRating.propTypes = {
  rating: PropTypes.number.isRequired,
  setRating: PropTypes.func,
  editable: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

ReviewItem.propTypes = {
  review: PropTypes.shape({
    id: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    comment: PropTypes.string,
    created_at: PropTypes.string.isRequired,
    user: PropTypes.shape({
      name: PropTypes.string.isRequired,
      profile_image: PropTypes.string
    }).isRequired
  }).isRequired
};

export default DealerReviewsSection; 