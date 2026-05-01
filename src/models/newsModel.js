import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

export const News = sequelize.define(
    'News', 
    {
        news_title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        news_description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        news_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        news_is_temporarily_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: 'news',
        timestamps: true,
        paranoid: true,
    }
);