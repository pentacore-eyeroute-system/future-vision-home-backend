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
            if (err.statusCode) {
                return res.status(err.statusCode).json({
                    success: false,
                    error: err.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        }
    };

    login = async (req, res) => {
        try {
            const { username, password } = req.body;
            const ip = req.ip
                .replace('::ffff:', '')
                .replace('::1', '127.0.0.1');

            const result = await adminAuthService.login(ip, username, password, req);

            res.status(200).json({
                success : true,
                message : 'Login success',
                result
            });
        } catch (err) {
            if (err.statusCode) {
                return res.status(err.statusCode).json({
                    success: false,
                    error: err.message,
                    retryAfter: err.retryAfter || null,
                });
            }

            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        }
    };

    updatePassword = async (req, res) => {
        try {
            let userData = {
                id: req.user.id,
                password: req.body.password.trim(),
            };

            await adminAuthService.updatePassword(userData);

            res.status(200).json({
                success : true,
                message : 'Update password success',
            });
        } catch (err) {
            if (err.statusCode) {
                return res.status(err.statusCode).json({
                    success: false,
                    error: err.message
                });
            }

            res.status(500).json({
                success: false,
                error: 'An internal server error occurred',
            });
        }
    };
}