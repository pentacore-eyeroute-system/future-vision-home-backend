import { sequelize } from "../config/db.js";
import pkg from "sequelize";
const { DataTypes } = pkg;

export const User = sequelize.define(
  "User",
  {
    usr_email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    usr_google_sub: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    usr_fullname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usr_pic_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usr_username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    usr_password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    usr_role: {
      type: DataTypes.ENUM("admin", "editor", "reviewer"),
      defaultValue: "reviewer",
      allowNull: false,
    },
    usr_status: {
      type: DataTypes.ENUM("active", "disabled"),
      defaultValue: "active",
      allowNull: true,
    },
    usr_linked_application_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'fvh_user_applications',
        key: "id"
      }
    }
  },
  {
    tableName: "fvh_users",
    timestamps: true,
  },
);
