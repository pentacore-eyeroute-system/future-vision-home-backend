import express from 'express';
import { AdminAuthController } from '../controllers/adminAuthController.js';

const router = express.Router();
const adminAuthController = new AdminAuthController();

router.post('/login', adminAuthController.login);

export default router;