const { classic } = require("sequelize");
const sequelize = require("../config/connection");

class Classic extends Model {}

module.exports = classic;