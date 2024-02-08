const { Model, DataTypes } = require("sequelize");
const sequelize = require("..config/connection");

class WildCard extends Model {}

WildCard.init(
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
        },
        cardname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        filename: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        value: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },    
    },
    {
        sequelize,
        freezeTableName: true,
        underscored: true,
        modelName: "wildcard"
    }
);

module.exports = WildCard;