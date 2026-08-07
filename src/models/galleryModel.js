import { sequelize } from "../config/db.js";
import pkg from "sequelize";
const { DataTypes } = pkg;

export const Gallery = sequelize.define(
  "Gallery",
  {
    gal_title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gal_description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gal_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    gal_is_temporarily_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "galleries",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        // Backs the paginated list queries: filter on the two delete flags,
        // then sort by gal_date.
        name: "galleries_list_idx",
        fields: ["gal_is_temporarily_deleted", "deletedAt", "gal_date"],
      },
    ],
  },
);
