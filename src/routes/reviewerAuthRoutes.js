import express from 'express';
import { ReviewerAuthController } from '../controllers/reviewerAuthController.js';
import { authenticateGoogleToken } from '../middleware/authenticateGoogleToken.js';

const router = express.Router();
const reviewerAuthController = new ReviewerAuthController();

router.post('/login', authenticateGoogleToken, reviewerAuthController.login);

export default router;