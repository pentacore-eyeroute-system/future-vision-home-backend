import { UserService } from "./userService.js";
import { TokenService } from "./tokenService.js";

const userService = new UserService();
const tokenService = new TokenService();

export class ReviewerAuthService {
    async login(userData) {
        let user = {};
        
        user = await userService.findByGoogleSub(userData.googleSub);

        if (!user) {
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
            token: token,
            user: {
                id: user.id,
                fullname: user.usr_fullname,
                email: user.usr_email,
                picture: user.usr_pic_url,
                role: user.usr_role,
            },
        };
    };
}