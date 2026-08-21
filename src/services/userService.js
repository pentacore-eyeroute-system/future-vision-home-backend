import bcrypt from 'bcrypt';
import { User } from '../models/userModel.js';
import { LoginAttemptService } from './loginAttemptService.js';

const loginAttemptService = new LoginAttemptService();

export class UserService {
    async addUser(userData) {
        try {
            const user = await User.create({
                usr_email: userData.email,
                usr_google_sub: userData.googleSub,
                usr_fullname: userData.fullname,
                usr_username: userData.username,
                usr_password: userData.password,
                usr_pic_url: userData.picture,
                usr_role: userData.role,
            });

            return {
                id: user.id,
                username: user.usr_username,
            };
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                throw new Error('Email is already used');
            }

            throw err;
        }
    };

    async validateCredentials(record, ip, username, password) {
        const admin = await User.findOne({ where: { usr_username : username } });

        if (!admin) {
            await loginAttemptService.onLoginFailed(record);

            throw new Error('Incorrect username or password');
        }

        const isMatch = await bcrypt.compare(password, admin.usr_password);

        if (!isMatch) {
            await loginAttemptService.onLoginFailed(record);
            
            throw new Error('Incorrect username or password');
        }

        await loginAttemptService.onLoginSuccess(ip, username);

        return admin;
    };

    async findByGoogleSub(googleSub) {
        const user = await User.findOne({ where : { usr_google_sub : googleSub } });

        return user;
    };

    async findById(userId, transaction) {
        const user = await User.findByPk(userId, { transaction });

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    };

    async updateUser(user, userData) {
        const updatedUser = await user.update({
            usr_email: userData.email,
            usr_fullname: userData.fullname,
            usr_pic_url: userData.picture,
        });

        return updatedUser;
    };
}