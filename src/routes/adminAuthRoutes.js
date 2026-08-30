import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { AdminAuthController } from '../controllers/adminAuthController.js';

const router = express.Router();
const adminAuthController = new AdminAuthController();

// POST route
router.post('/onboard', adminAuthController.signup);
router.post('/login', adminAuthController.login);
router.post('/confirm-password', authenticateToken, adminAuthController.confirmPassword); 

// PATCH route
router.patch('/password', authenticateToken, adminAuthController.updatePassword);

export default router;