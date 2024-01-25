const { DataTypes } = require("sequelize");

module.exports = (sequelize, Sequelize) => {
  const Photo = sequelize.define(
    "Photo",
    {
      link: {
        type: DataTypes.STRING(255),
      },
      reference_id: {
        type: DataTypes.STRING(255),
      },
    },
    {
      sequelize,
      modelName: "Photo",
      tableName: "photos",
      timestamps: true,
      updatedAt: "updated_at",
      createdAt: "created_at",
    }
  );

  return Photo;
};
