import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { VisionistaController } from '../controllers/visionistaController.js';

const router = express.Router();
const visionistaController = new VisionistaController();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route
router.post('/add-visionista', authenticateToken, upload.single('image'), visionistaController.addVisionista);

// GET route
router.get('/get-all-visionistas', authenticateToken, visionistaController.getAllVisionistas);

// PATCH route
router.patch('/update-visionista-info/:id', authenticateToken, upload.single('image'), visionistaController.updateVisionistaInfo);
router.patch('/archive-visionista/:id', authenticateToken, visionistaController.updateIsArchivedStatus);
router.patch('/temporary-delete-visionista/:id', authenticateToken, visionistaController.updateIsTemporarilyDeletedStatus);

// "DELETE" route (soft delete)
router.put('/soft-delete-visionista/:id', authenticateToken, visionistaController.softDeleteVisionista);

export default router;