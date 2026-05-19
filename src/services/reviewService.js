import { Review } from "../models/reviewModel.js";
import { User } from "../models/userModel.js";

export class ReviewService {
    async addReview(reviewData, transaction) {
        const [review, isCreated] = await Review.upsert(
        {
            rev_linked_reviewer_id: reviewData.linkedReviewerId,
            rev_rating: reviewData.rating,
            rev_feedback: reviewData.feedback,
        },
        { transaction }
        );

        return review;
    };

    async getAllReviews() {
        const reviews = await Review.findAll({
            include: {
                model: User,
                as: 'reviewer'
            }
        });

        return reviews;
    };

    async softDeleteReview(reviewId, transaction) {
        const review = await Review.findByPk(reviewId);
        
        await review.destroy({ transaction });
    };
} 