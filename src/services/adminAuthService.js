import { UserService } from "./userService.js";
import { LoginAttemptService } from './loginAttemptService.js';
import { TokenService } from "./tokenService.js";

const userService = new UserService();
const loginAttemptService = new LoginAttemptService();
const tokenService = new TokenService();

export class AdminAuthService {    
    async login(ip, username, password) {
        const record = await loginAttemptService.getRecord(ip, username);

        // Checks if user is blocked from previous session
        const blockStatus = await loginAttemptService.checkIsBlocked(record);

        if (blockStatus.isBlocked) {
            this.throwTooManyAttempts(blockStatus.retryAfter);
        }

        try {
            // Finds matching admin
            const admin = await userService.validateCredentials(record, ip, username, password);

            const payload = {
                id: admin.id,
                role: "admin"
            };

            // Generates JWT token for admin
            const token = await tokenService.generateJwt(payload);

            return token;
        } catch (err) {
            // Re-checks block status AFTER a failed attempt
            const postFailBlockStatus = await loginAttemptService.checkIsBlocked(record);

            if (postFailBlockStatus.isBlocked) {
                this.throwTooManyAttempts(postFailBlockStatus.retryAfter);
            }

            // If not blocked yet, throw the original "Incorrect username or password" message
            throw err;
        }
    };

    throwTooManyAttempts(retryAfter) {
        const error = new Error('Too many attempts');

        error.statusCode = 429;
        error.retryAfter = this.getRetryMessage(retryAfter);

        throw error;
    }

    getRetryMessage(retryAfter) {
        const retryTime = new Date(retryAfter);
        const now = new Date();

        const diffMs = retryTime - now;

        if (diffMs <= 0) return "Try again now";

        const diffMinutes = Math.ceil(diffMs / (1000 * 60));

        if (diffMinutes < 60) {
            return `Too many attempts. Try again in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}.`;
        }
    };
}