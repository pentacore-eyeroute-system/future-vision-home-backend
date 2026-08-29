import { AuditLog } from "../models/auditLogModel.js";
import { User } from "../models/userModel.js";
import { UserApplication } from "../models/userApplicationModel.js";
import pkgSeq from "sequelize";
const { Op } = pkgSeq;

export const ACTION_TYPES = {
    APPROVED_REQUEST: "APPROVED_REQUEST",
    REJECTED_REQUEST: "REJECTED_REQUEST",
    PROMOTED_TO_ADMIN: "PROMOTED_TO_ADMIN",
    DEMOTED_TO_EDITOR: "DEMOTED_TO_EDITOR",
    REMOVED_STAFF_MEMBER: "REMOVED_STAFF_MEMBER",
    AUTH_FAILED_LOCKOUT: "AUTH_FAILED_LOCKOUT",
    AUTH_LOGIN_SUCCESS: "AUTH_LOGIN_SUCCESS",
    AUTH_FAILED_LOGIN: "AUTH_FAILED_LOGIN",
    AUTH_PASSWORD_CHANGED: "AUTH_PASSWORD_CHANGED",
    SYSTEM_EXPORT_LOGS: "SYSTEM_EXPORT_LOGS",
    CONTENT_CREATED: "CONTENT_CREATED",
    CONTENT_UPDATED: "CONTENT_UPDATED",
    CONTENT_DELETED: "CONTENT_DELETED",
    CONTENT_RESTORED: "CONTENT_RESTORED"
};

export const CATEGORIES = {
    ACCESS: "ACCESS",
    ROLES: "ROLES",
    STAFF: "STAFF",
    SECURITY: "SECURITY",
};

export const SEVERITIES = {
    INFO: "info",
    WARNING: "warning",
    CRITICAL: "critical",
};

export const ACTOR_TYPES = {
    USER: "user",
    SYSTEM: "system",
};

const ACTION_LABELS = {
    [ACTION_TYPES.APPROVED_REQUEST]: "Access Request Approved",
    [ACTION_TYPES.REJECTED_REQUEST]: "Access Request Rejected",
    [ACTION_TYPES.PROMOTED_TO_ADMIN]: "Staff Promoted to Admin",
    [ACTION_TYPES.DEMOTED_TO_EDITOR]: "Staff Demoted to Editor",
    [ACTION_TYPES.REMOVED_STAFF_MEMBER]: "Staff Member Disabled",
    [ACTION_TYPES.AUTH_FAILED_LOCKOUT]: "Account Locked Out due to Failed Authentication",
    [ACTION_TYPES.AUTH_LOGIN_SUCCESS]: "User Logged In Successfully",
    [ACTION_TYPES.AUTH_FAILED_LOGIN]: "User Failed Login Attempt",
    [ACTION_TYPES.AUTH_PASSWORD_CHANGED]: "User Changed Password",
    [ACTION_TYPES.SYSTEM_EXPORT_LOGS]: "System Audit Logs Exported",
    [ACTION_TYPES.CONTENT_CREATED]: "Content Resource Created",
    [ACTION_TYPES.CONTENT_UPDATED]: "Content Resource Updated",
    [ACTION_TYPES.CONTENT_DELETED]: "Content Resource Deleted",
    [ACTION_TYPES.CONTENT_RESTORED]: "Content Resource Restored"
};

export class AuditLogService {
    async log({
        actorUserId = null,
        targetUserId = null,
        targetApplicationId = null,
        actorType = ACTOR_TYPES.USER,
        actionType,
        category,
        severity = SEVERITIES.INFO,
        isSecurityAlert = false,
        details = null,
        metadata = null,
        request = null,
        transaction = null,
    }) {
        // Enforce validation on actions, categories, severities, and actors
        if (!Object.values(ACTION_TYPES).includes(actionType)) {
            const error = new Error('Invalid actionType');
            error.statusCode = 400;

            throw error;
        }
        if (!Object.values(CATEGORIES).includes(category)) {
            const error = new Error('Invalid category');
            error.statusCode = 400;
            
            throw error;
        }
        if (!Object.values(SEVERITIES).includes(severity)) {
            const error = new Error('Invalid severity');
            error.statusCode = 400;
            
            throw error;
        }
        if (!Object.values(ACTOR_TYPES).includes(actorType)) {
            const error = new Error('Invalid actorType');
            error.statusCode = 400;

            throw error;
        }

        // Sanitize sensitive values from metadata if present
        let sanitizedMetadata = metadata;
        if (sanitizedMetadata && typeof sanitizedMetadata === "object") {
            sanitizedMetadata = { ...metadata };
            const sensitiveKeys = ["password", "otp", "token", "secret", "authorization", "passwordConfirm"];
            for (const key of Object.keys(sanitizedMetadata)) {
                if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
                    delete sanitizedMetadata[key];
                }
            }
        }

        // Extract connection details from req if provided
        let ipAddress = null;
        let userAgent = null;

        if (request) {
            ipAddress = request.ip || request.headers?.["x-forwarded-for"] || request.socket?.remoteAddress || null;
            userAgent = request.headers?.["user-agent"] || null;
        }

        return await AuditLog.create(
            {
                aud_actor_user_id: actorUserId,
                aud_target_user_id: targetUserId,
                aud_target_application_id: targetApplicationId,
                aud_actor_type: actorType,
                aud_action_type: actionType,
                aud_category: category,
                aud_severity: severity,
                aud_is_security_alert: isSecurityAlert,
                aud_details: details,
                aud_metadata: sanitizedMetadata,
                aud_ip_address: ipAddress,
                aud_user_agent: userAgent,
            },
            { transaction }
        );
    }

    /**
     * Formats database audit logs to the frontend representation.
     */
    formatLog(log) {
        if (!log) return null;
        const plainLog = typeof log.toJSON === "function" ? log.toJSON() : log;

        return {
            id: plainLog.id,
            timestamp: plainLog.createdAt,
            actor: plainLog.actor ? {
                id: plainLog.actor.id,
                fullname: plainLog.actor.usr_fullname,
                email: plainLog.actor.usr_email,
                username: plainLog.actor.usr_username,
                role: plainLog.actor.usr_role,
            } : null,
            actionType: plainLog.aud_action_type,
            actionLabel: ACTION_LABELS[plainLog.aud_action_type] || plainLog.aud_action_type,
            category: plainLog.aud_category,
            severity: plainLog.aud_severity,
            isSecurityAlert: plainLog.aud_is_security_alert,
            targetUser: plainLog.target ? {
                id: plainLog.target.id,
                fullname: plainLog.target.usr_fullname,
                email: plainLog.target.usr_email,
                username: plainLog.target.usr_username,
                role: plainLog.target.usr_role,
            } : null,
            targetApplication: plainLog.targetApplication ? {
                id: plainLog.targetApplication.id,
                fullname: plainLog.targetApplication.apl_fullname,
                email: plainLog.targetApplication.apl_email,
                username: plainLog.targetApplication.apl_username,
                status: plainLog.targetApplication.apl_status,
            } : null,
            details: plainLog.aud_details,
            metadata: plainLog.aud_metadata,
        };
    }

    async getAuditLogs(filters = {}) {
        // const page = parseInt(filters.page) || 1;
        // const limit = parseInt(filters.limit) || 10;
        // const offset = (page - 1) * limit;

        const where = {};

        if (filters.category) {
            where.aud_category = filters.category;
        }
        if (filters.actionType) {
            where.aud_action_type = filters.actionType;
        }
        if (filters.severity) {
            where.aud_severity = filters.severity;
        }
        if (filters.isSecurityAlert !== undefined && filters.isSecurityAlert !== null && filters.isSecurityAlert !== '') {
            where.aud_is_security_alert = filters.isSecurityAlert === 'true' || filters.isSecurityAlert === true;
        }
        if (filters.actorUserId) {
            where.aud_actor_user_id = filters.actorUserId;
        }
        if (filters.targetUserId) {
            where.aud_target_user_id = filters.targetUserId;
        }
        if (filters.targetApplicationId) {
            where.aud_target_application_id = filters.targetApplicationId;
        }

        // Date range filtering
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt[Op.gte] = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.createdAt[Op.lte] = new Date(filters.endDate);
            }
        }

        const { count, rows } = await AuditLog.findAndCountAll({
            where,
            include: [
                { model: User, as: 'actor', attributes: ['id', 'usr_fullname', 'usr_email', 'usr_username', 'usr_role'] },
                { model: User, as: 'target', attributes: ['id', 'usr_fullname', 'usr_email', 'usr_username', 'usr_role'] },
                { model: UserApplication, as: 'targetApplication', attributes: ['id', 'apl_fullname', 'apl_email', 'apl_username', 'apl_status'] }
            ],
            order: [['createdAt', 'DESC']],
            // limit,
            // offset
        });

        return {
            // total: count,
            // totalPages: Math.ceil(count / limit),
            // currentPage: page,
            // limit,
            logs: rows.map(log => this.formatLog(log))
        };
    }

    async getAuditLogById(id) {
        const log = await AuditLog.findByPk(id, {
            include: [
                { model: User, as: 'actor', attributes: ['id', 'usr_fullname', 'usr_email', 'usr_username', 'usr_role'] },
                { model: User, as: 'target', attributes: ['id', 'usr_fullname', 'usr_email', 'usr_username', 'usr_role'] },
                { model: UserApplication, as: 'targetApplication', attributes: ['id', 'apl_fullname', 'apl_email', 'apl_username', 'apl_status'] }
            ]
        });

        if (!log) {
            const error = new Error('Audit log not found');
            error.statusCode = 404; // Mark it so the controller knows it's "safe"
            
            throw error;
        }

        return this.formatLog(log);
    }

    async getAuditLogsExport(filters = {}) {
        const where = {};

        if (filters.category) {
            where.aud_category = filters.category;
        }
        if (filters.actionType) {
            where.aud_action_type = filters.actionType;
        }
        if (filters.severity) {
            where.aud_severity = filters.severity;
        }
        if (filters.isSecurityAlert !== undefined && filters.isSecurityAlert !== null && filters.isSecurityAlert !== '') {
            where.aud_is_security_alert = filters.isSecurityAlert === 'true' || filters.isSecurityAlert === true;
        }
        if (filters.actorUserId) {
            where.aud_actor_user_id = filters.actorUserId;
        }
        if (filters.targetUserId) {
            where.aud_target_user_id = filters.targetUserId;
        }
        if (filters.targetApplicationId) {
            where.aud_target_application_id = filters.targetApplicationId;
        }

        // Date range filtering
        if (filters.startDate || filters.endDate) {
            where.createdAt = {};
            if (filters.startDate) {
                where.createdAt[Op.gte] = new Date(filters.startDate);
            }
            if (filters.endDate) {
                where.createdAt[Op.lte] = new Date(filters.endDate);
            }
        }

        const rows = await AuditLog.findAll({
            where,
            include: [
                { model: User, as: 'actor', attributes: ['id', 'usr_fullname', 'usr_email', 'usr_username', 'usr_role'] },
                { model: User, as: 'target', attributes: ['id', 'usr_fullname', 'usr_email', 'usr_username', 'usr_role'] },
                { model: UserApplication, as: 'targetApplication', attributes: ['id', 'apl_fullname', 'apl_email', 'apl_username', 'apl_status'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        return rows.map(log => this.formatLog(log));
    }
}
