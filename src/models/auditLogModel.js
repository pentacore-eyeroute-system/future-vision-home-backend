import { sequelize } from "../config/db.js";
import pkg from "sequelize";
const { DataTypes } = pkg;

export const AuditLog = sequelize.define(
  "AuditLog",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    aud_actor_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "fvh_users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    aud_target_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "fvh_users",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    aud_target_application_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "fvh_user_applications",
        key: "id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    },
    aud_actor_type: {
      type: DataTypes.ENUM("user", "system"),
      allowNull: false,
      defaultValue: "user",
    },
    aud_action_type: {
      type: DataTypes.ENUM(
        "APPROVED_REQUEST",
        "REJECTED_REQUEST",
        "PROMOTED_TO_ADMIN",
        "DEMOTED_TO_EDITOR",
        "REMOVED_STAFF_MEMBER",
        "AUTH_FAILED_LOCKOUT",
        "AUTH_LOGIN_SUCCESS",
        "AUTH_FAILED_LOGIN",
        "AUTH_PASSWORD_CHANGED",
        "SYSTEM_EXPORT_LOGS",
        "CONTENT_CREATED",
        "CONTENT_UPDATED",
        "CONTENT_DELETED",
        "CONTENT_RESTORED"
      ),
      allowNull: false,
    },
    aud_category: {
      type: DataTypes.ENUM("ACCESS", "ROLES", "STAFF", "SECURITY"),
      allowNull: false,
    },
    aud_severity: {
      type: DataTypes.ENUM("info", "warning", "critical"),
      allowNull: false,
      defaultValue: "info",
    },
    aud_is_security_alert: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    aud_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    aud_metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    aud_ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    aud_user_agent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "fvh_audit_logs",
    timestamps: true,
    updatedAt: false,
  }
);
