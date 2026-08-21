import { UserService } from "./userService.js";
import { LoginAttemptService } from './loginAttemptService.js';
import { TokenService } from "./tokenService.js";
import { AuthUtil } from '../utils/authUtil.js';
import { UserApplicationService } from "./userApplicationService.js";

const userService = new UserService();
const loginAttemptService = new LoginAttemptService();
const tokenService = new TokenService();
const authUtil = new AuthUtil();
const userApplicationService = new UserApplicationService();

export class AdminAuthService {
    async signup(userData) {
        const hashedPassword = await authUtil.hashPassword(userData.password);

        userData = {
            ...userData,
            password : hashedPassword
        }

        const user = await userApplicationService.addApplication(userData);

        return user;
    };
    
    async login(ip, username, password) {
        const record = await loginAttemptService.getRecord(ip, username);

        // Finds user application
        const userApplication = await userApplicationService.findByUsername(username);

        if (!userApplication) {
            throw new Error('Account not found. Please sign up first.')
        }

        // Rejects login if user application isn't approved
        if (userApplication.apl_status !== "approved") {
            if (userApplication.apl_status === "pending") {
                throw new Error('Account not yet verified. Please check again later.');
            }

            if (userApplication.apl_status === "rejected") {
                throw new Error('Account application was rejected.');
            }
        }
        
        // Finds the actual user record
        const user = await userService.findByUsername(username);

        if (!user) {
            throw new Error('Account not found. Please sign up first.')
        }

        // Rejects login if user is disabled approved
        if (user.usr_status === "disabled") {
            throw new Error('Account has been suspended.')   
        }

        // Checks if user is blocked from previous session
        const blockStatus = await loginAttemptService.checkIsBlocked(record);

        if (blockStatus.isBlocked) {
            this.throwTooManyAttempts(blockStatus.retryAfter);
        }

        try {
            // Finds matching user
            const user = await userService.validateCredentials(record, ip, username, password);

            const payload = {
                id: user.id,
                role: (user.usr_role === "admin") ? "admin" : "editor"
            };

            // Generates JWT token for admin
            const token = tokenService.generateJwt(payload);

            return {
                user,
                token
            };
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