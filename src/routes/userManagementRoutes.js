import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { UserManagementController } from '../controllers/userManagementController.js';

const router = express.Router();
const userManagementController = new UserManagementController();

// GET route
router.get('/pending-request', authenticateToken, userManagementController.getAllPendingUserApplications);
router.get('/staff-members', authenticateToken, userManagementController.getAllStaffMembers);

// PATCH route
router.patch('/pending-request/:id', authenticateToken, userManagementController.updatePendingUserApplication); // id points to user application id

export default router;
