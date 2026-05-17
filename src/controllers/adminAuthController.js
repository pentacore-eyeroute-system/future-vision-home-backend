import { AdminAuthService } from "../services/adminAuthService.js";

const adminAuthService = new AdminAuthService();

export class AdminAuthController {
    login = async (req, res) => {
        try {
            const { username, password } = req.body;

            const result = await adminAuthService.login(username, password);

            res.status(200).json({
                success : true,
                message : 'Login success',
                result
            });
        } catch (err) {
            res.status(401).json({
                success : false,
                error : err.message,
            });
        }
    };
}