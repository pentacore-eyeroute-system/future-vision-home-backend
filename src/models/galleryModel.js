import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

export const Gallery = sequelize.define(
    'Gallery', 
    {
        gal_title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gal_description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        gal_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        gal_is_temporarily_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: 'galleries',
        timestamps: true,
        paranoid: true,
    }
);