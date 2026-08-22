import { UserApplicationService } from "./userApplicationService.js"
import { UserService } from "./userService.js";

const userApplicationService = new UserApplicationService();
const userService = new UserService();

export class UserManagementService {
    async getAllPendingUserApplications() {
        const userApplications = await userApplicationService.getAllPendingUserApplications();

        return userApplications;
    }

    async updatePendingUserApplication(userApplicationData) {
        const userApplication = await userApplicationService.findById(userApplicationData.id);

        if (userApplication.apl_status === "approved" ||
            userApplication.apl_status === "rejected"
        ) {
            throw new Error('Application has already been approved/rejected');
        }

        const updatedUserApplication = await userApplicationService.updateStatus(userApplicationData);

        if (updatedUserApplication.status === "rejected") {
            return userApplication.id;
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

        return user;
    };
}