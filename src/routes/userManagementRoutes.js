import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { UserManagementController } from '../controllers/userManagementController.js';

const router = express.Router();
const userManagementController = new UserManagementController();

// GET route
router.get('/pending-request', authenticateToken, userManagementController.getAllPendingUserApplications);

export default router;
