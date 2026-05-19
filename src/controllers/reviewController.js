import { ReviewManagementService } from "../services/reviewManagementService.js";

const reviewManagementService = new ReviewManagementService();

export class ReviewController {
    addReview = async (req, res) => {
        try {
            const reviewData = {
                linkedReviewerId: req.user.id,
                rating: req.body.rating,
                feedback: req.body.feedback
            };

            const result = await reviewManagementService.addReview(reviewData);

            res.status(201).json({
                success: true,
                message: 'EyeRoute review store successful',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        };
    };

    getAllReviews = async (req, res) => {
        try {
            const result = await reviewManagementService.getAllReviews();

            res.status(200).json({
                success: true,
                message: 'EyeRoute reviews retrieval successful',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        };
    };

    softDeleteReview = async (req, res) => {
        try {
            const reviewId = req.params.id;

            const result = await reviewManagementService.softDeleteReview(reviewId);

            res.status(200).json({
                success: true,
                message: 'EyeRoute reviews soft delete successful',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        };
    }
}