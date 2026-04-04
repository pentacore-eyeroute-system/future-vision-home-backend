import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { PartnerController } from '../controllers/partnerController.js';

const router = express.Router();
const partnerController = new PartnerController();

// POST route
router.post('/add-partner', authenticateToken, partnerController.addPartner);

// GET route
router.get('/get-all-partners', authenticateToken, partnerController.getAllPartners);

// PUT route
router.put('/update-partner-info/:id', authenticateToken, partnerController.updatePartnerInfo);

// PATCH route
router.patch('/archive-partner/:id', authenticateToken, partnerController.updateIsArchivedStatus);
router.patch('/temporary-delete-partner/:id', authenticateToken, partnerController.updateIsTemporarilyDeletedStatus);

// "DELETE" route (soft delete)
router.put('/soft-delete-partner/:id', authenticateToken, partnerController.softDeletePartner);

export default router;