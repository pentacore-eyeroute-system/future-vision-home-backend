import pkg from "sequelize";
const { DataTypes } = pkg;
import { sequelize } from "../config/db.js";

export const LoginAttempt = sequelize.define(
  "LoginAttempt",
  {
    log_ip: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    log_username: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    log_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    log_blocked_until: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "login_attempts",
    timestamps: true,
  },
);
