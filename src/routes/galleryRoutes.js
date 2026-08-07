import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { GalleryController } from '../controllers/galleryController.js';

const router = express.Router();
const galleryController = new GalleryController();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// The public collection view is open; the temporarily-deleted filter is admin-only
const authenticateWhenTemporarilyDeleted = (req, res, next) => {
    if (req.query['temporarily-deleted'] === 'true') return authenticateToken(req, res, next);

    next();
};

// POST route
router.post('/create-gallery', authenticateToken, upload.array('images'), galleryController.createGallery);

// GET route
router.get('/', authenticateWhenTemporarilyDeleted, galleryController.getGalleries); // ?temporarily-deleted=true filters to the recycle bin
router.get('/get-all-galleries', galleryController.getAllGalleries);

// PATCH
router.patch('/update-gallery-info/:id', authenticateToken, upload.array('images'), galleryController.updateGalleryInfo); // id points to gallery id
router.patch('/temporary-delete-gallery/:id', authenticateToken, galleryController.updateIsTemporarilyDeletedStatus); // id points to gallery id

// "DELETE" route (soft delete)
router.put('/soft-delete-gallery/:id', authenticateToken, galleryController.softDeleteGallery); // id points to gallery id

export default router;  
