import { UserService } from "./userService.js";
import { TokenService } from "./tokenService.js";

const userService = new UserService();
const tokenService = new TokenService();

export class AdminAuthService {
    async login(username, password) {
        // Finds matching admin
        const admin = await userService.findByUsername(username, password);

        const payload = {
            id: admin.id,
            role: "admin"
        };

        // Generates JWT token for admin
        const token = await tokenService.generateJwt(payload);

        return token;
    };
}