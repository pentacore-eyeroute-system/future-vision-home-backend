import { UserService } from "./userService.js";
import { TokenService } from "./tokenService.js";

const userService = new UserService();
const tokenService = new TokenService();

export class ReviewerAuthService {
    async login(userData) {
        let user = {};

        const existingUser = userService.findByEmail(userData.email);

        if (existingUser) {
            const error = new Error('Email is already registered as a Future Vision Home staff member');
            error.statusCode = 409;

            throw error;
        }
        
        user = await userService.findByGoogleSub(userData.googleSub);

        if (!user) {
            userData = {
                ...userData,
                role : "reviewer",
            }
            
            user = await userService.addUser(userData);
        } else {
            user = await userService.updateUser(user, userData);
        }

        const payload = {
            id: user.id,
            role: "reviewer",
        };

        // Generates JWT token for review user
        const token = await tokenService.generateJwt(payload);

        return {
            user: {
                id: user.id,
                fullname: user.usr_fullname,
                email: user.usr_email,
                picture: user.usr_pic_url,
                role: user.usr_role,
                token: token,
            },
        };
    };
}