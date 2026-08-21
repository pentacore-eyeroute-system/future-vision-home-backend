import { UserApplication } from "../models/userApplicationModel.js";

export class UserApplicationService {
    async addApplication(userApplicationData) {
        try {
            const userApplication = await UserApplication.create({
                apl_email: userApplicationData.email,
                apl_fullname: userApplicationData.fullname,
                apl_username: userApplicationData.username,
                apl_password: userApplicationData.password,
                apl_status: userApplicationData.status,
            });

            return {
                id: userApplication.id,
                username: userApplication.apl_username,
            };
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                throw new Error('Email is already used');
            }

            throw err;
        }
    };

    async findByUsername(username) {
        const userApplication = await UserApplication.findOne({
            where : { apl_username : username }
        });

        return userApplication;
    };
}