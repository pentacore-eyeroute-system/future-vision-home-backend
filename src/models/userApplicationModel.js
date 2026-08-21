import { sequelize } from "../config/db.js";
import pkg from "sequelize";
const { DataTypes } = pkg;

export const UserApplication = sequelize.define(
  "UserApplication",
  {
    apl_email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    apl_fullname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apl_username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    apl_password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    apl_status: {
      type: DataTypes.ENUM("pending", "approved", "rejected"),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  {
    tableName: "fvh_user_applications",
    timestamps: true,
  },
);
