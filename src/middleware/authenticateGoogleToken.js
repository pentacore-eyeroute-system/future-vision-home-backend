import { OAuth2Client } from "google-auth-library";
import config from '../config/env.js'

const GOOGLE_WEB_CLIENT_ID = config.google.webClientId;

const googleClient = new OAuth2Client();

export async function authenticateGoogleToken(req, res, next) {
    try {
        const googleIdToken = req.body.googleIdToken;

        if (!googleIdToken) {
            return res.status(400).json({ message: 'Google token required' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: googleIdToken,
            audience: GOOGLE_WEB_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        req.reviewer = payload;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}; 