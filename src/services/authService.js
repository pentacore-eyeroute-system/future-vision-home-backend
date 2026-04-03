import { AdminService } from "./adminService.js";

const adminService = new AdminService();

export class AuthService {
    async login(username, password) {
        // Finds matching admin
        const admin = await adminService.findByUsername(username, password);

        // Generates JWT token for admin
        const token = adminService.generateAdminJwt(admin);

        return token;
    };
}