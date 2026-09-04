import express from "express";
import { authenticateToken } from "../middleware/authenticateToken.js";
import { noCache } from '../middleware/noCache.js';
import { AuditLogController } from "../controllers/auditLogController.js";

const router = express.Router();
const auditLogController = new AuditLogController();

// GET route
router.get("/", authenticateToken, noCache, auditLogController.getAllLogs);
router.get("/export/csv", authenticateToken, auditLogController.exportCsv);
router.get("/:id", authenticateToken, auditLogController.getLogById);

export default router;
