import { sequelize } from "../config/db.js";
import { UserService } from "./userService.js";
import { ReviewService } from "./reviewService.js";

const userService = new UserService();
const reviewService = new ReviewService();

export class ReviewManagementService {
    async addReview(reviewData) {
        const transaction = await sequelize.transaction();

        try {
            // Finds the reviewer based on id
            const reviewer = await userService.findById(reviewData.linkedReviewerId, transaction);

            // Stores review in table
            const review = await reviewService.addReview(reviewData, transaction);

            await transaction.commit();

            return review;
        } catch (err) {
            await transaction.rollback();

            throw err;
        }
    };

    async getAllReviews() {
        // Joins review and associated reviewer and returns them as one object
        const reviews = await reviewService.getAllReviews();

        return reviews.map(review => ({
            user: {
                id: review.reviewer.id,
                usr_email: review.reviewer.usr_email,
            },
            review: {
                id: review.id,
                rev_rating: review.rev_rating,
                rev_feedback: review.rev_feedback,
                rev_date: review.createdAt
            }
        }));
    };

    async softDeleteReview(reviewId) {
        const transaction = await sequelize.transaction();

        try {
            await reviewService.softDeleteReview(reviewId, transaction);

            await transaction.commit()
        } catch (err) {
            await transaction.rollback();

            throw err;
        }
    };
}