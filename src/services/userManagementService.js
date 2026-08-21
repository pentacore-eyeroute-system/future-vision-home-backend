import { UserApplicationService } from "./userApplicationService.js"

const userApplicationService = new UserApplicationService();

export class UserManagementService {
    async getAllPendingUserApplications() {
        const userApplications = await userApplicationService.getAllPendingUserApplications();

        return userApplications;
    }
}