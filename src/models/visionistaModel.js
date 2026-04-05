import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

export const Visionista = sequelize.define(
    'Visionista',
    {
        vis_fullname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vis_age: {
            type: DataTypes.INTEGER,
            allowNull: false,            
        },
        vis_story: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vis_pic_path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        vis_isArchived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        vis_isTemporarilyDeleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: 'visionistas',
        timestamps: true,
        paranoid: true,
    }
);