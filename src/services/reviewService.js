import { Review } from "../models/reviewModel.js";
import { User } from "../models/userModel.js";

export class ReviewService {
    async addReview(reviewData, transaction) {
        const existingReview = await Review.findOne({
            where: {
                rev_linked_reviewer_id: reviewData.linkedReviewerId
            },
            paranoid: false,
            transaction
        });

        if (existingReview) {
            if (existingReview.deletedAt) {
                await existingReview.restore({ transaction });
            }

            await existingReview.update({
                rev_rating: reviewData.rating,
                rev_feedback: reviewData.feedback,                
            }, { transaction });
            
            return existingReview;
        }

        return await Review.create({
            rev_linked_reviewer_id: reviewData.linkedReviewerId,
            rev_rating: reviewData.rating,
            rev_feedback: reviewData.feedback,
        }, { transaction });
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

    async softDeleteReview(reviewId, reviewerId, transaction) {
        const review = await Review.findByPk(reviewId, { transaction });

        if (!review) {
            const error = new Error('Review not found');
            error.statusCode = 404;
            throw error;
        }
        if (review.rev_linked_reviewer_id !== reviewerId){
            const error = new Error('Forbidden: Not allowed to delete others review');
            error.statusCode = 403;
            throw error;
        }
        
        await review.destroy({ transaction });
    };

    async updateReview(reviewId, reviewData, reviewerId, transaction) {
        const review = await Review.findOne({
            where: {
                id: reviewId,
                rev_linked_reviewer_id: reviewerId,
            },
            transaction,
        });

        if (!review) {
            throw new Error('Review not found');
        }

        await review.update({
            rev_rating: reviewData.rating,
            rev_feedback: reviewData.feedback,
        }, { transaction });

        return review;
    };
} 
