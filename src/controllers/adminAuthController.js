import dns from "dns/promises";
import { z } from "zod";
import { AdminAuthService } from "../services/adminAuthService.js";

const adminAuthService = new AdminAuthService();

// Helper function to sanitize strings against XSS attacks
const sanitizeString = (val) => {
    if (typeof val !== "string") return val;
    return val
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
};

// Helper function to verify if an email domain has active DNS MX records
const hasValidMxRecord = async (email) => {
    if (typeof email !== "string" || !email.includes("@")) return false;
    const domain = email.split("@")[1];
    if (!domain) return false;

    try {
        const mxRecords = await dns.resolveMx(domain);
        if (!mxRecords || mxRecords.length === 0) return false;
        // RFC 7505 Null MX records publish an empty exchange ("" or ".") to explicitly declare no mail service
        return mxRecords.some(r => r.exchange && r.exchange.trim() !== "" && r.exchange.trim() !== ".");
    } catch (err) {
        return false;
    }
};

// Password validation schema requiring min 8 chars, 1 uppercase, 1 lowercase, 1 number, and 1 special character
const passwordValidationSchema = z.string({ required_error: "Password is required" })
    .trim()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// Zod schemas for input validation & XSS protection
const signupSchema = z.object({
    fullname: z.string({ required_error: "Fullname is required" })
        .trim()
        .min(1, "Fullname is required")
        .max(100, "Fullname is too long")
        .refine((val) => !/<[^>]*>|javascript:|data:/i.test(val), {
            message: "Fullname contains unsafe characters or HTML tags"
        })
        .transform(sanitizeString),
    email: z.string({ required_error: "Email is required" })
        .trim()
        .toLowerCase()
        .email("Invalid email format")
        .refine((val) => !/<[^>]*>|javascript:/i.test(val), {
            message: "Email contains unsafe characters"
        })
        .refine(hasValidMxRecord, {
            message: "Email domain does not exist or cannot receive emails"
        }),
    username: z.string({ required_error: "Username is required" })
        .trim()
        .min(3, "Username must be at least 3 characters")
        .max(30, "Username must not exceed 30 characters")
        .regex(/^[a-zA-Z0-9_.-]+$/, "Username can only contain letters, numbers, underscores, dots, and hyphens")
        .transform(sanitizeString),
    password: passwordValidationSchema
});

const loginSchema = z.object({
    username: z.string({ required_error: "Username is required" })
        .trim()
        .min(1, "Username is required")
        .refine((val) => !/<[^>]*>|javascript:/i.test(val), {
            message: "Username contains unsafe characters"
        })
        .transform(sanitizeString),
    password: z.string({ required_error: "Password is required" })
        .trim()
        .min(1, "Password is required")
});

const confirmPasswordSchema = z.object({
    password: z.string({ required_error: "Password is required" })
        .trim()
        .min(1, "Password is required")
});

const updatePasswordSchema = z.object({
    password: passwordValidationSchema
});

export class AdminAuthController {
    signup = async (req, res) => {
        try {
            const validation = await signupSchema.safeParseAsync(req.body);
            if (!validation.success) {
                const errorMessage = validation.error.errors.map(e => e.message).join(', ');
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            const userData = validation.data;

            const result = await adminAuthService.signup(userData, req);

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
            const validation = loginSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = validation.error.errors.map(e => e.message).join(', ');
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            const { username, password } = validation.data;
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

    confirmPassword = async (req, res) => {
        try {
            const validation = confirmPasswordSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = validation.error.errors.map(e => e.message).join(', ');
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            let userData = {
                id: req.user.id,
                password: validation.data.password,
            };

            await adminAuthService.confirmPassword(userData);

            res.status(200).json({
                success : true,
                message : 'Confirm password success',
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
    }

    updatePassword = async (req, res) => {
        try {
            const validation = updatePasswordSchema.safeParse(req.body);
            if (!validation.success) {
                const errorMessage = validation.error.errors.map(e => e.message).join(', ');
                return res.status(400).json({
                    success: false,
                    error: errorMessage
                });
            }

            let userData = {
                id: req.user.id,
                password: validation.data.password,
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