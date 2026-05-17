import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

export const User = sequelize.define(
    'User',
    {
        usr_email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        usr_google_sub: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        usr_fullname: {
            type: DataTypes.STRING,
            allowNull: true
        },
        usr_pic_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        usr_username: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        usr_password: {
            type: DataTypes.STRING,
            allowNull: true
        },
        usr_role: {
            type: DataTypes.ENUM("admin", "reviewer"),
            defaultValue: "reviewer",
            allowNull: false
        }
    },
    {
        tableName: 'fvh_users',
        timestamps: true,
    },
);