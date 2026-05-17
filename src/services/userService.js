import bcrypt from 'bcrypt';
import { User } from '../models/userModel.js';

export class UserService {
    async addUser(userData) {
        const user = await User.create({
            usr_email: userData.email,
            usr_google_sub: userData.googleSub,
            usr_fullname: userData.fullname,
            usr_pic_url: userData.picture,
            usr_role: "reviewer",
        });

        return user;
    };

    async findByUsername(username, password) {
        const admin = await User.findOne({ where: { usr_username : username } });

        if (!admin) {
            throw new Error('Incorrect username or password');
        }

        const isMatch = await bcrypt.compare(password, admin.usr_password);

        if (!isMatch) {
            throw new Error('Incorrect username or password');
        }

        return admin;
    };

    async findByGoogleSub(googleSub) {
        const reviewer = await User.findOne({ where : { usr_google_sub : googleSub } });

        return reviewer;
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