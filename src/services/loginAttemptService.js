import { LoginAttempt } from "../models/loginAttemptModel.js";
import { User } from "../models/userModel.js";
import { AuditLogService, ACTION_TYPES, CATEGORIES, SEVERITIES, ACTOR_TYPES } from "./auditLogService.js";

const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 5 * 60 * 1000; // 5 minutes
const auditLogService = new AuditLogService();

export class LoginAttemptService {
    async getRecord(ip, username, transaction) {
        let record = await LoginAttempt.findOne({ where: { log_ip: ip, log_username: username }, transaction });

        if (!record) {
            record = await LoginAttempt.create({
                log_ip: ip,
                log_username: username,
                log_attempts: 0,
            }, { transaction });
        }

        return record;
    };

    async checkIsBlocked(record) {
        // If block already expired, then reset
        if (record.log_blocked_until && new Date() > record.log_blocked_until) {
            record.log_attempts = 0;
            record.log_blocked_until = null;

            await record.save({ transaction });
        }

        // If still blocked
        if (record.log_blocked_until && new Date() < record.log_blocked_until) {
            return { 
                isBlocked: true, 
                retryAfter: record.log_blocked_until 
            };
        }

        return { isBlocked: false };
    };

    async onLoginFailed(record, req, transaction) {
        record.log_attempts += 1;

        const user = await User.findOne({ where: { usr_username: record.log_username }, transaction });
        const targetUserId = user ? user.id : null;

        // Log the failed login attempt
        await auditLogService.log({
            actorUserId: null,
            targetUserId,
            actorType: ACTOR_TYPES.USER,
            actionType: ACTION_TYPES.AUTH_FAILED_LOGIN,
            category: CATEGORIES.SECURITY,
            severity: SEVERITIES.WARNING,
            isSecurityAlert: false,
            details: `Failed login attempt for username '${record.log_username}' from IP ${record.log_ip || 'unknown'}.`,
            metadata: {
                ip: record.log_ip,
                username: record.log_username,
                attemptNumber: record.log_attempts
            },
            request: req,
            transaction
        });

        // Block immediately when limit is reached
        if (record.log_attempts >= MAX_ATTEMPTS) {
            record.log_blocked_until = new Date (Date.now() + BLOCK_TIME);

            // Log the lockout event
            await auditLogService.log({
                actorUserId: null,
                targetUserId,
                actorType: ACTOR_TYPES.SYSTEM,
                actionType: ACTION_TYPES.AUTH_FAILED_LOCKOUT,
                category: CATEGORIES.SECURITY,
                severity: SEVERITIES.CRITICAL,
                isSecurityAlert: true,
                details: `IP ${record.log_ip} blocked for 5 minutes due to 3 failed login attempts on username '${record.log_username}'.`,
                metadata: {
                    ip: record.log_ip,
                    username: record.log_username,
                    attempts: record.log_attempts
                },
                request: req,
                transaction
            });
        }

        await record.save({ transaction });
        
        return record;
    };

    async onLoginSuccess(ip, username, transaction) {
        await LoginAttempt.destroy({ where: { log_ip: ip, log_username: username }, transaction });
    };
}