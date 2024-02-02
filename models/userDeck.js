const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/connection");

class UserDeck extends Model {}

UserDeck.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    userDeck_id: {
      references: {
        model: 'user',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: "Cards",
  }
);

module.exports = UserDeck;
