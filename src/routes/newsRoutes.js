import express from 'express';
import multer from 'multer';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { NewsController } from '../controllers/newsController.js';

const router = express.Router();
const newsController = new NewsController();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST route
router.post('/create-news', authenticateToken, upload.array('images'), newsController.createNews);

// GET route
router.get('/get-all-news', authenticateToken, newsController.getAllNews);

// PATCH
router.patch('/update-news-info/:id', upload.array('images'), newsController.updateNewsInfo); // id points to news id
router.patch('/temporary-delete-news/:id', authenticateToken, newsController.updateIsTemporarilyDeletedStatus); // id points to news id

// "DELETE" route (soft delete)
router.put('/soft-delete-news/:id', authenticateToken, newsController.softDeleteNews); // id points to news id

export default router;