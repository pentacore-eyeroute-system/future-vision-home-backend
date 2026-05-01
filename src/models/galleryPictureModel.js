import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

export const GalleryPicture = sequelize.define(
    'GalleryPicture', 
    {
        gpi_linked_gallery_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'galleries',
                key: 'id'
            },
        },
        gpi_pic_path: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        tableName: 'gallery_pictures',
        timestamps: true,
        paranoid: true,
    }
);