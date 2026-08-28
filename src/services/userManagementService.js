import { UserApplicationService } from "./userApplicationService.js"
import { UserService } from "./userService.js";
import { EmailService } from "./emailService.js";
import { AuditLogService, ACTION_TYPES, CATEGORIES, SEVERITIES } from "./auditLogService.js";
import { sequelize } from "../config/db.js";

const userApplicationService = new UserApplicationService();
const userService = new UserService();
const emailService = new EmailService();
const auditLogService = new AuditLogService();

export class UserManagementService {
    async getAllPendingUserApplications() {
        const userApplications = await userApplicationService.getAllPendingUserApplications();

        return userApplications;
    }

    async getAllStaffMembers() {
        const staffMembers = await userService.getAllStaffMembers();

        return staffMembers;
    };
 
    async updatePendingUserApplication(userApplicationData, actorId, req) {
        const transaction = await sequelize.transaction();

        try {
            const userApplication = await userApplicationService.findById(userApplicationData.id, transaction);

            if (userApplication.apl_status === "approved" ||
                userApplication.apl_status === "rejected"
            ) {
                throw new Error('Application has already been approved/rejected');
            }

            const updatedUserApplication = await userApplicationService.updateStatus(userApplicationData, transaction);

            if (updatedUserApplication.apl_status === "rejected") {
                await auditLogService.log({
                    actorUserId: actorId,
                    targetUserId: null,
                    targetApplicationId: userApplication.id,
                    actionType: ACTION_TYPES.REJECTED_REQUEST,
                    category: CATEGORIES.ACCESS,
                    severity: SEVERITIES.WARNING,
                    isSecurityAlert: false,
                    details: `Rejected access request for ${userApplication.apl_fullname} (${userApplication.apl_email}).`,
                    metadata: {
                        applicationId: userApplication.id,
                        email: userApplication.apl_email,
                        username: userApplication.apl_username
                    },
                    request: req,
                    transaction
                });

                await transaction.commit();

                await emailService.sendAccountRequestResult(userApplication.apl_email, updatedUserApplication.apl_status);

                return {
                    id : userApplication.id,
                    username: userApplication.apl_username,
                };
            }

            const userData = {
                linkedApplicationId: userApplication.id,
                email: userApplication.apl_email,
                fullname: userApplication.apl_fullname,
                username: userApplication.apl_username,
                password: userApplication.apl_password,
                role: "editor",
            };

            const user = await userService.addUser(userData, transaction);

            await auditLogService.log({
                actorUserId: actorId,
                targetUserId: user.id,
                targetApplicationId: userApplication.id,
                actionType: ACTION_TYPES.APPROVED_REQUEST,
                category: CATEGORIES.ACCESS,
                severity: SEVERITIES.INFO,
                isSecurityAlert: false,
                details: `Approved access request for ${userApplication.apl_fullname} (${userApplication.apl_email}) and created user account.`,
                metadata: {
                    applicationId: userApplication.id,
                    userId: user.id,
                    username: user.username
                },
                request: req,
                transaction
            });

            await transaction.commit();

            await emailService.sendAccountRequestResult(userApplication.apl_email, updatedUserApplication.apl_status);

            return user;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    };

    async updateRole(userData, actorId, req) {
        const transaction = await sequelize.transaction();

        try {
            const targetUser = await userService.findById(userData.id, transaction);
            const previousRole = targetUser.usr_role;

            const updatedUser = await userService.updateRole(userData, transaction);

            const isPromoted = updatedUser.usr_role === "admin";
            const actionType = isPromoted ? ACTION_TYPES.PROMOTED_TO_ADMIN : ACTION_TYPES.DEMOTED_TO_EDITOR;
            const severity = isPromoted ? SEVERITIES.INFO : SEVERITIES.WARNING;
            const isSecurityAlert = !isPromoted;
            const details = isPromoted
                ? `Upgraded role permissions for ${updatedUser.usr_fullname} from ${previousRole} to admin.`
                : `Downgraded role permissions for ${updatedUser.usr_fullname} from ${previousRole} to ${updatedUser.usr_role}.`;

            await auditLogService.log({
                actorUserId: actorId,
                targetUserId: updatedUser.id,
                actionType,
                category: CATEGORIES.ROLES,
                severity,
                isSecurityAlert,
                details,
                metadata: {
                    oldRole: previousRole,
                    newRole: updatedUser.usr_role
                },
                request: req,
                transaction
            });

            await transaction.commit();

            await emailService.sendRoleUpdate(updatedUser.usr_email, updatedUser.usr_role);

            return updatedUser;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    };

    async updateStatus(userData, actorId, req) {
        const ACTIVE_ADMINS_MINIUM_LENGTH = 2;

        const transaction = await sequelize.transaction();

        try {
            const user = await userService.findById(userData.id);

            const activeAdminsLength = await userService.getNumberOfActiveAdmins();

            if (user.usr_role === 'admin' &&
                activeAdminsLength == ACTIVE_ADMINS_MINIUM_LENGTH) {
                throw new Error('Cannot disable this admin. The minimum number of active admins must be maintained.');
            }

            const updatedUser = await userService.updateStatus(userData, transaction);

            if (updatedUser.usr_status === "disabled") {
                await auditLogService.log({
                    actorUserId: actorId,
                    targetUserId: updatedUser.id,
                    actionType: ACTION_TYPES.REMOVED_STAFF_MEMBER,
                    category: CATEGORIES.STAFF,
                    severity: SEVERITIES.CRITICAL,
                    isSecurityAlert: true,
                    details: `Disabled/Removed staff member ${updatedUser.usr_fullname} (${updatedUser.usr_username}).`,
                    metadata: {
                        status: updatedUser.usr_status
                    },
                    request: req,
                    transaction
                });
            }

            await transaction.commit();

            await emailService.sendStatusUpdate(updatedUser.usr_email, updatedUser.usr_status);

            return updatedUser;
        } catch (err) {
            await transaction.rollback();
            throw err;
        }
    };
}