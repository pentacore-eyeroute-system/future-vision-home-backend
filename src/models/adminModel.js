import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

export const Admin = sequelize.define(
    'Admin',
    {
        adm_username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        adm_password: {
            type: DataTypes.STRING,
            allowNull: false
        },
    },
    {
        tableName: 'admins',
        timestamps: true,
    },
);