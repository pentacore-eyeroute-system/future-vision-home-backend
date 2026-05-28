import { AdminAuthService } from "../services/adminAuthService.js";

const adminAuthService = new AdminAuthService();

export class AdminAuthController {
    login = async (req, res) => {
        try {
            const { username, password } = req.body;
            const ip = req.ip
                .replace('::ffff:', '')
                .replace('::1', '127.0.0.1');

            const result = await adminAuthService.login(ip, username, password);

            res.status(200).json({
                success : true,
                message : 'Login success',
                result
            });
        } catch (err) {
            res.status(err.statusCode || 401).json({
                success: false,
                error: err.message,
                retryAfter: err.retryAfter || null,
            });
        }
    };
}