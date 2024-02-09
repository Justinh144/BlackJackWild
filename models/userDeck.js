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
      id: DataTypes.INTEGER,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    power_id: {
      id: DataTypes.INTEGER,
      references: {
        model: 'powers',
        key: 'id'
      }
    },
    wild_cards: {
      id: DataTypes.INTEGER,
      references: {
        model: 'wild_card',
        key: 'id',
      }
    },
  },
  {
    sequelize,
    freezeTableName: true,
    underscored: true,
    modelName: "userdeck",
  }
);

module.exports = UserDeck;
