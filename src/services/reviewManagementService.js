import { sequelize } from "../config/db.js";
import { UserService } from "./userService.js";
import { ReviewService } from "./reviewService.js";
import { AuditLogService, ACTION_TYPES, CATEGORIES, SEVERITIES } from "./auditLogService.js";

const userService = new UserService();
const reviewService = new ReviewService();
const auditLogService = new AuditLogService();

export class ReviewManagementService {
    async addReview(reviewData, req) {
        const transaction = await sequelize.transaction();

        try {
            // Finds the reviewer based on id
            const reviewer = await userService.findById(reviewData.linkedReviewerId, transaction);

            // Stores review in table
            const review = await reviewService.addReview(reviewData, transaction);

            await auditLogService.log({
                actorUserId: reviewData.linkedReviewerId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_CREATED,
                category: CATEGORIES.ACCESS,
                severity: SEVERITIES.INFO,
                isSecurityAlert: false,
                details: `Reviewer created a new review (ID: ${review.id}).`,
                metadata: { reviewId: review.id, rating: reviewData.rating },
                request: req,
                transaction
            });

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

    async softDeleteReview(reviewId, reviewerId, req) {
        const transaction = await sequelize.transaction();

        try {
            await reviewService.softDeleteReview(reviewId, reviewerId, transaction);

            await auditLogService.log({
                actorUserId: reviewerId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_DELETED,
                category: CATEGORIES.ACCESS,
                severity: SEVERITIES.WARNING,
                isSecurityAlert: false,
                details: `Reviewer deleted review (ID: ${reviewId}).`,
                metadata: { reviewId },
                request: req,
                transaction
            });

            await transaction.commit()
        } catch (err) {
            await transaction.rollback();

            throw err;
        }
    };

    async updateReview(reviewId, reviewData, req) {
        const transaction = await sequelize.transaction();

        try {
            const review = await reviewService.updateReview(
                reviewId,
                reviewData,
                reviewData.linkedReviewerId,
                transaction,
            );

            await auditLogService.log({
                actorUserId: reviewData.linkedReviewerId,
                targetUserId: null,
                actionType: ACTION_TYPES.CONTENT_UPDATED,
                category: CATEGORIES.ACCESS,
                severity: SEVERITIES.INFO,
                isSecurityAlert: false,
                details: `Reviewer updated review (ID: ${reviewId}).`,
                metadata: { reviewId, rating: reviewData.rating },
                request: req,
                transaction
            });

            await transaction.commit();

            return review;
        } catch (err) {
            await transaction.rollback();

            throw err;
        }
    };
}
