const Sequelize = require('sequelize');
require('dotenv').config();

let sequelize;

// Connects to Heroku
if (process.env.JAWSDB_URL) {
  sequelize = new Sequelize(process.env.JAWSDB_URL);
  
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: 'localhost',
      dialect: 'mysql',
      port: 3306
    }
  );
}

module.exports = sequelize;




// It looks like you are dealing with a Node.js
//  application that uses the Sequelize library to interact with a database.
// The code you provided checks if there is a JAWSDB_URL environment variable set, 
// and if so, it creates a new Sequelize instance using that URL.
// JAWSDB is a database service that is often used with cloud platforms, 
// and its URL typically contains connection information (such as database type, username, password, host, and database name) 
// needed for Sequelize to connect to the database.
