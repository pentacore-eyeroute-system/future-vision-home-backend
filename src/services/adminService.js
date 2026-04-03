import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Admin } from "../models/adminModel.js";
import config from '../config/env.js';

const ADMIN_SECRET_KEY = config.adminSecretKey;

export class AdminService {


    async findByUsername(username, password) {
        const admin = await Admin.findOne({ where: { adm_username : username } });

        if (!admin) {
            throw new Error('Incorrect username');
        }

        const isMatch = await bcrypt.compare(password, admin.adm_password);

        if (!isMatch) {
            throw new Error('Incorrect password');
        }

        return admin;
    };

    generateAdminJwt(admin) {
        const token = jwt.sign({ id: admin.id, username: admin.adm_username }, ADMIN_SECRET_KEY, { expiresIn: '1h' });

        return token;
    };
}