import { UserApplicationService } from "./userApplicationService.js"
import { UserService } from "./userService.js";
import { EmailService } from "./emailService.js";

const userApplicationService = new UserApplicationService();
const userService = new UserService();
const emailService = new EmailService();

export class UserManagementService {
    async getAllPendingUserApplications() {
        const userApplications = await userApplicationService.getAllPendingUserApplications();

        return userApplications;
    }

    async getAllStaffMembers() {
        const staffMembers = await userService.getAllStaffMembers();

        return staffMembers;
    };
 
    async updatePendingUserApplication(userApplicationData) {
        const userApplication = await userApplicationService.findById(userApplicationData.id);

        if (userApplication.apl_status === "approved" ||
            userApplication.apl_status === "rejected"
        ) {
            throw new Error('Application has already been approved/rejected');
        }

        const updatedUserApplication = await userApplicationService.updateStatus(userApplicationData);

        if (updatedUserApplication.apl_status === "rejected") {
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

        const user = await userService.addUser(userData);

        await emailService.sendAccountRequestResult(userApplication.apl_email, updatedUserApplication.apl_status);

        return user;
    };

    async updateRole(userData) {
        const updatedUser = await userService.updateRole(userData);

        await emailService.sendRoleUpdate(updatedUser.usr_email, updatedUser.usr_role);

        return updatedUser;
    };

    async updateStatus(userData) {
        const ACTIVE_ADMINS_MINIUM_LENGTH = 2;

        const activeAdminsLength = await userService.getNumberOfActiveAdmins();

        if (activeAdminsLength == ACTIVE_ADMINS_MINIUM_LENGTH) {
            throw new Error('Cannot disable this admin. The minimum number of active admins must be maintained.');
        }

        const updatedUser = await userService.updateStatus(userData);

        await emailService.sendStatusUpdate(updatedUser.usr_email, updatedUser.usr_status);

        return updatedUser;
    };
}