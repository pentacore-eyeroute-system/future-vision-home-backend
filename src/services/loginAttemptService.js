import { LoginAttempt } from "../models/loginAttemptModel.js";

const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 5 * 60 * 1000; // 5 minutes

export class LoginAttemptService {
    async getRecord(ip, username) {
        let record = await LoginAttempt.findOne({ where: { log_ip: ip, log_username: username }});

        if (!record) {
            record = await LoginAttempt.create({
                log_ip: ip,
                log_username: username,
                log_attempts: 0,
            });
        }

        return record;
    };

    async checkIsBlocked(record) {
        // If block already expired, then reset
        if (record.log_blocked_until && new Date() > record.log_blocked_until) {
            record.log_attempts = 0;
            record.log_blocked_until = null;

            await record.save();
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

    async onLoginFailed(record) {
        record.log_attempts += 1;

        // Block immediately when limit is reached
        if (record.log_attempts >= MAX_ATTEMPTS) {
            record.log_blocked_until = new Date (Date.now() + BLOCK_TIME);
        }

        await record.save();
        
        return record;
    };

    async onLoginSuccess(ip, username) {
        await LoginAttempt.destroy({ where: { log_ip: ip, log_username: username } });
    };
}