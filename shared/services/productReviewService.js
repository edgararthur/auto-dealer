import supabase from '../supabase/supabaseClient.js';

/**
 * Service for managing product reviews
 */
const ProductReviewService = {
  /**
   * Add a new product review
   * @param {string} productId - Product ID
   * @param {string} userId - User ID
   * @param {Object} reviewData - Review data
   * @returns {Promise} - Review creation result
   */
  addReview: async (productId, userId, reviewData) => {
    try {
      const { rating, comment, title } = reviewData;

      // Validate required fields
      if (!rating || rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      if (!comment || comment.trim().length < 10) {
        throw new Error('Review comment must be at least 10 characters long');
      }

      // Check if user has already reviewed this product
      const { data: existingReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', userId)
        .single();

      if (existingReview) {
        throw new Error('You have already reviewed this product');
      }

      // Create the review
      const { data: review, error } = await supabase
        .from('product_reviews')
        .insert({
          product_id: productId,
          user_id: userId,
          rating,
          comment: comment.trim(),
          title: title?.trim() || null,
          status: 'pending', // Reviews need moderation
          helpful_count: 0,
          not_helpful_count: 0
        })
        .select(`
          id,
          rating,
          comment,
          title,
          created_at,
          user:profiles!user_id(id, full_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error adding review:', error);
        throw error;
      }

      return { success: true, review };

    } catch (error) {
      console.error('Error in addReview:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get reviews for a product
   * @param {string} productId - Product ID
   * @param {Object} options - Query options
   * @returns {Promise} - Product reviews
   */
  getProductReviews: async (productId, options = {}) => {
    try {
      let query = supabase
        .from('product_reviews')
        .select(`
          id,
          rating,
          comment,
          title,
          helpful_count,
          not_helpful_count,
          created_at,
          updated_at,
          user:profiles!user_id(id, full_name, avatar_url)
        `)
        .eq('product_id', productId)
        .eq('status', 'approved'); // Only show approved reviews

      // Apply sorting
      if (options.sortBy) {
        switch (options.sortBy) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'rating_high':
            query = query.order('rating', { ascending: false });
            break;
          case 'rating_low':
            query = query.order('rating', { ascending: true });
            break;
          case 'helpful':
            query = query.order('helpful_count', { ascending: false });
            break;
          default:
            query = query.order('created_at', { ascending: false });
        }
      } else {
        query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (options.page && options.limit) {
        const start = (options.page - 1) * options.limit;
        const end = start + options.limit - 1;
        query = query.range(start, end);
      } else if (options.limit) {
        query = query.limit(options.limit);
      }

      // Filter by rating if specified
      if (options.rating) {
        query = query.eq('rating', options.rating);
      }

      const { data: reviews, error } = await query;

      if (error) {
        console.error('Error fetching product reviews:', error);
        throw error;
      }

      const transformedData = reviews.map(review => ({
        ...review,
        user: {
          id: review.user?.id,
          name: review.user?.full_name || 'Anonymous',
          avatar: review.user?.avatar_url
        },
        helpfulnessRatio: review.helpful_count + review.not_helpful_count > 0 
          ? review.helpful_count / (review.helpful_count + review.not_helpful_count) 
          : 0,
        timeAgo: getTimeAgo(review.created_at)
      }));

      return { 
        success: true, 
        reviews: transformedData,
        hasMore: options.limit ? transformedData.length === options.limit : false
      };

    } catch (error) {
      console.error('Error in getProductReviews:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get review statistics for a product
   * @param {string} productId - Product ID
   * @returns {Promise} - Review statistics
   */
  getReviewStats: async (productId) => {
    try {
      const { data: reviews, error } = await supabase
        .from('product_reviews')
        .select('rating')
        .eq('product_id', productId)
        .eq('status', 'approved');

      if (error) {
        console.error('Error fetching review stats:', error);
        throw error;
      }

      if (!reviews || reviews.length === 0) {
        return {
          success: true,
          stats: {
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          }
        };
      }

      const totalReviews = reviews.length;
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      
      // Calculate rating distribution
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach(review => {
        ratingDistribution[review.rating]++;
      });

      return {
        success: true,
        stats: {
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution
        }
      };

    } catch (error) {
      console.error('Error in getReviewStats:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Mark a review as helpful or not helpful
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID
   * @param {boolean} helpful - Whether the review is helpful
   * @returns {Promise} - Update result
   */
  markReviewHelpful: async (reviewId, userId, helpful = true) => {
    try {
      // Check if user has already voted on this review
      const { data: existingVote } = await supabase
        .from('review_helpfulness')
        .select('id, helpful')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .single();

      if (existingVote) {
        // Update existing vote if different
        if (existingVote.helpful !== helpful) {
          const { error: updateError } = await supabase
            .from('review_helpfulness')
            .update({ helpful })
            .eq('id', existingVote.id);

          if (updateError) {
            console.error('Error updating helpfulness vote:', updateError);
            throw updateError;
          }
        }
      } else {
        // Create new vote
        const { error: insertError } = await supabase
          .from('review_helpfulness')
          .insert({
            review_id: reviewId,
            user_id: userId,
            helpful
          });

        if (insertError) {
          console.error('Error adding helpfulness vote:', insertError);
          throw insertError;
        }
      }

      // Update the review's helpful/not helpful counts
      const { data: votes } = await supabase
        .from('review_helpfulness')
        .select('helpful')
        .eq('review_id', reviewId);

      const helpfulCount = votes?.filter(v => v.helpful).length || 0;
      const notHelpfulCount = votes?.filter(v => !v.helpful).length || 0;

      const { error: updateReviewError } = await supabase
        .from('product_reviews')
        .update({
          helpful_count: helpfulCount,
          not_helpful_count: notHelpfulCount
        })
        .eq('id', reviewId);

      if (updateReviewError) {
        console.error('Error updating review counts:', updateReviewError);
        throw updateReviewError;
      }

      return { success: true };

    } catch (error) {
      console.error('Error in markReviewHelpful:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update a review
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID (must be review owner)
   * @param {Object} updateData - Update data
   * @returns {Promise} - Update result
   */
  updateReview: async (reviewId, userId, updateData) => {
    try {
      const { rating, comment, title } = updateData;

      // Validate fields if provided
      if (rating && (rating < 1 || rating > 5)) {
        throw new Error('Rating must be between 1 and 5');
      }

      if (comment && comment.trim().length < 10) {
        throw new Error('Review comment must be at least 10 characters long');
      }

      const updateFields = {};
      if (rating) updateFields.rating = rating;
      if (comment) updateFields.comment = comment.trim();
      if (title !== undefined) updateFields.title = title?.trim() || null;
      updateFields.updated_at = new Date().toISOString();
      updateFields.status = 'pending'; // Re-moderation required

      const { data: review, error } = await supabase
        .from('product_reviews')
        .update(updateFields)
        .eq('id', reviewId)
        .eq('user_id', userId) // Ensure user owns the review
        .select(`
          id,
          rating,
          comment,
          title,
          updated_at,
          user:profiles!user_id(id, full_name, avatar_url)
        `)
        .single();

      if (error) {
        console.error('Error updating review:', error);
        throw error;
      }

      if (!review) {
        throw new Error('Review not found or you do not have permission to update it');
      }

      return { success: true, review };

    } catch (error) {
      console.error('Error in updateReview:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete a review
   * @param {string} reviewId - Review ID
   * @param {string} userId - User ID (must be review owner)
   * @returns {Promise} - Delete result
   */
  deleteReview: async (reviewId, userId) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', userId); // Ensure user owns the review

      if (error) {
        console.error('Error deleting review:', error);
        throw error;
      }

      return { success: true };

    } catch (error) {
      console.error('Error in deleteReview:', error);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Helper function to calculate time ago
 * @param {string} dateString - Date string
 * @returns {string} - Time ago string
 */
function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

export default ProductReviewService; 