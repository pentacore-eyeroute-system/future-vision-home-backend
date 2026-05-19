import { sequelize } from '../config/db.js';
import { DataTypes } from 'sequelize';

export const Review = sequelize.define(
    'Review',
    {
        rev_linked_reviewer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'fvh_users',
                key: 'id'
            },
            unique: true,
        },
        rev_rating: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 5
            }
        },
        rev_feedback: {
            type: DataTypes.TEXT,
            allowNull: true,  
        },
    },
    {
        tableName: 'reviews',
        timestamps: true,
        paranoid: true,
    }
);
