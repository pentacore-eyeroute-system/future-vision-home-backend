import { AdminAuthService } from "../services/adminAuthService.js";

const adminAuthService = new AdminAuthService();

export class AdminAuthController {
    signup = async (req, res) => {
        try {
            let userData = {
                fullname: req.body.fullname.trim(),
                email: req.body.email.trim(),
                username: req.body.username.trim(),
                password: req.body.password.trim(),
            };

            const result = await adminAuthService.signup(userData);

            res.status(201).json({
                success : true,
                message : 'Onboarding success',
                result
            });
        } catch (err) {
            if (err.message === 'Email is already used') {
                return res.status(409).json({
                    success: false,
                    error: err.message
                });
            }

            res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    };

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

    updatePassword = async (req, res) => {
        try {
            let userData = {
                id: req.params.id,
                password: req.body.password.trim(),
            };

            await adminAuthService.updatePassword(userData);

            res.status(200).json({
                success : true,
                message : 'Update password success',
            });
        } catch (err) {
            res.status(500).json({
                success: false,
                error: err.message,
            });
        }
    };
}