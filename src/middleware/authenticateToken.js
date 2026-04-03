import jwt from 'jsonwebtoken';
import config from '../config/env.js';

const ADMIN_SECRET_KEY = config.adminSecretKey;

export function authenticateToken(req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;

        if (!authorizationHeader) return res.status(401).json({ message: 'Missing authorization header' });

        const token = authorizationHeader.split(' ')[1];

        const payload = jwt.verify(token, ADMIN_SECRET_KEY);

        req.user = payload;

        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}