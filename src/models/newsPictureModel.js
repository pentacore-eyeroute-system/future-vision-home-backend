import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

export const NewsPictures = sequelize.define(
    'NewsPictures', 
    {
        npi_linked_news_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'news',
                key: 'id'
            },
        },
        npi_pic_path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'news_pictures',
        timestamps: true,
        paranoid: true,
    }
);