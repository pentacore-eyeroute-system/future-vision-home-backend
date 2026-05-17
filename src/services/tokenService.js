import jwt from 'jsonwebtoken';
import config from '../config/env.js';

const SECRET_KEY = config.secretKey;

export class TokenService {
    generateJwt(user) {
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY);

        return token;
    };
}