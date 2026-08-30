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
                const error = new Error('Email is already registered and has a pending account application.');
                error.statusCode = 409;
                
                throw error;
            }

            throw err;
        }
    };

    async findByUsername(username, transaction) {
        const userApplication = await UserApplication.findOne({
            where : { apl_username : username },
            transaction
        });

        return userApplication;
    };

    async findById(userApplicationId, transaction) {
        const userApplication = await UserApplication.findByPk(userApplicationId, { transaction });

        return userApplication;
    };

    async getAllPendingUserApplications() {
        const userApplications = await UserApplication.findAll({
            where: { apl_status : 'pending' },
            attributes: ['id', 'apl_fullname', 'apl_email', 'apl_username', 'createdAt']
        });

        return userApplications;
    };

    async updateStatus(userApplicationData, transaction) {
        await UserApplication.update({ apl_status: userApplicationData.status }, { where: { id: userApplicationData.id }, transaction });

        const userApplication = await UserApplication.findByPk(
            userApplicationData.id,
            { raw: true, transaction }
        );

        return userApplication;
    };
}