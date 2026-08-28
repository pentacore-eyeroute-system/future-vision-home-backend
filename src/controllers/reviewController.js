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

            const result = await reviewManagementService.addReview(reviewData, req);

            res.status(201).json({
                success: true,
                message: 'EyeRoute review store successful',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
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
                error: 'An internal server error occurred',
            });
        };
    };

    softDeleteReview = async (req, res) => {
        try {
            const reviewId = req.params.id;

            if (req.user.role !== 'reviewer') {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: You do not have access'
                });
                }

            const result = await reviewManagementService.softDeleteReview(reviewId, req.user.id, req);

            res.status(200).json({
                success: true,
                message: 'EyeRoute reviews soft delete successful',
                result
            });
        } catch (err) {
            res.status(err.statusCode || 500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        };
    }

    updateReview = async (req, res) => {
        try {
            const reviewId = req.params.id;
            const reviewData = {
                linkedReviewerId: req.user.id,
                rating: req.body.rating,
                feedback: req.body.feedback
            };

            const result = await reviewManagementService.updateReview(reviewId, reviewData, req);

            res.status(200).json({
                success: true,
                message: 'EyeRoute review update successful',
                result
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        };
    }
}
