import express from 'express';
import { AdminAuthController } from '../controllers/adminAuthController.js';

const router = express.Router();
const adminAuthController = new AdminAuthController();

// POST route
router.post('/onboard', adminAuthController.signup);
router.post('/login', adminAuthController.login);

export default router;