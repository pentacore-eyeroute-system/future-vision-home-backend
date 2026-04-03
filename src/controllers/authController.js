import { AuthService } from "../services/authService.js";

const authService = new AuthService();

export class AuthController {
    login = async (req, res) => {
        try {
            const { username, password } = req.body;

            const result = await authService.login(username, password);

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