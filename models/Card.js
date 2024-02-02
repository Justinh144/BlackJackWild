const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class Cards extends Model {}

Cards.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    cardName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filename: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: "Cards",
  }
);

module.exports = Cards;
