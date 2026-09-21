import { z } from "zod";

// Helper function to sanitize string input against XSS attacks by HTML-escaping special characters
export const sanitizeString = (val) => {
    if (typeof val !== "string") return val;
    return val
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;")
        .replace(/\//g, "&#x2F;");
};

// Reusable XSS safe Zod string check
export const xssSafeString = (fieldName, maxLen = 1000) => {
    return z.string({ required_error: `${fieldName} is required` })
        .trim()
        .min(1, `${fieldName} is required`)
        .max(maxLen, `${fieldName} must not exceed ${maxLen} characters`)
        .refine((val) => !/<[^>]*>|javascript:|data:/i.test(val), {
            message: `${fieldName} contains potentially unsafe characters or HTML tags`
        })
        .transform(sanitizeString);
};

// Optional XSS safe Zod string check
export const optionalXssSafeString = (fieldName, maxLen = 1000) => {
    return z.string()
        .trim()
        .max(maxLen, `${fieldName} must not exceed ${maxLen} characters`)
        .refine((val) => !val || !/<[^>]*>|javascript:|data:/i.test(val), {
            message: `${fieldName} contains potentially unsafe characters or HTML tags`
        })
        .transform(sanitizeString)
        .optional();
};

// Helper function to extract error messages from Zod error objects
export const getZodErrorMessage = (error) => {
    const issues = error?.issues || error?.errors || [];
    if (issues.length > 0) {
        return issues.map(e => e.message).join('. ');
    }
    return error?.message || 'Invalid input data';
};
