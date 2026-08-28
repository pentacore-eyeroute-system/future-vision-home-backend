import { AuditLogManagementService } from "../services/auditLogManagementService.js";
import { UserService } from "../services/userService.js";

const auditLogManagementService = new AuditLogManagementService();
const userService = new UserService();

export class AuditLogController {
    getAllLogs = async (req, res) => {
        try {
            // Require admin role for authorization by checking the database
            const user = await userService.findById(req.user.id);

            if (user.usr_role !== "admin") {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden: Admin access required to retrieve audit logs.",
                });
            }

            const {
                // page,
                // limit,
                category,
                actionType,
                severity,
                isSecurityAlert,
                actorUserId,
                targetUserId,
                targetApplicationId,
                startDate,
                endDate
            } = req.query;

            const result = await auditLogManagementService.getAuditLogs({
                // page,
                // limit,
                category,
                actionType,
                severity,
                isSecurityAlert,
                actorUserId,
                targetUserId,
                targetApplicationId,
                startDate,
                endDate
            });

            res.status(200).json({
                success: true,
                message: "Audit logs retrieved successfully",
                result,
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    };

    getLogById = async (req, res) => {
        try {
            // Require admin role for authorization by checking the database
            const user = await userService.findById(req.user.id);

            if (user.usr_role !== "admin") {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden: Admin access required to retrieve audit logs.",
                });
            }

            const log = await auditLogManagementService.getAuditLogById(req.params.id);

            res.status(200).json({
                success: true,
                message: "Audit log retrieved successfully",
                result: log,
            });
        } catch (err) {
            if (err.message === "Audit log not found") {
                return res.status(404).json({
                    success: false,
                    error: err.message,
                });
            }

            res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    };

    exportCsv = async (req, res) => {
        try {
            // Require admin role for authorization by checking the database
            const user = await userService.findById(req.user.id);
            
            if (user.usr_role !== "admin") {
                return res.status(403).json({
                    success: false,
                    error: "Forbidden: Admin access required to export audit logs.",
                });
            }

            const {
                category,
                actionType,
                severity,
                isSecurityAlert,
                actorUserId,
                targetUserId,
                targetApplicationId,
                startDate,
                endDate
            } = req.query;

            const csvContent = await auditLogManagementService.exportAuditLogsToCsv({
                category,
                actionType,
                severity,
                isSecurityAlert,
                actorUserId,
                targetUserId,
                targetApplicationId,
                startDate,
                endDate
            }, req.user.id, req);

            res.setHeader("Content-Type", "text/csv");
            res.setHeader("Content-Disposition", 'attachment; filename="audit_logs.csv"');
            return res.status(200).send(csvContent);
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    };
}
