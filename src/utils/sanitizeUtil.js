import { z } from "zod";
import sanitizeHtml from "sanitize-html";

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

// Helper function to sanitize rich text HTML content while preserving safe tags and attributes
export const sanitizeRichText = (val) => {
    if (typeof val !== "string") return val;
    return sanitizeHtml(val, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([
            "img", "span", "u", "s", "strike", "sub", "sup"
        ]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            "*": ["class", "style", "align"],
            a: ["href", "name", "target", "rel"],
            img: ["src", "srcset", "alt", "title", "width", "height", "loading"]
        },
        allowedSchemes: ["http", "https", "mailto", "tel"],
        disallowedTagsMode: "discard"
    });
};

// Reusable XSS safe Zod string check for plain-text fields (disallows all HTML tags)
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

// Optional XSS safe Zod string check for plain-text fields
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

// Optional Rich Text XSS safe Zod string check (allows safe HTML tags like <p>, <b>, <i>, <ul> while stripping malicious scripts/attributes)
export const optionalRichTextXssSafeString = (fieldName, maxLen = 50000) => {
    return z.string()
        .trim()
        .max(maxLen, `${fieldName} must not exceed ${maxLen} characters`)
        .refine((val) => {
            if (!val) return true;
            // Reject dangerous script tags, iframes, and javascript: protocols upfront
            return !/<script\b|javascript:|<iframe\b/i.test(val);
        }, {
            message: `${fieldName} contains potentially unsafe script tags`
        })
        .transform(sanitizeRichText)
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
