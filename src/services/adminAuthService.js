import { UserService } from "./userService.js";
import { LoginAttemptService } from './loginAttemptService.js';
import { TokenService } from "./tokenService.js";
import { AuthUtil } from '../utils/authUtil.js';
import { UserApplicationService } from "./userApplicationService.js";
import { sequelize } from '../config/db.js';
import { AuditLogService, ACTION_TYPES, CATEGORIES, SEVERITIES } from "./auditLogService.js";

const userService = new UserService();
const loginAttemptService = new LoginAttemptService();
const tokenService = new TokenService();
const authUtil = new AuthUtil();
const userApplicationService = new UserApplicationService();
const auditLogService = new AuditLogService();

export class AdminAuthService {
    async signup(userData) {
        const hashedPassword = await authUtil.hashPassword(userData.password);

        userData = {
            ...userData,
            password : hashedPassword
        }

        const existingUser = await userService.findByEmail(userData.email);

        if (existingUser) {
            let errorMessage = ''

            errorMessage = existingUser.usr_role === 'reviewer' 
                            ? 'Email is already registered as a reviewer and cannot be used for a staff account.'
                            : 'Email is already registered as a Future Vision Home staff member'

            const error = new Error(errorMessage);
            error.statusCode = 409;

            throw error;
        }

        const user = await userApplicationService.addApplication(userData);

        return user;
    };
    
    async login(ip, username, password, req) {
        const transaction = await sequelize.transaction();

        try {
            const record = await loginAttemptService.getRecord(ip, username, transaction);

            // Finds user application
            const userApplication = await userApplicationService.findByUsername(username, transaction);

            if (!userApplication) {
                const error = new Error('Account not found. Please sign up first.');
                error.statusCode = 404; // Mark it so the controller knows it's "safe"
                
                throw error;
            }

            // Rejects login if user application isn't approved
            if (userApplication.apl_status !== "approved") {
                if (userApplication.apl_status === "pending") {
                    const error = new Error('Account not yet verified. Please check again later.');
                    error.statusCode = 403; // Mark it so the controller knows it's "safe"
                    
                    throw error;
                }

                if (userApplication.apl_status === "rejected") {
                    const error = new Error('Account application was rejected.');
                    error.statusCode = 403; // Mark it so the controller knows it's "safe"
                    
                    throw error;
                }
            }
            
            // Finds the actual user record
            const user = await userService.findByUsername(username, transaction);

            if (!user) {
                const error = new Error('Account not found. Please sign up first.');
                error.statusCode = 404; // Mark it so the controller knows it's "safe"
                
                throw error;
            }

            // Rejects login if user is disabled approved
            if (user.usr_status === "disabled") {
                const error = new Error('Account has been disabled.');
                error.statusCode = 403; // Mark it so the controller knows it's "safe"
                
                throw error;
            }

            // Checks if user is blocked from previous session
            const blockStatus = await loginAttemptService.checkIsBlocked(record, transaction);

            if (blockStatus.isBlocked) {
                this.throwTooManyAttempts(blockStatus.retryAfter);
            }

            try {
                // Finds matching user
                const userValidated = await userService.validateCredentials(record, ip, username, password, req, transaction);

                const payload = {
                    id: userValidated.id,
                    role: (userValidated.usr_role === "admin") ? "admin" : "editor"
                };

                // Generates JWT token for admin
                const token = tokenService.generateJwt(payload);

                await auditLogService.log({
                    actorUserId: userValidated.id,
                    targetUserId: null,
                    actionType: ACTION_TYPES.AUTH_LOGIN_SUCCESS,
                    category: CATEGORIES.ACCESS,
                    severity: SEVERITIES.INFO,
                    isSecurityAlert: false,
                    details: `User ${userValidated.usr_fullname} (${userValidated.usr_username}) logged in successfully.`,
                    metadata: {
                        userId: userValidated.id,
                        username: userValidated.usr_username
                    },
                    request: req,
                    transaction
                });

                await transaction.commit();

                return {
                    user: userValidated,
                    token
                };
            } catch (err) {
                // Re-checks block status AFTER a failed attempt
                const postFailBlockStatus = await loginAttemptService.checkIsBlocked(record, transaction);

                if (postFailBlockStatus.isBlocked) {
                    await transaction.commit();
                    this.throwTooManyAttempts(postFailBlockStatus.retryAfter);
                }

                await transaction.commit();
                // If not blocked yet, throw the original "Incorrect username or password" message
                throw err;
            }
        } catch (err) {
            if (!transaction.finished) {
                await transaction.rollback();
            }
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

    async updatePassword(userData) {
        const transaction = await sequelize.transaction();

        try {
            const user = await userService.findById(userData.id, transaction);

            const isMatch = await authUtil.comparePassword(userData.password, user.usr_password);

            if (isMatch) {
                const error = new Error('New password cannot be the same as the current password');
                error.statusCode = 400;
                
                throw error;
            }

            const hashedPassword = await authUtil.hashPassword(userData.password);

            await userService.updatePassword(
                {
                    ...userData,
                    password: hashedPassword
                },
                transaction
            );

            await auditLogService.log({
                actorUserId: user.id,
                targetUserId: user.id,
                actionType: ACTION_TYPES.AUTH_PASSWORD_CHANGED,
                category: CATEGORIES.SECURITY,
                severity: SEVERITIES.WARNING,
                isSecurityAlert: true,
                details: `User ${user.usr_fullname} (${user.usr_username}) changed their password.`,
                metadata: {
                    userId: user.id,
                    username: user.username
                },
                transaction
            });

            await transaction.commit();
        } catch (err) {
            await transaction.rollback();

            throw err;
        }
    };
}