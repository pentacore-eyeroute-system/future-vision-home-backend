import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

export const Partner = sequelize.define(
    'Partner',
    {
        par_fullname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        par_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        par_is_temporarily_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    },
    {
        tableName: 'partners',
        timestamps: true,
        paranoid: true,
    }
);