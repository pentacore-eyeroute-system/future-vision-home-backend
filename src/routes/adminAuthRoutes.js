import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { AdminAuthController } from '../controllers/adminAuthController.js';

const router = express.Router();
const adminAuthController = new AdminAuthController();

// POST route
router.post('/onboard', adminAuthController.signup);
router.post('/login', adminAuthController.login);

// PATCH route
router.patch('/:id/password', authenticateToken, adminAuthController.updatePassword); // id points to user id

export default router;