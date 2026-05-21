import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { GalleryController } from '../controllers/galleryController.js';

const router = express.Router();
const galleryController = new GalleryController();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route
router.post('/create-gallery', authenticateToken, upload.array('images'), galleryController.createGallery);

// GET route
router.get('/get-all-galleries', galleryController.getAllGalleries);
router.get('/temporary-deleted-galleries', authenticateToken, galleryController.getAllTemporarilyDeletedGalleries);

// PATCH
router.patch('/update-gallery-info/:id', upload.array('images'), galleryController.updateGalleryInfo); // id points to gallery id
router.patch('/temporary-delete-gallery/:id', authenticateToken, galleryController.updateIsTemporarilyDeletedStatus); // id points to gallery id

// "DELETE" route (soft delete)
router.put('/soft-delete-gallery/:id', authenticateToken, galleryController.softDeleteGallery); // id points to gallery id

export default router;  