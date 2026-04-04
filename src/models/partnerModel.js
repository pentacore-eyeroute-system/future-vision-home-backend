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
        par_isArchived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        par_isTemporarilyDeleted: {
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