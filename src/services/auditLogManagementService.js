import { AuditLogService, ACTION_TYPES, CATEGORIES, SEVERITIES } from "./auditLogService.js";

const auditLogService = new AuditLogService();

export class AuditLogManagementService {
    async getAuditLogs(filters) {
        return await auditLogService.getAuditLogs(filters);
    }

    async getAuditLogById(id) {
        return await auditLogService.getAuditLogById(id);
    }

    async exportAuditLogsToCsv(filters, actorUserId, req) {
        const logs = await auditLogService.getAuditLogsExport(filters);

        await auditLogService.log({
            actorUserId,
            targetUserId: null,
            actionType: ACTION_TYPES.SYSTEM_EXPORT_LOGS,
            category: CATEGORIES.SECURITY,
            severity: SEVERITIES.WARNING,
            isSecurityAlert: true,
            details: `Exported audit logs as CSV.`,
            metadata: {
                filters
            },
            request: req
        });

        const headers = [
            "Log ID",
            "Timestamp",
            "Actor Name",
            "Actor Username",
            "Actor Email",
            "Actor Role",
            "Action Type",
            "Action Label",
            "Category",
            "Severity",
            "Is Security Alert",
            "Target Name",
            "Target Username",
            "Target Email",
            "Target Role",
            "Target Application ID",
            "Target Application Name",
            "Target Application Username",
            "Target Application Email",
            "Details",
            "IP Address",
            "User Agent"
        ];

        const escapeCsvValue = (val) => {
            if (val === null || val === undefined) return "";
            let str = String(val);
            if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
                str = str.replace(/"/g, '""');
                return `"${str}"`;
            }
            return str;
        };

        const rows = logs.map(log => [
            log.id,
            log.timestamp,
            log.actor ? log.actor.fullname : "System",
            log.actor ? log.actor.username : "system",
            log.actor ? log.actor.email : "system",
            log.actor ? log.actor.role : "system",
            log.actionType,
            log.actionLabel,
            log.category,
            log.severity,
            log.isSecurityAlert ? "TRUE" : "FALSE",
            log.targetUser ? log.targetUser.fullname : "",
            log.targetUser ? log.targetUser.username : "",
            log.targetUser ? log.targetUser.email : "",
            log.targetUser ? log.targetUser.role : "",
            log.targetApplication ? log.targetApplication.id : "",
            log.targetApplication ? log.targetApplication.fullname : "",
            log.targetApplication ? log.targetApplication.username : "",
            log.targetApplication ? log.targetApplication.email : "",
            log.details,
            log.ipAddress,
            log.userAgent
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(escapeCsvValue).join(","))
        ].join("\n");

        return csvContent;
    }
}
