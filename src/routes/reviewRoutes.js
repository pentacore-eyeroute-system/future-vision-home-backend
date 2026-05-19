import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { ReviewController } from '../controllers/reviewController.js';

const router = express.Router();
const reviewController = new ReviewController();

// POST route
router.post('/add-review', authenticateToken, reviewController.addReview);

// GET route
router.get('/get-reviews', reviewController.getAllReviews);

// "DELETE" route
router.put('/soft-delete-review/:id', authenticateToken, reviewController.softDeleteReview); // id points to review id

export default router;