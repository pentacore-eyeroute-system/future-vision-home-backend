import bcrypt from 'bcrypt';
import { Op} from 'sequelize';
import { User } from '../models/userModel.js';
import { LoginAttemptService } from './loginAttemptService.js';

const loginAttemptService = new LoginAttemptService();

export class UserService {
    async addUser(userData, transaction) {
        try {
            const user = await User.create({
                usr_linked_application_id: userData.linkedApplicationId,
                usr_email: userData.email,
                usr_google_sub: userData.googleSub,
                usr_fullname: userData.fullname,
                usr_username: userData.username,
                usr_password: userData.password,
                usr_pic_url: userData.picture,
                usr_role: userData.role,
            }, { transaction });

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

    async validateCredentials(record, ip, username, password, req, transaction) {
        const user = await User.findOne({ where: { usr_username : username }, transaction });

        if (!user) {
            await loginAttemptService.onLoginFailed(record, req, transaction);

            throw new Error('Incorrect username or password');
        }

        const isMatch = await bcrypt.compare(password, user.usr_password);

        if (!isMatch) {
            await loginAttemptService.onLoginFailed(record, req, transaction);
            
            throw new Error('Incorrect username or password');
        }

        await loginAttemptService.onLoginSuccess(ip, username, transaction);

        return {
            id : user.id,
            usr_email: user.usr_email,
            usr_fullname: user.usr_fullname,
            usr_username: user.usr_username,
        };
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

    async findByUsername(username, transaction) {
        const user = await User.findOne({
            where : { usr_username : username },
            transaction
        });

        return user;
    };

    async getAllStaffMembers() {
        const staffMembers = await User.findAll({
            where: { 
                usr_role : {
                    [Op.in]: ['admin', 'editor']
                },
                usr_status : 'active' 
            },
            attributes: ['id', 'usr_fullname', 'usr_email', 'usr_username', 'usr_role']
        });

        return staffMembers;
    };

    async getNumberOfActiveAdmins() {
        const admins = await User.findAll({
            where : { 'usr_role' : 'admin' }  
        });

        return admins.length;
    };

    async updateUser(user, userData) {
        const updatedUser = await user.update({
            usr_email: userData.email,
            usr_fullname: userData.fullname,
            usr_pic_url: userData.picture,
        });

        return updatedUser;
    };

    async updateRole(userData, transaction) {
        const user = await User.findByPk(userData.id, { transaction });

        if (!user) {
            throw new Error('User not found');
        }

        if (userData.role === user.usr_role) {
            throw new Error("New role is the same as the current role");
        }

        await user.update({
            usr_role: userData.role
        }, { transaction });

        return {
            id : user.id, 
            usr_fullname : user.usr_fullname, 
            usr_email : user.usr_email, 
            usr_username : user.usr_username, 
            usr_role : user.usr_role
        }
    };

    async updateStatus(userData, transaction) {
        const user = await User.findByPk(userData.id, { transaction });

        if (!user) {
            throw new Error('User not found');
        }

        await user.update({
            usr_status: userData.status
        }, { transaction });

        return {
            id : user.id, 
            usr_fullname : user.usr_fullname, 
            usr_email : user.usr_email, 
            usr_username : user.usr_username, 
            usr_role : user.usr_role,
            usr_status: user.usr_status,
        }
    };

    async updatePassword(userData, transaction) {
        await User.update(
            { usr_password: userData.password },
            {
                where: { id: userData.id },
                transaction
            }
        );
    };
}